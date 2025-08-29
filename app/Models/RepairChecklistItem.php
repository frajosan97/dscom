<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RepairChecklistItem extends Model
{
    protected $fillable = [
        'checklist_id',
        'name',
        'description',
        'is_required',
        'order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    /**
     * Get the checklist that owns the item.
     */
    public function checklist(): BelongsTo
    {
        return $this->belongsTo(RepairChecklist::class, 'checklist_id');
    }

    /**
     * Get the repair orders that have this checklist item.
     */
    public function repairOrders(): BelongsToMany
    {
        return $this->belongsToMany(RepairOrder::class, 'repair_order_checklists')
            ->withPivot('is_completed', 'completed_by', 'completed_at', 'notes')
            ->withTimestamps();
    }
}