<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'prod_variant_id',
        'product_name',
        'sku',
        'barcode',
        'description',
        'price',
        'original_price',
        'tax_amount',
        'discount_amount',
        'quantity',
        'quantity_shipped',
        'total',
        'options',
        'attributes',
        'inventory_updated',
        'inventory_updated_at',
        'status'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'options' => 'array',
        'attributes' => 'array',
        'inventory_updated' => 'boolean',
        'inventory_updated_at' => 'datetime'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'prod_variant_id');
    }
}
