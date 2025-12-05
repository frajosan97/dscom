<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'warehouse_id',
        'order_id',
        'user_id',
        'payment_method_id',
        'transaction_id',
        'reference',
        'amount',
        'fee',
        'currency',
        'payment_method_code',
        'payment_method_name',
        'status',
        'gateway_response',
        'gateway_parameters',
        'metadata',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'paid_at' => 'datetime',
        'gateway_parameters' => 'array',
        'metadata' => 'array',
    ];

    // Relationships
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    // Computed Attributes
    public function getNetAmountAttribute()
    {
        return $this->amount - $this->fee;
    }

    public function getIsSuccessfulAttribute()
    {
        return in_array($this->status, ['completed', 'refunded', 'partially_refunded']);
    }

    public function getIsFailedAttribute()
    {
        return $this->status === 'failed';
    }

    public function getIsPendingAttribute()
    {
        return $this->status === 'pending';
    }

    // Business Logic Methods
    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'paid_at' => now()
        ]);
    }

    public function markAsFailed($reason = null)
    {
        $this->update([
            'status' => 'failed',
            'gateway_response' => $reason
        ]);
    }

    public function refund($amount = null)
    {
        $refundAmount = $amount ?? $this->amount;

        $this->update([
            'status' => $refundAmount < $this->amount ? 'partially_refunded' : 'refunded'
        ]);

        // Update order refund total
        $this->order->increment('total_refunded', $refundAmount);
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRefunded($query)
    {
        return $query->where('status', 'refunded');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisMonth($query)
    {
        return $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
    }
}