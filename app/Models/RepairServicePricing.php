<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairServicePricing extends Model
{
    protected $fillable = [
        'repair_service_id',
        'device_type_id',
        'price',
        'min_price',
        'max_price',
        'is_flat_rate',
        'price_notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'min_price' => 'decimal:2',
        'max_price' => 'decimal:2',
        'is_flat_rate' => 'boolean',
    ];

    /**
     * Get the repair service that owns the pricing.
     */
    public function repairService(): BelongsTo
    {
        return $this->belongsTo(RepairService::class);
    }

    /**
     * Get the device type that owns the pricing.
     */
    public function deviceType(): BelongsTo
    {
        return $this->belongsTo(RepairServiceDeviceType::class);
    }

    /**
     * Get the formatted price range.
     */
    public function getPriceRangeAttribute(): string
    {
        if ($this->is_flat_rate) {
            return $this->price;
        }

        if ($this->min_price && $this->max_price) {
            return "{$this->min_price} - {$this->max_price}";
        }

        return $this->price;
    }
}