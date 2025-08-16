<?php

namespace App\Http\Requests\Sale;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            // Order Information
            'date' => 'required|date',
            'reference' => 'required|string|max:255',
            'branch_id' => 'nullable|integer|exists:branches,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'customer_id' => 'required|integer|exists:users,id',

            // Customer Information
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:255',
            'customer_first_name' => 'nullable|string|max:255',
            'customer_last_name' => 'nullable|string|max:255',
            'customer_company' => 'nullable|string|max:255',
            'customer_tax_number' => 'nullable|string|max:255',

            // Address Information
            'billing_address.street' => 'nullable|string|max:255',
            'billing_address.city' => 'nullable|string|max:255',
            'billing_address.state' => 'nullable|string|max:255',
            'billing_address.postal_code' => 'nullable|string|max:255',
            'billing_address.country' => 'nullable|string|max:255',
            'shipping_address.street' => 'nullable|string|max:255',
            'shipping_address.city' => 'nullable|string|max:255',
            'shipping_address.state' => 'nullable|string|max:255',
            'shipping_address.postal_code' => 'nullable|string|max:255',
            'shipping_address.country' => 'nullable|string|max:255',
            'shipping_same_as_billing' => 'nullable|boolean',

            // Status Information
            'status' => 'required|string|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded,partially_refunded,on_hold,failed,completed',
            'fulfillment_status' => 'required|string|in:unfulfilled,partially_fulfilled,fulfilled',

            // Pricing Information
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'shipping_cost' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'total_paid' => 'required|numeric|min:0',
            'total_refunded' => 'required|numeric|min:0',
            'currency' => 'required|string|size:1',

            // Payment Information
            'payment_method_id' => 'nullable|integer|exists:payment_methods,id',
            'payment_method_code' => 'nullable|string|max:255',
            'payment_method_name' => 'nullable|string|max:255',
            'payment_status' => 'required|string|in:pending,paid,failed,partially_paid,refunded',
            'payment_reference' => 'nullable|string|max:255',
            'payment_date' => 'required|date',

            // Shipping Information
            'shipping_method_id' => 'nullable|integer|exists:shipping_methods,id',
            'tracking_number' => 'nullable|string|max:255',
            'tracking_url' => 'nullable|url|max:255',
            'shipped_at' => 'nullable|date',
            'delivered_at' => 'nullable|date',

            // Coupon Information
            'coupon_id' => 'nullable|integer',
            'coupon_code' => 'nullable|string|max:255',
            'coupon_value' => 'nullable|numeric|min:0',

            // Notes
            'customer_note' => 'nullable|string|max:1000',
            'private_notes' => 'nullable|string|max:1000',

            // Products
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.product_variant_id' => 'nullable|integer|exists:product_variants,id',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.original_price' => 'required|numeric|min:0',
            'items.*.tax_amount' => 'required|numeric|min:0',
            'items.*.discount_amount' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.total' => 'required|numeric|min:0',
            'items.*.options' => 'nullable|array',
            'items.*.attributes' => 'nullable|array',
        ];
    }

    public function messages()
    {
        return [
            'customer_id.required' => 'Please select a customer for this order.',
            'items.required' => 'At least one product is required to create an order.',
            'items.min' => 'At least one product is required to create an order.',
            'status.required' => 'Order status is required.',
            'payment_status.required' => 'Payment status is required.',
            'fulfillment_status.required' => 'Fulfillment status is required.',
            'payment_date.required' => 'Payment date is required.',
        ];
    }

    public function attributes()
    {
        return [
            'items.*.product_id' => 'product',
            'items.*.quantity' => 'quantity',
            'items.*.price' => 'price',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validate that total matches the calculated amount
            $subtotal = $this->input('subtotal', 0);
            $tax = $this->input('tax', 0);
            $discount = $this->input('discount', 0);
            $shipping = $this->input('shipping_cost', 0);
            $calculatedTotal = $subtotal + $tax - $discount + $shipping;
            $total = $this->input('total', 0);

            if (abs($calculatedTotal - $total) > 0.01) {
                $validator->errors()->add('total', 'The total amount does not match the calculated amount based on subtotal, tax, discount, and shipping.');
            }

            // Validate that total_paid is not greater than total
            if ($this->input('total_paid', 0) > $total) {
                $validator->errors()->add('total_paid', 'Paid amount cannot be greater than the total amount.');
            }
        });
    }
}
