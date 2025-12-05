<?php

namespace App\Http\Requests\Setting\Brand;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255|unique:brands,name',
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'website_url' => 'nullable|url|max:255',
            'facebook_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            'is_featured' => 'required|in:true,false,1,0,on,off',
            'is_active' => 'required|in:true,false,1,0,on,off',
            'order' => 'nullable|integer',
        ];
    }

    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();

        return array_merge($validated, [
            'is_featured' => filter_var($validated['is_featured'], FILTER_VALIDATE_BOOLEAN),
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}