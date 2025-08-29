<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        'configuration' => 'array',
        'supported_countries' => 'array',
        'supported_states' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the orders that use this shipping method.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}