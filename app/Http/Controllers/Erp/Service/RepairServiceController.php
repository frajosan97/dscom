<?php

namespace App\Http\Controllers\Erp\Service;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\RepairService\StoreRequest;
use App\Http\Requests\Setting\RepairService\UpdateRequest;
use App\Models\RepairService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RepairServiceController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('draw')) {
            $services = RepairService::query()
                ->withoutTrashed()
                ->withCount('orders');

            return datatables()->of($services)
                ->addColumn('name', fn($row) => $row->name ?? 'N/A')
                ->addColumn('base_price', fn($row) => number_format($row->base_price, 2))
                ->addColumn('orders_count', fn($row) => $row->orders_count)
                ->addColumn('status', function ($row) {
                    return view('partials.settings.status', compact('row'))->render();
                })
                ->addColumn('action', function ($row) {
                    return view('partials.settings.actions', compact('row'))->render();
                })
                ->rawColumns(['status', 'action'])
                ->make();
        }

        return Inertia::render('Backend/ERP/Setting/RepairService');
    }

    public function store(StoreRequest $request)
    {
        DB::beginTransaction();
        try {
            $service = RepairService::create($request->validated());

            // Sync device types and pricing
            if ($request->has('device_types')) {
                $this->syncDeviceTypes($service, $request->device_types);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Repair service created successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function edit(RepairService $repairService)
    {
        try {
            $repairService->load(['deviceTypes', 'pricings']);

            return response()->json([
                'success' => true,
                'message' => 'Repair service fetched successfully.',
                'data' => $repairService
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function update(UpdateRequest $request, RepairService $repairService)
    {
        DB::beginTransaction();
        try {
            $repairService->update($request->validated());

            // Sync device types and pricing
            if ($request->has('device_types')) {
                $this->syncDeviceTypes($repairService, $request->device_types);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Repair service updated successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function destroy(RepairService $repairService)
    {
        DB::beginTransaction();
        try {
            // Prevent deletion if there are orders
            if ($repairService->orders()->exists()) {
                throw new \Exception('Cannot delete repair service with existing orders.');
            }

            $repairService->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Repair service deleted successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    protected function syncDeviceTypes(RepairService $service, array $deviceTypes)
    {
        $syncData = [];
        foreach ($deviceTypes as $deviceType) {
            $syncData[$deviceType['id']] = [
                'price' => $deviceType['price'],
                'min_price' => $deviceType['min_price'],
                'max_price' => $deviceType['max_price'],
                'is_flat_rate' => $deviceType['is_flat_rate'],
                'price_notes' => $deviceType['price_notes']
            ];
        }

        $service->deviceTypes()->sync($syncData);
    }
}
