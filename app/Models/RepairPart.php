<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairPart extends Model
{
    protected $fillable = [
        'repair_order_id',
        'product_id',
        'part_name',
        'part_number',
        'description',
        'cost_price',
        'selling_price',
        'quantity',
        'total',
        'status',
        'notes',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // Status constants
    const STATUS_ORDERED = 'ordered';
    const STATUS_INSTALLED = 'installed';
    const STATUS_RETURNED = 'returned';

    /**
     * Get the repair order that owns the part.
     */
    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }

    /**
     * Get the product associated with the part.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate the total price.
     */
    public function calculateTotal(): void
    {
        $this->total = $this->selling_price * $this->quantity;
    }

    /**
     * Scope a query to only include installed parts.
     */
    public function scopeInstalled($query)
    {
        return $query->where('status', self::STATUS_INSTALLED);
    }

    /**
     * Scope a query to only include ordered parts.
     */
    public function scopeOrdered($query)
    {
        return $query->where('status', self::STATUS_ORDERED);
    }

    /**
     * Mark the part as installed.
     */
    public function markAsInstalled(): bool
    {
        return $this->update(['status' => self::STATUS_INSTALLED]);
    }

    /**
     * Mark the part as returned.
     */
    public function markAsReturned(): bool
    {
        return $this->update(['status' => self::STATUS_RETURNED]);
    }
}