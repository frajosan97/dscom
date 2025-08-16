<?php

namespace App\Http\Requests\Setting\DeviceType;

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
            'slug' => 'required|string|max:255|unique:repair_service_device_types,slug,' . $this->device_type->id,
            'parent_id' => 'nullable|exists:repair_service_device_types,id',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'image' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'order' => 'integer|min:0',
        ];
    }
}
