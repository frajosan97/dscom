<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'metadata'
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'metadata' => 'array'
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function orders()
    {
        return $this->hasMany(RepairOrder::class);
    }

    public function pricings()
    {
        return $this->hasMany(RepairServicePricing::class);
    }

    public function deviceTypes()
    {
        return $this->belongsToMany(DeviceType::class, 'repair_service_pricings', 'repair_service_id', 'device_type_id')
            ->using(RepairServicePricing::class)
            ->withPivot('price', 'min_price', 'max_price', 'is_flat_rate', 'price_notes')
            ->withTimestamps();
    }
}
