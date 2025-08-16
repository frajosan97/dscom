<?php

namespace App\Http\Requests\Setting\RepairService;

use Illuminate\Foundation\Http\FormRequest;

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
            'slug' => 'required|string|max:255|unique:repair_services,slug,' . $this->repair_service->id,
            'description' => 'nullable|string',
            'detailed_description' => 'nullable|string',
            'repair_process' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'estimated_duration' => 'nullable|integer|min:0',
            'warranty_days' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'image' => 'nullable|string',
            'device_types' => 'required|array',
            'device_types.*.id' => 'required|exists:repair_service_device_types,id',
            'device_types.*.price' => 'required|numeric|min:0',
            'device_types.*.min_price' => 'nullable|numeric|min:0',
            'device_types.*.max_price' => 'nullable|numeric|min:0',
            'device_types.*.is_flat_rate' => 'boolean',
            'device_types.*.price_notes' => 'nullable|string',
        ];
    }
}
