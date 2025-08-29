<?php

namespace App\Http\Controllers\Erp\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\StoreRequest;
use App\Http\Requests\Sale\UpdateRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        try {
            if ($request->ajax() || $request->has("draw")) {
                $query = Order::query()
                    ->with(['items', 'payments', 'customer', 'user'])
                    ->withCount('items');

                // Add additional filters if needed (search, date range, etc.)
                if ($request->has('status') && $request->status != '') {
                    $query->where('status', $request->status);
                }

                return DataTables::eloquent($query)
                    ->addColumn('customer', fn($row) => $row->customer->full_name ?? "N/A")
                    ->addColumn('total_formatted', fn($row) => number_format($row->total, 2))
                    ->addColumn('action', function ($row) {
                        return view('partials.backend.sales-actions', compact('row'))->render();
                    })
                    ->rawColumns(['action'])
                    ->make(true);
            }

            return Inertia::render('Backend/ERP/Sale/Index');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', $th->getMessage());
        }
    }

    public function create()
    {
        try {
            return Inertia::render('Backend/ERP/Sale/SaleForm');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', $th->getMessage());
        }
    }

    public function store(StoreRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();

            // Generate order number
            $orderNumber = 'ORD-' . strtoupper(Str::random(6));
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . mt_rand(1000, 9999);

            // Calculate order totals
            $cartItems = $validated['cartItems'];
            $subtotal = collect($cartItems)->sum(function ($item) {
                return $item['price'] * $item['quantity'];
            });

            $tax = $request->tax ?? 0;
            $shippingCost = $request->shipping_cost ?? 0;
            $discount = 0;
            $total = $subtotal + $tax + $shippingCost - $discount;

            // Create the order
            $order = Order::create(
                $validated + [
                    'order_number' => $orderNumber,
                    'invoice_number' => $invoiceNumber,
                    'user_id' => Auth::id(),
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'shipping_cost' => $shippingCost,
                    'discount' => $discount,
                    'total' => $total,
                ]
            );

            // Create order items
            foreach ($cartItems as $cartItem) {
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem['id'],
                    'product_name' => $cartItem['name'],
                    'price' => $cartItem['price'],
                    'quantity' => $cartItem['quantity'],
                    'total' => $cartItem['price'] * $cartItem['quantity'],
                    'status' => 'pending',
                ]);

                if ($orderItem) {
                    $product = $orderItem->product;
                    $product->quantity -= $orderItem->quantity;
                    $product->save();
                }
            }

            // Process payments
            $paymentData = $request->paymentData;
            $totalPaid = 0;

            $paymentMethods = PaymentMethod::all();

            if ($paymentMethods) {
                foreach ($paymentMethods as $paymentMethod) {
                    if (isset($paymentData[$paymentMethod->code]) && $paymentData[$paymentMethod->code] > 0) {
                        foreach ($paymentData[$paymentMethod->code] as $payment) {
                            Payment::create([
                                'order_id' => $order->id,
                                'user_id' => Auth::id(),
                                'branch_id' => 1,
                                'payment_method_id' => $paymentMethod->id,
                                'transaction_id' => $paymentMethod->code . '-' . time() . '-' . Str::random(6),
                                'amount' => $payment['amount'],
                                'status' => 'completed',
                                'paid_at' => now(),
                                'payment_method_name' => $paymentMethod['name'],
                                'metadata' => $payment,
                            ]);

                            $totalPaid += $payment['amount'];
                        }
                    }
                }

                // Update order payment status
                $order->total_paid = $totalPaid;

                if ($totalPaid >= $total) {
                    $order->payment_status = 'paid';
                } elseif ($totalPaid > 0) {
                    $order->payment_status = 'partially_paid';
                } else {
                    $order->payment_status = 'pending';
                }

                $order->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sale created successfully',
                'data' => [
                    'order' => $order->load(['items', 'payments', 'customer', 'user'])
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create sale',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update the specified sale/order.
     */
    public function update(UpdateRequest $request, Order $sale): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();

            // Calculate order totals
            $cartItems = $validated['cartItems'];
            $subtotal = collect($cartItems)->sum(function ($item) {
                return $item['price'] * $item['quantity'];
            });

            $tax = $request->tax ?? 0;
            $shippingCost = $request->shipping_cost ?? 0;
            $discount = 0;
            $total = $subtotal + $tax + $shippingCost - $discount;

            // Basic order fields update
            $sale->update(
                $validated + [
                    'user_id' => Auth::id(),
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'shipping_cost' => $shippingCost,
                    'discount' => $discount,
                    'total' => $total,
                ]
            );

            if ($request->has('cartItems')) {
                // first return stock to product before delete
                foreach ($sale->items as $item) {
                    $product = $item->product;
                    $product->quantity += $item->quantity;
                    $product->save();
                }

                // Delete old items and recreate
                $sale->items()->delete();

                // Create new sale items
                foreach ($request->cartItems as $cartItem) {
                    $orderItem = OrderItem::create([
                        'order_id' => $sale->id,
                        'product_id' => $cartItem['id'],
                        'product_name' => $cartItem['name'],
                        'price' => $cartItem['price'],
                        'quantity' => $cartItem['quantity'],
                        'total' => $cartItem['price'] * $cartItem['quantity'],
                        'status' => 'pending',
                    ]);

                    if ($orderItem) {
                        $product = $orderItem->product;
                        $product->quantity -= $orderItem->quantity;
                        $product->save();
                    }
                }
            }

            if ($request->has('paymentData')) {
                $paymentData = $request->paymentData;
                $totalPaid = 0;

                $paymentMethods = PaymentMethod::all();

                // Delete old payments and recreate
                $sale->payments()->delete();

                if ($paymentMethods) {
                    foreach ($paymentMethods as $paymentMethod) {
                        if (isset($paymentData[$paymentMethod->code]) && $paymentData[$paymentMethod->code] > 0) {
                            foreach ($paymentData[$paymentMethod->code] as $payment) {
                                Payment::create([
                                    'order_id' => $sale->id,
                                    'user_id' => Auth::id(),
                                    'branch_id' => 1,
                                    'payment_method_id' => $paymentMethod->id,
                                    'transaction_id' => $paymentMethod->code . '-' . time() . '-' . Str::random(6),
                                    'amount' => $payment['amount'],
                                    'status' => 'completed',
                                    'paid_at' => now(),
                                    'payment_method_name' => $paymentMethod['name'],
                                    'metadata' => $payment,
                                ]);

                                $totalPaid += $payment['amount'];
                            }
                        }
                    }

                    // Update sale payment status
                    $sale->total_paid = $totalPaid;

                    if ($totalPaid >= $total) {
                        $sale->payment_status = 'paid';
                    } elseif ($totalPaid > 0) {
                        $sale->payment_status = 'partially_paid';
                    } else {
                        $sale->payment_status = 'pending';
                    }

                    $sale->save();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sale updated successfully',
                'data' => [
                    'order' => $sale->load(['items', 'payments', 'customer', 'user'])
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update sale',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function show(Order $sale)
    {
        try {
            $sale->load(['items', 'payments', 'customer', 'user']);

            return Inertia::render('Backend/ERP/Sale/SaleForm', [
                'sale' => $sale
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', $th->getMessage());
        }
    }
}
