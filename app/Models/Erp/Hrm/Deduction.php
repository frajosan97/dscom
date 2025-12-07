<?php

namespace App\Models\Erp\Hrm;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Deduction extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'deductions';

    protected $fillable = [
        'employee_id',
        'salary_component_id',
        'amount',
        'calculation_type',
        'calculation_value',
        'is_active',
        'valid_from',
        'valid_until',
        'description',
        'approved_by',
        'approved_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'calculation_value' => 'decimal:2',
        'is_active' => 'boolean',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'approved_at' => 'datetime',
    ];

    // Calculation type constants
    const CALC_FIXED = 'fixed';
    const CALC_PERCENTAGE = 'percentage';

    // Relationships
    public function employee()
    {
        return $this->belongsTo(User::class);
    }

    public function component()
    {
        return $this->belongsTo(SalaryComponent::class, 'salary_component_id');
    }

    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValidForDate($query, $date)
    {
        return $query->where('valid_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', $date);
            });
    }

    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    // Methods
    public function calculateAmount($baseSalary = 0)
    {
        if ($this->calculation_type === self::CALC_PERCENTAGE) {
            return ($baseSalary * $this->calculation_value) / 100;
        }
        return $this->amount;
    }

    public function isCurrentlyValid()
    {
        if (!$this->is_active)
            return false;

        $now = now();
        if ($this->valid_from && $this->valid_from > $now)
            return false;
        if ($this->valid_until && $this->valid_until < $now)
            return false;

        return true;
    }
}