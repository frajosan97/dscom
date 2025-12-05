<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'delivery_fee' => 'decimal:2',
        'opening_time' => 'datetime:H:i',
        'closing_time' => 'datetime:H:i',
    ];

    // Relationships
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class);
    }
}