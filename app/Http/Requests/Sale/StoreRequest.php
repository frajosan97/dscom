<?php

namespace App\Http\Requests\Sale;

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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'customer_id' => 'required|exists:users,id',
            'cartItems' => 'sometimes|required|array',
            'paymentData' => 'sometimes|required|array',
            'branch_id' => 'nullable|exists:branches,id',
            'customer_note' => 'nullable|string',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'shipping_method_id' => 'nullable|exists:shipping_methods,id',
            'shipping_cost' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Decode JSON strings to arrays for validation
        $this->merge([
            'cartItems' => json_decode($this->cartItems, true),
            'paymentData' => json_decode($this->paymentData, true),
        ]);
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'cartItems.required' => 'Cart items are required',
            'cartItems.json' => 'Cart items must be valid JSON',
            'paymentData.required' => 'Payment data is required',
            'paymentData.json' => 'Payment data must be valid JSON',
            'customer.exists' => 'The selected customer does not exist',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'customer_id' => 'customer',
            'cartItems' => 'cart items',
            'paymentData' => 'payment data',
        ];
    }
}