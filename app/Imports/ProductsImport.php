<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Tax;
use App\Models\ProductImage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;

class ProductsImport implements ToModel, WithHeadingRow, WithValidation, WithBatchInserts, WithChunkReading, SkipsEmptyRows
{
    private $rows = 0;
    private $errors = [];
    private $existingSkus = [];

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        ++$this->rows;

        try {
            // Skip if row doesn't have required fields
            if (empty($row['name']) || empty($row['sku'])) {
                $this->errors[] = 'Row ' . $this->rows . ': Missing name or SKU';
                return null;
            }

            // Clean SKU
            $sku = strtoupper(trim($row['sku']));

            // Check if SKU already exists
            if (in_array($sku, $this->existingSkus)) {
                $this->errors[] = 'Row ' . $this->rows . ': SKU ' . $sku . ' is duplicated in this import';
                return null;
            }

            $this->existingSkus[] = $sku;

            // Check if product already exists by SKU
            $existingProduct = Product::withTrashed()->where('sku', $sku)->first();

            // Process arrays from comma-separated strings
            $sizes = !empty($row['sizes']) ? $this->processArrayData($row['sizes']) : [];
            $colors = !empty($row['colors']) ? $this->processArrayData($row['colors']) : [];
            $materials = !empty($row['materials']) ? $this->processArrayData($row['materials']) : [];
            $variations = !empty($row['variations']) ? $this->processVariations($row['variations']) : [];

            // Get foreign key IDs
            $categoryId = $this->getCategoryId($row['category'] ?? null);
            $brandId = $this->getBrandId($row['brand'] ?? null);
            $taxId = $this->getTaxId($row['tax'] ?? null);

            $productData = [
                'category_id' => $categoryId,
                'brand_id' => $brandId,
                'tax_id' => $taxId,
                'name' => $row['name'] ?? '',
                'slug' => $this->generateSlug($row['name'], $existingProduct),
                'short_description' => $row['short_description'] ?? '',
                'description' => $row['description'] ?? '',
                'sku' => $sku,
                'product_type' => $row['product_type'] ?? 'simple',
                'sizes' => $sizes,
                'colors' => $colors,
                'materials' => $materials,
                'variations' => $variations,
                'base_price' => $this->parseDecimal($row['base_price'] ?? 0),
                'agent_price' => $this->parseDecimal($row['agent_price'] ?? 0),
                'wholesaler_price' => $this->parseDecimal($row['wholesaler_price'] ?? 0),
                'compare_price' => $this->parseDecimal($row['compare_price'] ?? 0),
                'cost_per_item' => $this->parseDecimal($row['cost_per_item'] ?? 0),
                'total_quantity' => intval($row['total_quantity'] ?? 0),
                'low_stock_alert' => intval($row['low_stock_alert'] ?? 10),
                'track_quantity' => $this->parseBoolean($row['track_quantity'] ?? true),
                'allow_backorders' => $this->parseBoolean($row['allow_backorders'] ?? false),
                'stock_status' => $row['stock_status'] ?? 'in_stock',
                'is_digital' => $this->parseBoolean($row['is_digital'] ?? false),
                'requires_shipping' => $this->parseBoolean($row['requires_shipping'] ?? true),
                'weight' => $this->parseDecimal($row['weight'] ?? 0),
                'length' => $this->parseDecimal($row['length'] ?? 0),
                'width' => $this->parseDecimal($row['width'] ?? 0),
                'height' => $this->parseDecimal($row['height'] ?? 0),
                'is_featured' => $this->parseBoolean($row['is_featured'] ?? false),
                'is_active' => $this->parseBoolean($row['is_active'] ?? true),
                'is_bestseller' => $this->parseBoolean($row['is_bestseller'] ?? false),
                'is_new' => $this->parseBoolean($row['is_new'] ?? false),
                'new_until' => $this->parseDate($row['new_until'] ?? null),
                'meta_title' => $row['meta_title'] ?? '',
                'meta_description' => $row['meta_description'] ?? '',
                'metadata' => $this->processMetadata($row),
            ];

            if ($existingProduct) {
                // Restore if soft deleted
                if ($existingProduct->trashed()) {
                    $existingProduct->restore();
                }

                // Update existing product
                $existingProduct->update($productData);
                $product = $existingProduct;
            } else {
                // Create new product
                $product = new Product($productData);
                $product->save();
            }

            // Process images if provided
            $this->processImages($product, $row);

            // Update total quantity if needed
            if ($product->track_quantity) {
                $product->updateTotalQuantity();
            }

            return $product;

        } catch (\Throwable $th) {
            Log::error('Product import error at row ' . $this->rows . ': ' . $th->getMessage());
            Log::error($th->getTraceAsString());
            $this->errors[] = 'Row ' . $this->rows . ': ' . $th->getMessage();
            return null;
        }
    }

    /**
     * Process comma-separated array data
     */
    private function processArrayData($data)
    {
        if (empty($data)) {
            return [];
        }

        // Check if it's already JSON
        if ($this->isJson($data)) {
            return json_decode($data, true);
        }

        // Handle comma-separated values
        $items = array_map('trim', explode(',', $data));

        // Create associative array with items as keys and labels as values
        $result = [];
        foreach ($items as $item) {
            $result[$item] = $item;
        }

        return $result;
    }

    /**
     * Process variations data
     */
    private function processVariations($data)
    {
        if (empty($data)) {
            return [];
        }

        if ($this->isJson($data)) {
            return json_decode($data, true);
        }

        // Handle variations in format: "size:Small,Medium|color:Red,Blue"
        $variations = [];

        $pairs = explode('|', $data);
        foreach ($pairs as $pair) {
            $parts = explode(':', $pair, 2);
            if (count($parts) === 2) {
                $attribute = trim($parts[0]);
                $values = array_map('trim', explode(',', $parts[1]));
                $variations[$attribute] = $values;
            }
        }

        return $variations;
    }

    /**
     * Process metadata from row
     */
    private function processMetadata($row)
    {
        $metadata = [];

        // Look for columns starting with 'meta_' or 'metadata_'
        foreach ($row as $key => $value) {
            if (strpos($key, 'meta_') === 0 || strpos($key, 'metadata_') === 0) {
                $cleanKey = str_replace(['meta_', 'metadata_'], '', $key);
                $metadata[$cleanKey] = $value;
            }
        }

        return $metadata;
    }

    /**
     * Get category ID from name
     */
    private function getCategoryId($categoryName)
    {
        if (empty($categoryName)) {
            return null;
        }

        // Check if it's numeric ID
        if (is_numeric($categoryName)) {
            $category = Category::find($categoryName);
            return $category ? $category->id : null;
        }

        // Find by name or slug
        $category = Category::where('name', $categoryName)
            ->orWhere('slug', Str::slug($categoryName))
            ->first();

        if (!$category) {
            // Create new category if not found
            $category = Category::create([
                'name' => $categoryName,
                'slug' => Str::slug($categoryName),
                'is_active' => true,
            ]);
        }

        return $category->id;
    }

    /**
     * Get brand ID from name
     */
    private function getBrandId($brandName)
    {
        if (empty($brandName)) {
            return null;
        }

        if (is_numeric($brandName)) {
            $brand = Brand::find($brandName);
            return $brand ? $brand->id : null;
        }

        $brand = Brand::where('name', $brandName)
            ->orWhere('slug', Str::slug($brandName))
            ->first();

        if (!$brand) {
            $brand = Brand::create([
                'name' => $brandName,
                'slug' => Str::slug($brandName),
                'is_active' => true,
            ]);
        }

        return $brand->id;
    }

    /**
     * Get tax ID from name or rate
     */
    private function getTaxId($taxInput)
    {
        if (empty($taxInput)) {
            return null;
        }

        if (is_numeric($taxInput)) {
            // Check if it's an ID
            $tax = Tax::find($taxInput);
            if ($tax) {
                return $tax->id;
            }

            // Or if it's a rate percentage
            $tax = Tax::where('rate', floatval($taxInput))->first();
            if ($tax) {
                return $tax->id;
            }
        } else {
            // Find by name
            $tax = Tax::where('name', $taxInput)->first();
            if ($tax) {
                return $tax->id;
            }
        }

        return null;
    }

    /**
     * Generate unique slug
     */
    private function generateSlug($name, $existingProduct = null)
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        // Check if slug exists for other products
        $query = Product::withTrashed()->where('slug', $slug);
        if ($existingProduct) {
            $query->where('id', '!=', $existingProduct->id);
        }

        while ($query->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;

            $query = Product::withTrashed()->where('slug', $slug);
            if ($existingProduct) {
                $query->where('id', '!=', $existingProduct->id);
            }
        }

        return $slug;
    }

    /**
     * Process product images
     */
    private function processImages(Product $product, array $row)
    {
        // Clear existing images if specified
        if (isset($row['replace_images']) && $this->parseBoolean($row['replace_images'])) {
            $product->images()->delete();
        }

        // Handle image URLs
        if (!empty($row['image_urls'])) {
            $urls = array_map('trim', explode(',', $row['image_urls']));

            foreach ($urls as $index => $url) {
                if (!empty($url)) {
                    $isDefault = ($index === 0 && empty($row['default_image_url'])) ||
                        ($url === ($row['default_image_url'] ?? ''));

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $url,
                        'is_default' => $isDefault,
                        'sort_order' => $index,
                    ]);
                }
            }
        }

        // Handle single default image
        if (!empty($row['default_image_url']) && empty($row['image_urls'])) {
            ProductImage::create([
                'product_id' => $product->id,
                'image_url' => trim($row['default_image_url']),
                'is_default' => true,
                'sort_order' => 0,
            ]);
        }
    }

    /**
     * Parse decimal values
     */
    private function parseDecimal($value)
    {
        if (empty($value)) {
            return 0.00;
        }

        // Remove currency symbols and thousands separators
        $value = str_replace(['$', '€', '£', ',', ' '], '', $value);

        return floatval($value);
    }

    /**
     * Parse boolean values
     */
    private function parseBoolean($value)
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (bool) $value;
        }

        $value = strtolower(trim($value));

        return in_array($value, ['yes', 'true', '1', 'y', 'active', 'enabled']);
    }

    /**
     * Parse date values
     */
    private function parseDate($value)
    {
        if (empty($value)) {
            return null;
        }

        try {
            // Try to parse Excel date format
            if (is_numeric($value) && $value > 25569) { // Excel date serial number
                $unixTimestamp = ($value - 25569) * 86400;
                return date('Y-m-d', $unixTimestamp);
            }

            // Try regular date parsing
            $date = \Carbon\Carbon::parse($value);
            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Check if string is JSON
     */
    private function isJson($string)
    {
        if (!is_string($string)) {
            return false;
        }

        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }

    /**
     * Validation rules
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100',
            'base_price' => 'nullable|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'total_quantity' => 'nullable|integer|min:0',
            'low_stock_alert' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Custom validation messages
     */
    public function customValidationMessages()
    {
        return [
            'name.required' => 'Product name is required',
            'sku.required' => 'SKU is required',
            'base_price.numeric' => 'Base price must be a number',
            'base_price.min' => 'Base price cannot be negative',
            'compare_price.numeric' => 'Compare price must be a number',
            'compare_price.min' => 'Compare price cannot be negative',
            'total_quantity.integer' => 'Total quantity must be an integer',
            'total_quantity.min' => 'Total quantity cannot be negative',
        ];
    }

    /**
     * Get import errors
     */
    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * Get processed rows count
     */
    public function getRowCount()
    {
        return $this->rows;
    }

    /**
     * Get success count
     */
    public function getSuccessCount()
    {
        return $this->rows - count($this->errors);
    }

    /**
     * Batch inserts for performance
     */
    public function batchSize(): int
    {
        return 50;
    }

    /**
     * Chunk reading for memory management
     */
    public function chunkSize(): int
    {
        return 50;
    }

    /**
     * Prepare data before validation
     */
    public function prepareForValidation($data)
    {
        // Trim all string values
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = trim($value);
            }
        }

        return $data;
    }
}