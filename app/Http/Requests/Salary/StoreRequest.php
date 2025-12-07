<?php

namespace App\Http\Requests\Salary;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'employee_id' => [
                'required',
                'exists:users,id',
            ],
            'payroll_period_id' => [
                'required',
                'exists:payroll_periods,id',
                Rule::exists('payroll_periods', 'id')->where('status', 'open'),
            ],
            'basic_salary' => [
                'required',
                'numeric',
                'min:0',
                'max:9999999.99',
            ],
            'components' => [
                'array',
                'min:0',
            ],
            'components.*.id' => [
                'required',
                'exists:salary_components,id',
            ],
            'components.*.amount' => [
                'required',
                'numeric',
                'min:0',
                'max:999999.99',
            ],
            'components.*.type' => [
                'required',
                'in:allowance,deduction',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'employee_id.required' => 'Please select an employee.',
            'employee_id.exists' => 'The selected employee does not exist or is not active.',
            'payroll_period_id.required' => 'Please select a payroll period.',
            'payroll_period_id.exists' => 'The selected payroll period is not open.',
            'basic_salary.required' => 'Basic salary is required.',
            'basic_salary.min' => 'Basic salary must be at least 0.',
            'components.*.amount.min' => 'Component amount cannot be negative.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'employee_id' => 'employee',
            'payroll_period_id' => 'payroll period',
            'basic_salary' => 'basic salary',
            'components.*.id' => 'component',
            'components.*.amount' => 'component amount',
            'components.*.type' => 'component type',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'components' => $this->components ?? [],
        ]);
    }
}