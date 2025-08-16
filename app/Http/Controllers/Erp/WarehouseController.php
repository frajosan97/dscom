<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\WareHouse\StoreRequest;
use App\Http\Requests\Setting\WareHouse\UpdateRequest;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has('draw')) {
            $warehouses = Warehouse::query()
                ->withoutTrashed()
                ->with('branch');

            return datatables()->of($warehouses)
                ->addColumn('name', fn($row) => $row->name ?? 'N/A')
                ->addColumn('code', fn($row) => $row->code ?? 'N/A')
                ->addColumn('branch', fn($row) => $row->branch->name ?? 'N/A')
                ->addColumn('location', function ($row) {
                    return $row->city . ', ' . $row->state . ', ' . $row->country;
                })
                ->addColumn('status', function ($row) {
                    return view('partials.settings.status', compact('row'))->render();
                })
                ->addColumn('action', function ($row) {
                    return view('partials.settings.actions', compact('row'))->render();
                })
                ->rawColumns(['status', 'action'])
                ->make();
        }

        return Inertia::render('Backend/ERP/Setting/Warehouse');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        DB::beginTransaction();
        try {
            $warehouse = Warehouse::create($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Warehouse created successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Warehouse $warehouse)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Warehouse fetched successfully.',
                'data' => $warehouse->load('branch')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, Warehouse $warehouse)
    {
        DB::beginTransaction();
        try {
            $warehouse->update($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Warehouse updated successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Warehouse $warehouse)
    {
        DB::beginTransaction();
        try {
            $warehouse->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Warehouse deleted successfully.',
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
