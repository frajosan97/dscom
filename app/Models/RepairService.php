<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RepairService extends Model
{
    use HasFactory, SoftDeletes;

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
        'estimated_duration' => 'integer',
        'warranty_days' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'metadata' => 'array',
    ];

    // Relationships
    public function pricings(): HasMany
    {
        return $this->hasMany(RepairServicePricing::class);
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(RepairChecklist::class);
    }

    public function repairOrders(): HasMany
    {
        return $this->hasMany(RepairOrder::class);
    }

    public function deviceTypes(): BelongsToMany
    {
        return $this->belongsToMany(
            RepairServiceDeviceType::class,
            'repair_service_pricings',
            'repair_service_id',
            'device_type_id'
        )->withPivot('price', 'min_price', 'max_price', 'is_flat_rate', 'price_notes');
    }

    // Computed Attributes
    public function getPriceRangeAttribute()
    {
        $minPrice = $this->pricings()->min('price');
        $maxPrice = $this->pricings()->max('price');

        if ($minPrice && $maxPrice) {
            return $minPrice == $maxPrice
                ? format_currency($minPrice)
                : format_currency($minPrice) . ' - ' . format_currency($maxPrice);
        }

        return format_currency($this->base_price);
    }

    public function getEstimatedDurationFormattedAttribute()
    {
        if (!$this->estimated_duration)
            return null;

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

    // Business Logic Methods
    public function getPriceForDeviceType($deviceTypeId)
    {
        $pricing = $this->pricings()->where('device_type_id', $deviceTypeId)->first();
        return $pricing ? $pricing->price : $this->base_price;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeWithPricings($query)
    {
        return $query->with([
            'pricings' => function ($q) {
                $q->with('deviceType');
            }
        ]);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%")
            ->orWhere('description', 'like', "%{$search}%");
    }
}