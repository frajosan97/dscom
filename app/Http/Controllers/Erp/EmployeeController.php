<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreRequest;
use App\Http\Requests\Employee\UpdateRequest;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Yajra\DataTables\Facades\DataTables;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $users = User::with(['branch', 'roles'])
                    ->select('users.*')
                    ->whereDoesntHave('roles', function ($q) {
                        $q->where('name', 'customer');
                    })
                    ->when($request->filled('branch_id'), fn($q) => $q->where('branch_id', $request->branch_id))
                    ->when($request->filled('is_active'), fn($q) => $q->where('is_active', $request->is_active))
                    ->when($request->filled('role'), function ($q) use ($request) {
                        $q->whereHas('roles', function ($query) use ($request) {
                            $query->where('name', $request->role);
                        });
                    });

                return DataTables::of($users)
                    ->addIndexColumn()
                    ->addColumn('photo', function ($row) {
                        return '<img src="' . asset($row->photo ?? '/storage/images/profile/default.png') . '" class="img_fluid thumbnail" style="max-width: 30px" alt="User Photo">';
                    })
                    ->addColumn('name', function ($row) {
                        return $row->name;
                    })
                    ->addColumn('phone', function ($row) {
                        return $row->phone ?? 'N/A';
                    })
                    ->addColumn('role', function ($row) {
                        return $row->roles->first()?->name ? ucfirst($row->roles->first()->name) : '<span class="text-muted">No role</span>';
                    })
                    ->addColumn('ending_date', function ($row) {
                        return "";
                    })
                    ->addColumn('download_assets', function ($row) {
                        return "";
                    })
                    ->addColumn('status', function ($row) {
                        return view('partials.employee.status', compact('row'))->render();
                    })
                    ->addColumn('action', function ($row) {
                        return view('partials.employee.actions', compact('row'))->render();
                    })
                    ->rawColumns(['photo', 'status', 'action'])
                    ->make(true);
            }

            return Inertia::render('Backend/ERP/Employee/Index', []);
        } catch (\Throwable $e) {
            Log::error('Employee list error: ' . $e->getMessage() . ' Line: ' . $e->getLine());
            return back()->with('error', 'Failed to load employee list.');
        }
    }

    public function create()
    {
        return Inertia::render('Backend/ERP/Employee/Create', []);
    }

    public function store(StoreRequest $request)
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();
            $plainPassword = Str::random(12);

            $userData = array_diff_key($validated, ['role' => '']);

            $user = User::create($userData + [
                'token' => Str::random(60),
                'password' => Hash::make($plainPassword),
                'created_by' => Auth::id(),
                'is_active' => $validated['is_active'] ?? true
            ]);

            $user->assignRole($validated['role']);

            event(new Registered($user));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Employee creation failed", ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Employee creation failed. ' . $e->getMessage(),
                'errors' => ['general' => $e->getMessage()]
            ], 500);
        }
    }

    public function show(User $employee)
    {
        try {
            return Inertia::render('Backend/ERP/Employee/Show', [
                'user' => $employee->load([
                    'roles',
                    'permissions',
                    'company',
                    'county',
                    'constituency',
                    'ward',
                    'location',
                    'market',
                    'branch',
                    'sales.items',
                    'kycSubmissions.document',
                    'authLogs' => function ($query) {
                        $query->latest()->take(10);
                    },
                ]),
            ]);
        } catch (\Throwable $th) {
            Log::error('Employee show error: ' . $th->getMessage() . ' Line: ' . $th->getLine());
            return back()->with('error', 'Failed to load employee details.');
        }
    }

    public function edit(User $employee)
    {
        try {
            return Inertia::render('Backend/ERP/Employee/Edit', [
                'user' => $employee->load([
                    'county',
                    'constituency',
                    'ward',
                    'branch',
                    'kycSubmissions.document',
                    'roles',
                    'permissions',
                ]),
            ]);
        } catch (\Throwable $th) {
            Log::error('Employee edit error: ' . $th->getMessage() . ' Line: ' . $th->getLine());
            return back()->with('error', 'Failed to load employee edit form.');
        }
    }

    public function update(UpdateRequest $request, User $employee)
    {
        try {
            $validated = $request->validated();

            $updateData = array_diff_key($validated, ['roles' => '', 'permissions' => '']);

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $employee->update($updateData + [
                'updated_by' => Auth::id(),
                'is_active' => $validated['is_active'] ?? true
            ]);

            if (!empty($request->role) && $request->filled('role')) {
                $employee->syncRoles($request->role);
            }

            if (!empty($request->permissions) && $request->filled('permissions')) {
                $employee->syncPermissions($request->permissions);
            }

            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully',
                'redirect' => route('employee.show', $employee)
            ]);
        } catch (\Throwable $e) {
            Log::error("Employee update failed", ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Employee update failed. ' . $e->getMessage(),
                'errors' => ['general' => $e->getMessage()]
            ], 500);
        }
    }

    public function destroy(User $employee)
    {
        try {
            // Prevent deleting self
            if ($employee->id === Auth::id()) {
                throw new \Exception('You cannot delete your own account.');
            }

            $employee->delete();

            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully'
            ]);
        } catch (\Throwable $e) {
            Log::error("Employee deletion failed", ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Employee deletion failed. ' . $e->getMessage()
            ], 500);
        }
    }
}
