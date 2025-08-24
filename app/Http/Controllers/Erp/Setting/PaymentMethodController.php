<?php

namespace App\Http\Controllers\Erp\Setting;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\PaymentMethod\StoreRequest;
use App\Http\Requests\Setting\PaymentMethod\UpdateRequest;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('draw')) {
            $methods = PaymentMethod::query()->withoutTrashed();

            return datatables()->of($methods)
                ->addColumn('name', fn($row) => $row->name ?? 'N/A')
                ->addColumn('code', fn($row) => $row->code ?? 'N/A')
                ->addColumn('fee', function ($row) {
                    return $row->processing_fee
                        ? $row->processing_fee . ($row->fee_type === 'percentage' ? '%' : '')
                        : 'Free';
                })
                ->addColumn('status', function ($row) {
                    return view('partials.settings.status', compact('row'))->render();
                })
                ->addColumn('action', function ($row) {
                    return view('partials.settings.actions', compact('row'))->render();
                })
                ->rawColumns(['status', 'action'])
                ->make();
        }

        return Inertia::render('Backend/ERP/Setting/PaymentMethod');
    }

    public function store(StoreRequest $request)
    {
        DB::beginTransaction();
        try {
            // Ensure only one default method exists
            if ($request->is_default) {
                PaymentMethod::where('is_default', true)->update(['is_default' => false]);
            }

            PaymentMethod::create($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment method created successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function edit(PaymentMethod $paymentMethod)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Payment method fetched successfully.',
                'data' => $paymentMethod
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function update(UpdateRequest $request, PaymentMethod $paymentMethod)
    {
        DB::beginTransaction();
        try {
            // Handle default payment method logic
            if ($request->is_default) {
                PaymentMethod::where('is_default', true)
                    ->where('id', '!=', $paymentMethod->id)
                    ->update(['is_default' => false]);
            }

            $paymentMethod->update($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment method updated successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        DB::beginTransaction();
        try {
            // Prevent deletion of default payment method
            if ($paymentMethod->is_default) {
                throw new \Exception('Cannot delete the default payment method.');
            }

            $paymentMethod->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment method deleted successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
}
