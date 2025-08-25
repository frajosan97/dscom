<?php

namespace App\Http\Controllers\Erp\Setting;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreRequest;
use App\Http\Requests\Category\UpdateRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $query = Category::with(['parent'])
                    ->withCount('products')
                    ->withoutTrashed()
                    ->orderBy('order');

                return DataTables::of($query)
                    ->addIndexColumn()
                    ->addColumn('name', fn($row) => $row->name ?? 'N/A')
                    ->addColumn('parent', fn($row) => $row->parent?->name ?? '—')
                    ->addColumn('products_count', fn($row) => $row->products_count ?? 0)
                    ->addColumn('image_preview', fn($row) => view('partials.backend.image-preview', compact('row')))
                    ->addColumn('featured_badge', fn($row) => view('partials.backend.featured-badge', compact('row')))
                    ->addColumn('status_badge', fn($row) => view('partials.backend.status-badge', compact('row')))
                    ->addColumn('action', fn($row) => view('partials.backend.category-actions', compact('row')))
                    ->rawColumns(['image_preview', 'featured_badge', 'status_badge', 'action'])
                    ->make(true);
            }

            return Inertia::render('Backend/ERP/Setting/Category');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug)
    {
        $category = Category::with(['children.products', 'products'])
            ->where('slug', $slug)
            ->firstOrFail()
            ->toArray(); // Convert the model to array immediately

        // Merge direct products and children's products into one array
        $category['products'] = array_merge(
            $category['products'], // Direct products
            collect($category['children']) // Children's products
                ->pluck('products')
                ->flatten(1)
                ->toArray()
        );

        return Inertia::render('Frontend/Category', [
            'category' => $category
        ]);
    }

    public function store(StoreRequest $request)
    {
        try {
            $data = $request->validated();
            $data['slug'] = (new Category())->generateUniqueSlug($data['name']);

            $category = Category::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully.',
                'category' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function edit(Category $category)
    {
        try {
            return response()->json([
                'success' => true,
                'category' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function update(UpdateRequest $request, Category $category)
    {
        try {
            $data = $request->validated();

            if ($category->name !== $data['name']) {
                $data['slug'] = $category->generateUniqueSlug($data['name']);
            }

            $category->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully.',
                'category' => $category->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function destroy(Category $category)
    {
        try {
            $category->delete();
            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
}
