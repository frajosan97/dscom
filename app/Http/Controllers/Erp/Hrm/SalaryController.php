<?php

namespace App\Http\Controllers\Erp\Hrm;

use App\Http\Controllers\Controller;
use App\Http\Requests\Salary\StoreRequest;
use App\Http\Requests\Salary\UpdateRequest;
use App\Http\Requests\Salary\PaymentRequest;
use App\Http\Requests\Salary\BulkCalculateRequest;
use App\Http\Requests\Salary\ApproveRequest;
use App\Models\Erp\Hrm\Salary;
use App\Models\Erp\Hrm\SalaryComponent;
use App\Models\Erp\Hrm\SalaryPayment;
use App\Models\Erp\Hrm\PayrollPeriod;
use App\Models\Erp\Hrm\Attendance;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;
use Yajra\DataTables\Facades\DataTables;

class SalaryController extends Controller
{
    /**
     * Display salary listing page or DataTable response
     */
    public function index(Request $request)
    {
        try {
            if ($request->ajax() || $request->has('draw')) {
                return $this->getSalaryDataTable($request);
            }

            return Inertia::render('Backend/ERP/HRM/Salary');
        } catch (Throwable $e) {
            Log::error('Salary index error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'request' => $request->all(),
            ]);

            return $request->ajax()
                ? response()->json(['error' => 'Failed to load salary data'], 500)
                : back()->with('error', 'Failed to load salary list.');
        }
    }

    /**
     * Get DataTable response for salaries
     */
    private function getSalaryDataTable(Request $request)
    {
        $query = Salary::with(['employee', 'payrollPeriod', 'payments'])
            ->when($request->filled('payroll_period_id'), fn($q) => $q->where('payroll_period_id', $request->payroll_period_id))
            ->when($request->filled('employee_id'), fn($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when(
                $request->filled('date_from') && $request->filled('date_to'),
                fn($q) => $q->whereBetween('salary_date', [$request->date_from, $request->date_to])
            )
            ->orderBy('created_at', 'desc');

        return DataTables::eloquent($query)
            ->addIndexColumn()
            ->addColumn('employee_name', fn($row) => $row->employee?->full_name ?? 'N/A')
            ->addColumn('period', fn($row) => $row->payrollPeriod?->name ?? 'N/A')
            ->addColumn('basic_salary', fn($row) => $row->basic_salary)
            ->addColumn('gross_salary', fn($row) => $row->gross_salary)
            ->addColumn('net_salary', fn($row) => $row->net_salary)
            ->addColumn('status', fn($row) => $this->getStatusBadge($row))
            ->addColumn('payment_status', fn($row) => $this->getPaymentStatus($row))
            ->addColumn('action', fn($row) => view('partials.backend.salary-actions', compact('row'))->render())
            ->rawColumns(['status', 'payment_status', 'action'])
            ->make(true);
    }

    /**
     * Get formatted status badge
     */
    private function getStatusBadge(Salary $salary): string
    {
        $statusColors = [
            'pending' => 'warning',
            'calculated' => 'info',
            'approved' => 'primary',
            'paid' => 'success',
            'cancelled' => 'danger',
        ];

        $color = $statusColors[$salary->status] ?? 'secondary';
        $status = ucfirst($salary->status);

        return sprintf(
            '<span class="badge bg-%s">%s</span>',
            $color,
            e($status)
        );
    }

    /**
     * Get payment status
     */
    private function getPaymentStatus(Salary $salary): string
    {
        if ($salary->status !== 'paid') {
            return '<span class="text-muted">Not Paid</span>';
        }

        $latestPayment = $salary->payments->last();
        if (!$latestPayment) {
            return '<span class="text-muted">Paid</span>';
        }

        return sprintf(
            '<span class="badge bg-success">Paid on %s</span>',
            $latestPayment->payment_date->format('d/m/Y')
        );
    }

    /**
     * Show salary creation form
     */
    public function create()
    {
        try {
            $periods = PayrollPeriod::where('status', 'open')
                ->orderBy('start_date', 'desc')
                ->get(['id', 'name', 'start_date', 'end_date']);

            $employees = User::whereDoesntHave('roles', fn($q) => $q->where('name', 'customer'))
                ->active()
                ->with(['branch', 'department', 'designation'])
                ->get(['id', 'first_name', 'last_name', 'employee_id', 'basic_salary']);

            $components = SalaryComponent::active()->get();

            return Inertia::render('Backend/ERP/HRM/Salary/Form', [
                'periods' => $periods,
                'employees' => $employees,
                'components' => $components,
                'defaultComponents' => SalaryComponent::getDefaultComponents(),
            ]);
        } catch (Throwable $e) {
            Log::error('Salary create form error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
            ]);

            return back()->with('error', 'Failed to load salary creation form.');
        }
    }

    /**
     * Store a new salary
     */
    public function store(StoreRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();

            // Check for existing salary
            $existingSalary = Salary::where('employee_id', $validated['employee_id'])
                ->where('payroll_period_id', $validated['payroll_period_id'])
                ->first();

            if ($existingSalary) {
                return response()->json([
                    'success' => false,
                    'message' => 'Salary already exists for this employee and period.',
                ], 409);
            }

            // Calculate totals
            $calculatedData = $this->calculateSalary($validated);

            // Create salary record
            $salary = Salary::create(array_merge($calculatedData, [
                'employee_id' => $validated['employee_id'],
                'payroll_period_id' => $validated['payroll_period_id'],
                'salary_date' => PayrollPeriod::find($validated['payroll_period_id'])->end_date,
                'status' => 'calculated',
                'notes' => $validated['notes'] ?? null,
                'created_by' => Auth::id(),
            ]));

            // Save salary components
            $this->saveSalaryComponents($salary, $validated['components'] ?? []);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Salary created successfully.',
                'data' => [
                    'id' => $salary->id,
                    'employee_name' => $salary->employee?->full_name,
                    'period' => $salary->payrollPeriod?->name,
                    'net_salary' => $salary->net_salary,
                ],
                'redirect' => route('salaries.show', $salary),
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Salary creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create salary. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Calculate salary from request data
     */
    private function calculateSalary(array $validated): array
    {
        $basicSalary = $validated['basic_salary'];
        $components = $validated['components'] ?? [];

        $totalAllowances = collect($components)
            ->where('type', 'allowance')
            ->sum('amount');

        $totalDeductions = collect($components)
            ->where('type', 'deduction')
            ->sum('amount');

        $grossSalary = $basicSalary + $totalAllowances;
        $netSalary = $grossSalary - $totalDeductions;

        return [
            'basic_salary' => $basicSalary,
            'total_allowances' => $totalAllowances,
            'total_deductions' => $totalDeductions,
            'gross_salary' => $grossSalary,
            'net_salary' => $netSalary,
        ];
    }

    /**
     * Save salary components
     */
    private function saveSalaryComponents(Salary $salary, array $components): void
    {
        foreach ($components as $component) {
            $salary->components()->create([
                'salary_component_id' => $component['id'],
                'amount' => $component['amount'],
                'type' => $component['type'],
            ]);
        }
    }

    /**
     * Display salary details
     */
    public function show(Salary $salary)
    {
        try {
            $salary->load([
                'employee.branch',
                'employee.department',
                'employee.designation',
                'payrollPeriod',
                'components.component',
                'payments.transaction',
                'createdBy',
                'approvedBy',
            ]);

            $breakdown = $this->getSalaryBreakdown($salary);

            return Inertia::render('Backend/ERP/HRM/Salary/Show', [
                'salary' => $salary,
                'breakdown' => $breakdown,
            ]);
        } catch (Throwable $e) {
            Log::error('Salary show error:', [
                'salary_id' => $salary->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to load salary details.');
        }
    }

    /**
     * Get salary breakdown for display
     */
    private function getSalaryBreakdown(Salary $salary): array
    {
        $allowances = $salary->components()
            ->whereHas('component', fn($q) => $q->where('type', 'allowance'))
            ->with('component')
            ->get()
            ->map(fn($item) => [
                'name' => $item->component->name,
                'amount' => $item->amount,
                'code' => $item->component->code,
            ]);

        $deductions = $salary->components()
            ->whereHas('component', fn($q) => $q->where('type', 'deduction'))
            ->with('component')
            ->get()
            ->map(fn($item) => [
                'name' => $item->component->name,
                'amount' => $item->amount,
                'code' => $item->component->code,
            ]);

        return [
            'allowances' => $allowances,
            'deductions' => $deductions,
            'summary' => [
                'basic_salary' => $salary->basic_salary,
                'total_allowances' => $salary->total_allowances,
                'total_deductions' => $salary->total_deductions,
                'gross_salary' => $salary->gross_salary,
                'net_salary' => $salary->net_salary,
            ],
        ];
    }

    /**
     * Get salary data for editing
     */
    public function edit(Salary $salary)
    {
        try {
            if (!in_array($salary->status, ['pending', 'calculated'])) {
                return back()->with('error', 'Cannot edit salary with status: ' . $salary->status);
            }

            $salary->load(['components.component']);

            $periods = PayrollPeriod::where('status', 'open')->get(['id', 'name']);
            $employees = User::active()->get(['id', 'first_name', 'last_name']);
            $components = SalaryComponent::active()->get();

            return Inertia::render('Backend/ERP/HRM/Salary/Form', [
                'salary' => $salary,
                'periods' => $periods,
                'employees' => $employees,
                'components' => $components,
                'isEdit' => true,
            ]);
        } catch (Throwable $e) {
            Log::error('Salary edit error:', [
                'salary_id' => $salary->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to load salary edit form.');
        }
    }

    /**
     * Update salary
     */
    public function update(UpdateRequest $request, Salary $salary): JsonResponse
    {
        try {
            if (!in_array($salary->status, ['pending', 'calculated'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update salary with status: ' . $salary->status,
                ], 403);
            }

            $validated = $request->validated();
            $calculatedData = $this->calculateSalary($validated);

            DB::beginTransaction();

            // Update salary
            $salary->update(array_merge($calculatedData, [
                'notes' => $validated['notes'] ?? $salary->notes,
                'status' => $validated['status'] ?? $salary->status,
                'updated_by' => Auth::id(),
            ]));

            // Update components
            $salary->components()->delete();
            $this->saveSalaryComponents($salary, $validated['components'] ?? []);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Salary updated successfully.',
                'data' => [
                    'id' => $salary->id,
                    'employee_name' => $salary->employee?->full_name,
                    'net_salary' => $salary->net_salary,
                ],
            ]);

        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Salary update failed:', [
                'salary_id' => $salary->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update salary.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Delete salary
     */
    public function destroy(Salary $salary): JsonResponse
    {
        try {
            if (!in_array($salary->status, ['pending', 'calculated'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete salary with status: ' . $salary->status,
                ], 403);
            }

            DB::beginTransaction();

            $salary->components()->delete();
            $salary->delete();

            DB::commit();

            Log::info('Salary deleted', [
                'salary_id' => $salary->id,
                'deleted_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Salary deleted successfully.',
            ]);

        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Salary deletion failed:', [
                'salary_id' => $salary->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete salary.',
            ], 500);
        }
    }

    /**
     * Process salary payment
     */
    public function processPayment(PaymentRequest $request, Salary $salary): JsonResponse
    {
        if ($salary->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Salary must be approved before payment.',
            ], 403);
        }

        DB::beginTransaction();

        try {
            $validated = $request->validated();

            // // Create transaction
            // $transaction = Transaction::create([
            //     'date' => $validated['payment_date'],
            //     'type' => 'expense',
            //     'amount' => $salary->net_salary,
            //     'description' => sprintf(
            //         'Salary payment for %s - %s',
            //         $salary->employee->full_name,
            //         $salary->payrollPeriod->name
            //     ),
            //     'reference_no' => $validated['reference_no'] ?? null,
            //     'payment_method' => $validated['payment_method'],
            //     'account_id' => in_array($validated['payment_method'], ['bank_transfer', 'online'])
            //         ? $validated['account_id']
            //         : null,
            //     'status' => 'completed',
            //     'created_by' => Auth::id(),
            // ]);

            // Create salary payment
            $payment = SalaryPayment::create([
                'salary_id' => $salary->id,
                // 'transaction_id' => $transaction->id,
                'amount' => $salary->net_salary,
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'reference_no' => $validated['reference_no'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'paid_by' => Auth::id(),
            ]);

            // Update salary status
            $salary->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Salary payment processed successfully.',
            ]);

        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Salary payment failed:', [
                'salary_id' => $salary->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process salary payment.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Bulk salary calculation
     */
    public function bulkCalculate(BulkCalculateRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();
            $period = PayrollPeriod::findOrFail($validated['payroll_period_id']);

            if ($period->status !== 'open') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll period is not open for calculation.',
                ], 403);
            }

            // Get employees to process
            $query = User::active()
                ->whereDoesntHave('roles', fn($q) => $q->where('name', 'customer'));

            if (!empty($validated['employee_ids'])) {
                $query->whereIn('id', $validated['employee_ids']);
            }

            $employees = $query->get();

            $calculatedSalaries = [];
            $errors = [];

            foreach ($employees as $employee) {
                try {
                    // Check existing salary
                    if (
                        Salary::where('employee_id', $employee->id)
                            ->where('payroll_period_id', $period->id)
                            ->exists()
                    ) {
                        $errors[] = "Salary already exists for employee: {$employee->full_name}";
                        continue;
                    }

                    $salary = $this->calculateAutoSalary($employee, $period);
                    $calculatedSalaries[] = $salary;
                } catch (Throwable $e) {
                    $errors[] = "Failed for {$employee->full_name}: " . $e->getMessage();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bulk salary calculation completed.',
                'data' => [
                    'calculated_count' => count($calculatedSalaries),
                    'error_count' => count($errors),
                    'errors' => $errors,
                ],
            ]);

        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Bulk salary calculation failed:', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process bulk calculation.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Calculate salary automatically for employee
     */
    private function calculateAutoSalary(User $employee, PayrollPeriod $period): Salary
    {
        $basicSalary = $employee->basic_salary ?? 0;

        // Calculate allowances and deductions from employee's assigned components
        $totalAllowances = $employee->allowances()
            ->where('is_active', true)
            ->where(function ($query) use ($period) {
                $query->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', $period->end_date);
            })
            ->sum('amount');

        $totalDeductions = $employee->deductions()
            ->where('is_active', true)
            ->where(function ($query) use ($period) {
                $query->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', $period->end_date);
            })
            ->sum('amount');

        // Calculate additional adjustments
        $attendanceAdjustment = $this->calculateAttendanceAdjustment($employee, $period);
        $totalDeductions += $attendanceAdjustment;

        // Calculate final amounts
        $grossSalary = $basicSalary + $totalAllowances;
        $netSalary = $grossSalary - $totalDeductions;

        // Create salary record
        $salary = Salary::create([
            'employee_id' => $employee->id,
            'payroll_period_id' => $period->id,
            'basic_salary' => $basicSalary,
            'total_allowances' => $totalAllowances,
            'total_deductions' => $totalDeductions,
            'gross_salary' => $grossSalary,
            'net_salary' => $netSalary,
            'salary_date' => $period->end_date,
            'status' => 'calculated',
            'created_by' => Auth::id(),
            'calculation_notes' => 'Auto-calculated',
        ]);

        // Save components (you can add logic to save individual components here)

        return $salary;
    }

    /**
     * Calculate attendance adjustment
     */
    private function calculateAttendanceAdjustment(User $employee, PayrollPeriod $period): float
    {
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('date', [$period->start_date, $period->end_date])
            ->get();

        $totalWorkingDays = $period->working_days ?? 26;
        $presentDays = $attendances->where('status', 'present')->count();
        $absentDays = $attendances->where('status', 'absent')->count();
        $halfDays = $attendances->where('status', 'half_day')->count();

        $dailyRate = $employee->basic_salary / $totalWorkingDays;

        return ($absentDays * $dailyRate) + ($halfDays * ($dailyRate / 2));
    }

    /**
     * Approve salary
     */
    public function approve(ApproveRequest $request, Salary $salary): JsonResponse
    {
        if ($salary->status !== 'calculated') {
            return response()->json([
                'success' => false,
                'message' => 'Salary must be calculated before approval.',
            ], 403);
        }

        try {
            $salary->update([
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'approval_notes' => $request->notes ?? null,
            ]);

            Log::info('Salary approved', [
                'salary_id' => $salary->id,
                'approved_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Salary approved successfully.',
                'data' => [
                    'id' => $salary->id,
                    'status' => $salary->status,
                ],
            ]);

        } catch (Throwable $e) {
            Log::error('Salary approval failed:', [
                'salary_id' => $salary->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve salary.',
            ], 500);
        }
    }

    /**
     * Get salary statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $periodId = $request->period_id;

            if (!$periodId) {
                $latestPeriod = PayrollPeriod::orderBy('end_date', 'desc')->first();
                $periodId = $latestPeriod?->id;
            }

            $query = Salary::query();

            if ($periodId) {
                $query->where('payroll_period_id', $periodId);
            }

            if ($request->filled('date_from') && $request->filled('date_to')) {
                $query->whereBetween('salary_date', [$request->date_from, $request->date_to]);
            }

            $stats = [
                'total_salaries' => $query->count(),
                'total_amount' => $query->sum('net_salary'),
                'pending_count' => $query->where('status', 'calculated')->count(),
                'approved_count' => $query->where('status', 'approved')->count(),
                'paid_count' => $query->where('status', 'paid')->count(),
                'department_breakdown' => $this->getDepartmentBreakdown($periodId),
                'status_distribution' => $this->getStatusDistribution($periodId),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);

        } catch (Throwable $e) {
            Log::error('Salary statistics error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to load statistics.',
            ], 500);
        }
    }

    /**
     * Get department breakdown
     */
    private function getDepartmentBreakdown($periodId)
    {
        return Salary::select(
            'departments.name as department',
            DB::raw('COUNT(salaries.id) as employee_count'),
            DB::raw('SUM(salaries.net_salary) as total_salary')
        )
            ->join('users', 'salaries.employee_id', '=', 'users.id')
            ->join('departments', 'users.department_id', '=', 'departments.id')
            ->when($periodId, fn($q) => $q->where('salaries.payroll_period_id', $periodId))
            ->groupBy('departments.id', 'departments.name')
            ->get();
    }

    /**
     * Get status distribution
     */
    private function getStatusDistribution($periodId)
    {
        return Salary::select('status', DB::raw('COUNT(*) as count'))
            ->when($periodId, fn($q) => $q->where('payroll_period_id', $periodId))
            ->groupBy('status')
            ->get();
    }
}