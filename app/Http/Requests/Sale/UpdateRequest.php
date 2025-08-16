<?php

namespace App\Http\Requests\Sale;

use App\Http\Requests\Sale\StoreRequest;

class UpdateRequest extends StoreRequest
{
    public function authorize(): bool
    {
        return true; // Allow updates
    }

    public function rules(): array
    {
        $rules = parent::rules();

        // Make certain fields optional for updates
        $optionalFields = [
            'date',
            'reference',
            'customer_id',
            'status',
            'fulfillment_status',
            'payment_status',
            'payment_date',
            'items'
        ];

        foreach ($optionalFields as $field) {
            if (isset($rules[$field])) {
                $rules[$field] = str_replace('required|', 'sometimes|required|', $rules[$field]);
            }
        }

        // Additional update-specific rules
        $rules['items'] = 'sometimes|array|min:1'; // Items are optional during update
        $rules['total_paid'] = 'sometimes|required|numeric|min:0|lte:total'; // Paid can't exceed total

        return $rules;
    }

    public function messages()
    {
        return array_merge(parent::messages(), [
            // Update-specific messages
            'total_paid.lte' => 'Paid amount cannot exceed the total order amount.',
        ]);
    }

    public function withValidator($validator)
    {
        parent::withValidator($validator);

        $validator->after(function ($validator) {
            // Additional update validation if needed
        });
    }
}
