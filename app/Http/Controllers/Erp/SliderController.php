<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class SliderController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            return $this->getDataTableResponse($request);
        }

        return Inertia::render('Backend/ERP/Slide/Index');
    }

    public function store(Request $request)
    {
        $validated = $this->validateSliderRequest($request);

        try {
            $data = $this->buildSliderData($validated);
            $data['slug'] = (new Slider())->generateUniqueSlug($validated['name']);

            $slider = Slider::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Slider created successfully.',
                'slider' => $slider
            ]);
        } catch (\Exception $e) {
            Log::error('Slider creation failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to create slider. Please try again.'
            ], 500);
        }
    }

    public function show(Slider $slider)
    {
        return Inertia::render('Backend/ERP/Slide/Show', [
            'slider' => $slider
        ]);
    }

    public function edit(Slider $slider)
    {
        return response()->json($slider);
    }

    public function update(Request $request, Slider $slider)
    {
        try {
            $validated = $this->validateSliderRequest($request);
            $data = $this->buildSliderData($validated);

            if ($slider->name !== $validated['name']) {
                $data['slug'] = $slider->generateUniqueSlug($validated['name']);
            }

            $slider->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Slider updated successfully.',
                'slider' => $slider->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Slider update failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to update slider. Please try again.'
            ], 500);
        }
    }

    public function destroy(Slider $slider)
    {
        try {
            $slider->delete();
            return response()->json([
                'success' => true,
                'message' => 'Slider deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete slider.'
            ], 500);
        }
    }

    public function restore($id)
    {
        try {
            $slider = Slider::withTrashed()->findOrFail($id);
            $slider->restore();
            return response()->json([
                'success' => true,
                'message' => 'Slider restored successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to restore slider.'
            ], 500);
        }
    }

    public function forceDelete($id)
    {
        try {
            $slider = Slider::withTrashed()->findOrFail($id);
            $slider->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Slider permanently deleted.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to permanently delete slider.'
            ], 500);
        }
    }

    private function getDataTableResponse(Request $request)
    {
        $query = Slider::query()
            ->withCount('items')
            ->withoutTrashed()
            ->orderBy('created_at', 'desc');

        return DataTables::of($query)
            ->addIndexColumn()
            ->addColumn('name', fn($row) => $row->name ?? 'N/A')
            ->addColumn('type', fn($row) => ucfirst($row->type) ?? 'Default')
            ->addColumn('items_count', fn($row) => $row->items_count ?? 0)
            ->addColumn('status_badge', fn($row) => $row->is_active
                ? '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Active</span>'
                : '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Inactive</span>')
            ->addColumn('action', fn($row) => $this->getSliderActionButtons($row))
            ->rawColumns(['status_badge', 'action'])
            ->make(true);
    }

    private function validateSliderRequest(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|in:default,hero,banner,testimonial,gallery',
            'is_active' => 'required|in:true,false,1,0,on,off',
            'autoplay' => 'required|in:true,false,1,0,on,off',
            'arrows' => 'required|in:true,false,1,0,on,off',
            'dots' => 'required|in:true,false,1,0,on,off',
            'infinite' => 'required|in:true,false,1,0,on,off',
            'autoplay_speed' => 'required|integer|min:1000',
            'slides_to_show' => 'required|integer|min:1',
            'slides_to_scroll' => 'required|integer|min:1',
            'breakpoints' => 'nullable|json',
            'custom_settings' => 'nullable|json',
        ]);
    }

    private function buildSliderData(array $validated): array
    {
        return [
            'name' => $validated['name'],
            'type' => 'hero',
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
            'autoplay' => filter_var($validated['autoplay'], FILTER_VALIDATE_BOOLEAN),
            'arrows' => filter_var($validated['arrows'], FILTER_VALIDATE_BOOLEAN),
            'dots' => filter_var($validated['dots'], FILTER_VALIDATE_BOOLEAN),
            'infinite' => filter_var($validated['infinite'], FILTER_VALIDATE_BOOLEAN),
            'autoplay_speed' => $validated['autoplay_speed'],
            'slides_to_show' => $validated['slides_to_show'],
            'slides_to_scroll' => $validated['slides_to_scroll'],
            'breakpoints' => $validated['breakpoints'] ?? null,
            'custom_settings' => $validated['custom_settings'] ?? null,
        ];
    }

    private function getSliderActionButtons(Slider $slider): string
    {
        return '
            <div class="btn-group float-end text-nowrap gap-2">
                <a href="' . route('slider.show', $slider->id) . '" class="btn btn-sm btn-outline-info rounded">
                    <i class="bi bi-images me-1"></i> Items
                </a>
                <button class="btn btn-sm btn-outline-primary rounded edit-btn" data-id="' . $slider->id . '">
                    <i class="bi bi-pen me-1"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger rounded delete-btn" data-id="' . $slider->id . '">
                    <i class="bi bi-trash me-1"></i> Delete
                </button>
            </div>';
    }
}
