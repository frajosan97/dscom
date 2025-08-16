<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'icon' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'is_featured' => 'required|in:true,false,1,0,on,off',
            'is_active' => 'required|in:true,false,1,0,on,off',
            'order' => 'nullable|integer',
            'additional_fields' => 'nullable|json',
        ];

        // Only validate image if it's present in the request
        if ($this->hasFile('image')) {
            $rules['image'] = 'image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        }

        return $rules;
    }

    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();

        // Only handle image if it's present and valid
        if ($this->hasFile('image') && $this->file('image')->isValid()) {
            $validated['image'] = $this->uploadImage($this->file('image'));
        }

        return array_merge($validated, [
            'is_featured' => filter_var($validated['is_featured'], FILTER_VALIDATE_BOOLEAN),
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ]);
    }

    private function uploadImage($image): string
    {
        $filename = Str::random(10) . '.' . $image->getClientOriginalExtension();
        $path = $image->storeAs('images/categories', $filename, 'public');
        return 'storage/' . $path;
    }
}
