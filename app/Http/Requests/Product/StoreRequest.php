<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            // Basic Information
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'tax_id' => 'nullable|exists:taxes,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $productId,
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',

            // SKU & Identification
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $productId,
            'product_type' => 'required|in:physical,digital,service',

            // Product Variations
            'sizes' => 'nullable|array',
            'sizes.*' => 'string|max:50',
            'colors' => 'nullable|array',
            'colors.*' => 'string|max:50',
            'materials' => 'nullable|array',
            'materials.*' => 'string|max:50',
            'variations' => 'nullable|array',

            // Pricing
            'base_price' => 'required|numeric|min:0',
            'agent_price' => 'nullable|numeric|min:0',
            'wholesaler_price' => 'nullable|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_per_item' => 'nullable|numeric|min:0',

            // Inventory
            'total_quantity' => 'integer|min:0',
            'low_stock_alert' => 'integer|min:0',
            'track_quantity' => 'boolean',
            'allow_backorders' => 'boolean',
            'stock_status' => 'required|in:in_stock,out_of_stock,on_backorder',

            // Shipping
            'is_digital' => 'boolean',
            'requires_shipping' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',

            // Status
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'is_bestseller' => 'boolean',
            'is_new' => 'boolean',
            'new_until' => 'nullable|date|after_or_equal:today',

            // SEO
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
            'metadata' => 'nullable|array',

            // Images
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'existing_images' => 'nullable|array',
            'existing_images.*.id' => 'sometimes|string',
            'existing_images.*.is_default' => 'boolean',

            // Product Items
            'items' => 'nullable|array',
            'items.*.id' => 'nullable|string',
            'items.*.warehouse_id' => 'required|exists:warehouses,id',
            'items.*.serial_number' => 'required|string|max:100',
            'items.*.barcode' => 'nullable|string|max:100',
            'items.*.item_code' => 'nullable|string|max:100',
            'items.*.size' => 'nullable|string|max:50',
            'items.*.color' => 'nullable|string|max:50',
            'items.*.material' => 'nullable|string|max:50',
            'items.*.attributes' => 'nullable|array',
            'items.*.status' => 'required|in:available,reserved,sold,damaged,returned,quarantined',
            'items.*.condition' => 'required|in:new,used,refurbished,damaged',
            'items.*.aisle' => 'nullable|string|max:50',
            'items.*.rack' => 'nullable|string|max:50',
            'items.*.shelf' => 'nullable|string|max:50',
            'items.*.bin' => 'nullable|string|max:50',
            'items.*.manufacture_date' => 'nullable|date',
            'items.*.expiry_date' => 'nullable|date|after:manufacture_date',
            'items.*.notes' => 'nullable|string',
            'items.*.metadata' => 'nullable|array',
        ];
    }

    public function attributes(): array
    {
        return [
            'category_id' => 'category',
            'brand_id' => 'brand',
            'tax_id' => 'tax',
            'base_price' => 'price',
            'items.*.warehouse_id' => 'warehouse',
            'items.*.serial_number' => 'serial number',
            'items.*.manufacture_date' => 'manufacture date',
            'items.*.expiry_date' => 'expiry date',
            'existing_images.*.is_default' => 'default image',
        ];
    }

    public function messages(): array
    {
        return [
            'slug.unique' => 'This product URL already exists. Please choose a different one.',
            'sku.unique' => 'This SKU already exists. Please choose a different one.',
            'items.*.serial_number.required' => 'Serial number is required for each item.',
            'items.*.warehouse_id.required' => 'Warehouse is required for each item.',
            'items.*.expiry_date.after' => 'Expiry date must be after manufacture date.',
            'existing_images.*.is_default.required' => 'Default image selection is required.',
            'existing_images.*.is_default.accepted' => 'Default image must be set to true or false.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            // Boolean fields
            'track_quantity' => filter_var($this->track_quantity, FILTER_VALIDATE_BOOLEAN),
            'allow_backorders' => filter_var($this->allow_backorders, FILTER_VALIDATE_BOOLEAN),
            'is_digital' => filter_var($this->is_digital, FILTER_VALIDATE_BOOLEAN),
            'requires_shipping' => filter_var($this->requires_shipping, FILTER_VALIDATE_BOOLEAN),
            'is_featured' => filter_var($this->is_featured, FILTER_VALIDATE_BOOLEAN),
            'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN),
            'is_bestseller' => filter_var($this->is_bestseller, FILTER_VALIDATE_BOOLEAN),
            'is_new' => filter_var($this->is_new, FILTER_VALIDATE_BOOLEAN),

            // Array fields with JSON decoding
            'sizes' => $this->sizes ? (is_string($this->sizes) ? json_decode($this->sizes, true) : $this->sizes) : [],
            'colors' => $this->colors ? (is_string($this->colors) ? json_decode($this->colors, true) : $this->colors) : [],
            'materials' => $this->materials ? (is_string($this->materials) ? json_decode($this->materials, true) : $this->materials) : [],
            'variations' => $this->variations ? (is_string($this->variations) ? json_decode($this->variations, true) : $this->variations) : [],
            'metadata' => $this->metadata ? (is_string($this->metadata) ? json_decode($this->metadata, true) : $this->metadata) : [],
            'items' => $this->items ?: [],

            // Fix item attributes and metadata from string to array
            'items' => collect($this->items ?? [])->map(function ($item) {
                if (isset($item['attributes']) && is_string($item['attributes'])) {
                    $item['attributes'] = json_decode($item['attributes'], true) ?: [];
                }
                if (isset($item['metadata']) && is_string($item['metadata'])) {
                    $item['metadata'] = json_decode($item['metadata'], true) ?: [];
                }
                return $item;
            })->toArray(),

            // Convert existing_images is_default from string to boolean
            'existing_images' => collect($this->existing_images ?? [])->map(function ($image) {
                if (isset($image['is_default'])) {
                    $image['is_default'] = filter_var($image['is_default'], FILTER_VALIDATE_BOOLEAN);
                }
                return $image;
            })->toArray(),
        ]);
    }
}