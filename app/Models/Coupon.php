<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'min_order_amount',
        'max_discount_amount',
        'start_date',
        'end_date',
        'is_active',
        'usage_limit',
        'usage_limit_per_user',
        'usage_count',
        'apply_to_all_products',
        'product_ids',
        'excluded_product_ids',
        'category_ids',
        'apply_to_all_customers',
        'customer_ids',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'usage_limit' => 'integer',
        'usage_limit_per_user' => 'integer',
        'usage_count' => 'integer',
        'apply_to_all_products' => 'boolean',
        'product_ids' => 'array',
        'excluded_product_ids' => 'array',
        'category_ids' => 'array',
        'apply_to_all_customers' => 'boolean',
        'customer_ids' => 'array',
    ];

    // Relationships
    // Coupons can be used in orders, associated with customers, etc.

    /**
     * Check if coupon is valid
     */
    public function isValid()
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->start_date && now()->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && now()->gt($this->end_date)) {
            return false;
        }

        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Calculate discount amount
     */
    public function calculateDiscount($orderAmount, $applicableAmount = null)
    {
        if (!$this->isValid()) {
            return 0;
        }

        if ($this->min_order_amount && $orderAmount < $this->min_order_amount) {
            return 0;
        }

        $amountToUse = $applicableAmount ?? $orderAmount;
        $discount = 0;

        switch ($this->type) {
            case 'percentage':
                $discount = ($amountToUse * $this->value) / 100;
                break;
            case 'fixed_amount':
                $discount = $this->value;
                break;
            case 'free_shipping':
                // Free shipping is handled separately
                return 0;
        }

        // Apply maximum discount limit
        if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
            $discount = $this->max_discount_amount;
        }

        // Ensure discount doesn't exceed order amount
        if ($discount > $orderAmount) {
            $discount = $orderAmount;
        }

        return $discount;
    }

    /**
     * Check if coupon applies to product
     */
    public function appliesToProduct($productId)
    {
        if ($this->apply_to_all_products) {
            return !in_array($productId, $this->excluded_product_ids ?? []);
        }

        return in_array($productId, $this->product_ids ?? []);
    }

    /**
     * Check if coupon applies to customer
     */
    public function appliesToCustomer($customerId)
    {
        if ($this->apply_to_all_customers) {
            return true;
        }

        return in_array($customerId, $this->customer_ids ?? []);
    }

    /**
     * Increment usage count
     */
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }

    /**
     * Scope for active coupons
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            });
    }

    /**
     * Scope for valid coupons
     */
    public function scopeValid($query)
    {
        return $query->active()->where(function ($q) {
            $q->whereNull('usage_limit')
                ->orWhereRaw('usage_count < usage_limit');
        });
    }
}