<?php

namespace App\Http\Controllers\Erp\Hrm;

use App\Http\Controllers\Controller;
use App\Models\Erp\Hrm\Allowance;
use App\Models\Erp\Hrm\Deduction;
use App\Models\Erp\Hrm\Salary;
use App\Models\Erp\Hrm\SalaryComponent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class SalaryController extends Controller
{
    /**
     * Display salary listing page
     */
    public function index(Request $request)
    {
        if ($request->has('draw')) {
            $query = Salary::with(['user', 'payrollPeriod']);

            return DataTables::eloquent($query)
                ->addIndexColumn()
                ->addColumn('employee', fn($row) => view('partials.backend.salary.employee', compact('row'))->render())
                ->addColumn('period', fn($row) => view('partials.backend.salary.period', compact('row'))->render())
                ->addColumn('status', fn($row) => view('partials.backend.salary.status', compact('row'))->render())
                ->addColumn('action', fn($row) => view('partials.backend.salary.action', compact('row'))->render())
                ->rawColumns(['employee', 'period', 'status', 'action'])
                ->make(true);
        }

        return Inertia::render('Backend/ERP/HRM/Salary');
    }

    /**
     * Get salary statistics
     */
    public function statistics()
    {
        try {
            $stats = $this->getStatistics();

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Helper method to get statistics
     */
    private function getStatistics()
    {
        $total = Salary::count();
        $paid = Salary::where('status', 'paid')->count();
        $processing = Salary::where('status', 'processing')->count();
        $pending = Salary::where('status', 'pending')->count();
        $totalAmount = Salary::where('status', 'paid')->sum('net_salary');
        $avgSalary = $paid > 0 ? $totalAmount / $paid : 0;

        return [
            'total' => $total,
            'paid' => $paid,
            'processing' => $processing,
            'pending' => $pending,
            'totalAmount' => number_format($totalAmount, 2),
            'avgSalary' => number_format($avgSalary, 2)
        ];
    }

    /**
     * Store a new salary record
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:users,id',
            'month' => 'required|string',
            'year' => 'required|integer',
            'basic_salary' => 'required|numeric|min:0',
            'daily_rate' => 'required|numeric|min:0',
            'total_days' => 'required|integer|min:1|max:31',
            'days_present' => 'required|integer|min:0|lte:total_days',
            'allowances' => 'nullable|string',
            'deductions' => 'nullable|string',
            'status' => 'required|in:pending,processing,paid',
            'currency' => 'required|in:USD,CDF',
            'exchange_rate' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Check for duplicate salary record
            $existingSalary = Salary::where('user_id', $request->employee_id)
                ->where('month', $request->month)
                ->where('year', $request->year)
                ->first();

            if ($existingSalary) {
                return response()->json([
                    'success' => false,
                    'message' => 'Salary record already exists for this employee in the selected period'
                ], 409);
            }

            // Get user details
            $user = User::findOrFail($request->employee_id);

            // Parse JSON fields from request
            $allowances = $this->parseRequestJsonField($request->allowances);
            $deductions = $this->parseRequestJsonField($request->deductions);
            $otherAllowances = $this->parseRequestJsonField($request->other_allowances ?? '[]');
            $disciplinaryDeductions = $this->parseRequestJsonField($request->disciplinary_deductions ?? '[]');
            $otherDeductions = $this->parseRequestJsonField($request->other_deductions ?? '[]');

            // Calculate totals
            $calculated = $this->calculateSalaryTotals($request, $user, [
                'allowances' => $allowances,
                'deductions' => $deductions,
                'other_allowances' => $otherAllowances,
                'disciplinary_deductions' => $disciplinaryDeductions,
                'other_deductions' => $otherDeductions
            ]);

            // Create salary record
            $salary = Salary::create([
                'user_id' => $request->employee_id,
                'employee_code' => $user->code ?? ($request->employee_code ?? 'EMP-' . $user->id),
                'month' => $request->month,
                'year' => $request->year,
                'payroll_period_id' => $request->payroll_period_id ?? null,
                'basic_salary' => $request->basic_salary,
                'total_days' => $request->total_days,
                'days_present' => $request->days_present,
                'days_absent' => $request->total_days - $request->days_present,
                'allowances' => $allowances,
                'deductions' => $deductions,
                'currency' => $request->currency,
                'exchange_rate' => $request->exchange_rate,
                'real_salary' => $calculated['real_salary'],
                'total_allowances' => $calculated['total_allowances'],
                'total_deductions' => $calculated['total_deductions'],
                'gross_salary' => $calculated['gross_salary'],
                'net_salary' => $calculated['net_salary'],
                'days_deduction' => $calculated['days_deduction'],
                'net_in_usd' => $calculated['net_in_usd'],
                'net_in_cdf' => $calculated['net_in_cdf'],
                'status' => $request->status,
                'payment_date' => $request->status === 'paid' ? ($request->payment_date ?? now()) : null,
                'notes' => $request->notes,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
                'paid_by' => $request->status === 'paid' ? Auth::id() : null,
                'paid_at' => $request->status === 'paid' ? ($request->payment_date ?? now()) : null,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Salary record created successfully',
                'data' => $salary->load('user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create salary record: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create salary record',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display salary details
     */
    public function show(Salary $salary)
    {
        try {
            // Load relationships
            $salary->load([
                'user',
                'payrollPeriod',
                'approvedBy',
                'paidBy'
            ]);

            // Ensure JSON fields are properly parsed
            $salary = $this->parseJsonFields($salary);

            return response()->json([
                'success' => true,
                'data' => $salary
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Salary record not found',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 404);
        }
    }

    /**
     * Update salary record
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:users,id',
            'month' => 'required|string',
            'year' => 'required|integer',
            'basic_salary' => 'required|numeric|min:0',
            'daily_rate' => 'required|numeric|min:0',
            'total_days' => 'required|integer|min:1|max:31',
            'days_present' => 'required|integer|min:0|lte:total_days',
            'allowances' => 'nullable|string',
            'deductions' => 'nullable|string',
            'status' => 'required|in:pending,processing,paid',
            'currency' => 'required|in:USD,CDF',
            'exchange_rate' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $salary = Salary::findOrFail($id);

            // Check for duplicate salary record (excluding current)
            $existingSalary = Salary::where('user_id', $request->employee_id)
                ->where('month', $request->month)
                ->where('year', $request->year)
                ->where('id', '!=', $id)
                ->first();

            if ($existingSalary) {
                return response()->json([
                    'success' => false,
                    'message' => 'Another salary record already exists for this employee in the selected period'
                ], 409);
            }

            // Get user details
            $user = User::findOrFail($request->employee_id);

            // Parse JSON fields from request
            $allowances = $this->parseRequestJsonField($request->allowances);
            $deductions = $this->parseRequestJsonField($request->deductions);
            $otherAllowances = $this->parseRequestJsonField($request->other_allowances ?? '[]');
            $disciplinaryDeductions = $this->parseRequestJsonField($request->disciplinary_deductions ?? '[]');
            $otherDeductions = $this->parseRequestJsonField($request->other_deductions ?? '[]');

            // Calculate totals
            $calculated = $this->calculateSalaryTotals($request, $user, [
                'allowances' => $allowances,
                'deductions' => $deductions,
                'other_allowances' => $otherAllowances,
                'disciplinary_deductions' => $disciplinaryDeductions,
                'other_deductions' => $otherDeductions
            ]);

            // Update salary record
            $updateData = [
                'user_id' => $request->employee_id,
                'employee_code' => $user->code ?? ($request->employee_code ?? 'EMP-' . $user->id),
                'month' => $request->month,
                'year' => $request->year,
                'payroll_period_id' => $request->payroll_period_id ?? null,
                'basic_salary' => $request->basic_salary,
                'total_days' => $request->total_days,
                'days_present' => $request->days_present,
                'days_absent' => $request->total_days - $request->days_present,
                'allowances' => $allowances,
                'deductions' => $deductions,
                'currency' => $request->currency,
                'exchange_rate' => $request->exchange_rate,
                'real_salary' => $calculated['real_salary'],
                'total_allowances' => $calculated['total_allowances'],
                'total_deductions' => $calculated['total_deductions'],
                'gross_salary' => $calculated['gross_salary'],
                'net_salary' => $calculated['net_salary'],
                'days_deduction' => $calculated['days_deduction'],
                'net_in_usd' => $calculated['net_in_usd'],
                'net_in_cdf' => $calculated['net_in_cdf'],
                'status' => $request->status,
                'payment_date' => $request->payment_date,
                'notes' => $request->notes,
                'updated_by' => Auth::id(),
            ];

            // Handle payment status change
            if ($request->status === 'paid' && $salary->status !== 'paid') {
                $updateData['paid_by'] = Auth::id();
                $updateData['paid_at'] = $request->payment_date ?? now();
                $updateData['payment_date'] = $request->payment_date ?? now();
            }

            $salary->update($updateData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Salary record updated successfully',
                'data' => $salary->fresh()->load('user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update salary record: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update salary record',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Mark salary as paid
     */
    public function markAsPaid($id)
    {
        try {
            DB::beginTransaction();

            $salary = Salary::findOrFail($id);

            if ($salary->status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Salary is already marked as paid'
                ], 400);
            }

            $salary->update([
                'status' => 'paid',
                'paid_by' => Auth::id(),
                'paid_at' => now(),
                'payment_date' => now(),
                'updated_by' => Auth::id()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Salary marked as paid successfully',
                'data' => $salary->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark salary as paid',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Delete salary record
     */
    public function destroy($id)
    {
        try {
            $salary = Salary::findOrFail($id);
            $salary->delete();

            return response()->json([
                'success' => true,
                'message' => 'Salary record deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete salary record',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get employees for dropdown
     */
    public function getEmployees()
    {
        try {
            $employees = User::where('status', 'active')
                ->select('id', 'name', 'code', 'designation', 'salary')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch employees',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get salary components
     */
    public function getSalaryComponents($type = null)
    {
        try {
            $query = SalaryComponent::active()->ordered();

            if ($type) {
                $query->where('type', $type);
            }

            $components = $query->get();

            return response()->json([
                'success' => true,
                'data' => $components
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch salary components',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Generate payroll for period
     */
    public function generatePayroll(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'month' => 'required|string',
            'year' => 'required|integer',
            'payroll_period_id' => 'nullable|exists:payroll_periods,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $employees = User::where('status', 'active')->get();
            $generatedCount = 0;
            $errors = [];

            foreach ($employees as $employee) {
                try {
                    // Check if salary already exists for this period
                    $existingSalary = Salary::where('user_id', $employee->id)
                        ->where('month', $request->month)
                        ->where('year', $request->year)
                        ->first();

                    if ($existingSalary) {
                        continue;
                    }

                    // Calculate daily rate
                    $dailyRate = $employee->salary ? ($employee->salary / 26) : 0;

                    // Get employee allowances and deductions
                    $allowances = Allowance::where('user_id', $employee->id)
                        ->active()
                        ->valid()
                        ->with('salaryComponent')
                        ->get()
                        ->map(function ($allowance) use ($employee) {
                            return [
                                'description' => $allowance->salaryComponent->name,
                                'amount' => $allowance->calculateAmount($employee->salary)
                            ];
                        })
                        ->toArray();

                    $deductions = Deduction::where('user_id', $employee->id)
                        ->active()
                        ->valid()
                        ->with('salaryComponent')
                        ->get()
                        ->map(function ($deduction) use ($employee) {
                            return [
                                'description' => $deduction->salaryComponent->name,
                                'amount' => $deduction->calculateAmount($employee->salary)
                            ];
                        })
                        ->toArray();

                    // Calculate totals
                    $calculated = $this->calculateSalaryTotalsFromEmployee($employee, $dailyRate, $allowances, $deductions);

                    // Create salary record
                    $salary = Salary::create([
                        'user_id' => $employee->id,
                        'employee_code' => $employee->code ?? 'EMP-' . $employee->id,
                        'month' => $request->month,
                        'year' => $request->year,
                        'payroll_period_id' => $request->payroll_period_id,
                        'basic_salary' => $employee->salary ?? 0,
                        'daily_rate' => round($dailyRate, 2),
                        'daily_transport_rate' => 8.27,
                        'total_days' => 26,
                        'days_present' => 26,
                        'days_absent' => 0,
                        'allowances' => $allowances,
                        'deductions' => $deductions,
                        'currency' => 'USD',
                        'exchange_rate' => 1,
                        'real_salary' => $calculated['real_salary'],
                        'total_allowances' => $calculated['total_allowances'],
                        'total_deductions' => $calculated['total_deductions'],
                        'gross_salary' => $calculated['gross_salary'],
                        'net_salary' => $calculated['net_salary'],
                        'days_deduction' => $calculated['days_deduction'],
                        'net_in_usd' => $calculated['net_in_usd'],
                        'net_in_cdf' => $calculated['net_in_cdf'],
                        'status' => 'pending',
                        'created_by' => Auth::id(),
                        'updated_by' => Auth::id(),
                    ]);

                    $generatedCount++;
                } catch (\Exception $e) {
                    $errors[] = "Failed to generate salary for {$employee->name}: " . $e->getMessage();
                }
            }

            DB::commit();

            $response = [
                'success' => true,
                'message' => "Payroll generated successfully for {$generatedCount} employees",
                'count' => $generatedCount
            ];

            if (!empty($errors)) {
                $response['errors'] = $errors;
                $response['warning'] = 'Some employees failed to process';
            }

            return response()->json($response);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate payroll',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Export salaries
     */
    public function export(Request $request)
    {
        try {
            $query = Salary::with(['user', 'payrollPeriod'])
                ->when($request->filled('month') && $request->month !== 'all', function ($q) use ($request) {
                    $q->where('month', $request->month);
                })
                ->when($request->filled('year'), function ($q) use ($request) {
                    $q->where('year', $request->year);
                })
                ->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                    $q->where('status', $request->status);
                })
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->orderBy('user_id');

            $salaries = $query->get();

            // Format for export
            $exportData = $salaries->map(function ($salary) {
                return [
                    'Employee' => $salary->user->name ?? 'N/A',
                    'Code' => $salary->employee_code,
                    'Period' => $salary->month . ' ' . $salary->year,
                    'Basic Salary' => number_format($salary->basic_salary, 2),
                    'Days Present' => $salary->days_present . '/' . $salary->total_days,
                    'Real Salary' => number_format($salary->real_salary, 2),
                    'Total Allowances' => number_format($salary->total_allowances, 2),
                    'Total Deductions' => number_format($salary->total_deductions, 2),
                    'Gross Salary' => number_format($salary->gross_salary, 2),
                    'Net Salary' => number_format($salary->net_salary, 2),
                    'Currency' => $salary->currency,
                    'Status' => ucfirst($salary->status),
                    'Payment Date' => $salary->payment_date ? $salary->payment_date->format('Y-m-d') : 'N/A',
                    'Notes' => $salary->notes
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $exportData,
                'total' => $salaries->count(),
                'summary' => [
                    'total_salaries' => $salaries->count(),
                    'total_amount' => number_format($salaries->sum('net_salary'), 2),
                    'average_salary' => number_format($salaries->avg('net_salary') ?? 0, 2)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export salaries',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Helper method to parse JSON fields from request
     */
    private function parseRequestJsonField($data)
    {
        if (empty($data) || $data === '[]' || $data === 'null') {
            return [];
        }

        if (is_string($data)) {
            $decoded = json_decode($data, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::warning('Failed to parse JSON field: ' . json_last_error_msg());
                return [];
            }
            return is_array($decoded) ? $decoded : [];
        }

        if (is_array($data)) {
            return array_map(function ($item) {
                return [
                    'description' => $item['description'] ?? '',
                    'amount' => floatval($item['amount'] ?? 0)
                ];
            }, $data);
        }

        return [];
    }

    /**
     * Helper method to parse JSON fields from model
     */
    private function parseJsonFields($salary)
    {
        $jsonFields = ['allowances', 'deductions', 'other_allowances', 'disciplinary_deductions', 'other_deductions'];

        foreach ($jsonFields as $field) {
            if (isset($salary->$field)) {
                $salary->$field = is_string($salary->$field)
                    ? json_decode($salary->$field, true) ?? []
                    : (array) $salary->$field;
            } else {
                $salary->$field = [];
            }
        }

        return $salary;
    }

    /**
     * Helper method to calculate salary totals
     */
    private function calculateSalaryTotals(Request $request, $user, $jsonData = [])
    {
        $dailyRate = floatval($request->daily_rate);
        $daysPresent = intval($request->days_present);
        $totalDays = intval($request->total_days);
        $daysAbsent = $totalDays - $daysPresent;

        // Real salary based on attendance
        $realSalary = $dailyRate * $daysPresent;

        // Extract JSON data
        $allowances = $jsonData['allowances'] ?? [];
        $deductions = $jsonData['deductions'] ?? [];
        $otherAllowances = $jsonData['other_allowances'] ?? [];
        $disciplinaryDeductions = $jsonData['disciplinary_deductions'] ?? [];
        $otherDeductions = $jsonData['other_deductions'] ?? [];

        // Calculate allowances total
        $allowancesTotal = collect($allowances)->sum('amount');
        $otherAllowancesTotal = collect($otherAllowances)->sum('amount');
        $overtimeTotal = (floatval($request->overtime_hours ?? 0) * floatval($request->overtime_rate ?? 0));

        $totalAllowances = $allowancesTotal
            + floatval($request->bonus ?? 0)
            + floatval($request->quality_bonus ?? 0)
            + $overtimeTotal
            + floatval($request->regularization ?? 0)
            + $otherAllowancesTotal;

        // Calculate gross salary
        $grossSalary = $realSalary + $totalAllowances;

        // Calculate deductions total
        $deductionsTotal = collect($deductions)->sum('amount');
        $disciplinaryDeductionsTotal = collect($disciplinaryDeductions)->sum('amount');
        $otherDeductionsTotal = collect($otherDeductions)->sum('amount');
        $daysDeduction = $dailyRate * $daysAbsent;

        $totalDeductions = $deductionsTotal
            + floatval($request->transport_deduction ?? 0)
            + floatval($request->advance_salary ?? 0)
            + $daysDeduction
            + $disciplinaryDeductionsTotal
            + floatval($request->product_loss ?? 0)
            + $otherDeductionsTotal;

        // Calculate net salary
        $netSalary = max(0, $grossSalary - $totalDeductions);

        // Currency conversion
        $exchangeRate = floatval($request->exchange_rate);
        if ($request->currency === 'CDF') {
            $netInUsd = $netSalary / $exchangeRate;
            $netInCdf = $netSalary;
        } else {
            $netInUsd = $netSalary;
            $netInCdf = $netSalary * $exchangeRate;
        }

        return [
            'real_salary' => round($realSalary, 2),
            'total_allowances' => round($totalAllowances, 2),
            'total_deductions' => round($totalDeductions, 2),
            'gross_salary' => round($grossSalary, 2),
            'net_salary' => round($netSalary, 2),
            'days_deduction' => round($daysDeduction, 2),
            'net_in_usd' => round($netInUsd, 2),
            'net_in_cdf' => round($netInCdf, 2)
        ];
    }

    /**
     * Helper method to calculate salary totals from employee data
     */
    private function calculateSalaryTotalsFromEmployee($employee, $dailyRate, $allowances, $deductions)
    {
        $realSalary = $dailyRate * 26; // Full month attendance
        $totalAllowances = collect($allowances)->sum('amount');
        $totalDeductions = collect($deductions)->sum('amount');
        $grossSalary = $realSalary + $totalAllowances;
        $netSalary = max(0, $grossSalary - $totalDeductions);

        return [
            'real_salary' => round($realSalary, 2),
            'total_allowances' => round($totalAllowances, 2),
            'total_deductions' => round($totalDeductions, 2),
            'gross_salary' => round($grossSalary, 2),
            'net_salary' => round($netSalary, 2),
            'days_deduction' => 0,
            'net_in_usd' => round($netSalary, 2),
            'net_in_cdf' => round($netSalary, 2)
        ];
    }

    /**
     * Helper method to get status color
     */
    private function getStatusColor($status)
    {
        $colors = [
            'pending' => 'warning',
            'processing' => 'info',
            'paid' => 'success'
        ];

        return $colors[$status] ?? 'secondary';
    }
}