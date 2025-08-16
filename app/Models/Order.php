<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'invoice_number',
        'branch_id',
        'user_id',
        'customer_id',
        'customer_email',
        'customer_phone',
        'customer_first_name',
        'customer_last_name',
        'customer_company',
        'customer_tax_number',
        'billing_address',
        'shipping_address',
        'shipping_same_as_billing',
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
        'payment_method_id',
        'payment_method_code',
        'payment_method_name',
        'payment_status',
        'payment_reference',
        'payment_date',
        'shipping_method_id',
        'tracking_number',
        'tracking_url',
        'shipped_at',
        'delivered_at',
        'coupon_id',
        'coupon_code',
        'coupon_value',
        'customer_note',
        'private_notes',
        'custom_fields',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'billing_address' => 'array',
        'shipping_address' => 'array',
        'custom_fields' => 'array',
        'shipping_same_as_billing' => 'boolean',
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
        'delivered_at' => 'datetime'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function orderStatusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getCustomerFullNameAttribute()
    {
        return $this->customer_first_name . ' ' . $this->customer_last_name;
    }
}
