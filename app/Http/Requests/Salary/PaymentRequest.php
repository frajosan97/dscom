<?php

namespace App\Http\Requests\Salary;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentRequest extends FormRequest
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
        $rules = [
            'payment_date' => [
                'required',
                'date',
                'before_or_equal:today',
            ],
            'payment_method' => [
                'required',
                'in:cash,bank_transfer,cheque,online',
            ],
            'reference_no' => [
                'nullable',
                'string',
                'max:100',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:500',
            ],
        ];

        // Add account validation for bank transfers and online payments
        if (in_array($this->payment_method, ['bank_transfer', 'online'])) {
            $rules['account_id'] = [
                'required',
                'exists:accounts,id',
                Rule::exists('accounts', 'id')->where('is_active', true),
            ];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'payment_date.required' => 'Payment date is required.',
            'payment_date.before_or_equal' => 'Payment date cannot be in the future.',
            'payment_method.required' => 'Payment method is required.',
            'account_id.required' => 'Account is required for bank transfer and online payments.',
            'account_id.exists' => 'Selected account does not exist or is not active.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'payment_date' => 'payment date',
            'payment_method' => 'payment method',
            'account_id' => 'account',
            'reference_no' => 'reference number',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'payment_date' => $this->payment_date ?? now()->format('Y-m-d'),
        ]);
    }
}