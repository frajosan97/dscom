<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\Branch\StoreRequest;
use App\Http\Requests\Setting\Branch\UpdateRequest;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BranchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has('draw')) {
            $branches = Branch::query()->withoutTrashed();

            return datatables()->of($branches)
                ->addColumn('branch_name', fn($row) => $row->branch_name ?? 'N/A')
                ->addColumn('address', fn($row) => $row->address ?? 'N/A')
                ->addColumn('status_badge', function ($row) {
                    return view('partials.settings.status', compact('row'))->render();
                })
                ->addColumn('action', function ($row) {
                    return view('partials.settings.actions', compact('row'))->render();
                })
                ->rawColumns(['status_badge', 'action'])
                ->make();
        }

        return Inertia::render('Backend/ERP/Setting/Branch');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        DB::beginTransaction();
        try {
            $branch = Branch::create($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Branch craeted successfully.',
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
    public function edit(Branch $branch)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Branch fetched successfully.',
                'data' => $branch
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
    public function update(UpdateRequest $request, Branch $branch)
    {
        DB::beginTransaction();
        try {
            $branch->update($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Branch updated successfully.',
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
    public function destroy(Branch $branch)
    {
        DB::beginTransaction();
        try {
            $branch->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Branch deleted successfully.',
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
