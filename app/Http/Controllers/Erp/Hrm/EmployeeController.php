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
use Illuminate\Support\Facades\Log;
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
                return $this->getEmployeeDataTable($request);
            }

            return Inertia::render('Backend/ERP/HRM/Employee');
        } catch (Throwable $e) {
            Log::error('Employee index error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'request' => $request->all(),
            ]);

            return $request->ajax()
                ? response()->json(['error' => 'Failed to load employee data'], 500)
                : back()->with('error', 'Failed to load employee list.');
        }
    }

    /**
     * Get DataTable response for employees
     */
    private function getEmployeeDataTable(Request $request)
    {
        $query = User::with(['branch', 'roles'])
            ->whereDoesntHave('roles', fn($q) => $q->where('name', 'customer'))
            ->when($request->filled('branch_id'), fn($q) => $q->where('branch_id', $request->branch_id))
            ->when($request->filled('is_active'), fn($q) => $q->where('is_active', $request->is_active))
            ->when($request->filled('role'), function ($q) use ($request) {
                $q->whereHas('roles', fn($query) => $query->where('name', $request->role));
            });

        return DataTables::eloquent($query)
            ->addIndexColumn()
            ->addColumn('photo', fn($row) => $this->getPhotoColumn($row))
            ->addColumn('role', fn($row) => $this->getRoleColumn($row))
            ->addColumn('ending_date', fn() => '')
            ->addColumn('download_assets', fn() => '')
            ->addColumn('status', fn($row) => view('partials.backend.status-badge', compact('row'))->render())
            ->addColumn('action', fn($row) => view('partials.backend.employee-actions', compact('row'))->render())
            ->rawColumns(['photo', 'status', 'action', 'role'])
            ->make(true);
    }

    /**
     * Get formatted photo column
     */
    private function getPhotoColumn(User $user): string
    {
        $photoPath = $user->profile_image
            ? asset('storage/' . ltrim($user->profile_image, '/'))
            : asset('/storage/images/profile/default.png');

        return sprintf(
            '<img src="%s" class="img-fluid thumbnail" style="max-width: 30px" alt="User Photo">',
            e($photoPath)
        );
    }

    /**
     * Get formatted role column
     */
    private function getRoleColumn(User $user): string
    {
        $roleName = $user->roles->first()?->name;

        return $roleName
            ? ucfirst($roleName)
            : '<span class="text-muted">No role</span>';
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

            $this->handlePostCreationTasks($user, $validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->full_name ?? "{$user->first_name} {$user->last_name}",
                    'email' => $user->email,
                    'username' => $user->username,
                    'phone' => $user->phone,
                    'role' => $role,
                ],
                'redirect' => route('employee.show', $user),
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Employee creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
            ]);

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
     * Handle post-creation tasks (email, logging, etc.)
     */
    private function handlePostCreationTasks(User $user, array $validated): void
    {
        if ($user->email && isset($validated['password'])) {
            $this->sendWelcomeEmail($user, $validated['password']);
        }

        if (!$user->email || !isset($validated['password'])) {
            Log::info('Employee created without email credentials', [
                'user_id' => $user->id,
                'has_email' => !empty($user->email),
                'has_password' => isset($validated['password']),
            ]);
        }
    }

    /**
     * Send welcome email to employee
     */
    private function sendWelcomeEmail(User $user, string $plainPassword): void
    {
        try {
            // Uncomment when mail class is ready
            // Mail::to($user->email)->send(new EmployeeWelcomeMail($user, $plainPassword));

            Log::info('Welcome email queued for employee', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (Throwable $e) {
            Log::warning('Failed to send welcome email', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Display employee details
     */
    public function show(User $employee)
    {
        $employee->load(['branch', 'department', 'roles', 'technician']);

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
            Log::error('Employee edit error:', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
            ]);

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
                'data' => [
                    'id' => $employee->id,
                    'name' => "{$employee->first_name} {$employee->last_name}",
                ],
            ]);

        } catch (Throwable $e) {
            Log::error('Employee update failed:', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
            ]);

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

            Log::info('Employee soft deleted', [
                'employee_id' => $employee->id,
                'deleted_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully',
            ]);
        } catch (Throwable $e) {
            Log::error('Employee deletion failed:', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete employee.',
            ], 500);
        }
    }
}