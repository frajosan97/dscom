<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class RepairService extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'detailed_description',
        'repair_process',
        'base_price',
        'estimated_duration',
        'warranty_days',
        'is_active',
        'is_featured',
        'image',
        'metadata',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get the pricings for the repair service.
     */
    public function pricings(): HasMany
    {
        return $this->hasMany(RepairServicePricing::class);
    }

    /**
     * Get the device types for the repair service.
     */
    // public function deviceTypes(): BelongsToMany
    // {
    //     return $this->belongsToMany(RepairServiceDeviceType::class, 'repair_service_pricings')
    //         ->withPivot('price', 'min_price', 'max_price', 'is_flat_rate', 'price_notes')
    //         ->withTimestamps();
    // }

    /**
     * Get the checklists for the repair service.
     */
    // public function checklists(): HasMany
    // {
    //     return $this->hasMany(RepairChecklist::class);
    // }

    /**
     * Get the repair orders for the repair service.
     */
    public function repairOrders(): HasMany
    {
        return $this->hasMany(RepairOrder::class);
    }

    /**
     * Get the price for a specific device type.
     */
    public function getPriceForDeviceType($deviceTypeId): ?RepairServicePricing
    {
        return $this->pricings()->where('device_type_id', $deviceTypeId)->first();
    }

    /**
     * Scope a query to only include active repair services.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include featured repair services.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Get the estimated duration in hours and minutes.
     */
    protected function estimatedDurationFormatted(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->estimated_duration) {
                    return null;
                }

                $hours = floor($this->estimated_duration / 60);
                $minutes = $this->estimated_duration % 60;

                if ($hours > 0 && $minutes > 0) {
                    return "{$hours}h {$minutes}m";
                } elseif ($hours > 0) {
                    return "{$hours}h";
                } else {
                    return "{$minutes}m";
                }
            }
        );
    }
}