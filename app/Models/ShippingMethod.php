<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'base_cost',
        'free_shipping_threshold',
        'is_free',
        'delivery_days_min',
        'delivery_days_max',
        'delivery_timeframe',
        'carrier_name',
        'carrier_service',
        'tracking_url_template',
        'configuration',
        'supported_countries',
        'supported_states',
        'is_active',
        'order',
    ];

    protected $casts = [
        'base_cost' => 'decimal:2',
        'free_shipping_threshold' => 'decimal:2',
        'is_free' => 'boolean',
        'is_active' => 'boolean',
        'delivery_days_min' => 'integer',
        'delivery_days_max' => 'integer',
        'order' => 'integer',
        'configuration' => 'array',
        'supported_countries' => 'array',
        'supported_states' => 'array',
    ];

    // Relationships
    // Shipping methods can be used in orders, branches, etc.

    /**
     * Calculate shipping cost for an order amount
     */
    public function calculateCost($orderAmount = 0)
    {
        if ($this->is_free) {
            return 0;
        }

        if ($this->free_shipping_threshold && $orderAmount >= $this->free_shipping_threshold) {
            return 0;
        }

        return $this->base_cost;
    }

    /**
     * Get estimated delivery date
     */
    public function getEstimatedDelivery()
    {
        if (!$this->delivery_days_min && !$this->delivery_days_max) {
            return null;
        }

        $minDate = now()->addDays($this->delivery_days_min);
        $maxDate = now()->addDays($this->delivery_days_max);

        return [
            'min' => $minDate,
            'max' => $maxDate,
            'timeframe' => $this->delivery_timeframe,
        ];
    }

    /**
     * Scope for active shipping methods
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('order');
    }

    /**
     * Check if method supports location
     */
    public function supportsLocation($country, $state = null)
    {
        if ($this->supported_countries && !in_array($country, $this->supported_countries)) {
            return false;
        }

        if ($state && $this->supported_states && !in_array($state, $this->supported_states)) {
            return false;
        }

        return true;
    }
}