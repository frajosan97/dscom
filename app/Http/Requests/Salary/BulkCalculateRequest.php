<?php

namespace App\Http\Requests\Salary;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkCalculateRequest extends FormRequest
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
            'payroll_period_id' => [
                'required',
                'exists:payroll_periods,id',
                Rule::exists('payroll_periods', 'id')->where('status', 'open'),
            ],
            'employee_ids' => [
                'nullable',
                'array',
            ],
            'employee_ids.*' => [
                'exists:users,id',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->whereDoesntHave('roles', function ($q) {
                        $q->where('name', 'customer');
                    })->where('is_active', true);
                }),
            ],
            'calculate_all' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'payroll_period_id.required' => 'Please select a payroll period.',
            'payroll_period_id.exists' => 'The selected payroll period is not open.',
            'employee_ids.*.exists' => 'One or more selected employees do not exist or are not active.',
            'calculate_all.boolean' => 'Calculate all must be true or false.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'payroll_period_id' => 'payroll period',
            'employee_ids' => 'employees',
            'employee_ids.*' => 'employee',
            'calculate_all' => 'calculate all',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // If calculate_all is true, set employee_ids to empty array
        if ($this->calculate_all) {
            $this->merge([
                'employee_ids' => [],
            ]);
        }

        $this->merge([
            'employee_ids' => $this->employee_ids ?? [],
            'calculate_all' => filter_var($this->calculate_all, FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}