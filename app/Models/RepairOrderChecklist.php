<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class RepairOrderChecklist extends Model
{
    protected $table = 'repair_order_checklists';

    protected $fillable = [
        'repair_order_id',
        'checklist_item_id',
        'is_completed',
        'completed_by',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the repair order that owns the checklist item.
     */
    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }

    /**
     * Get the checklist item.
     */
    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(RepairChecklistItem::class);
    }

    /**
     * Get the user who completed the checklist item.
     */
    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    /**
     * Mark the checklist item as completed.
     */
    public function markAsCompleted($userId = null, $notes = null): bool
    {
        return $this->update([
            'is_completed' => true,
            'completed_by' => $userId ?? Auth::id(),
            'completed_at' => now(),
            'notes' => $notes,
        ]);
    }

    /**
     * Mark the checklist item as incomplete.
     */
    public function markAsIncomplete(): bool
    {
        return $this->update([
            'is_completed' => false,
            'completed_by' => null,
            'completed_at' => null,
        ]);
    }
}