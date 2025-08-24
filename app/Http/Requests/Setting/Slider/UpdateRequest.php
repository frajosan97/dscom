<?php

namespace App\Http\Requests\Setting\Slider;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $sliderId = $this->route('slider')->id;

        return [
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|in:default,hero,banner,testimonial,gallery',
            'is_active' => 'required|boolean',
            'autoplay' => 'required|boolean',
            'arrows' => 'required|boolean',
            'dots' => 'required|boolean',
            'infinite' => 'required|boolean',
            'autoplay_speed' => 'required|integer|min:1000',
            'slides_to_show' => 'required|integer|min:1',
            'slides_to_scroll' => 'required|integer|min:1',
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
