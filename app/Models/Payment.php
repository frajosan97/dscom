<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
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
        'paid_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'gateway_parameters' => 'array',
        'metadata' => 'array',
        'paid_at' => 'datetime'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
