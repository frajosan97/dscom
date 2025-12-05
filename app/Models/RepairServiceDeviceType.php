<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RepairServiceDeviceType extends Model
{
    use HasFactory, SoftDeletes;

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
        'order' => 'integer',
    ];

    // Relationships
    public function parent(): BelongsTo
    {
        return $this->belongsTo(RepairServiceDeviceType::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(RepairServiceDeviceType::class, 'parent_id');
    }

    public function repairServices(): HasMany
    {
        return $this->hasMany(RepairService::class);
    }

    public function pricings(): HasMany
    {
        return $this->hasMany(RepairServicePricing::class, 'device_type_id');
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(RepairChecklist::class, 'device_type_id');
    }

    public function repairOrders(): HasMany
    {
        return $this->hasMany(RepairOrder::class, 'device_type_id');
    }

    // Computed Attributes
    public function getFullPathAttribute()
    {
        $path = [$this->name];
        $parent = $this->parent;

        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parent;
        }

        return implode(' > ', $path);
    }

    // Business Logic Methods
    public function getAllDescendants()
    {
        return $this->children()->with('allDescendants');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }

    public function scopeWithChildren($query)
    {
        return $query->with([
            'children' => function ($q) {
                $q->active()->ordered();
            }
        ]);
    }
}