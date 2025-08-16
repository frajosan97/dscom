<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'name',
        'sku',
        'barcode',
        'price',
        'compare_price',
        'cost_per_item',
        'quantity',
        'stock_status',
        'track_inventory',
        'options',
        'image',
        'weight',
        'is_default',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_per_item' => 'decimal:2',
        'quantity' => 'integer',
        'track_inventory' => 'boolean',
        'options' => 'json',
        'is_default' => 'boolean',
        'weight' => 'decimal:2',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
