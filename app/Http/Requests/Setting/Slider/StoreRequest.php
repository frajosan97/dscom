<?php

namespace App\Http\Requests\Setting\Slider;

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
            'type' => 'nullable|string',
            'is_active' => 'required|boolean',
            'autoplay' => 'required|boolean',
            'arrows' => 'required|boolean',
            'dots' => 'required|boolean',
            'infinite' => 'required|boolean',
            'autoplay_speed' => 'nullable|integer|min:1000',
            'slides_to_show' => 'nullable|integer|min:1',
            'slides_to_scroll' => 'nullable|integer|min:1',
            'breakpoints' => 'nullable|json',
            'custom_settings' => 'nullable|json',
        ];
    }

    public function prepareForValidation()
    {
        $this->merge([
            'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN),
            'autoplay' => filter_var($this->autoplay, FILTER_VALIDATE_BOOLEAN),
            'arrows' => filter_var($this->arrows, FILTER_VALIDATE_BOOLEAN),
            'dots' => filter_var($this->dots, FILTER_VALIDATE_BOOLEAN),
            'infinite' => filter_var($this->infinite, FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
