<?php

namespace App\Http\Controllers\Erp\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\{StoreRequest, UpdateRequest};
use App\Models\{Order, OrderItem, Payment, Product};
use Illuminate\Http\{Request, JsonResponse};
use Illuminate\Support\Facades\{Auth, DB, Log};
use Illuminate\Support\Str;
use Inertia\{Inertia, Response};
use Yajra\DataTables\Facades\DataTables;

class SaleController extends Controller
{
    private const ORDER_PREFIX = 'ORD-';
    private const INVOICE_PREFIX = 'INV-';

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            if ($request->has("draw")) {
                return $this->handleDataTableRequest($request);
            }

            return Inertia::render('Backend/ERP/Sale/Index');
        } catch (\Throwable $th) {
            Log::error('Sale index error: ' . $th->getMessage());
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            return Inertia::render('Backend/ERP/Sale/Create');
        } catch (\Throwable $th) {
            Log::error('Sale create form error: ' . $th->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $order = $this->createOrder($request);
            $this->createOrderItems($order, $request->items);
            $this->createPaymentIfNeeded($order, $request->validated());
            $this->recordStatusHistory($order);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $sale)
    {
        try {
            return Inertia::render('Backend/ERP/Sale/Show', [
                'order' => $sale->load([
                    'customer',
                    'branch',
                    'payments.paymentMethod',
                    'items.product',
                    'items.variant',
                ]),
            ]);
        } catch (\Throwable $th) {
            Log::error('Sale show error: ' . $th->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $sale)
    {
        try {
            return Inertia::render('Backend/ERP/Sale/Edit', [
                'sale' => $sale->load([
                    'customer',
                    'branch',
                    'payments.paymentMethod',
                    'items.product',
                    'items.variant',
                ]),
            ]);
        } catch (\Throwable $th) {
            Log::error('Sale edit error: ' . $th->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, Order $sale): JsonResponse
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();
            $this->updateOrder($sale, $validated);

            if (isset($validated['items'])) {
                $this->updateOrderItems($sale, $validated['items']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
                'order' => $sale->fresh()->load(['items.product', 'payments']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order update failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $sale): JsonResponse
    {
        DB::beginTransaction();

        try {
            $sale->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order deletion failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle datatable request
     */
    private function handleDataTableRequest(Request $request): JsonResponse
    {
        $query = Order::with([
            'customer',
            'branch',
            'paymentMethod',
            'shippingMethod',
            'coupon'
        ])->get();

        return DataTables::of($query)
            ->addColumn('customer', fn($row) => $row->customer->full_name)
            ->addColumn('status', fn($row) => view('partials.sale.status', compact('row'))->render())
            ->addColumn('payment', fn($row) => view('partials.sale.payment', compact('row'))->render())
            ->addColumn('action', fn($row) => view('partials.sale.actions', compact('row'))->render())
            ->rawColumns(['status', 'payment', 'action'])
            ->make(true);
    }

    /**
     * Create new order
     */
    private function createOrder(StoreRequest $request): Order
    {
        $validated = $request->validated();
        $totals = $this->calculateOrderTotals($validated);

        return Order::create([
            'order_number' => self::ORDER_PREFIX . strtoupper(Str::random(8)),
            'invoice_number' => self::INVOICE_PREFIX . date('Ymd') . '-' . mt_rand(1000, 9999),
            'user_id' => Auth::id(),
            'customer_id' => $validated['customer_id'],
            'branch_id' => Auth::user()->branch_id,
            'status' => $validated['status'] ?? 'pending',
            'fulfillment_status' => 'unfulfilled',
            'subtotal' => $totals['subtotal'],
            'tax' => $totals['tax'],
            'shipping_cost' => $totals['shipping'],
            'discount' => $totals['discount'],
            'total' => $totals['total'],
            'total_paid' => $validated['paid_amount'] ?? 0,
            'currency' => $validated['currency'] ?? '$',
            'payment_method_id' => $validated['payment_method'] ?? null,
            'payment_status' => $this->determinePaymentStatus($totals['total'], $validated['paid_amount'] ?? 0),
            'payment_reference' => $validated['payment_reference'] ?? null,
            'shipping_method_id' => $validated['shipping_method_id'] ?? null,
            'customer_note' => $validated['customer_note'] ?? null,
            'private_notes' => $validated['private_notes'] ?? null,
        ]);
    }

    /**
     * Create order items
     */
    private function createOrderItems(Order $order, array $products): void
    {
        $items = array_map(function ($product) {
            return [
                'product_id' => $product['product_id'],
                'product_variant_id' => $product['product_variant_id'] ?? null,
                'product_name' => $product['product_name'],
                'price' => $product['price'],
                'original_price' => $product['original_price'],
                'quantity' => $product['quantity'],
                'total' => $product['total'],
                'options' => $product['options'] ?? null,
                'attributes' => $product['attributes'] ?? null,
            ];
        }, $products);

        $order->items()->createMany($items);
    }

    /**
     * Create payment if amount paid > 0
     */
    private function createPaymentIfNeeded(Order $order, array $validated): void
    {
        if (($validated['paid_amount'] ?? 0) > 0) {
            Payment::create([
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'branch_id' => Auth::user()->branch_id,
                'payment_method_id' => $validated['payment_method'] ?? null,
                'transaction_id' => $validated['payment_reference'] ?? 'PAY-' . strtoupper(Str::random(8)),
                'amount' => $validated['paid_amount'],
                'currency' => $validated['currency'] ?? '$',
                'status' => 'completed',
                'paid_at' => now(),
                'payment_method_code' => $validated['payment_method_code'] ?? null,
                'payment_method_name' => $validated['payment_method_name'] ?? null,
            ]);
        }
    }

    /**
     * Record order status history
     */
    private function recordStatusHistory(Order $order): void
    {
        $order->orderStatusHistory()->create([
            'status' => 'pending',
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Update order details
     */
    private function updateOrder(Order $order, array $validated): void
    {
        $updateData = array_filter([
            'status' => $validated['status'] ?? null,
            'fulfillment_status' => $validated['fulfillment_status'] ?? null,
            'payment_status' => $validated['payment_status'] ?? null,
            'payment_method_id' => $validated['payment_method_id'] ?? null,
            'customer_note' => $validated['customer_note'] ?? null,
            'private_notes' => $validated['private_notes'] ?? null,
        ]);

        if (!empty($updateData)) {
            $order->update($updateData);
        }
    }

    /**
     * Update order items
     */
    private function updateOrderItems(Order $order, array $items): void
    {
        $order->items()->delete(); // Remove existing items
        $this->createOrderItems($order, $items); // Add new items

        // Recalculate totals
        $subtotal = collect($items)->sum(fn($item) => $item['price'] * $item['quantity']);
        $order->update([
            'subtotal' => $subtotal,
            'total' => $subtotal + $order->tax + $order->shipping_cost - $order->discount,
        ]);
    }

    /**
     * Calculate order totals
     */
    private function calculateOrderTotals(array $validated): array
    {
        $subtotal = collect($validated['items'])->sum(fn($item) => $item['price'] * $item['quantity']);
        $tax = $validated['tax'] ?? 0;
        $shipping = $validated['shipping_cost'] ?? 0;
        $discount = $validated['discount'] ?? 0;

        return [
            'subtotal' => $subtotal,
            'tax' => $tax,
            'shipping' => $shipping,
            'discount' => $discount,
            'total' => $subtotal + $tax + $shipping - $discount,
        ];
    }

    /**
     * Determine payment status
     */
    private function determinePaymentStatus(float $total, float $paid): string
    {
        if ($paid >= $total) return 'paid';
        if ($paid > 0) return 'partially_paid';
        return 'pending';
    }

    /**
     * Redirect with error message
     */
    private function redirectWithError(\Throwable $th)
    {
        return redirect()->back()->with('error', $th->getMessage());
    }
}
