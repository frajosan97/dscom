<?php

namespace App\Http\Controllers\Erp\Hrm;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreRequest;
use App\Http\Requests\Employee\UpdateRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Imports\UsersImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Throwable;
use Yajra\DataTables\Facades\DataTables;

class EmployeeController extends Controller
{
    /**
     * Display employee listing page or DataTable response
     */
    public function index(Request $request)
    {
        try {
            if ($request->ajax() || $request->has('draw')) {
                $query = User::with(['branch', 'roles'])
                    ->whereDoesntHave('roles', fn($q) => $q->where('name', 'customer'));

                return DataTables::eloquent($query)
                    ->addIndexColumn()
                    ->addColumn('profile_image', fn($row) => view('partials.backend.employee.profile_image', compact('row'))->render())
                    ->addColumn('name', fn($row) => view('partials.backend.employee.name', compact('row'))->render())
                    ->addColumn('contact', fn($row) => view('partials.backend.employee.contact', compact('row'))->render())
                    ->addColumn('role', fn($row) => view('partials.backend.employee.role', compact('row'))->render())
                    ->addColumn('salary', fn($row) => view('partials.backend.employee.salary', compact('row'))->render())
                    ->addColumn('status', fn($row) => view('partials.backend.employee.status', compact('row'))->render())
                    ->addColumn('action', fn($row) => view('partials.backend.employee.action', compact('row'))->render())
                    ->rawColumns(['profile_image', 'name', 'contact', 'role', 'salary', 'status', 'action'])
                    ->make(true);
            }

            return Inertia::render('Backend/ERP/HRM/Employee');
        } catch (Throwable $e) {
            return $request->ajax()
                ? response()->json(['error' => 'Failed to load employee data'], 500)
                : back()->with('error', 'Failed to load employee list.');
        }
    }

    /**
     * Show employee creation form
     */
    public function create()
    {
        return Inertia::render('Backend/ERP/HRM/EmployeeForm');
    }

    /**
     * Store a new employee
     */
    public function store(StoreRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();
            $role = $validated['role'] ?? null;

            $userData = $this->prepareUserData($validated);
            $user = User::create($userData);

            if ($role) {
                $user->assignRole($role);
            }

            // if ($user->email && isset($validated['password'])) {
            //     Mail::to($user->email)->send(new EmployeeWelcomeMail(
            //         $user,
            //         $validated['password']
            //     ));
            // }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully',
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create employee. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Prepare user data for creation
     */
    private function prepareUserData(array $validated): array
    {
        $userData = Arr::except($validated, ['role', 'confirm_password']);

        return array_merge($userData, [
            'token' => Str::random(60),
            'created_by' => Auth::id(),
            'email_verified_at' => now(),
            'is_active' => ($validated['status'] ?? 'active') === 'active',
            'is_verified' => true,
            'balance' => $validated['opening_balance'] ?? 0,
            'password' => Hash::make($validated['password']),
        ]);
    }

    /**
     * Display employee details
     */
    public function show(User $employee)
    {
        $employee->load([
            'branch',
            'roles',
            'department',
            'sales',
            'salary',
            'attendance',
        ]);

        return Inertia::render('Backend/ERP/HRM/EmployeeShow', [
            'employee' => $employee,
        ]);
    }

    /**
     * Get employee data for editing
     */
    public function edit(User $employee)
    {
        try {
            $employee->load(['roles']);

            return Inertia::render('Backend/ERP/HRM/EmployeeForm', [
                'employee' => $employee
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load employee data.',
            ], 500);
        }
    }

    /**
     * Update employee
     */
    public function update(UpdateRequest $request, User $employee): JsonResponse
    {
        try {
            $validated = $request->validated();
            $updateData = Arr::except($validated, ['role', 'permissions', 'password_confirmation']);

            // Handle password update
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            // Update employee
            $employee->update(array_merge($updateData, [
                'updated_by' => Auth::id(),
                'is_active' => $validated['is_active'] ?? $employee->is_active,
            ]));

            // Update role if provided
            if ($request->filled('role')) {
                $employee->syncRoles([$request->role]);
            }

            // Update permissions if provided
            if ($request->filled('permissions')) {
                $employee->syncPermissions($request->permissions);
            }

            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully',
            ]);

        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update employee.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Delete employee (soft delete)
     */
    public function destroy(User $employee): JsonResponse
    {
        try {
            $employee->delete();

            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully',
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete employee.',
            ], 500);
        }
    }

    /**
     * Handle Excel import
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120'
        ]);

        try {
            $import = new UsersImport();

            Excel::import($import, $request->file('file'));

            return response()->json([
                'success' => true,
                'message' => 'Employees imported successfully',
            ]);

        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errors = [];

            foreach ($failures as $failure) {
                $errors[] = "Row {$failure->row()}: " . implode(', ', $failure->errors());
            }

            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred',
                'errors' => $errors
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error importing file: ' . $e->getMessage(),
                'error_details' => $e->getMessage()
            ], 500);
        }
    }
}