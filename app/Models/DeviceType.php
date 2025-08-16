<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DeviceType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'repair_service_device_types';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
        'icon',
        'image',
        'is_active',
        'order'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function parent()
    {
        return $this->belongsTo(DeviceType::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(DeviceType::class, 'parent_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function orders()
    {
        return $this->hasMany(RepairOrder::class);
    }

    public function repairServices()
    {
        return $this->belongsToMany(RepairService::class, 'repair_service_pricings', 'device_type_id', 'repair_service_id')
            ->using(RepairServicePricing::class)
            ->withPivot('price', 'min_price', 'max_price', 'is_flat_rate', 'price_notes')
            ->withTimestamps();
    }
}
