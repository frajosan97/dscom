<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreRequest;
use App\Http\Requests\Product\UpdateRequest;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $query = Product::with(['category', 'brand'])
                ->withCount(['variants'])
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

    public function create()
    {
        return Inertia::render('Backend/ERP/Product/Create');
    }

    public function store(StoreRequest $request)
    {
        try {
            $product = Product::create($request->validated());

            if ($request->hasFile('images')) {
                $this->storeProductImages($product, $request->file('images'));
            }

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'product' => $product->load(['category', 'brand', 'images'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to store product: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)
            ->orWhere('id', $slug)
            ->firstOrFail();

        $product = $product->load([
            'category',
            'brand',
            'branch',
            'tax',
            'images',
            'variants',
            'attributes.values'
        ]);

        if (systemMode() === 'erp') {
            return Inertia::render('Backend/ERP/Product/Show', [
                'product' => $product
            ]);
        }

        return Inertia::render('Frontend/Product', [
            'product' => $product
        ]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('Backend/ERP/Product/Edit', [
            'product' => $product->load([
                'category',
                'brand',
                'branch',
                'tax',
                'images',
                'variants',
                'attributes.values'
            ])
        ]);
    }

    public function update(UpdateRequest $request, Product $product)
    {
        try {
            $product->update($request->validated());

            if ($request->hasFile('images')) {
                $this->storeProductImages($product, $request->file('images'));
            }

            if ($request->has('remove_images')) {
                foreach ($request->input('remove_images') as $imageId) {
                    $image = ProductImage::find($imageId);
                    if ($image) {
                        Storage::disk('public')->delete($image->image_path);
                        $image->delete();
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'product' => $product->fresh()->load(['category', 'brand', 'images'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Product $product)
    {
        try {
            $product->delete();
            return response()->json([
                'success' => true,
                'message' => 'Product moved to trash successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product'
            ], 500);
        }
    }

    private function storeProductImages(Product $product, array $uploadedFiles): void
    {
        foreach ($uploadedFiles as $file) {
            $path = $file->store('products', 'public');

            ProductImage::create([
                'product_id'  => $product->id,
                'image_path'  => $path,
                'alt_text'    => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'is_default'  => false,
                'order'       => 0
            ]);
        }
    }
}
