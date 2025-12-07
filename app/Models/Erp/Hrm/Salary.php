<?php

namespace App\Models\Erp\Hrm;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Salary extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'salaries';

    protected $fillable = [
        'employee_id',
        'payroll_period_id',
        'basic_salary',
        'total_allowances',
        'total_deductions',
        'gross_salary',
        'net_salary',
        'salary_date',
        'status',
        'payment_method',
        'paid_at',
        'approved_by',
        'approved_at',
        'approval_notes',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'total_allowances' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'gross_salary' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'salary_date' => 'date',
        'paid_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_CALCULATED = 'calculated';
    const STATUS_APPROVED = 'approved';
    const STATUS_PAID = 'paid';
    const STATUS_CANCELLED = 'cancelled';

    public static function getStatuses()
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_CALCULATED,
            self::STATUS_APPROVED,
            self::STATUS_PAID,
            self::STATUS_CANCELLED,
        ];
    }

    // Relationships
    public function employee()
    {
        return $this->belongsTo(User::class);
    }

    public function payrollPeriod()
    {
        return $this->belongsTo(PayrollPeriod::class);
    }

    public function components()
    {
        return $this->hasMany(SalaryComponentValue::class);
    }

    public function payments()
    {
        return $this->hasMany(SalaryPayment::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'employee_id', 'employee_id')
            ->whereBetween('date', [
                $this->payrollPeriod->start_date ?? now()->startOfMonth(),
                $this->payrollPeriod->end_date ?? now()->endOfMonth()
            ]);
    }

    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeCalculated($query)
    {
        return $query->where('status', self::STATUS_CALCULATED);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    public function scopeForPeriod($query, $periodId)
    {
        return $query->where('payroll_period_id', $periodId);
    }

    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('salary_date', [$startDate, $endDate]);
    }

    // Methods
    public function isEditable()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CALCULATED]);
    }

    public function isPayable()
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function markAsPaid($paymentMethod, $paidAt = null)
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'payment_method' => $paymentMethod,
            'paid_at' => $paidAt ?? now(),
        ]);
    }

    public function getAllowances()
    {
        return $this->components()
            ->whereHas('component', function ($query) {
                $query->where('type', SalaryComponent::TYPE_ALLOWANCE);
            })
            ->with('component')
            ->get();
    }

    public function getDeductions()
    {
        return $this->components()
            ->whereHas('component', function ($query) {
                $query->where('type', SalaryComponent::TYPE_DEDUCTION);
            })
            ->with('component')
            ->get();
    }
}