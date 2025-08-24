<?php

namespace App\Http\Controllers\Erp\Setting;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\Slider\StoreRequest;
use App\Http\Requests\Setting\Slider\UpdateRequest;
use App\Models\Slider;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class SliderController extends Controller
{
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $query = Slider::query()
                    ->withCount('items')
                    ->latest();

                return DataTables::of($query)
                    ->addIndexColumn()
                    ->addColumn('name', fn($row) => $row->name ?? 'N/A')
                    ->addColumn('type', fn($row) => ucfirst($row->type) ?? 'Default')
                    ->addColumn('items_count', fn($row) => $row->items_count ?? 0)
                    ->addColumn('status', function ($row) {
                        return view('partials.backend.status-badge', compact('row'))->render();
                    })
                    ->addColumn('action', function ($row) {
                        return view('partials.backend.slides-actions', compact('row'))->render();
                    })
                    ->rawColumns(['status', 'action'])
                    ->make(true);
            }

            return Inertia::render('Backend/ERP/Setting/Slide');
        } catch (\Throwable $th) {
            return back()->with('error', 'Failed to load slider list.');
        }
    }

    public function store(StoreRequest $request)
    {
        try {
            $validated = $request->validated();

            $slider = Slider::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Slider created successfully.',
                'slider' => $slider
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to create slider. Please try again.'
            ], 500);
        }
    }

    public function edit(Slider $slider)
    {
        try {
            $slider->load('items');
            
            return response()->json([
                'success' => true,
                'slider' => $slider
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to edit slider.',
                'error' => 'Failed to edit slider. Please try again.'
            ]);
        }
    }

    public function update(UpdateRequest $request, Slider $slider)
    {
        try {
            $validated = $request->validated();

            if ($slider->name !== $validated['name']) {
                $validated['slug'] = $slider->generateUniqueSlug($validated['name']);
            }

            $slider->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Slider updated successfully.',
                'slider' => $slider->fresh()
            ]);
        } catch (\Exception $e) {
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

    public function restore(Slider $slider)
    {
        try {
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
}
