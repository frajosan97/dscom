<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            return $this->getDataTableResponse($request);
        }

        return Inertia::render('Backend/ERP/Category/Index');
    }

    public function store(Request $request)
    {
        $validated = $this->validateRequest($request);

        try {
            $validated['image'] = $request->hasFile('image') && $request->file('image')->isValid()
                ? $this->uploadImage($request->file('image'))
                : null;

            $data = $this->buildCatalogueData($validated);
            $data['slug'] = (new Category())->generateUniqueSlug($validated['name']);

            $category = Category::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully.',
                'category' => $category
            ]);
        } catch (\Exception $e) {
            Log::error('Category creation failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to create category. Please try again.'
            ], 500);
        }
    }

    public function edit(Category $category)
    {
        return response()->json($category);
    }

    public function update(Request $request, Category $category)
    {
        try {
            $validated = $this->validateRequest($request);

            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                if ($category->image) {
                    $this->deleteImage($category->image);
                }
                $validated['image'] = $this->uploadImage($request->file('image'));
            } else {
                $validated['image'] = $category->image;
            }

            $data = $this->buildCatalogueData($validated);

            if ($category->name !== $validated['name']) {
                $data['slug'] = $category->generateUniqueSlug($validated['name']);
            }

            $category->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully.',
                'category' => $category->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Category update failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to update category. Please try again.'
            ], 500);
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
                'error' => 'Failed to delete category.'
            ], 500);
        }
    }

    public function restore($id)
    {
        try {
            $category = Category::withTrashed()->findOrFail($id);
            $category->restore();
            return response()->json([
                'success' => true,
                'message' => 'Category restored successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to restore category.'
            ], 500);
        }
    }

    public function forceDelete($id)
    {
        try {
            $category = Category::withTrashed()->findOrFail($id);

            if ($category->image) {
                $this->deleteImage($category->image);
            }

            if ($category->icon) {
                $this->deleteImage($category->icon);
            }

            $category->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Category permanently deleted.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to permanently delete category.'
            ], 500);
        }
    }

    private function getDataTableResponse(Request $request)
    {
        $query = Category::with(['parent'])
            ->withCount('products')
            ->withoutTrashed()
            ->orderBy('order');

        return DataTables::of($query)
            ->addIndexColumn()
            ->addColumn('name', fn($row) => $row->name ?? 'N/A')
            ->addColumn('parent', fn($row) => $row->parent?->name ?? '—')
            ->addColumn('products_count', fn($row) => $row->products_count ?? 0)
            ->addColumn('image_preview', fn($row) => $row->image
                ? '<img src="' . asset($row->image) . '" alt="Category Image" class="img-thumbnail" style="max-width: 40px; max-height: 40px;">'
                : 'No Image')
            ->addColumn('featured_badge', fn($row) => $row->is_featured
                ? '<span class="badge bg-primary"><i class="bi bi-star"></i> Featured</span>'
                : 'N/A')
            ->addColumn('status_badge', fn($row) => $row->is_active
                ? '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Active</span>'
                : '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Inactive</span>')
            ->addColumn('action', fn($row) => $this->getActionButtons($row))
            ->rawColumns(['image_preview', 'featured_badge', 'status_badge', 'action'])
            ->make(true);
    }

    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            // 'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'icon' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'is_featured' => 'required|in:true,false,1,0,on,off',
            'is_active' => 'required|in:true,false,1,0,on,off',
            'order' => 'nullable|integer',
            'additional_fields' => 'nullable|json',
        ]);
    }

    private function buildCatalogueData(array $validated): array
    {
        return [
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            // 'image' => $validated['image'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'parent_id' => $validated['parent_id'] ?? null,
            'is_featured' => filter_var($validated['is_featured'], FILTER_VALIDATE_BOOLEAN),
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
            'order' => $validated['order'] ?? 0,
            'additional_fields' => $validated['additional_fields'] ?? null,
        ];
    }

    private function uploadImage($image): string
    {
        $filename = Str::random(10) . '.' . $image->getClientOriginalExtension();
        $path = $image->storeAs('images/categories', $filename, 'public');
        return 'storage/' . $path;
    }

    private function deleteImage($path): void
    {
        $storagePath = str_replace('/storage', 'public', $path);
        if (Storage::exists($storagePath)) {
            Storage::delete($storagePath);
        }
    }

    private function getActionButtons(Category $category): string
    {
        return '
            <div class="btn-group float-end text-nowrap gap-2">
                <button class="btn btn-sm btn-outline-primary rounded edit-btn" data-id="' . $category->id . '">
                    <i class="bi bi-pen me-1"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger rounded delete-btn" data-id="' . $category->id . '">
                    <i class="bi bi-trash me-1"></i> Delete
                </button>
            </div>';
    }
}
