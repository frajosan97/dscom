<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
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

            // Pricing - FIXED: Made agent_price and wholesaler_price nullable like StoreRequest
            'base_price' => 'required|numeric|min:0',
            'agent_price' => 'nullable|numeric|min:0', // Changed from required
            'wholesaler_price' => 'nullable|numeric|min:0', // Changed from required
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

            // Images - FIXED: Corrected existing_images validation
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'existing_images' => 'nullable|array',
            'existing_images.*.id' => 'sometimes|string', // Changed from 'exists:product_images,id'
            'existing_images.*.is_default' => 'boolean', // Changed from 'required|accepted'

            // Product Items - FIXED: Made id nullable for new items
            'items' => 'nullable|array',
            'items.*.id' => 'nullable|string', // Changed from 'exists:product_items,id'
            'items.*.warehouse_id' => 'required|exists:warehouses,id',
            'items.*.serial_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('product_items', 'serial_number')->ignore($productId, 'product_id')
            ],
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
            'agent_price' => 'agent price',
            'wholesaler_price' => 'wholesaler price',
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
            'items.*.serial_number.unique' => 'This serial number already exists in the system.',
            'items.*.warehouse_id.required' => 'Warehouse is required for each item.',
            'items.*.expiry_date.after' => 'Expiry date must be after manufacture date.',
            'existing_images.*.is_default.boolean' => 'Default image must be set to true or false.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Use Laravel's built-in boolean() method for consistency with StoreRequest
        $this->merge([
            'track_quantity' => $this->boolean('track_quantity'),
            'allow_backorders' => $this->boolean('allow_backorders'),
            'is_digital' => $this->boolean('is_digital'),
            'requires_shipping' => $this->boolean('requires_shipping'),
            'is_featured' => $this->boolean('is_featured'),
            'is_active' => $this->boolean('is_active'),
            'is_bestseller' => $this->boolean('is_bestseller'),
            'is_new' => $this->boolean('is_new'),
        ]);

        // Handle JSON fields if they come as strings
        $jsonFields = ['sizes', 'colors', 'materials', 'variations', 'metadata'];
        foreach ($jsonFields as $field) {
            if ($this->has($field) && is_string($this->input($field))) {
                $decoded = json_decode($this->input($field), true);
                $this->merge([$field => $decoded !== null ? $decoded : []]);
            }
        }

        // Handle items array and convert nested JSON strings
        if ($this->has('items')) {
            $items = collect($this->input('items', []))->map(function ($item) {
                if (isset($item['attributes']) && is_string($item['attributes'])) {
                    $item['attributes'] = json_decode($item['attributes'], true) ?: [];
                }
                if (isset($item['metadata']) && is_string($item['metadata'])) {
                    $item['metadata'] = json_decode($item['metadata'], true) ?: [];
                }
                return $item;
            })->toArray();

            $this->merge(['items' => $items]);
        }

        // Handle existing_images boolean conversion
        if ($this->has('existing_images')) {
            $existingImages = collect($this->input('existing_images', []))->map(function ($image) {
                if (isset($image['is_default'])) {
                    $image['is_default'] = filter_var($image['is_default'], FILTER_VALIDATE_BOOLEAN);
                }
                return $image;
            })->toArray();

            $this->merge(['existing_images' => $existingImages]);
        }

        // Ensure all array fields are arrays even if empty
        $arrayFields = ['sizes', 'colors', 'materials', 'variations', 'metadata', 'items', 'existing_images'];
        foreach ($arrayFields as $field) {
            if (!$this->has($field) || empty($this->input($field))) {
                $this->merge([$field => []]);
            }
        }
    }

    /**
     * Get the validated data from the request.
     * This ensures proper casting of boolean values.
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        // Ensure boolean fields are properly cast
        $booleanFields = [
            'track_quantity',
            'allow_backorders',
            'is_digital',
            'requires_shipping',
            'is_featured',
            'is_active',
            'is_bestseller',
            'is_new'
        ];

        foreach ($booleanFields as $field) {
            if (array_key_exists($field, $validated)) {
                $validated[$field] = (bool) $validated[$field];
            }
        }

        return $validated;
    }
}