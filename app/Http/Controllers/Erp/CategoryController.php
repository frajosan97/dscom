<?php

namespace App\Http\Controllers\Erp;

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
                    ->addColumn('image_preview', fn($row) => view('partials.backend.image-preview', ['image' => $row->image]))
                    ->addColumn('featured_badge', fn($row) => view('partials.backend.featured-badge', ['isFeatured' => $row->is_featured]))
                    ->addColumn('status_badge', fn($row) => view('partials.backend.status-badge', ['isActive' => $row->is_active]))
                    ->addColumn('action', fn($row) => view('partials.backend.category-actions', ['category' => $row]))
                    ->rawColumns(['image_preview', 'featured_badge', 'status_badge', 'action'])
                    ->make(true);
            }

            return Inertia::render('Backend/ERP/Category/Index');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
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
        return response()->json($category);
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
