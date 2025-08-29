<?php

namespace App\Http\Controllers\Erp\Service;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\DeviceType\StoreRequest;
use App\Http\Requests\Setting\DeviceType\UpdateRequest;
use App\Models\RepairServiceDeviceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DeviceTypeController extends Controller
{
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $deviceTypes = RepairServiceDeviceType::query()
                    ->with(['parent', 'children']);
                    // ->withCount(['repairServices']);

                return datatables()->of($deviceTypes)
                    ->addColumn('name', function ($row) {
                        return $row->parent ? $row->parent->name . ' > ' . $row->name : $row->name;
                    })
                    ->addColumn('parent_name', fn($row) => $row->parent?->name ?? '—')
                    ->addColumn('children_count', fn($row) => $row->children_count ?? 0)
                    // ->addColumn('repair_services_count', fn($row) => $row->repair_services_count ?? 0)
                    // ->addColumn('orders_count', fn($row) => $row->orders_count ?? 0)
                    ->addColumn('status_badge', function ($row) {
                        return view('partials.settings.status', compact('row'))->render();
                    })
                    ->addColumn('action', function ($row) {
                        return view('partials.settings.actions', compact('row'))->render();
                    })
                    ->rawColumns(['status_badge', 'action'])
                    ->make();
            }

            return Inertia::render('Backend/ERP/Setting/DeviceType', [
                'parentDeviceTypes' => RepairServiceDeviceType::whereNull('parent_id')->active()->get(['id', 'name'])
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function store(StoreRequest $request)
    {
        DB::beginTransaction();
        try {
            RepairServiceDeviceType::create($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Device type created successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function edit(RepairServiceDeviceType $deviceType)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Device type fetched successfully.',
                'data' => $deviceType
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function update(UpdateRequest $request, RepairServiceDeviceType $deviceType)
    {
        DB::beginTransaction();
        try {
            $deviceType->update($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Device type updated successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function destroy(RepairServiceDeviceType $deviceType)
    {
        DB::beginTransaction();
        try {
            // Prevent deletion if there are children, services, or orders
            if ($deviceType->children()->exists()) {
                throw new \Exception('Cannot delete device type with child categories.');
            }

            if ($deviceType->repairServices()->exists()) {
                throw new \Exception('Cannot delete device type with associated repair services.');
            }

            if ($deviceType->orders()->exists()) {
                throw new \Exception('Cannot delete device type with existing orders.');
            }

            $deviceType->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Device type deleted successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
}
