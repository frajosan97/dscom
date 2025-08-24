<?php

namespace App\Http\Controllers\Erp\Setting;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use App\Models\SliderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class SliderItemController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['slider' => 'required|exists:sliders,id']);
        $slider = Slider::findOrFail($request->slider);

        if ($request->ajax()) {
            return $this->getItemsDataTableResponse($request, $slider);
        }

        return Inertia::render('Backend/ERP/Slide/Show', [
            'slider' => $slider
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateItemRequest($request);
        $slider = Slider::findOrFail($validated['slider_id']);

        try {
            $data = $this->buildItemData($validated);
            $data['image'] = $this->uploadItemImage($request->file('image'));

            if ($request->hasFile('mobile_image')) {
                $data['mobile_image'] = $this->uploadItemImage($request->file('mobile_image'));
            }

            $item = $slider->items()->create($data);

            return response()->json([
                'success' => true,
                'message' => 'Slide item created successfully.',
                'item' => $item
            ]);
        } catch (\Exception $e) {
            Log::error('Slide item creation failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to create slide item. Please try again.'
            ], 500);
        }
    }

    public function edit(Slider $slider, SliderItem $slider_item)
    {
        return response()->json($slider_item);
    }

    public function update(Request $request, Slider $slider, SliderItem $slider_item)
    {
        $validated = $this->validateItemRequest($request, true);

        try {
            $data = $this->buildItemData($validated);

            if ($request->hasFile('image')) {
                $this->deleteItemImage($slider_item->image);
                $data['image'] = $this->uploadItemImage($request->file('image'));
            }

            if ($request->hasFile('mobile_image')) {
                if ($slider_item->mobile_image) {
                    $this->deleteItemImage($slider_item->mobile_image);
                }
                $data['mobile_image'] = $this->uploadItemImage($request->file('mobile_image'));
            }

            $slider_item->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Slide item updated successfully.',
                'item' => $slider_item->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Slide item update failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to update slide item. Please try again.'
            ], 500);
        }
    }

    public function destroy(Slider $slider, SliderItem $slider_item)
    {
        try {
            if ($slider_item->image) {
                $this->deleteItemImage($slider_item->image);
            }
            if ($slider_item->mobile_image) {
                $this->deleteItemImage($slider_item->mobile_image);
            }

            $slider_item->delete();

            return response()->json([
                'success' => true,
                'message' => 'Slide item deleted successfully.'
            ]);
        } catch (\Exception $e) {
            Log::error('Slide item deletion failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete slide item.'
            ], 500);
        }
    }

    private function getItemsDataTableResponse(Request $request, Slider $slider)
    {
        $query = $slider->items()
            ->orderBy('order')
            ->orderBy('created_at', 'desc');

        return DataTables::of($query)
            ->addIndexColumn()
            ->addColumn('title', fn($row) => $row->title ?? 'Untitled Slide')
            ->addColumn('subtitle', fn($row) => $row->subtitle ?? 'Untitled Slide')
            ->addColumn('description', fn($row) => Str::limit($row->description ?? 'No description', 50))
            ->addColumn('image_preview', fn($row) => $row->image
                ? '<img src="' . asset($row->image) . '" alt="Slide Image" class="img-thumbnail" style="max-width: 80px; max-height: 80px;">'
                : 'No Image')
            ->addColumn('status_badge', fn($row) => $row->is_active
                ? '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Active</span>'
                : '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Inactive</span>')
            ->addColumn('action', fn($row) => $this->getItemActionButtons($slider, $row))
            ->rawColumns(['image_preview', 'status_badge', 'action'])
            ->make(true);
    }

    private function validateItemRequest(Request $request, $isUpdate = false): array
    {
        $rules = [
            'slider_id' => 'required|exists:sliders,id',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'mobile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'video_url' => 'nullable|url',
            'button_text' => 'nullable|string|max:50',
            'button_url' => 'nullable|url',
            'secondary_button_text' => 'nullable|string|max:50',
            'secondary_button_url' => 'nullable|url',
            'order' => 'nullable|integer',
            'is_active' => 'required|in:true,false,1,0,on,off',
            'content_position' => 'nullable',
            'text_color' => 'nullable|string|max:20',
            'overlay_color' => 'nullable|string|max:20',
            'overlay_opacity' => 'nullable|integer|min:0|max:100',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'custom_fields' => 'nullable',
        ];

        return $request->validate($rules);
    }

    private function buildItemData(array $validated): array
    {
        return [
            'title' => $validated['title'] ?? null,
            'subtitle' => $validated['subtitle'] ?? null,
            'description' => $validated['description'] ?? null,
            'video_url' => $validated['video_url'] ?? null,
            'button_text' => $validated['button_text'] ?? null,
            'button_url' => $validated['button_url'] ?? null,
            'secondary_button_text' => $validated['secondary_button_text'] ?? null,
            'secondary_button_url' => $validated['secondary_button_url'] ?? null,
            'order' => $validated['order'] ?? 0,
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
            'content_position' => $validated['content_position'] ?? null,
            'text_color' => $validated['text_color'] ?? '#ffffff',
            'overlay_color' => $validated['overlay_color'] ?? null,
            'overlay_opacity' => $validated['overlay_opacity'] ?? null,
            'start_at' => $validated['start_at'] ?? null,
            'end_at' => $validated['end_at'] ?? null,
            'custom_fields' => $validated['custom_fields'] ?? null,
        ];
    }

    private function uploadItemImage($image): string
    {
        $filename = Str::random(20) . '_' . time() . '.' . $image->getClientOriginalExtension();
        $path = $image->storeAs('images/slider_items', $filename, 'public');
        return 'storage/' . $path;
    }

    private function deleteItemImage(?string $path): void
    {
        if ($path) {
            $storagePath = str_replace('/storage', 'public', $path);
            if (Storage::exists($storagePath)) {
                Storage::delete($storagePath);
            }
        }
    }

    private function getItemActionButtons(Slider $slider, SliderItem $item): string
    {
        return '
            <div class="btn-group float-end text-nowrap gap-2">
                <button class="btn btn-sm btn-outline-primary rounded edit-item-btn" 
                    data-slider="' . $slider->id . '" 
                    data-id="' . $item->id . '">
                    <i class="bi bi-pen me-1"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger rounded delete-item-btn" 
                    data-slider="' . $slider->id . '" 
                    data-id="' . $item->id . '">
                    <i class="bi bi-trash me-1"></i> Delete
                </button>
            </div>';
    }
}
