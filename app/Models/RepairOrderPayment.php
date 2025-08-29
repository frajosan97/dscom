<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairOrderPayment extends Model
{
    protected $fillable = [
        'repair_order_id',
        'user_id',
        'amount',
        'payment_method',
        'transaction_id',
        'receipt_number',
        'payment_type',
        'status',
        'notes',
        'metadata',
        'payment_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'metadata' => 'array',
    ];

    // Payment type constants
    const TYPE_DEPOSIT = 'deposit';
    const TYPE_PARTIAL = 'partial';
    const TYPE_FULL = 'full';
    const TYPE_REFUND = 'refund';

    // Payment status constants
    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';

    /**
     * Get the repair order that owns the payment.
     */
    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }

    /**
     * Get the user who made the payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include completed payments.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope a query to only include pending payments.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Mark the payment as completed.
     */
    public function markAsCompleted(): bool
    {
        return $this->update(['status' => self::STATUS_COMPLETED]);
    }

    /**
     * Mark the payment as failed.
     */
    public function markAsFailed(): bool
    {
        return $this->update(['status' => self::STATUS_FAILED]);
    }

    /**
     * Mark the payment as refunded.
     */
    public function markAsRefunded(): bool
    {
        return $this->update(['status' => self::STATUS_REFUNDED]);
    }
}