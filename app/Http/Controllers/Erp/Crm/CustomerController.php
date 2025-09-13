<?php

namespace App\Http\Controllers\Erp\Crm;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreRequest;
use App\Http\Requests\Customer\UpdateRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $users = User::with(['branch', 'roles'])
                    ->select('users.*')
                    ->whereHas('roles', fn($q) => $q->where('name', 'customer'))
                    ->when($request->filled('is_active'), fn($q) => $q->where('is_active', $request->is_active))
                    ->when($request->filled('role'), function ($q) use ($request) {
                        $q->whereHas('roles', fn($query) => $query->where('name', $request->role));
                    });

                return DataTables::of($users)
                    ->addIndexColumn()
                    ->addColumn('role', fn($row) => $row->roles->first()?->name ? ucfirst($row->roles->first()->name) : '<span class="text-muted">No role</span>')
                    ->addColumn('status', fn($row) => view('partials.backend.status-badge', compact('row'))->render())
                    ->addColumn('action', fn($row) => view('partials.backend.customer-actions', compact('row'))->render())
                    ->rawColumns(['status', 'action'])
                    ->make(true);
            }

            return Inertia::render('Backend/ERP/CRM/Customer', [
                'filters' => $request->only(['is_active', 'role']),
            ]);
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to load customer list: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Backend/ERP/CRM/CustomerCreate');
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(StoreRequest $request)
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();

            $user = User::create($validated + [
                'ending_date' => now()->addYear()
            ]);

            $user->assignRole('customer');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Customer created successfully',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $customer)
    {
        try {
            $customer->load(['services', 'orders', 'payments']);

            return Inertia::render('Backend/ERP/CRM/CustomerShow', [
                'customer' => $customer
            ]);
        } catch (\Throwable $e) {
            return back()->with('error', 'Customer not found.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $customer = User::with(['branch', 'roles'])->findOrFail($id);

            return Inertia::render('Backend/ERP/CRM/CustomerEdit', [
                'customer' => $customer
            ]);
        } catch (\Throwable $e) {
            return back()->with('error', 'Customer not found.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, string $id)
    {
        DB::beginTransaction();

        try {
            $customer = User::findOrFail($id);

            $validated = $request->validated();
            $customer->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Customer updated successfully',
                'data' => $customer
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Update failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();

        try {
            $customer = User::findOrFail($id);
            $customer->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Customer deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Deletion failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
