<?php

namespace App\Http\Requests\Product;

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
            // Basic Information
            'name'                => 'required|string|max:255',
            'short_description'   => 'nullable|string|max:500',
            'description'         => 'nullable|string',
            'category_id'         => 'required|exists:categories,id',
            'brand_id'            => 'nullable|exists:brands,id',
            'branch_id'           => 'nullable|exists:branches,id',
            'tax_id'              => 'nullable|exists:taxes,id',

            // Pricing
            'price'               => 'required|numeric|min:0',
            'wholesaler_price'    => 'required|numeric|min:0',
            'agent_price'         => 'required|numeric|min:0',
            'compare_price'       => 'nullable|numeric|min:0',
            'cost_per_item'       => 'nullable|numeric|min:0',

            // Inventory
            'sku'                 => 'nullable|string|max:100|unique:products,sku',
            'barcode'             => 'nullable|string|max:100|unique:products,barcode',
            'quantity'            => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'stock_status'        => 'required|in:in_stock,out_of_stock,backorder',

            // Shipping
            'weight'              => 'nullable|numeric|min:0',
            'length'              => 'nullable|numeric|min:0',
            'width'               => 'nullable|numeric|min:0',
            'height'              => 'nullable|numeric|min:0',

            // Metadata
            'new_until'           => 'nullable|date',
            'meta_title'          => 'nullable|string|max:255',
            'meta_description'    => 'nullable|string|max:500',

            // Images
            'images.*'            => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',

            // Flags
            'is_digital'          => 'nullable|boolean',
            'requires_shipping'   => 'nullable|boolean',
            'is_featured'         => 'nullable|boolean',
            'is_active'           => 'nullable|boolean',
            'is_new'              => 'nullable|boolean',
            'is_bestseller'       => 'nullable|boolean',
        ];
    }

    public function prepareForValidation()
    {
        $this->merge([
            'is_digital'        => $this->boolean('is_digital'),
            'requires_shipping' => $this->boolean('requires_shipping'),
            'is_featured'       => $this->boolean('is_featured'),
            'is_active'         => $this->boolean('is_active'),
            'is_new'            => $this->boolean('is_new'),
            'is_bestseller'     => $this->boolean('is_bestseller'),
        ]);
    }
}
