<?php

namespace App\Models\Erp\Hrm;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalaryComponentValue extends Model
{
    use HasFactory;

    protected $table = 'salary_component_values';

    protected $fillable = [
        'salary_id',
        'salary_component_id',
        'amount',
        'type',
        'calculation_note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    // Type constants
    const TYPE_ALLOWANCE = 'allowance';
    const TYPE_DEDUCTION = 'deduction';

    // Relationships
    public function salary()
    {
        return $this->belongsTo(Salary::class);
    }

    public function component()
    {
        return $this->belongsTo(SalaryComponent::class, 'salary_component_id');
    }

    // Scopes
    public function scopeAllowances($query)
    {
        return $query->where('type', self::TYPE_ALLOWANCE);
    }

    public function scopeDeductions($query)
    {
        return $query->where('type', self::TYPE_DEDUCTION);
    }
}