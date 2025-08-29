<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RepairChecklist extends Model
{
    protected $fillable = [
        'repair_service_id',
        'device_type_id',
        'name',
        'description',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the repair service that owns the checklist.
     */
    public function repairService(): BelongsTo
    {
        return $this->belongsTo(RepairService::class);
    }

    /**
     * Get the device type that owns the checklist.
     */
    public function deviceType(): BelongsTo
    {
        return $this->belongsTo(RepairServiceDeviceType::class);
    }

    /**
     * Get the items for the checklist.
     */
    public function items(): HasMany
    {
        return $this->hasMany(RepairChecklistItem::class, 'checklist_id');
    }

    /**
     * Scope a query to only include active checklists.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}