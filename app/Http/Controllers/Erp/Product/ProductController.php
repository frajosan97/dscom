<?php

namespace App\Http\Controllers\Erp\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreRequest;
use App\Http\Requests\Product\UpdateRequest;
use App\Imports\ProductsImport;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Yajra\DataTables\DataTables;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has("draw")) {
            $query = Product::with(['category', 'brand'])
                ->withCount(['items'])
                ->latest();

            return DataTables::of($query)
                ->addColumn('product_image', function ($row) {
                    return view('partials.product.image', compact('row'))->render();
                })
                ->addColumn('product_name', function ($row) {
                    return view('partials.product.name', compact('row'))->render();
                })
                ->addColumn('price_list', function ($row) {
                    return view('partials.product.prices', compact('row'))->render();
                })
                ->addColumn('status_badge', function ($row) {
                    return view('partials.product.status', compact('row'))->render();
                })
                ->addColumn('action', function ($row) {
                    return view('partials.product.actions', compact('row'))->render();
                })
                ->rawColumns(['product_image', 'product_name', 'price_list', 'status_badge', 'action'])
                ->make(true);
        }

        return Inertia::render('Backend/ERP/Product/Index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Backend/ERP/Product/ProductForm', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreRequest $request)
    {
        // Log::info($request);

        DB::beginTransaction();

        try {
            // Create the main product
            $product = Product::create($this->prepareProductData($request));

            // Handle product images
            $this->handleProductImages($product, $request);

            // Handle product items (for physical products)
            if (!$product->is_digital && $request->filled('items')) {
                $this->handleProductItems($product, $request);
            }

            // Update total quantity based on items
            if ($product->track_quantity && !$product->is_digital) {
                $this->updateProductQuantity($product);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully!',
                'data' => [
                    'product' => $product->load(['category', 'brand', 'images', 'items']),
                    'redirect_url' => route('product.index')
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load(['category', 'brand', 'images', 'items.warehouse']);

        return Inertia::render('Frontend/Product', [
            'product' => $product
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $product->load(['images', 'items.warehouse']);

        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Backend/ERP/Product/ProductForm', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateRequest $request, Product $product)
    {
        DB::beginTransaction();

        try {
            // Update the main product
            $product->update($this->prepareProductData($request));

            // Handle product images
            $this->handleProductImages($product, $request);

            // Handle product items (for physical products)
            if (!$product->is_digital && $request->filled('items')) {
                $this->handleProductItems($product, $request);
            } else {
                // Remove all items if product is now digital
                $product->items()->delete();
            }

            // Update total quantity based on items
            if ($product->track_quantity && !$product->is_digital) {
                $this->updateProductQuantity($product);
            } else {
                // Reset total quantity if tracking is disabled or product is digital
                $product->update(['total_quantity' => 0]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully!',
                'data' => [
                    'product' => $product->load(['category', 'brand', 'images', 'items']),
                    'redirect_url' => route('product.index')
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product)
    {
        DB::beginTransaction();

        try {
            // Delete product images from storage
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->image_path);
            }

            // Delete the product (this will cascade delete related records due to foreign keys)
            $product->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully!'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Prepare product data for creation/update.
     */
    private function prepareProductData(Request $request): array
    {
        $data = $request->validated();

        // Handle JSON fields - encode arrays to JSON
        $jsonFields = ['sizes', 'colors', 'materials', 'variations', 'metadata'];
        foreach ($jsonFields as $field) {
            if (isset($data[$field]) && is_array($data[$field])) {
                $data[$field] = !empty($data[$field]) ? json_encode($data[$field]) : null;
            } elseif (isset($data[$field]) && is_string($data[$field])) {
                // Already encoded or empty string
                $data[$field] = !empty($data[$field]) ? $data[$field] : null;
            } else {
                $data[$field] = null;
            }
        }

        // Generate slug if not provided
        if (empty($data['slug']) && !empty($data['name'])) {
            $data['slug'] = $this->generateSlug($data['name'], $request->route('product')?->id);
        }

        // Set default values for digital products
        if ($data['is_digital'] ?? false) {
            $data['requires_shipping'] = false;
            $data['weight'] = null;
            $data['length'] = null;
            $data['width'] = null;
            $data['height'] = null;
        }

        // Calculate stock status if not tracking quantity
        if (!($data['track_quantity'] ?? true)) {
            $data['stock_status'] = ($data['is_active'] ?? true) ? 'in_stock' : 'out_of_stock';
        }

        // Ensure numeric fields are properly cast
        $numericFields = [
            'base_price',
            'agent_price',
            'wholesaler_price',
            'compare_price',
            'cost_per_item',
            'total_quantity',
            'low_stock_alert',
            'weight',
            'length',
            'width',
            'height'
        ];

        foreach ($numericFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = is_numeric($data[$field]) ? $data[$field] : 0;
            }
        }

        return $data;
    }

    /**
     * Handle product images upload and management.
     */
    private function handleProductImages(Product $product, Request $request): void
    {
        $existingImages = $request->input('existing_images', []);
        $newImages = $request->file('images', []);

        // Handle existing images (for both new and existing products)
        $this->handleExistingImages($product, $existingImages);

        // Handle new image uploads
        $this->handleNewImageUploads($product, $newImages, $request);

        // Ensure single default image
        $this->ensureSingleDefaultImage($product);
    }

    /**
     * Handle existing images (both for new and existing products)
     */
    private function handleExistingImages(Product $product, array $existingImages): void
    {
        // For existing products, manage image deletions and updates
        if ($product->exists) {
            $keptImageIds = collect($existingImages)
                ->pluck('id')
                ->filter(fn($id) => is_numeric($id))
                ->toArray();

            // Delete images that are no longer associated
            $product->images()
                ->whereNotIn('id', $keptImageIds)
                ->get()
                ->each(function ($image) {
                    Storage::disk('public')->delete($image->image_path);
                    $image->delete();
                });

            // Update existing images
            foreach ($existingImages as $index => $imageData) {
                if (isset($imageData['id']) && is_numeric($imageData['id'])) {
                    ProductImage::where('id', $imageData['id'])
                        ->where('product_id', $product->id)
                        ->update([
                            'is_default' => $imageData['is_default'] ?? false,
                            'order' => $imageData['order'] ?? $index,
                            'alt_text' => $imageData['alt_text'] ?? '',
                            'title' => $imageData['title'] ?? '',
                        ]);
                }
            }
        }
    }

    /**
     * Handle new image uploads
     */
    private function handleNewImageUploads(Product $product, array $newImages, Request $request): void
    {
        $uploadedImages = [];

        foreach ($newImages as $index => $imageFile) {
            // Ensure the directory exists
            $directory = 'images/products/' . $product->id;

            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
            }

            // Generate unique filename
            $extension = $imageFile->getClientOriginalExtension();
            $filename = uniqid() . '_' . time() . '.' . $extension;
            $path = $imageFile->storeAs($directory, $filename, 'public');

            $uploadedImages[] = [
                'product_id' => $product->id,
                'image_path' => $path,
                'alt_text' => $request->input("images.{$index}.alt_text", ''),
                'title' => $request->input("images.{$index}.title", ''),
                'is_default' => $request->input("images.{$index}.is_default", false),
                'order' => $index,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert all new images
        if (!empty($uploadedImages)) {
            ProductImage::insert($uploadedImages);
        }
    }

    /**
     * Handle product items creation and updates.
     */
    private function handleProductItems(Product $product, Request $request): void
    {
        $items = $request->input('items', []);
        $existingItemIds = $product->items()->pluck('id')->toArray();
        $submittedItemIds = [];

        foreach ($items as $itemData) {
            $preparedData = $this->prepareItemData($itemData, $product->id);

            if (isset($itemData['id']) && is_numeric($itemData['id'])) {
                // Update existing item
                $product->items()
                    ->where('id', $itemData['id'])
                    ->update($preparedData);

                $submittedItemIds[] = $itemData['id'];
            } else {
                // Create new item (ignore temp IDs from frontend)
                $item = $product->items()->create($preparedData);
                $submittedItemIds[] = $item->id;
            }
        }

        // Delete items that were not submitted (removed by user)
        $itemsToDelete = array_diff($existingItemIds, $submittedItemIds);
        if (!empty($itemsToDelete)) {
            $product->items()->whereIn('id', $itemsToDelete)->delete();
        }
    }

    /**
     * Prepare item data for creation/update.
     */
    private function prepareItemData(array $itemData, int $productId): array
    {
        $preparedData = [
            'product_id' => $productId,
            'warehouse_id' => $itemData['warehouse_id'],
            'serial_number' => $itemData['serial_number'],
            'barcode' => $itemData['barcode'] ?? null,
            'item_code' => $itemData['item_code'] ?? null,
            'size' => $itemData['size'] ?? null,
            'color' => $itemData['color'] ?? null,
            'material' => $itemData['material'] ?? null,
            'status' => $itemData['status'],
            'condition' => $itemData['condition'],
            'aisle' => $itemData['aisle'] ?? null,
            'rack' => $itemData['rack'] ?? null,
            'shelf' => $itemData['shelf'] ?? null,
            'bin' => $itemData['bin'] ?? null,
            'manufacture_date' => $itemData['manufacture_date'] ?? null,
            'expiry_date' => $itemData['expiry_date'] ?? null,
            'notes' => $itemData['notes'] ?? null,
        ];

        // Handle JSON fields
        if (isset($itemData['attributes'])) {
            $preparedData['attributes'] = is_array($itemData['attributes']) && !empty($itemData['attributes'])
                ? json_encode($itemData['attributes'])
                : null;
        }

        if (isset($itemData['metadata'])) {
            $preparedData['metadata'] = is_array($itemData['metadata']) && !empty($itemData['metadata'])
                ? json_encode($itemData['metadata'])
                : null;
        }

        return $preparedData;
    }

    /**
     * Ensure only one default image exists for the product.
     */
    private function ensureSingleDefaultImage(Product $product): void
    {
        $defaultImages = $product->images()->where('is_default', true)->get();

        if ($defaultImages->count() > 1) {
            // Keep the first one as default, unset others
            $firstDefault = $defaultImages->first();
            $product->images()
                ->where('is_default', true)
                ->where('id', '!=', $firstDefault->id)
                ->update(['is_default' => false]);
        } elseif ($defaultImages->count() === 0) {
            // Set the first image as default if none exists
            $firstImage = $product->images()->orderBy('order')->first();
            if ($firstImage) {
                $firstImage->update(['is_default' => true]);
            }
        }
    }

    /**
     * Update product total quantity based on items.
     */
    private function updateProductQuantity(Product $product): void
    {
        $totalQuantity = $product->items()
            ->where('status', 'available')
            ->count();

        $product->update(['total_quantity' => $totalQuantity]);
    }

    /**
     * Generate unique slug for product.
     */
    private function generateSlug(string $name, ?int $excludeId = null): string
    {
        $slug = str($name)->slug();
        $originalSlug = $slug;
        $counter = 1;

        while (
            Product::where('slug', $slug)
                ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = $originalSlug . '-' . $counter++;
        }

        return $slug;
    }

    /**
     * Get product details for API.
     */
    public function getProductDetails(Product $product)
    {
        $product->load(['category', 'brand', 'images', 'items.warehouse']);

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Check product SKU uniqueness.
     */
    public function checkSku(Request $request)
    {
        $request->validate([
            'sku' => 'required|string',
            'product_id' => 'nullable|exists:products,id'
        ]);

        $exists = Product::where('sku', $request->sku)
            ->when($request->product_id, fn($q) => $q->where('id', '!=', $request->product_id))
            ->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'SKU already exists' : 'SKU is available'
        ]);
    }

    /**
     * Check product slug uniqueness.
     */
    public function checkSlug(Request $request)
    {
        $request->validate([
            'slug' => 'required|string',
            'product_id' => 'nullable|exists:products,id'
        ]);

        $exists = Product::where('slug', $request->slug)
            ->when($request->product_id, fn($q) => $q->where('id', '!=', $request->product_id))
            ->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Slug already exists' : 'Slug is available'
        ]);
    }

    /**
     * Handle Excel import
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120'
        ]);

        try {
            $import = new ProductsImport();

            Excel::import($import, $request->file('file'));

            return response()->json([
                'success' => true,
                'message' => 'Products imported successfully',
            ]);

        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errors = [];

            foreach ($failures as $failure) {
                $errors[] = "Row {$failure->row()}: " . implode(', ', $failure->errors());
            }

            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred',
                'errors' => $errors
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error importing file: ' . $e->getMessage(),
                'error_details' => $e->getMessage()
            ], 500);
        }
    }
}