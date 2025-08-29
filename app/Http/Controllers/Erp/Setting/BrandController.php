<?php

namespace App\Http\Controllers\Erp\Setting;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\Brand\StoreRequest;
use App\Http\Requests\Setting\Brand\UpdateRequest;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $query = Brand::withoutTrashed();

                return DataTables::of($query)
                    ->addIndexColumn()
                    ->addColumn('name', fn($row) => $row->name ?? 'N/A')
                    ->addColumn('slug', fn($row) => $row->slug ?? 'N/A')
                    ->addColumn('logo', fn($row) => view('partials.backend.image-preview', [
                        'row' => $row,
                        'imageField' => 'logo',
                        'altText' => $row->name
                    ]))
                    ->addColumn('featured_badge', fn($row) => view('partials.backend.featured-badge', compact('row')))
                    ->addColumn('status_badge', fn($row) => view('partials.backend.status-badge', compact('row')))
                    ->addColumn('action', fn($row) => view('partials.backend.brand-actions', compact('row')))
                    ->rawColumns(['logo', 'featured_badge', 'status_badge', 'action'])
                    ->make(true);
            }

            return Inertia::render('Backend/ERP/Setting/Brand');
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

            if ($request->hasFile('logo')) {
                $data['logo'] = $this->uploadLogo($request->file('logo'));
            }

            $brand = Brand::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Brand created successfully.',
                'brand' => $brand
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function edit(Brand $brand)
    {
        try {
            return response()->json([
                'success' => true,
                'brand' => $brand
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function update(UpdateRequest $request, Brand $brand)
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('logo')) {
                $this->deleteOldLogo($brand->logo);
                $data['logo'] = $this->uploadLogo($request->file('logo'));
            }

            $brand->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Brand updated successfully.',
                'brand' => $brand->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function destroy(Brand $brand)
    {
        try {
            $this->deleteOldLogo($brand->logo);
            $brand->delete();

            return response()->json([
                'success' => true,
                'message' => 'Brand deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Upload brand logo.
     */
    private function uploadLogo($image): string
    {
        $filename = \Illuminate\Support\Str::random(20) . '_' . time() . '.' . $image->getClientOriginalExtension();
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
}