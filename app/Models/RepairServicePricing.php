<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairServicePricing extends Model
{
    use HasFactory;

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

    // Relationships
    public function repairService(): BelongsTo
    {
        return $this->belongsTo(RepairService::class);
    }

    public function deviceType(): BelongsTo
    {
        return $this->belongsTo(RepairServiceDeviceType::class, 'device_type_id');
    }

    // Computed Attributes
    public function getPriceRangeAttribute()
    {
        // if ($this->is_flat_rate) {
        //     return format_currency($this->price);
        // }

        // if ($this->min_price && $this->max_price) {
        //     return format_currency($this->min_price) . ' - ' . format_currency($this->max_price);
        // }

        // return format_currency($this->price);
    }

    public function getIsVariablePricingAttribute()
    {
        return !$this->is_flat_rate && ($this->min_price || $this->max_price);
    }

    // Business Logic Methods
    public function calculateFinalPrice($diagnosis = null)
    {
        if ($this->is_flat_rate) {
            return $this->price;
        }

        if ($this->min_price && $this->max_price) {
            // For variable pricing, you might implement logic based on diagnosis
            return $this->min_price; // Return minimum as default
        }

        return $this->price;
    }

    // Scopes
    public function scopeForDeviceType($query, $deviceTypeId)
    {
        return $query->where('device_type_id', $deviceTypeId);
    }

    public function scopeFlatRate($query)
    {
        return $query->where('is_flat_rate', true);
    }

    public function scopeVariablePricing($query)
    {
        return $query->where('is_flat_rate', false)
            ->where(function ($q) {
                $q->whereNotNull('min_price')
                    ->orWhereNotNull('max_price');
            });
    }
}