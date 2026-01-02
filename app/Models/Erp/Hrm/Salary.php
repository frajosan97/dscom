<?php

namespace App\Models\Erp\Hrm;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;

class Salary extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'employee_code',
        'month',
        'year',
        'payroll_period_id',
        'basic_salary',
        'daily_rate',
        'daily_transport_rate',
        'total_days',
        'days_present',
        'days_absent',
        'allowances',
        'bonus',
        'quality_bonus',
        'overtime_hours',
        'overtime_rate',
        'regularization',
        'other_allowances',
        'deductions',
        'transport_deduction',
        'advance_salary',
        'disciplinary_deductions',
        'product_loss',
        'other_deductions',
        'real_salary',
        'total_allowances',
        'total_deductions',
        'gross_salary',
        'net_salary',
        'days_deduction',
        'currency',
        'exchange_rate',
        'net_in_usd',
        'net_in_cdf',
        'status',
        'payment_date',
        'salary_date',
        'notes',
        'approved_by',
        'approved_at',
        'paid_by',
        'paid_at',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'allowances' => 'array',
        'other_allowances' => 'array',
        'deductions' => 'array',
        'disciplinary_deductions' => 'array',
        'other_deductions' => 'array',
        'basic_salary' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'daily_transport_rate' => 'decimal:2',
        'bonus' => 'decimal:2',
        'quality_bonus' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'overtime_rate' => 'decimal:2',
        'regularization' => 'decimal:2',
        'transport_deduction' => 'decimal:2',
        'advance_salary' => 'decimal:2',
        'product_loss' => 'decimal:2',
        'real_salary' => 'decimal:2',
        'total_allowances' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'gross_salary' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'days_deduction' => 'decimal:2',
        'exchange_rate' => 'decimal:2',
        'net_in_usd' => 'decimal:2',
        'net_in_cdf' => 'decimal:2',
        'approved_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function payrollPeriod()
    {
        return $this->belongsTo(PayrollPeriod::class);
    }

    public function salaryComponents()
    {
        return $this->hasMany(SalaryComponentValue::class);
    }

    public function payments()
    {
        return $this->hasMany(SalaryPayment::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function paidBy()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeForPeriod($query, $month, $year)
    {
        return $query->where('month', $month)->where('year', $year);
    }

    public function scopeForEmployee($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Helpers
    public function calculateTotals()
    {
        // Real salary based on attendance
        $this->real_salary = $this->daily_rate * $this->days_present;
        
        // Calculate allowances total
        $allowancesTotal = collect($this->allowances)->sum('amount') ?? 0;
        $otherAllowancesTotal = collect($this->other_allowances)->sum('amount') ?? 0;
        $overtimeTotal = $this->overtime_hours * $this->overtime_rate;
        
        $this->total_allowances = $allowancesTotal 
            + $this->bonus 
            + $this->quality_bonus 
            + $overtimeTotal 
            + $this->regularization 
            + $otherAllowancesTotal;
        
        // Calculate gross salary
        $this->gross_salary = $this->real_salary + $this->total_allowances;
        
        // Calculate deductions total
        $deductionsTotal = collect($this->deductions)->sum('amount') ?? 0;
        $disciplinaryDeductionsTotal = collect($this->disciplinary_deductions)->sum('amount') ?? 0;
        $otherDeductionsTotal = collect($this->other_deductions)->sum('amount') ?? 0;
        $this->days_deduction = $this->daily_rate * $this->days_absent;
        
        $this->total_deductions = $deductionsTotal 
            + $this->transport_deduction 
            + $this->advance_salary 
            + $this->days_deduction 
            + $disciplinaryDeductionsTotal 
            + $this->product_loss 
            + $otherDeductionsTotal;
        
        // Calculate net salary
        $this->net_salary = max(0, $this->gross_salary - $this->total_deductions);
        
        // Currency conversion
        if ($this->currency === 'CDF') {
            $this->net_in_usd = $this->net_salary / $this->exchange_rate;
            $this->net_in_cdf = $this->net_salary;
        } else {
            $this->net_in_usd = $this->net_salary;
            $this->net_in_cdf = $this->net_salary * $this->exchange_rate;
        }
        
        return $this;
    }

    public function markAsPaid($paymentMethod = 'bank_transfer', $paymentDate = null, $notes = null)
    {
        $this->status = 'paid';
        $this->payment_date = $paymentDate ?? now();
        $this->paid_at = now();
        $this->paid_by = Auth::id();
        $this->save();

        // Create payment record
        SalaryPayment::create([
            'salary_id' => $this->id,
            'amount' => $this->net_salary,
            'payment_date' => $this->payment_date,
            'payment_method' => $paymentMethod,
            'notes' => $notes,
            'paid_by' => Auth::id(),
        ]);
    }

    public function getFormattedNetSalaryAttribute()
    {
        return number_format($this->net_salary, 2);
    }

    public function getFormattedGrossSalaryAttribute()
    {
        return number_format($this->gross_salary, 2);
    }

    public function getFormattedBasicSalaryAttribute()
    {
        return number_format($this->basic_salary, 2);
    }

    public function getPeriodAttribute()
    {
        return $this->month . ' ' . $this->year;
    }
}