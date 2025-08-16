<?php

namespace App\Http\Requests\Setting\Branch;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('branches')->ignore($this->branch),
            ],
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',
            'manager_name' => 'nullable|string|max:255',
            'manager_contact' => 'nullable|string|max:20',

            // Location
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',

            // Operational
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i|after:opening_time',
            'working_days' => 'nullable|array',
            'working_days.*' => 'integer|between:1,7',

            // Ecommerce
            'is_active' => 'boolean',
            'is_online' => 'boolean',
            'has_pickup' => 'boolean',
            'has_delivery' => 'boolean',
            'delivery_radius' => 'nullable|integer|min:0',
            'delivery_fee' => 'nullable|numeric|min:0',

            // Financial
            'currency' => 'required|string|max:3',

            // Notes
            'notes' => 'nullable|string',
        ];
    }
}
