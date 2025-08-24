<?php

namespace App\Http\Controllers\Erp\Hrm;

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
                        return view('partials.backend.status-badge', compact('row'))->render();
                    })
                    ->addColumn('action', function ($row) {
                        return view('partials.backend.employee-actions', compact('row'))->render();
                    })
                    ->rawColumns(['photo', 'status', 'action'])
                    ->make(true);
            }

            return Inertia::render('Backend/ERP/HRM/Employee', []);
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to load employee list.');
        }
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
            return response()->json([
                'success' => false,
                'message' => 'Employee creation failed. ' . $e->getMessage(),
                'errors' => ['general' => $e->getMessage()]
            ], 500);
        }
    }

    public function edit(User $employee)
    {
        try {
            return response()->json([
                'success'=>true,
                'employee'=>$employee
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success'=>false,
                'message'=>$th->getMessage(),
                'errors'=>['general'=>$th->getMessage()]
            ]);
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
            $employee->delete();
            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Employee deletion failed. ' . $e->getMessage()
            ], 500);
        }
    }
}
