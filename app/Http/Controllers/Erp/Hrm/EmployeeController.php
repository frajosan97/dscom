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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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

            $this->handlePostCreationTasks($user, $validated);

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

            $rowCount = $import->getRowCount();
            $errors = $import->getErrors();

            // Format errors as simple strings for frontend
            $formattedErrors = [];
            if (!empty($errors)) {
                foreach ($errors as $error) {
                    $formattedErrors[] = is_string($error) ? $error : [];
                }
            }

            return response()->json([
                'success' => true,
                'message' => $rowCount . ' employees imported successfully',
                'imported_count' => $rowCount,
                'errors' => $formattedErrors
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
            Log::error('Import error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error importing file: ' . $e->getMessage(),
                'error_details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download import template
     */
    public function downloadTemplate()
    {
        // Create templates directory if it doesn't exist
        Storage::makeDirectory('templates');

        $filePath = storage_path('app/templates/employee_import_template.xlsx');

        // Create template if it doesn't exist
        if (!file_exists($filePath)) {
            $this->createTemplate();
        }

        return response()->download($filePath, 'employee_import_template.xlsx');
    }

    /**
     * Create import template
     */
    private function createTemplate()
    {
        $template = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $template->getActiveSheet();

        // Headers
        $headers = [
            'firstname',
            'lastname',
            'email',
            'phone',
            'designation',
            'password',
            'role'
        ];

        $sheet->fromArray($headers, NULL, 'A1');

        // Style the headers
        $sheet->getStyle('A1:G1')->getFont()->setBold(true);

        // Auto size columns
        foreach (range('A', 'G') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($template);
        $writer->save(storage_path('app/templates/employee_import_template.xlsx'));
    }
}