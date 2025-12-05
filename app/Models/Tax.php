<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tax extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'identifier',
        'rate',
        'country',
        'state',
        'city',
        'postal_code',
        'type',
        'is_inclusive',
        'is_active',
        'is_default',
        'priority',
        'apply_to',
        'exceptions',
        'description',
        'tax_number',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'is_inclusive' => 'boolean',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'priority' => 'integer',
        'apply_to' => 'array',
        'exceptions' => 'array',
    ];

    // Relationships
    // Tax can be applied to products, orders, etc.
    // These relationships would be defined in the Product/Order models

    /**
     * Scope for active taxes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for default taxes
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope for taxes in a specific location
     */
    public function scopeForLocation($query, $country, $state = null, $city = null)
    {
        return $query->where(function ($q) use ($country, $state, $city) {
            $q->whereNull('country')
                ->orWhere('country', $country);
        })->where(function ($q) use ($state) {
            $q->whereNull('state')
                ->orWhere('state', $state);
        })->where(function ($q) use ($city) {
            $q->whereNull('city')
                ->orWhere('city', $city);
        });
    }
}