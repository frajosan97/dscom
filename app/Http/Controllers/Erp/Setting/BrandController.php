<?php

namespace App\Http\Controllers\Erp\Setting;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class BrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $brands = Brand::query()->withoutTrashed();

            return DataTables::of($brands)
                ->addColumn('name', fn($row) => $row->name ?? 'N/A')
                ->addColumn('slug', fn($row) => $row->slug ?? 'N/A')
                ->addColumn('status_badge', fn($row) => $row->is_active
                    ? '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Active</span>'
                    : '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Inactive</span>')
                ->addColumn('featured_badge', fn($row) => $row->is_featured
                    ? '<span class="badge bg-primary"><i class="bi bi-star"></i> Featured</span>'
                    : '<span class="badge bg-secondary"><i class="bi bi-star"></i> Regular</span>')
                ->addColumn('logo', fn($row) => $row->logo
                    ? '<img src="' . asset($row->logo) . '" alt="' . $row->name . '" class="img-thumbnail" width="50">'
                    : 'N/A')
                ->addColumn('action', fn($row) => $this->getActionButtons($row))
                ->rawColumns(['status_badge', 'featured_badge', 'logo', 'action'])
                ->make(true);
        }

        return Inertia::render('Backend/ERP/Brand/Index');
    }

    /**
     * Store a newly created brand in storage.
     */
    public function store(Request $request)
    {
        $validated = $this->validateBrand($request);
        $brandData = $this->buildBrandData($validated);

        if ($request->hasFile('logo')) {
            $brandData['logo'] = $this->uploadLogo($request->file('logo'));
        }

        Brand::create($brandData);

        return response()->json(['message' => 'Brand created successfully.']);
    }

    /**
     * Show the form for editing the specified brand.
     */
    public function edit(Brand $brand)
    {
        return response()->json($brand);
    }

    /**
     * Update the specified brand in storage.
     */
    public function update(Request $request, Brand $brand)
    {
        try {
            $validated = $this->validateBrand($request);
            $brandData = $this->buildBrandData($validated);

            if ($request->hasFile('logo')) {
                $this->deleteOldLogo($brand->logo);
                $brandData['logo'] = $this->uploadLogo($request->file('logo'));
            }

            $brand->update($brandData);

            return response()->json(['message' => 'Brand updated successfully.']);
        } catch (\Exception $e) {
            Log::error('Brand update failed', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to update brand. Please try again.',
            ], 500);
        }
    }

    /**
     * Soft delete the specified brand.
     */
    public function destroy(Brand $brand)
    {
        $this->deleteOldLogo($brand->logo);
        $brand->delete();
        return response()->json(['message' => 'Brand deleted successfully.']);
    }

    /**
     * Restore a soft-deleted brand.
     */
    public function restore($id)
    {
        $brand = Brand::withTrashed()->findOrFail($id);
        $brand->restore();

        return response()->json(['message' => 'Brand restored successfully.']);
    }

    /**
     * Permanently delete a soft-deleted brand.
     */
    public function forceDelete($id)
    {
        $brand = Brand::withTrashed()->findOrFail($id);
        $this->deleteOldLogo($brand->logo);
        $brand->forceDelete();

        return response()->json(['message' => 'Brand permanently deleted.']);
    }

    /**
     * Validate brand request data.
     */
    private function validateBrand(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:brands,slug,' . $request->id,
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'website_url' => 'nullable|url|max:255',
            'facebook_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            'is_active' => 'required|in:true,false,1,0,on,off',
            'is_featured' => 'required|in:true,false,1,0,on,off',
            'order' => 'nullable|integer',
        ]);
    }

    /**
     * Build brand data array.
     */
    private function buildBrandData(array $validated): array
    {
        return [
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'website_url' => $validated['website_url'] ?? null,
            'facebook_url' => $validated['facebook_url'] ?? null,
            'instagram_url' => $validated['instagram_url'] ?? null,
            'twitter_url' => $validated['twitter_url'] ?? null,
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
            'is_featured' => filter_var($validated['is_featured'], FILTER_VALIDATE_BOOLEAN),
            'order' => $validated['order'] ?? 0,
        ];
    }

    /**
     * Upload brand logo.
     */
    private function uploadLogo($image): string
    {
        $filename = Str::random(20) . '_' . time() . '.' . $image->getClientOriginalExtension();
        $path = $image->storeAs('images/brands', $filename, 'public');
        return 'storage/' . $path;
    }

    /**
     * Delete old logo file.
     */
    private function deleteOldLogo(?string $logoPath): void
    {
        if ($logoPath && file_exists(public_path($logoPath))) {
            unlink(public_path($logoPath));
        }
    }

    /**
     * Generate action buttons HTML.
     */
    private function getActionButtons(Brand $row): string
    {
        return '
            <div class="btn-group float-end text-nowrap gap-2">
                <button class="btn btn-sm btn-outline-primary rounded edit-btn" data-id="' . $row->id . '">
                    <i class="bi bi-pen me-1"></i>Edit
                </button>
                <button class="btn btn-sm btn-outline-danger rounded delete-btn" data-id="' . $row->id . '">
                    <i class="bi bi-trash me-1"></i>Delete
                </button>
            </div>';
    }
}
