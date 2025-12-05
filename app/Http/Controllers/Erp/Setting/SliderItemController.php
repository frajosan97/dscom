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
        $slider = Slider::find($request->slider);

        try {
            if ($request->has('draw')) {
                return $this->getItemsDataTableResponse($request, $slider);
            }

            return Inertia::render('Backend/ERP/Setting/SlideItems', [
                'slider' => $slider
            ]);
        } catch (\Throwable $th) {
            return back()->with('error', 'Failed to load slider items.');
        }
    }

    public function create(Slider $slider)
    {
        return response()->json([
            'slider' => $slider,
            'defaults' => [
                'text_color' => '#ffffff',
                'order' => 0,
                'is_active' => true
            ]
        ]);
    }

    public function store(Request $request, Slider $slider)
    {
        $validated = $this->validateItemRequest($request);

        try {
            $data = $this->buildItemData($validated);
            $data['slider_id'] = $request->slider_id;

            if ($request->hasFile('image')) {
                $data['image'] = $this->uploadItemImage($request->file('image'));
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Image is required.'
                ], 422);
            }

            if ($request->hasFile('mobile_image')) {
                $data['mobile_image'] = $this->uploadItemImage($request->file('mobile_image'));
            }

            $sliderItem = SliderItem::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Slide item created successfully.',
                'item' => $sliderItem
            ]);
        } catch (\Exception $e) {
            Log::error('Slide item creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to create slide item. Please try again.'
            ], 500);
        }
    }

    public function edit(SliderItem $sliderItem)
    {
        return response()->json([
            'item' => $sliderItem,
            'slider' => $sliderItem->slider
        ]);
    }

    public function update(Request $request, SliderItem $sliderItem)
    {
        $validated = $this->validateItemRequest($request, true);

        try {
            $data = $this->buildItemData($validated);

            if ($request->hasFile('image')) {
                $this->deleteItemImage($sliderItem->image);
                $data['image'] = $this->uploadItemImage($request->file('image'));
            }

            if ($request->hasFile('mobile_image')) {
                if ($sliderItem->mobile_image) {
                    $this->deleteItemImage($sliderItem->mobile_image);
                }
                $data['mobile_image'] = $this->uploadItemImage($request->file('mobile_image'));
            }

            $sliderItem->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Slide item updated successfully.',
                'item' => $sliderItem->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Slide item update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to update slide item. Please try again.'
            ], 500);
        }
    }

    public function destroy(SliderItem $sliderItem)
    {
        try {
            if ($sliderItem->image) {
                $this->deleteItemImage($sliderItem->image);
            }
            if ($sliderItem->mobile_image) {
                $this->deleteItemImage($sliderItem->mobile_image);
            }

            $sliderItem->delete();

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
            ->addColumn('subtitle', fn($row) => $row->subtitle ?? 'N/A')
            ->addColumn('description', fn($row) => Str::limit($row->description ?? 'No description', 50))
            ->addColumn('image_preview', fn($row) => $row->image
                ? '<img src="' . asset('/' . $row->image) . '" alt="Slide Image" class="img-thumbnail" style="max-width: 80px; max-height: 80px;">'
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
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => $isUpdate ? 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048' : 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'mobile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'video_url' => 'nullable|url',
            'button_text' => 'nullable|string|max:50',
            'button_url' => 'nullable|url',
            'secondary_button_text' => 'nullable|string|max:50',
            'secondary_button_url' => 'nullable|url',
            'order' => 'nullable|integer',
            'is_active' => 'required|boolean',
            'content_position' => 'nullable|array',
            'text_color' => 'nullable|string|max:20',
            'overlay_color' => 'nullable|string|max:20',
            'overlay_opacity' => 'nullable|integer|min:0|max:100',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'custom_fields' => 'nullable|array',
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
            'is_active' => $validated['is_active'] ?? true,
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
            $storagePath = str_replace('storage/', '', $path);
            if (Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->delete($storagePath);
            }
        }
    }

    private function getItemActionButtons(Slider $slider, SliderItem $sliderItem): string
    {
        return '
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary edit-item-btn" 
                    data-slider="' . $slider->id . '" 
                    data-id="' . $sliderItem->id . '">
                    <i class="bi bi-pen"></i>
                </button>
                <button class="btn btn-outline-danger delete-item-btn" 
                    data-slider="' . $slider->id . '" 
                    data-id="' . $sliderItem->id . '">
                    <i class="bi bi-trash"></i>
                </button>
            </div>';
    }
}