<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'brand_id',
        'tax_id',
        'name',
        'slug',
        'short_description',
        'description',
        'sku',
        'product_type',
        'sizes',
        'colors',
        'materials',
        'variations',
        'base_price',
        'agent_price',
        'wholesaler_price',
        'compare_price',
        'cost_per_item',
        'total_quantity',
        'low_stock_alert',
        'track_quantity',
        'allow_backorders',
        'stock_status',
        'is_digital',
        'requires_shipping',
        'weight',
        'length',
        'width',
        'height',
        'is_featured',
        'is_active',
        'is_bestseller',
        'is_new',
        'new_until',
        'meta_title',
        'meta_description',
        'metadata',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'agent_price' => 'decimal:2',
        'wholesaler_price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_per_item' => 'decimal:2',
        'total_quantity' => 'integer',
        'low_stock_alert' => 'integer',
        'track_quantity' => 'boolean',
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
        'new_until' => 'date',
        'sizes' => 'array',
        'colors' => 'array',
        'materials' => 'array',
        'variations' => 'array',
        'metadata' => 'array',
    ];

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ProductItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function defaultImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_default', true);
    }

    /**
     * Calculate discount percentage
     */
    public function getDiscountPercentageAttribute()
    {
        if (!$this->compare_price || $this->compare_price <= $this->base_price) {
            return 0;
        }

        return round((($this->compare_price - $this->base_price) / $this->compare_price) * 100);
    }

    /**
     * Check if product is in stock
     */
    public function getIsInStockAttribute()
    {
        if (!$this->track_quantity) {
            return true;
        }

        return $this->total_quantity > 0 || $this->allow_backorders;
    }

    /**
     * Check if product is on sale
     */
    public function getIsOnSaleAttribute()
    {
        return $this->compare_price && $this->compare_price > $this->base_price;
    }

    /**
     * Scope for active products
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for featured products
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for bestseller products
     */
    public function scopeBestseller($query)
    {
        return $query->where('is_bestseller', true);
    }

    /**
     * Scope for new products
     */
    public function scopeNew($query)
    {
        return $query->where('is_new', true)
            ->where(function ($q) {
                $q->whereNull('new_until')
                    ->orWhere('new_until', '>=', now());
            });
    }

    /**
     * Scope for in-stock products
     */
    public function scopeInStock($query)
    {
        return $query->where(function ($q) {
            $q->where('track_quantity', false)
                ->orWhere('total_quantity', '>', 0)
                ->orWhere('allow_backorders', true);
        });
    }

    /**
     * Update total quantity based on items
     */
    public function updateTotalQuantity()
    {
        $total = $this->items()->where('status', 'available')->count();
        $this->update(['total_quantity' => $total]);
    }
}