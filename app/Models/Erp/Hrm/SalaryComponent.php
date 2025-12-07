<?php

namespace App\Models\Erp\Hrm;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalaryComponent extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'salary_components';

    protected $fillable = [
        'name',
        'code',
        'type',
        'description',
        'calculation_type',
        'calculation_value',
        'is_taxable',
        'is_active',
        'is_default',
        'order',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'calculation_value' => 'decimal:2',
        'is_taxable' => 'boolean',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'order' => 'integer',
    ];

    // Type constants
    const TYPE_ALLOWANCE = 'allowance';
    const TYPE_DEDUCTION = 'deduction';

    // Calculation type constants
    const CALC_FIXED = 'fixed';
    const CALC_PERCENTAGE = 'percentage';
    const CALC_FORMULA = 'formula';

    public static function getTypes()
    {
        return [
            self::TYPE_ALLOWANCE,
            self::TYPE_DEDUCTION,
        ];
    }

    public static function getCalculationTypes()
    {
        return [
            self::CALC_FIXED,
            self::CALC_PERCENTAGE,
            self::CALC_FORMULA,
        ];
    }

    public static function getDefaultComponents()
    {
        return [
            // Allowances
            [
                'name' => 'Basic Salary',
                'code' => 'BASIC',
                'type' => self::TYPE_ALLOWANCE,
                'calculation_type' => self::CALC_FIXED,
                'is_taxable' => true,
                'is_default' => true,
                'is_active' => true,
            ],
            [
                'name' => 'House Rent Allowance',
                'code' => 'HRA',
                'type' => self::TYPE_ALLOWANCE,
                'calculation_type' => self::CALC_PERCENTAGE,
                'calculation_value' => 40,
                'is_taxable' => true,
                'is_default' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Travel Allowance',
                'code' => 'TA',
                'type' => self::TYPE_ALLOWANCE,
                'calculation_type' => self::CALC_FIXED,
                'is_taxable' => false,
                'is_default' => true,
                'is_active' => true,
            ],
            // Deductions
            [
                'name' => 'Provident Fund',
                'code' => 'PF',
                'type' => self::TYPE_DEDUCTION,
                'calculation_type' => self::CALC_PERCENTAGE,
                'calculation_value' => 12,
                'is_taxable' => false,
                'is_default' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Professional Tax',
                'code' => 'PT',
                'type' => self::TYPE_DEDUCTION,
                'calculation_type' => self::CALC_FIXED,
                'is_taxable' => false,
                'is_default' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Income Tax',
                'code' => 'TDS',
                'type' => self::TYPE_DEDUCTION,
                'calculation_type' => self::CALC_FORMULA,
                'is_taxable' => false,
                'is_default' => true,
                'is_active' => true,
            ],
        ];
    }

    // Relationships
    public function salaryValues()
    {
        return $this->hasMany(SalaryComponentValue::class);
    }

    public function employeeAllowances()
    {
        return $this->hasMany(Allowance::class);
    }

    public function employeeDeductions()
    {
        return $this->hasMany(Deduction::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeAllowances($query)
    {
        return $query->where('type', self::TYPE_ALLOWANCE);
    }

    public function scopeDeductions($query)
    {
        return $query->where('type', self::TYPE_DEDUCTION);
    }

    public function scopeTaxable($query)
    {
        return $query->where('is_taxable', true);
    }

    // Methods
    public function calculateAmount($baseAmount = 0)
    {
        switch ($this->calculation_type) {
            case self::CALC_PERCENTAGE:
                return ($baseAmount * $this->calculation_value) / 100;
            case self::CALC_FIXED:
                return $this->calculation_value;
            case self::CALC_FORMULA:
                return $this->evaluateFormula($baseAmount);
            default:
                return 0;
        }
    }

    private function evaluateFormula($baseAmount)
    {
        // Implement formula evaluation logic here
        // This could be a custom formula parser
        switch ($this->code) {
            case 'TDS':
                // Example: Simple tax calculation
                if ($baseAmount <= 250000)
                    return 0;
                if ($baseAmount <= 500000)
                    return ($baseAmount - 250000) * 0.05;
                if ($baseAmount <= 1000000)
                    return 12500 + ($baseAmount - 500000) * 0.2;
                return 112500 + ($baseAmount - 1000000) * 0.3;
            default:
                return 0;
        }
    }
}