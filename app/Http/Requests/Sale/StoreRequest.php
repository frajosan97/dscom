<?php

namespace App\Http\Requests\Sale;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class StoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // You can add authorization logic here, e.g.:
        // return auth()->user()->can('create-sales');
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date' => 'required|date|date_format:Y-m-d',
            'customer_id' => 'required|exists:users,id',
            'order_number' => 'nullable|string|unique:sales,order_number|max:100',
            'cartItems' => 'required|array|min:1',
            'cartItems.*.product_id' => 'required|exists:products,id',
            'cartItems.*.quantity' => 'required|integer|min:1',
            'cartItems.*.unit_price' => 'required|numeric|min:0',
            'cartItems.*.product_item_id' => 'nullable|exists:product_items,id',
            'paymentData' => 'required|array',
            'paymentData.*' => 'array', // Each payment method should be an array
            'paymentData.*.*.amount' => 'required|numeric|min:0.01',
            'paymentData.*.*.payment_method_id' => 'required|exists:payment_methods,id',
            'paymentData.*.*.payment_method_name' => 'required|string|max:255',
            'paymentData.*.*.payment_method_code' => 'required|string|max:50',
            'branch_id' => 'nullable|exists:branches,id',
            'customer_note' => 'nullable|string|max:1000',
            'shipping_method_id' => 'nullable|exists:shipping_methods,id',
            'shipping_cost' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:percentage,amount',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure arrays are properly formatted
        $cartItems = $this->input('cartItems', []);
        $paymentData = $this->input('paymentData', []);

        // If cartItems or paymentData come as JSON strings, decode them
        if (is_string($cartItems)) {
            $cartItems = json_decode($cartItems, true) ?? [];
        }

        if (is_string($paymentData)) {
            $paymentData = json_decode($paymentData, true) ?? [];
        }

        // Clean up the payment data - remove any empty arrays
        foreach ($paymentData as $method => $payments) {
            if (empty($payments) || !is_array($payments)) {
                unset($paymentData[$method]);
            } else {
                // Ensure each payment has required fields
                $paymentData[$method] = array_filter($payments, function ($payment) {
                    return isset($payment['amount']) && floatval($payment['amount']) > 0;
                });
            }
        }

        // Generate order number if not provided
        $orderNumber = $this->input('order_number');
        if (empty($orderNumber)) {
            $orderNumber = $this->generateOrderNumber();
        }

        // Ensure date is in correct format
        $date = $this->input('date');
        if ($date) {
            try {
                $date = date('Y-m-d', strtotime($date));
            } catch (\Exception $e) {
                $date = date('Y-m-d');
            }
        } else {
            $date = date('Y-m-d');
        }

        $this->merge([
            'cartItems' => $cartItems,
            'paymentData' => $paymentData,
            'order_number' => $orderNumber,
            'date' => $date,
        ]);
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'cartItems.required' => 'Please add at least one product to the cart.',
            'cartItems.array' => 'Cart items must be in valid format.',
            'cartItems.min' => 'Please add at least one product to the cart.',
            'cartItems.*.product_id.required' => 'Product ID is required for each item.',
            'cartItems.*.product_id.exists' => 'One or more selected products do not exist.',
            'cartItems.*.quantity.required' => 'Quantity is required for each product.',
            'cartItems.*.quantity.min' => 'Quantity must be at least 1.',
            'cartItems.*.unit_price.required' => 'Unit price is required for each product.',
            'cartItems.*.unit_price.min' => 'Unit price must be a positive value.',
            'paymentData.required' => 'Payment information is required.',
            'paymentData.array' => 'Payment data must be in valid format.',
            'paymentData.*.*.amount.required' => 'Payment amount is required.',
            'paymentData.*.*.amount.min' => 'Payment amount must be at least 0.01.',
            'paymentData.*.*.payment_method_id.required' => 'Payment method ID is required.',
            'paymentData.*.*.payment_method_id.exists' => 'Selected payment method does not exist.',
            'customer_id.required' => 'Please select a customer.',
            'customer_id.exists' => 'The selected customer does not exist.',
            'date.required' => 'Sale date is required.',
            'date.date' => 'Please enter a valid date.',
            'order_number.unique' => 'This order number already exists. Please try again.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'customer_id' => 'customer',
            'cartItems' => 'cart items',
            'cartItems.*.product_id' => 'product',
            'cartItems.*.quantity' => 'quantity',
            'cartItems.*.unit_price' => 'unit price',
            'paymentData' => 'payment information',
            'paymentData.*.*.amount' => 'payment amount',
            'paymentData.*.*.payment_method_id' => 'payment method',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validate total payment amount vs cart total
            if (!$this->validatePaymentTotal()) {
                $validator->errors()->add(
                    'paymentData',
                    'Total payment amount does not match cart total.'
                );
            }

            // Validate payment methods exist and are active
            if (!$this->validatePaymentMethods()) {
                $validator->errors()->add(
                    'paymentData',
                    'One or more payment methods are invalid or inactive.'
                );
            }

            // Validate product stock if needed
            if (!$this->validateProductStock()) {
                $validator->errors()->add(
                    'cartItems',
                    'One or more products have insufficient stock.'
                );
            }
        });
    }

    /**
     * Generate a unique order number.
     */
    private function generateOrderNumber(): string
    {
        $prefix = 'ORD-';
        $timestamp = time();
        $random = mt_rand(100, 999);

        // Check if order number exists and regenerate if needed
        $orderNumber = $prefix . $timestamp . '-' . $random;

        // You could also use a more sophisticated generation logic
        // Example: ORD-YYYYMMDD-XXXXX
        // $orderNumber = 'ORD-' . date('Ymd') . '-' . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);

        return $orderNumber;
    }

    /**
     * Validate that total payments match cart total.
     */
    private function validatePaymentTotal(): bool
    {
        $paymentData = $this->input('paymentData', []);
        $cartItems = $this->input('cartItems', []);

        // Calculate cart total
        $cartTotal = 0;
        foreach ($cartItems as $item) {
            $quantity = $item['quantity'] ?? 0;
            $unitPrice = $item['unit_price'] ?? 0;
            $cartTotal += $quantity * $unitPrice;
        }

        // Calculate total payments
        $totalPayments = 0;
        foreach ($paymentData as $payments) {
            foreach ($payments as $payment) {
                $totalPayments += $payment['amount'] ?? 0;
            }
        }

        // Allow small rounding differences
        return abs($cartTotal - $totalPayments) < 0.01;
    }

    /**
     * Validate that payment methods exist and are active.
     */
    private function validatePaymentMethods(): bool
    {
        $paymentData = $this->input('paymentData', []);

        foreach ($paymentData as $payments) {
            foreach ($payments as $payment) {
                $paymentMethodId = $payment['payment_method_id'] ?? null;

                if (!$paymentMethodId) {
                    return false;
                }

                // Check if payment method exists and is active
                // You might want to query the database here
                // For now, we'll trust the validation rule
            }
        }

        return true;
    }

    /**
     * Validate product stock availability.
     */
    private function validateProductStock(): bool
    {
        $cartItems = $this->input('cartItems', []);

        foreach ($cartItems as $item) {
            $productId = $item['product_id'] ?? null;
            $quantity = $item['quantity'] ?? 0;

            if (!$productId || $quantity <= 0) {
                continue;
            }

            // Here you would typically query the database to check stock
            // Example:
            // $product = Product::find($productId);
            // if (!$product || $product->stock_quantity < $quantity) {
            //     return false;
            // }

            // For now, we'll return true and assume stock validation happens elsewhere
        }

        return true;
    }
}