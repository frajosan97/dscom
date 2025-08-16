<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'min_order_amount',
        'max_discount_amount',
        'start_date',
        'end_date',
        'is_active',
        'usage_limit',
        'usage_limit_per_user',
        'usage_count',
        'apply_to_all_products',
        'product_ids',
        'excluded_product_ids',
        'category_ids',
        'apply_to_all_customers',
        'customer_ids'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'apply_to_all_products' => 'boolean',
        'apply_to_all_customers' => 'boolean',
        'product_ids' => 'array',
        'excluded_product_ids' => 'array',
        'category_ids' => 'array',
        'customer_ids' => 'array',
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2'
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('usage_count')
            ->withTimestamps();
    }
}
