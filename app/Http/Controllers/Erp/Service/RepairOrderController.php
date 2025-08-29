<?php

namespace App\Http\Controllers\Erp\Service;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\StoreRequest;
use App\Models\RepairOrder;
use App\Models\RepairOrderPayment;
use App\Models\RepairOrderStatusHistory;
use App\Models\RepairService;
use App\Models\RepairServiceDeviceType;
use Dotenv\Exception\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class RepairOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        if ($request->has("draw")) {
            $query = RepairOrder::query()
                ->with(['customer', 'technician']);

            return DataTables::eloquent($query)
                ->addColumn('status', function ($row) {
                    return view('partials.backend.repair-status', compact('row'))->render();
                })
                ->addColumn('priority', function ($row) {
                    return view('partials.backend.repair-priority', compact('row'))->render();
                })
                ->addColumn('action', function ($row) {
                    return view('partials.backend.repair-order-actions', compact('row'))->render();
                })
                ->rawColumns(['status', 'priority', 'action'])
                ->make(true);
        }

        return Inertia::render('Backend/ERP/Service/Index');
    }

    /**
     * Show the form for creating a new resource.
     */

    public function create()
    {
        return Inertia::render('Backend/ERP/Service/ServiceForm');
    }

    public function edit(RepairOrder $repairOrder)
    {
        return Inertia::render('Backend/ERP/Service/ServiceForm', [
            'service' => $repairOrder->load([
                'creator',
                'technician',
                'customer',
                'complaint',
                'payments',
                'initialChecks',
                'physicalConditions',
                'riskAgreements',
                'accessories',
            ])
        ]);
    }

    public function show(RepairOrder $repairOrder)
    {
        return Inertia::render('Backend/ERP/Service/Show', [
            'order' => $repairOrder->load([
                'creator',
                'technician',
                'customer',
                'complaint',
                'payments',
                'initialChecks',
                'physicalConditions',
                'riskAgreements',
                'accessories',
            ])
        ]);
    }

    public function assign(RepairOrder $repairOrder)
    {
        return Inertia::render('Backend/ERP/Service/Assign', [
            'order' => $repairOrder->load([
                'creator',
                'technician',
                'customer',
                'complaint',
                'payments',
            ])
        ]);
    }

    public function assignStore(Request $request)
    {
        try {
            Log::info($request);
            // Validate the request
            $validated = $request->validate([
                'job_id' => 'required|exists:repair_orders,id',
                'technician_id' => 'required|exists:users,id',
            ]);

            // Find the repair order
            $repairOrder = RepairOrder::findOrFail($validated['job_id']);

            // Update the repair order with the assigned technician
            $repairOrder->assigned_technician_id = $validated['technician_id'];
            $repairOrder->status = 'approved';

            // Save the changes
            $repairOrder->save();

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Technician assigned successfully!',
            ]);

        } catch (ValidationException $e) {
            // Return validation errors
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
            ], 422);

        } catch (ModelNotFoundException $e) {
            // Return not found error
            return response()->json([
                'success' => false,
                'message' => 'Repair order or technician not found'
            ], 404);

        } catch (\Exception $e) {
            // Return server error
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign technician. Please try again.' . $e->getMessage()
            ], 500);
        }
    }

    public function store(StoreRequest $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();
            $jobDetails = $validated['job_details'];
            $customer = $validated['customer'];
            $paymentInfo = $validated['payment_info'] ?? [];
            $otherInfo = $validated['other_info'] ?? [];
            $initialCheck = $validated['initial_check'] ?? [];

            // Generate order number if not provided
            if (empty($jobDetails['job_number'])) {
                $jobDetails['job_number'] = 'RO-' . now()->format('Ymd') . '-' . Str::random(4);
            }

            // Get valid repair service and device type (replace with actual logic)
            $repairServiceId = $this->getValidRepairServiceId($jobDetails);
            $deviceTypeId = $this->getValidDeviceTypeId($jobDetails);

            // Create the repair order
            $repairOrderData = [
                'order_number' => $jobDetails['order_number'],
                'customer_id' => $customer['customer_id'],
                'repair_service_id' => $repairServiceId,

                'device_type_id' => $deviceTypeId,
                'device_metadata' => [
                    'brand' => $jobDetails['brand'],
                    'model' => $jobDetails['model'],
                    'serial' => $jobDetails['serial'],
                    'specs' => $jobDetails['specs'],
                    'issue' => $jobDetails['issue'],
                    'remarks' => $jobDetails['remarks'] ?? null,
                ],
                'initial_check_metadata' => [
                    'brand' => $jobDetails['brand'],
                    'model' => $jobDetails['model'],
                    'serial' => $jobDetails['serial'],
                    'issue' => $jobDetails['issue'],
                    'remarks' => $jobDetails['remarks'] ?? null,
                ],

                'diagnosis_fee' => $paymentInfo['diagnosis_fee'] ?? 0,
                'estimated_cost' => $paymentInfo['estimated_cost'] ?? 0,
                'final_cost' => $paymentInfo['final_cost'] ?? 0,
                'total_amount' => $paymentInfo['total_amount'] ?? 0,

                'assigned_technician_id' => $otherInfo['technician'] ?? null,
                'created_by' => Auth::id(),

                'custom_fields' => $this->prepareCustomFields($jobDetails, $initialCheck),

                'expected_completion_date' => $jobDetails['expected_completion_date'],
            ];

            $repairOrder = RepairOrder::create($repairOrderData);

            // Create initial status history (uncomment when ready)
            // $this->createStatusHistory($repairOrder);

            // Process payments (uncomment when ready)
            // $this->processPayments($repairOrder, $customer['id'], $paymentInfo);

            DB::commit();

            // Send notifications
            $this->sendNotifications($repairOrder, $otherInfo);

            return response()->json([
                'success' => true,
                'message' => 'Repair order created successfully',
                'data' => $repairOrder->load(['customer', 'technician', 'service']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Repair order creation failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create repair order',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get valid repair service ID (replace with your actual logic)
     */
    private function getValidRepairServiceId(array $jobDetails): int
    {
        // Example: Get first available service or create a default one
        $service = RepairService::first();

        if (!$service) {
            $service = RepairService::create([
                'name' => 'General Repair',
                'description' => 'General device repair service',
                'base_price' => 0,
            ]);
        }

        return $service->id;
    }

    /**
     * Get valid device type ID (replace with your actual logic)
     */
    private function getValidDeviceTypeId(array $jobDetails): int
    {
        // Example: Get first available device type or create a default one
        $deviceType = RepairServiceDeviceType::first();

        if (!$deviceType) {
            $deviceType = RepairServiceDeviceType::create([
                'name' => $jobDetails['device_type'] ?? 'Mobile Device',
                'description' => 'Mobile device repair',
            ]);
        }

        return $deviceType->id;
    }

    /**
     * Prepare custom fields data
     */
    private function prepareCustomFields(array $jobDetails, array $initialCheck): array
    {
        return [
            'color' => $jobDetails['color'] ?? null,
            'device_password' => $jobDetails['device_password'] ?? null,
            'provider_info' => $jobDetails['provider_info'] ?? null,
            'warranty_status' => $jobDetails['warranty_status'] ?? null,
            'physical_condition' => $initialCheck['physicalCondition'] ?? null,
            'risk_agreement' => $initialCheck['riskAgreement'] ?? null,
            'accessories' => $initialCheck['accessories'] ?? null,
        ];
    }

    /**
     * Create initial status history
     */
    private function createStatusHistory(RepairOrder $repairOrder): void
    {
        RepairOrderStatusHistory::create([
            'repair_order_id' => $repairOrder->id,
            'status' => 'pending',
            'notes' => 'Order created',
            'changed_by' => Auth::id(),
        ]);
    }

    /**
     * Process payments
     */
    private function processPayments(RepairOrder $repairOrder, int $userId, array $paymentInfo): void
    {
        if (!empty($paymentInfo['cash'])) {
            foreach ($paymentInfo['cash'] as $cashPayment) {
                RepairOrderPayment::create([
                    'repair_order_id' => $repairOrder->id,
                    'user_id' => $userId,
                    'amount' => $cashPayment['amount'],
                    'payment_method' => 'cash',
                    'payment_type' => 'partial',
                    'status' => 'completed',
                    'payment_date' => $cashPayment['date'] ?? now(),
                ]);
            }

            // Update balance due
            $totalPaid = $repairOrder->payments()->sum('amount');
            $repairOrder->update([
                'amount_paid' => $totalPaid,
                'balance_due' => max(0, $repairOrder->total_amount - $totalPaid),
            ]);
        }
    }

    /**
     * Send notifications based on user preferences
     */
    private function sendNotifications(RepairOrder $repairOrder, array $otherInfo): void
    {
        if ($otherInfo['sendSms'] ?? false) {
            // Implement SMS notification
            // Notification::send($repairOrder->customer, new RepairOrderSmsNotification($repairOrder));
        }

        if ($otherInfo['sendEmail'] ?? false) {
            // Implement email notification
            // Notification::send($repairOrder->customer, new RepairOrderEmailNotification($repairOrder));
        }

        if ($otherInfo['sendWhatsApp'] ?? false) {
            // Implement WhatsApp notification
            // Notification::send($repairOrder->customer, new RepairOrderWhatsAppNotification($repairOrder));
        }
    }
}