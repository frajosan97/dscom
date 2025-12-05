<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RepairChecklist extends Model
{
    use HasFactory;

    protected $fillable = [
        'repair_service_id',
        'device_type_id',
        'name',
        'description',
        'order',
        'is_active',
    ];

    protected $casts = [
        'order' => 'integer',
        'is_active' => 'boolean',
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

    public function items(): HasMany
    {
        return $this->hasMany(RepairChecklistItem::class, 'checklist_id');
    }

    // Computed Attributes
    public function getRequiredItemsCountAttribute()
    {
        return $this->items()->where('is_required', true)->count();
    }

    public function getTotalItemsCountAttribute()
    {
        return $this->items()->count();
    }

    // Business Logic Methods
    public function getItemsByCategory()
    {
        return $this->items()->ordered()->get()->groupBy('category');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForServiceAndDevice($query, $serviceId, $deviceTypeId)
    {
        return $query->where('repair_service_id', $serviceId)
            ->where('device_type_id', $deviceTypeId);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }

    public function scopeWithItems($query)
    {
        return $query->with([
            'items' => function ($q) {
                $q->ordered();
            }
        ]);
    }
}