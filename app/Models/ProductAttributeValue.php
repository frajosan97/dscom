<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductAttributeValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_attribute_id',
        'value',
        'slug',
        'color_code',
        'image_url',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(ProductAttribute::class, 'product_attribute_id');
    }
}
