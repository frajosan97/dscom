<?php

namespace App\Http\Requests\Salary;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
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
            'basic_salary' => [
                'required',
                'numeric',
                'min:0',
                'max:9999999.99',
            ],
            'components' => [
                'required',
                'array',
                'min:1',
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
            'status' => [
                'nullable',
                'in:pending,calculated,approved',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'components.required' => 'At least one salary component is required.',
            'components.min' => 'At least one salary component is required.',
            'basic_salary.required' => 'Basic salary is required.',
            'status.in' => 'Status must be pending, calculated, or approved.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
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