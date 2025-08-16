<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'branch_id',
        'name',
        'slug',
        'short_description',
        'description',
        'meta_title',
        'meta_description',
        'category_id',
        'brand_id',
        'price',
        'agent_price',
        'wholesaler_price',
        'compare_price',
        'cost_per_item',
        'tax_amount',
        'tax_id',
        'sku',
        'barcode',
        'quantity',
        'low_stock_threshold',
        'stock_status',
        'track_inventory',
        'allow_backorders',
        'is_digital',
        'requires_shipping',
        'weight',
        'weight_unit',
        'length',
        'width',
        'height',
        'dimension_unit',
        'is_featured',
        'is_active',
        'is_bestseller',
        'is_new',
        'new_until',
        'has_variants',
        'tags',
        'specifications',
        'custom_fields',
        'related_products',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'agent_price' => 'decimal:2',
        'wholesaler_price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_per_item' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'quantity' => 'integer',
        'low_stock_threshold' => 'integer',
        'track_inventory' => 'boolean',
        'allow_backorders' => 'boolean',
        'is_digital' => 'boolean',
        'requires_shipping' => 'boolean',
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'is_bestseller' => 'boolean',
        'is_new' => 'boolean',
        'has_variants' => 'boolean',
        'tags' => 'json',
        'specifications' => 'json',
        'custom_fields' => 'json',
        'related_products' => 'json',
        'new_until' => 'date',
    ];

    protected $appends = [
        'default_image',
        'is_on_sale',
        'discount_percentage',
        'stock_percentage',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function attributes(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductAttribute::class,
            'product_product_attr_values',
            'product_id',
            'product_attribute_id'
        );
    }

    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductAttributeValue::class,
            'product_product_attr_values',
            'product_id',
            'product_attr_value_id'
        )->withPivot('product_attribute_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeBestseller($query)
    {
        return $query->where('is_bestseller', true);
    }

    public function scopeNew($query)
    {
        return $query->where('is_new', true)
            ->orWhere(function ($query) {
                $query->whereNotNull('new_until')
                    ->where('new_until', '>=', now());
            });
    }

    public function getDefaultImageAttribute()
    {
        return $this->images()->where('is_default', true)->first()
            ?? $this->images()->first();
    }

    public function getIsOnSaleAttribute(): bool
    {
        return $this->compare_price > 0
            && $this->compare_price > $this->price;
    }

    public function getDiscountPercentageAttribute(): ?float
    {
        if (!$this->is_on_sale) {
            return null;
        }

        return round(100 - ($this->price / $this->compare_price * 100), 2);
    }

    public function getStockPercentageAttribute(): ?float
    {
        if ($this->low_stock_threshold <= 0) {
            return null;
        }

        return min(100, round($this->quantity / $this->low_stock_threshold * 100, 2));
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            $product->slug = $product->generateUniqueSlug($product->name);
        });

        static::updating(function ($product) {
            if ($product->isDirty('name')) {
                $product->slug = $product->generateUniqueSlug($product->name);
            }
        });
    }

    public function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (static::where('slug', $slug)
            ->when($this->exists, fn($query) => $query->where('id', '!=', $this->id))
            ->exists()
        ) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return $slug;
    }
}
