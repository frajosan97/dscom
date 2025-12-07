<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SalaryComponentsSeeder extends Seeder
{
    public function run(): void
    {
        $components = [
            // Allowances
            [
                'name' => 'Basic Salary',
                'code' => 'BASIC',
                'type' => 'allowance',
                'calculation_type' => 'fixed',
                'calculation_value' => 0,
                'is_taxable' => true,
                'is_active' => true,
                'is_default' => true,
                'order' => 1,
            ],
            [
                'name' => 'House Rent Allowance',
                'code' => 'HRA',
                'type' => 'allowance',
                'calculation_type' => 'percentage',
                'calculation_value' => 40,
                'is_taxable' => true,
                'is_active' => true,
                'is_default' => true,
                'order' => 2,
            ],
            [
                'name' => 'Travel Allowance',
                'code' => 'TA',
                'type' => 'allowance',
                'calculation_type' => 'fixed',
                'calculation_value' => 0,
                'is_taxable' => false,
                'is_active' => true,
                'is_default' => true,
                'order' => 3,
            ],
            [
                'name' => 'Medical Allowance',
                'code' => 'MA',
                'type' => 'allowance',
                'calculation_type' => 'fixed',
                'calculation_value' => 0,
                'is_taxable' => false,
                'is_active' => true,
                'is_default' => true,
                'order' => 4,
            ],
            [
                'name' => 'Dearness Allowance',
                'code' => 'DA',
                'type' => 'allowance',
                'calculation_type' => 'percentage',
                'calculation_value' => 10,
                'is_taxable' => true,
                'is_active' => true,
                'is_default' => true,
                'order' => 5,
            ],
            [
                'name' => 'Bonus',
                'code' => 'BONUS',
                'type' => 'allowance',
                'calculation_type' => 'fixed',
                'calculation_value' => 0,
                'is_taxable' => true,
                'is_active' => true,
                'is_default' => true,
                'order' => 6,
            ],
            [
                'name' => 'Overtime',
                'code' => 'OT',
                'type' => 'allowance',
                'calculation_type' => 'fixed',
                'calculation_value' => 0,
                'is_taxable' => true,
                'is_active' => true,
                'is_default' => true,
                'order' => 7,
            ],
            // Deductions
            [
                'name' => 'Provident Fund',
                'code' => 'PF',
                'type' => 'deduction',
                'calculation_type' => 'percentage',
                'calculation_value' => 12,
                'is_taxable' => false,
                'is_active' => true,
                'is_default' => true,
                'order' => 8,
            ],
            [
                'name' => 'Professional Tax',
                'code' => 'PT',
                'type' => 'deduction',
                'calculation_type' => 'fixed',
                'calculation_value' => 0,
                'is_taxable' => false,
                'is_active' => true,
                'is_default' => true,
                'order' => 9,
            ],
            [
                'name' => 'Income Tax',
                'code' => 'TDS',
                'type' => 'deduction',
                'calculation_type' => 'formula',
                'calculation_value' => 0,
                'is_taxable' => false,
                'is_active' => true,
                'is_default' => true,
                'order' => 10,
            ],
            [
                'name' => 'Loan Deduction',
                'code' => 'LOAN',
                'type' => 'deduction',
                'calculation_type' => 'fixed',
                'calculation_value' => 0,
                'is_taxable' => false,
                'is_active' => true,
                'is_default' => true,
                'order' => 11,
            ],
            [
                'name' => 'Late Attendance Deduction',
                'code' => 'LATE',
                'type' => 'deduction',
                'calculation_type' => 'fixed',
                'calculation_value' => 0,
                'is_taxable' => false,
                'is_active' => true,
                'is_default' => true,
                'order' => 12,
            ],
            [
                'name' => 'Absent Deduction',
                'code' => 'ABSENT',
                'type' => 'deduction',
                'calculation_type' => 'fixed',
                'calculation_value' => 0,
                'is_taxable' => false,
                'is_active' => true,
                'is_default' => true,
                'order' => 13,
            ],
            [
                'name' => 'Health Insurance',
                'code' => 'HI',
                'type' => 'deduction',
                'calculation_type' => 'fixed',
                'calculation_value' => 0,
                'is_taxable' => false,
                'is_active' => true,
                'is_default' => true,
                'order' => 14,
            ],
        ];

        foreach ($components as $component) {
            DB::table('salary_components')->insert(array_merge($component, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}