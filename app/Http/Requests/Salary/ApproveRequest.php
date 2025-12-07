<?php

namespace App\Http\Requests\Salary;

use Illuminate\Foundation\Http\FormRequest;

class ApproveRequest extends FormRequest
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
            'notes' => [
                'nullable',
                'string',
                'max:500',
            ],
            'approved_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'max:9999999.99',
            ],
            'adjustment_reason' => [
                'nullable',
                'required_if:approved_amount,!=,null',
                'string',
                'max:255',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'approved_amount.numeric' => 'Approved amount must be a number.',
            'approved_amount.min' => 'Approved amount cannot be negative.',
            'adjustment_reason.required_if' => 'Adjustment reason is required when changing the approved amount.',
            'adjustment_reason.max' => 'Adjustment reason cannot exceed 255 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'notes' => 'approval notes',
            'approved_amount' => 'approved amount',
            'adjustment_reason' => 'adjustment reason',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // If approved_amount is provided, ensure it's numeric
        if ($this->has('approved_amount')) {
            $this->merge([
                'approved_amount' => (float) $this->approved_amount,
            ]);
        }
    }
}