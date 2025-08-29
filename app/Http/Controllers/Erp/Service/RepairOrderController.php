<?php

namespace App\Http\Controllers\Erp\Service;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\StoreRequest;
use App\Http\Requests\Service\UpdateRequest;
use App\Models\RepairOrder;
use App\Models\RepairOrderStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Yajra\DataTables\Facades\DataTables;

class RepairOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response|JsonResponse
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
    public function create(): Response
    {
        return Inertia::render('Backend/ERP/Service/ServiceForm');
    }

    /**
     * Show the form for editing a repair order.
     */
    public function edit(RepairOrder $repairOrder): Response
    {
        return Inertia::render('Backend/ERP/Service/ServiceForm', [
            'service' => $repairOrder->load([
                'creator',
                'technician',
                'customer',
                'payments',
            ])
        ]);
    }

    /**
     * Display the specified repair order.
     */
    public function show(RepairOrder $repairOrder): Response
    {
        return Inertia::render('Backend/ERP/Service/Show', [
            'order' => $repairOrder->load([
                'creator',
                'technician',
                'customer',
                'payments',
            ])
        ]);
    }

    /**
     * Show the assign technician form.
     */
    public function assign(RepairOrder $repairOrder): Response
    {
        return Inertia::render('Backend/ERP/Service/Assign', [
            'order' => $repairOrder->load([
                'creator',
                'technician',
                'customer',
                'payments',
            ])
        ]);
    }

    /**
     * Assign a technician to a repair order.
     */
    public function assignStore(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'job_id' => 'required|exists:repair_orders,id',
                'technician_id' => 'required|exists:users,id',
            ]);

            $repairOrder = RepairOrder::findOrFail($validated['job_id']);

            $repairOrder->update([
                'assigned_technician_id' => $validated['technician_id'],
                'status' => 'received',
            ]);

            // Create status history
            RepairOrderStatusHistory::create([
                'repair_order_id' => $repairOrder->id,
                'status' => 'received',
                'notes' => 'Technician assigned: ' . $validated['technician_id'],
                'changed_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Technician assigned successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign technician. Please try again.'
            ], 500);
        }
    }

    /**
     * Store a newly created repair order.
     */
    public function store(StoreRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();
            $jobDetails = $validated['job_details'];
            $customer = $validated['customer'];
            $paymentInfo = $validated['payment_info'] ?? [];
            $otherInfo = $validated['other_info'] ?? [];
            $initialCheck = $validated['initial_check'] ?? [];

            // Get valid repair service and device type
            // $repairServiceId = $this->getValidRepairServiceId($jobDetails);
            // $deviceTypeId = $this->getValidDeviceTypeId($jobDetails);

            // calculate total amount
            $total_amount = ($paymentInfo['diagnosis_fee'] ?? 0 + $paymentInfo['estimated_cost'] ?? 0 + $otherInfo['final_cost'] ?? 0)
                - $paymentInfo['discount'] ?? 0;

            // Create the repair order
            $repairOrderData = [
                'order_number' => $jobDetails['order_number'] ?? $this->generateOrderNumber(),
                'customer_id' => $customer['customer_id'],
                'repair_service_id' => $jobDetails['repair_service_id'],
                // 'device_type_id' => $jobDetails['device_type_id'],
                'device_type_id' => 1,
                'device_metadata' => $this->prepareDeviceMetadata($jobDetails),
                'initial_check_metadata' => $this->prepareInitialCheckMetadata($jobDetails, $initialCheck),
                'diagnosis_fee' => $paymentInfo['diagnosis_fee'] ?? 0,
                'estimated_cost' => $paymentInfo['estimated_cost'] ?? 0,
                'final_cost' => $otherInfo['final_cost'] ?? 0,
                'total_amount' => $total_amount ?? 0,
                'assigned_technician_id' => $otherInfo['technician'] ?? null,
                'created_by' => Auth::id(),
                'custom_fields' => $this->prepareCustomFields($jobDetails, $initialCheck),
                'expected_completion_date' => $jobDetails['completion_date'] ?? null,
                'completion_date' => $jobDetails['completion_date'] ?? null,
                'priority' => $jobDetails['priority'] ?? 'medium',
                'status' => $jobDetails['status'] ?? 'pending',
                'warranty_status' => $jobDetails['warranty'] ?? 'out',
            ];

            $repairOrder = RepairOrder::create($repairOrderData);

            // Create initial status history
            $this->createStatusHistory($repairOrder, 'Order created');

            // Process payments if any
            $this->processPayments($repairOrder, $customer['customer_id'], $paymentInfo);

            DB::commit();

            // Send notifications
            $this->sendNotifications($repairOrder, $otherInfo);

            return response()->json([
                'success' => true,
                'message' => 'Repair order created successfully',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create repair order',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update an existing repair order.
     */
    public function update(UpdateRequest $request, RepairOrder $repairOrder): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();
            $jobDetails = $validated['job_details'] ?? [];
            $customer = $validated['customer'] ?? [];
            $paymentInfo = $validated['payment_info'] ?? [];
            $otherInfo = $validated['other_info'] ?? [];
            $initialCheck = $validated['initial_check'] ?? [];

            $updateData = [
                'device_metadata' => array_merge(
                    (array) $repairOrder->device_metadata,
                    $this->prepareDeviceMetadata($jobDetails)
                ),
                'initial_check_metadata' => array_merge(
                    (array) $repairOrder->initial_check_metadata,
                    $this->prepareInitialCheckMetadata($jobDetails, $initialCheck)
                ),
                'custom_fields' => array_merge(
                    (array) $repairOrder->custom_fields,
                    $this->prepareCustomFields($jobDetails, $initialCheck)
                ),
            ];

            // Add optional fields if they exist in the request
            if (!empty($jobDetails['priority'])) {
                $updateData['priority'] = $jobDetails['priority'];
            }
            if (!empty($jobDetails['status'])) {
                $updateData['status'] = $jobDetails['status'];
            }
            if (!empty($otherInfo['final_cost'])) {
                $updateData['final_cost'] = $otherInfo['final_cost'];
            }
            if (!empty($otherInfo['total_amount'])) {
                $updateData['total_amount'] = $otherInfo['total_amount'];
            }

            $repairOrder->update($updateData);

            // Create status history if status changed
            if (!empty($jobDetails['status']) && $jobDetails['status'] !== $repairOrder->getOriginal('status')) {
                $this->createStatusHistory($repairOrder, 'Order updated');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Repair order updated successfully',
                'data' => $repairOrder->fresh(['customer', 'technician', 'service']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update repair order',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Generate order number.
     */
    private function generateOrderNumber(): string
    {
        return 'RO-' . now()->format('YmdHis') . '-' . Str::random(6);
    }

    /**
     * Prepare device metadata.
     */
    private function prepareDeviceMetadata(array $jobDetails): array
    {
        return [
            'brand' => $jobDetails['brand'] ?? null,
            'model' => $jobDetails['model'] ?? null,
            'serial' => $jobDetails['serial'] ?? null,
            'specs' => $jobDetails['specs'] ?? null,
            'issue' => $jobDetails['issue'] ?? null,
            'remarks' => $jobDetails['remarks'] ?? null,
            'color' => $jobDetails['color'] ?? null,
            'password' => $jobDetails['password'] ?? null,
            'provider' => $jobDetails['provider'] ?? null,
        ];
    }

    /**
     * Prepare initial check metadata.
     */
    private function prepareInitialCheckMetadata(array $jobDetails, array $initialCheck): array
    {
        return [
            'brand' => $jobDetails['brand'] ?? null,
            'model' => $jobDetails['model'] ?? null,
            'serial' => $jobDetails['serial'] ?? null,
            'issue' => $jobDetails['issue'] ?? null,
            'remarks' => $jobDetails['remarks'] ?? null,
            'display' => $initialCheck['display'] ?? null,
            'back_panel' => $initialCheck['back_panel'] ?? null,
            'physical_condition' => $initialCheck['physical_condition'] ?? null,
            'risk_agreed' => $initialCheck['risk_agreed'] ?? null,
            'accessories' => $initialCheck['accessories'] ?? null,
            'checked_by' => $initialCheck['checked_by'] ?? null,
            'check_date' => $initialCheck['check_date'] ?? null,
        ];
    }

    /**
     * Get valid repair service ID.
     */
    // private function getValidRepairServiceId(array $jobDetails): int
    // {
    //     if (!empty($jobDetails['repair_service_id'])) {
    //         return RepairService::firstOrCreate(
    //             ['id' => $jobDetails['repair_service_id']],
    //             ['name' => 'General Repair', 'description' => 'General device repair service', 'base_price' => 0]
    //         )->id;
    //     }

    //     return RepairService::firstOrCreate(
    //         ['name' => 'General Repair'],
    //         ['description' => 'General device repair service', 'base_price' => 0]
    //     )->id;
    // }

    /**
     * Get valid device type ID.
     */
    // private function getValidDeviceTypeId(array $jobDetails): int
    // {
    //     $deviceTypeName = $jobDetails['brand'] . ' ' . $jobDetails['model'] ?? 'Mobile Device';

    //     return RepairServiceDeviceType::firstOrCreate(
    //         ['name' => $deviceTypeName],
    //         ['description' => 'Device repair service']
    //     )->id;
    // }

    /**
     * Prepare custom fields data.
     */
    private function prepareCustomFields(array $jobDetails, array $initialCheck): array
    {
        return [
            'color' => $jobDetails['color'] ?? null,
            'device_password' => $jobDetails['password'] ?? null,
            'provider_info' => $jobDetails['provider'] ?? null,
            'warranty_status' => $jobDetails['warranty'] ?? null,
            'physical_condition' => $initialCheck['physicalCondition'] ?? null,
            'risk_agreement' => $initialCheck['riskAgreement'] ?? null,
            'accessories' => $initialCheck['accessories'] ?? null,
        ];
    }

    /**
     * Create status history.
     */
    private function createStatusHistory(RepairOrder $repairOrder, string $notes = ''): void
    {
        RepairOrderStatusHistory::create([
            'repair_order_id' => $repairOrder->id,
            'status' => $repairOrder->status,
            'notes' => $notes,
            'changed_by' => Auth::id(),
        ]);
    }

    /**
     * Process payments.
     */
    private function processPayments(RepairOrder $repairOrder, int $customerId, array $paymentInfo): void
    {
        // Implement payment processing logic here
        // This could include creating payment records, updating balances, etc.
    }

    /**
     * Send notifications based on user preferences.
     */
    private function sendNotifications(RepairOrder $repairOrder, array $otherInfo): void
    {
        $channels = $otherInfo['notification_channel'] ?? [];

        if (in_array('sms', $channels)) {
            // Implement SMS notification
        }

        if (in_array('email', $channels)) {
            // Implement email notification
        }

        if (in_array('whatsapp', $channels)) {
            // Implement WhatsApp notification
        }
    }
}