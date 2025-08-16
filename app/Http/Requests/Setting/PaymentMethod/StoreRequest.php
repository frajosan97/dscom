<?php

namespace App\Http\Requests\Setting\PaymentMethod;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:payment_methods,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'requires_approval' => 'boolean',
            'processing_fee' => 'numeric|min:0',
            'fee_type' => 'required|in:fixed,percentage',
            'account_number' => 'required_if:requires_approval,true|nullable|string|max:50',
            'account_name' => 'required_if:requires_approval,true|nullable|string|max:255',
            'bank_name' => 'required_if:requires_approval,true|nullable|string|max:255',
        ];
    }
}
