<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairOrderStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'repair_order_id',
        'status',
        'previous_status',
        'notes',
        'changed_by',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Relationships
    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    // Computed Attributes
    public function getStatusChangeDescriptionAttribute()
    {
        if ($this->previous_status) {
            return "Changed from {$this->previous_status} to {$this->status}";
        }

        return "Set to {$this->status}";
    }

    // Scopes
    public function scopeForRepairOrder($query, $repairOrderId)
    {
        return $query->where('repair_order_id', $repairOrderId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}