<?php

namespace App\Http\Requests\Setting\WareHouse;

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
            'code' => 'required|string|max:50|unique:warehouses,code',
            'branch_id' => 'nullable|exists:branches,id',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'contact_person' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:20',
            'contact_email' => 'required|email|max:255',
            'contact_position' => 'nullable|string|max:255',
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i',
            'working_days' => 'nullable|array',
            'is_primary' => 'boolean',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ];
    }
}
