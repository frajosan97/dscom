<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockTransfer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transfer_number',
        'status',
        'transfer_type',
        'from_warehouse_id',
        'to_warehouse_id',
        'requested_by',
        'approved_by',
        'shipped_by',
        'received_by',
        'requested_at',
        'approved_at',
        'shipped_at',
        'received_at',
        'notes',
        'rejection_reason',
        'metadata',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'shipped_at' => 'datetime',
        'received_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Relationships
    public function fromWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    public function toWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function shippedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shipped_by');
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockTransferItem::class);
    }

    /**
     * Calculate total items quantity
     */
    public function getTotalQuantityRequestedAttribute()
    {
        return $this->items->sum('quantity_requested');
    }

    public function getTotalQuantityShippedAttribute()
    {
        return $this->items->sum('quantity_shipped');
    }

    public function getTotalQuantityReceivedAttribute()
    {
        return $this->items->sum('quantity_received');
    }

    /**
     * Check if transfer can be approved
     */
    public function canBeApproved()
    {
        return $this->status === 'pending' || $this->status === 'draft';
    }

    /**
     * Check if transfer can be shipped
     */
    public function canBeShipped()
    {
        return $this->status === 'approved';
    }

    /**
     * Check if transfer can be received
     */
    public function canBeReceived()
    {
        return $this->status === 'in_transit' || $this->status === 'partially_received';
    }

    /**
     * Scope for pending transfers
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved transfers
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for in-transit transfers
     */
    public function scopeInTransit($query)
    {
        return $query->where('status', 'in_transit');
    }

    /**
     * Update transfer status
     */
    public function updateStatus($status)
    {
        $this->update(['status' => $status]);

        // Update timestamps based on status
        $timestampField = $status . '_at';
        if (in_array($timestampField, ['approved_at', 'shipped_at', 'received_at']) && !$this->$timestampField) {
            $this->update([$timestampField => now()]);
        }
    }
}