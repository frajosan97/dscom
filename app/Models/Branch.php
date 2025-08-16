<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'email',
        'phone',
        'manager_name',
        'manager_contact',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'latitude',
        'longitude',
        'opening_time',
        'closing_time',
        'working_days',
        'is_active',
        'is_online',
        'has_pickup',
        'has_delivery',
        'delivery_radius',
        'delivery_fee',
        'currency',
        'notes',
    ];

    protected $casts = [
        'working_days' => 'array',
        'is_active' => 'boolean',
        'is_online' => 'boolean',
        'has_pickup' => 'boolean',
        'has_delivery' => 'boolean',
        'opening_time' => 'datetime:H:i',
        'closing_time' => 'datetime:H:i',
        'delivery_fee' => 'decimal:2',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOnline($query)
    {
        return $query->where('is_online', true);
    }

    public function scopeWithDelivery($query)
    {
        return $query->where('has_delivery', true);
    }

    public function scopeWithPickup($query)
    {
        return $query->where('has_pickup', true);
    }
}
