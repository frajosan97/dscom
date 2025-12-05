<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'invoice_number',
        'branch_id',
        'warehouse_id',
        'user_id',
        'customer_id',
        'payment_method_id',
        'shipping_method_id',
        'coupon_id',
        'status',
        'fulfillment_status',
        'subtotal',
        'tax',
        'shipping_cost',
        'discount',
        'total',
        'total_paid',
        'total_refunded',
        'currency',
        'payment_status',
        'payment_reference',
        'payment_date',
        'tracking_number',
        'tracking_url',
        'shipped_at',
        'delivered_at',
        'coupon_code',
        'coupon_value',
        'customer_note',
        'private_notes',
        'custom_fields',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'total_paid' => 'decimal:2',
        'total_refunded' => 'decimal:2',
        'coupon_value' => 'decimal:2',
        'payment_date' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'custom_fields' => 'array',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(OrderAddress::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(OrderPayment::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function billingAddress(): HasOne
    {
        return $this->hasOne(OrderAddress::class)->where('type', 'billing');
    }

    public function shippingAddress(): HasOne
    {
        return $this->hasOne(OrderAddress::class)->where('type', 'shipping');
    }

    // Computed Attributes
    public function getBalanceDueAttribute()
    {
        return $this->total - $this->total_paid;
    }

    public function getIsPaidAttribute()
    {
        return $this->payment_status === 'paid' && $this->total_paid >= $this->total;
    }

    public function getIsFullyShippedAttribute()
    {
        return $this->fulfillment_status === 'fulfilled';
    }

    public function getIsPartiallyShippedAttribute()
    {
        return $this->fulfillment_status === 'partially_fulfilled';
    }

    public function getIsCompletedAttribute()
    {
        return $this->status === 'completed';
    }

    public function getIsCancelledAttribute()
    {
        return $this->status === 'cancelled';
    }

    // Business Logic Methods
    public function updatePaymentStatus()
    {
        if ($this->total_paid >= $this->total) {
            $this->update(['payment_status' => 'paid']);
        } elseif ($this->total_paid > 0) {
            $this->update(['payment_status' => 'partially_paid']);
        } else {
            $this->update(['payment_status' => 'pending']);
        }
    }

    public function updateFulfillmentStatus()
    {
        $totalItems = $this->items->sum('quantity');
        $shippedItems = $this->items->sum('quantity_shipped');
        $deliveredItems = $this->items->sum('quantity_delivered');

        if ($shippedItems >= $totalItems) {
            $status = 'fulfilled';
        } elseif ($shippedItems > 0) {
            $status = 'partially_fulfilled';
        } else {
            $status = 'unfulfilled';
        }

        $this->update(['fulfillment_status' => $status]);
    }

    public function addPayment($amount, $paymentMethodId = null, $transactionId = null)
    {
        $this->increment('total_paid', $amount);
        $this->updatePaymentStatus();

        if ($paymentMethodId) {
            OrderPayment::create([
                'order_id' => $this->id,
                'payment_method_id' => $paymentMethodId,
                'amount' => $amount,
                'transaction_id' => $transactionId ?? uniqid('PAY_'),
                'status' => 'completed',
                'paid_at' => now(),
            ]);
        }
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
    }

    public function scopeWithBalanceDue($query)
    {
        return $query->whereRaw('total_paid < total');
    }
}