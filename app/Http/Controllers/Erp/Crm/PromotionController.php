<?php

namespace App\Http\Controllers\Erp\Crm;

use App\Http\Controllers\Controller;
use App\Models\Erp\Crm\Promotion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class PromotionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->ajax() || $request->has('draw')) {
            $query = Promotion::query();

            return DataTables::eloquent($query)
                ->addColumn('action', function ($row) {
                    return view('partials.backend.promotion.actions', compact('row'))->render();
                })
                ->rawColumns(['action'])
                ->make(true);
        }

        return Inertia::render('Backend/ERP/CRM/Promotion');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
