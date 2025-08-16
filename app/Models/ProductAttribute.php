<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductAttribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'display_type',
        'is_filterable',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_filterable' => 'boolean',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function values(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class, 'product_attribute_id');
    }
}
