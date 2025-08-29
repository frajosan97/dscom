<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RepairServiceDeviceType extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
        'icon',
        'image',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the parent device type.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(RepairServiceDeviceType::class, 'parent_id');
    }

    /**
     * Get the child device types.
     */
    public function children(): HasMany
    {
        return $this->hasMany(RepairServiceDeviceType::class, 'parent_id');
    }

    /**
     * Get the repair services for the device type.
     */
    public function repairServices(): BelongsToMany
    {
        return $this->belongsToMany(RepairService::class, 'repair_service_pricings')
            ->withPivot('price', 'min_price', 'max_price', 'is_flat_rate', 'price_notes')
            ->withTimestamps();
    }

    /**
     * Get the pricings for the device type.
     */
    public function pricings(): HasMany
    {
        return $this->hasMany(RepairServicePricing::class);
    }

    /**
     * Get the repair orders for the device type.
     */
    public function repairOrders(): HasMany
    {
        return $this->hasMany(RepairOrder::class);
    }

    /**
     * Scope a query to only include active device types.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include root device types (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Check if the device type has children.
     */
    public function getHasChildrenAttribute(): bool
    {
        return $this->children()->count() > 0;
    }

    /**
     * Get all ancestor device types.
     */
    public function getAncestorsAttribute()
    {
        $ancestors = collect();
        $current = $this;

        while ($current->parent) {
            $ancestors->push($current->parent);
            $current = $current->parent;
        }

        return $ancestors->reverse();
    }

    /**
     * Get all descendant device types.
     */
    public function getDescendantsAttribute()
    {
        $descendants = collect();

        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->descendants);
        }

        return $descendants;
    }

    public function deviceTypes()
    {
        return $this->hasMany(RepairServiceDeviceType::class, 'parent_id');
    }
}