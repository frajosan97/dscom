<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use App\Http\Requests\RepairService\StoreRequest;
use App\Http\Requests\RepairService\UpdateRequest;
use App\Models\{
    RepairOrder,
    RepairOrderPayment,
    RepairOrderStatusHistory,
    RepairService,
    DeviceType,
    RepairServicePricing,
    Technician,
    User
};
use Illuminate\Http\{Request, JsonResponse};
use Illuminate\Support\Facades\{Auth, DB, Log};
use Illuminate\Support\Str;
use Inertia\{Inertia, Response};
use Yajra\DataTables\Facades\DataTables;

class ServiceController extends Controller
{
    private const ORDER_PREFIX = 'SRO-';
    private const INVOICE_PREFIX = 'SRV-';

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response|JsonResponse
    {
        try {
            if ($request->has('draw')) {
                return $this->handleDataTableRequest($request);
            }

            return Inertia::render("Backend/ERP/Service/Index", [
                'statusOptions' => $this->getStatusOptions(),
                'priorityOptions' => $this->getPriorityOptions(),
            ]);
        } catch (\Throwable $th) {
            Log::error('Service index error: ' . $th->getMessage());
            return $this->redirectWithError($th);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            return Inertia::render("Backend/ERP/Service/Create", [
                'services' => RepairService::all(),
                'deviceTypes' => DeviceType::all(),
                'technicians' => Technician::with('user')->get(),
                'statusOptions' => $this->getStatusOptions(),
                'priorityOptions' => $this->getPriorityOptions(),
            ]);
        } catch (\Throwable $th) {
            Log::error('Service create form error: ' . $th->getMessage());
            return $this->redirectWithError($th);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $order = $this->createRepairOrder($request);
            $this->createPartsIfNeeded($order, $request->parts ?? []);
            $this->createPaymentIfNeeded($order, $request->validated());
            $this->recordStatusHistory($order, 'pending');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Repair order created successfully',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Repair order creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create repair order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(RepairOrder $service): Response
    {
        try {
            return Inertia::render('Backend/ERP/Service/Show', [
                'order' => $service->load([
                    'user',
                    'branch',
                    'repairService',
                    'deviceType',
                    'assignedTechnician',
                    'payments',
                    'parts',
                    'statusHistory.changedBy',
                ]),
                'statusOptions' => $this->getStatusOptions(),
                'priorityOptions' => $this->getPriorityOptions(),
            ]);
        } catch (\Throwable $th) {
            Log::error('Service show error: ' . $th->getMessage());
            return $this->redirectWithError($th);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RepairOrder $service): Response
    {
        try {
            return Inertia::render('Backend/ERP/Service/Edit', [
                'order' => $service->load([
                    'user',
                    'branch',
                    'repairService',
                    'deviceType',
                    'assignedTechnician',
                    'payments',
                    'parts',
                ]),
                'services' => RepairService::active()->get(),
                'deviceTypes' => DeviceType::active()->get(),
                'technicians' => User::technicians()->get(),
                'statusOptions' => $this->getStatusOptions(),
                'priorityOptions' => $this->getPriorityOptions(),
            ]);
        } catch (\Throwable $th) {
            Log::error('Service edit error: ' . $th->getMessage());
            return $this->redirectWithError($th);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, RepairOrder $service): JsonResponse
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();
            $this->updateRepairOrder($service, $validated);

            if (isset($validated['parts'])) {
                $this->updateParts($service, $validated['parts']);
            }

            if (isset($validated['status'])) {
                $this->recordStatusHistory($service, $validated['status']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Repair order updated successfully',
                'order' => $service->fresh()->load(['parts', 'payments']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Repair order update failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update repair order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RepairOrder $service): JsonResponse
    {
        DB::beginTransaction();

        try {
            $service->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Repair order deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Repair order deletion failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete repair order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle datatable request
     */
    private function handleDataTableRequest(Request $request): JsonResponse
    {
        $query = RepairOrder::with([
            'user',
            'branch',
            'repairService',
            'deviceType',
            'assignedTechnician'
        ])->latest();

        return DataTables::of($query)
            ->addColumn('customer', fn($row) => $row->user?->name ?? 'N/A')
            ->addColumn('device', fn($row) => $row->deviceType->name . ' (' . $row->device_brand . ' ' . $row->device_model . ')')
            ->addColumn('service', fn($row) => $row->repairService->name)
            ->addColumn('status', fn($row) => view('partials.service.status', compact('row'))->render())
            ->addColumn('priority', fn($row) => view('partials.service.priority', compact('row'))->render())
            ->addColumn('technician', fn($row) => $row->assignedTechnician?->name ?? 'Not assigned')
            ->addColumn('action', fn($row) => view('partials.service.actions', compact('row'))->render())
            ->rawColumns(['status', 'priority', 'action'])
            ->make(true);
    }

    /**
     * Create new repair order
     */
    private function createRepairOrder(StoreRequest $request): RepairOrder
    {
        $validated = $request->validated();
        $pricing = $this->getServicePricing($validated['repair_service_id'], $validated['device_type_id']);

        return RepairOrder::create([
            'order_number' => self::ORDER_PREFIX . strtoupper(Str::random(8)),
            'invoice_number' => self::INVOICE_PREFIX . date('Ymd') . '-' . mt_rand(1000, 9999),
            'user_id' => $validated['user_id'] ?? null,
            'branch_id' => Auth::user()->branch_id ?? null,
            'repair_service_id' => $validated['repair_service_id'],
            'device_type_id' => $validated['device_type_id'],
            'device_brand' => $validated['device_brand'],
            'device_model' => $validated['device_model'],
            'device_serial' => $validated['device_serial'] ?? null,
            'device_age' => $validated['device_age'] ?? null,
            'device_issue' => $validated['device_issue'],
            'device_notes' => $validated['device_notes'] ?? null,
            'status' => $validated['status'] ?? 'pending',
            'priority' => $validated['priority'] ?? 'medium',
            'diagnosis_fee' => $pricing->diagnosis_fee ?? 0,
            'estimated_cost' => $pricing->price,
            'final_cost' => $pricing->price,
            'total_amount' => $pricing->price,
            'amount_paid' => $validated['amount_paid'] ?? 0,
            'balance_due' => $pricing->price - ($validated['amount_paid'] ?? 0),
            'currency' => $validated['currency'] ?? '$',
            'assigned_technician_id' => $validated['assigned_technician_id'] ?? null,
            'created_by' => Auth::id(),
            'expected_completion_date' => $validated['expected_completion_date'] ?? null,
        ]);
    }

    /**
     * Get service pricing for device type
     */
    private function getServicePricing($serviceId, $deviceTypeId)
    {
        return RepairServicePricing::where('repair_service_id', $serviceId)
            ->where('device_type_id', $deviceTypeId)
            ->firstOrFail();
    }

    /**
     * Create parts if provided
     */
    private function createPartsIfNeeded(RepairOrder $order, array $parts): void
    {
        if (!empty($parts)) {
            $order->parts()->createMany(array_map(function ($part) {
                return [
                    'part_name' => $part['part_name'],
                    'part_number' => $part['part_number'] ?? null,
                    'description' => $part['description'] ?? null,
                    'cost_price' => $part['cost_price'] ?? 0,
                    'selling_price' => $part['selling_price'],
                    'quantity' => $part['quantity'] ?? 1,
                    'total' => $part['selling_price'] * ($part['quantity'] ?? 1),
                    'status' => $part['status'] ?? 'ordered',
                ];
            }, $parts));

            // Update order totals with parts
            $partsTotal = collect($parts)->sum(fn($part) => $part['selling_price'] * ($part['quantity'] ?? 1));
            $order->update([
                'final_cost' => $order->estimated_cost + $partsTotal,
                'total_amount' => $order->estimated_cost + $partsTotal,
                'balance_due' => ($order->estimated_cost + $partsTotal) - $order->amount_paid,
            ]);
        }
    }

    /**
     * Create payment if amount paid > 0
     */
    private function createPaymentIfNeeded(RepairOrder $order, array $validated): void
    {
        if (($validated['amount_paid'] ?? 0) > 0) {
            RepairOrderPayment::create([
                'repair_order_id' => $order->id,
                'user_id' => Auth::id(),
                'amount' => $validated['amount_paid'],
                'payment_method' => $validated['payment_method'] ?? 'cash',
                'payment_type' => $validated['payment_type'] ?? ($validated['amount_paid'] >= $order->total_amount ? 'full' : 'partial'),
                'status' => 'completed',
                'payment_date' => now(),
            ]);
        }
    }

    /**
     * Record status history
     */
    private function recordStatusHistory(RepairOrder $order, string $status): void
    {
        RepairOrderStatusHistory::create([
            'repair_order_id' => $order->id,
            'status' => $status,
            'changed_by' => Auth::id(),
        ]);
    }

    /**
     * Update repair order details
     */
    private function updateRepairOrder(RepairOrder $order, array $validated): void
    {
        $updateData = array_filter([
            'status' => $validated['status'] ?? null,
            'priority' => $validated['priority'] ?? null,
            'assigned_technician_id' => $validated['assigned_technician_id'] ?? null,
            'diagnosis_details' => $validated['diagnosis_details'] ?? null,
            'repair_notes' => $validated['repair_notes'] ?? null,
            'technician_notes' => $validated['technician_notes'] ?? null,
            'final_cost' => $validated['final_cost'] ?? null,
            'total_amount' => $validated['total_amount'] ?? null,
            'expected_completion_date' => $validated['expected_completion_date'] ?? null,
            'completion_date' => $validated['completion_date'] ?? null,
            'delivery_date' => $validated['delivery_date'] ?? null,
        ]);

        if (!empty($updateData)) {
            $order->update($updateData);
        }
    }

    /**
     * Update repair parts
     */
    private function updateParts(RepairOrder $order, array $parts): void
    {
        $order->parts()->delete(); // Remove existing parts
        $this->createPartsIfNeeded($order, $parts); // Add new parts
    }

    /**
     * Get status options for repair orders
     */
    private function getStatusOptions(): array
    {
        return [
            'pending' => 'Pending',
            'diagnosis' => 'Diagnosis',
            'quoted' => 'Quoted',
            'approved' => 'Approved',
            'repairing' => 'Repairing',
            'awaiting_parts' => 'Awaiting Parts',
            'awaiting_customer_response' => 'Awaiting Customer',
            'completed' => 'Completed',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
            'rejected' => 'Rejected',
        ];
    }

    /**
     * Get priority options
     */
    private function getPriorityOptions(): array
    {
        return [
            'low' => 'Low',
            'medium' => 'Medium',
            'high' => 'High',
            'urgent' => 'Urgent',
        ];
    }

    /**
     * Redirect with error message
     */
    private function redirectWithError(\Throwable $th): Response
    {
        return Inertia::render('Error', [
            'message' => $th->getMessage(),
        ]);
    }
}
