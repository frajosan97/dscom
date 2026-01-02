<?php

namespace App\Models\Erp\Crm;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promotion extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'code',
        'discount_type',
        'discount_value',
        'start_date',
        'end_date',
        'status',
        'usage_limit',
        'used_count',
        'minimum_purchase',
        'is_exclusive',
        'applicable_categories',
        'applicable_products',
        'excluded_products',
        'description',
        'image',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'discount_value' => 'decimal:2',
        'minimum_purchase' => 'decimal:2',
        'is_exclusive' => 'boolean',
        'applicable_categories' => 'array',
        'applicable_products' => 'array',
        'excluded_products' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'discount_display',
        'is_valid',
        'days_remaining',
    ];

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function usages(): HasMany
    {
        return $this->hasMany(PromotionUsage::class);
    }

    // public function orders(): HasMany
    // {
    //     return $this->hasManyThrough(
    //         Order::class,
    //         PromotionUsage::class
    //     );
    // }

    // Accessors
    // public function getDiscountDisplayAttribute(): string
    // {
    //     return $this->discount_type === 'percentage'
    //         ? "{$this->discount_value}%"
    //         : format_currency($this->discount_value);
    // }

    public function getIsValidAttribute(): bool
    {
        $now = now();

        if ($this->status !== 'active') {
            return false;
        }

        if ($this->start_date > $now || $this->end_date < $now) {
            return false;
        }

        if ($this->usage_limit && $this->used_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    public function getDaysRemainingAttribute(): ?int
    {
        if ($this->end_date < now()) {
            return 0;
        }

        return now()->diffInDays($this->end_date);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    public function scopeValid($query)
    {
        return $query->active()
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereRaw('used_count < usage_limit');
            });
    }

    public function scopeExpired($query)
    {
        return $query->where('end_date', '<', now())
            ->orWhere('status', 'expired');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming')
            ->where('start_date', '>', now());
    }

    // Methods
    public function canApplyToOrder(Order $order): bool
    {
        if (!$this->is_valid) {
            return false;
        }

        if ($this->minimum_purchase && $order->subtotal < $this->minimum_purchase) {
            return false;
        }

        if ($this->applicable_categories) {
            // Check if order contains products from applicable categories
        }

        if ($this->applicable_products) {
            // Check if order contains applicable products
        }

        if ($this->excluded_products) {
            // Check if order contains excluded products
        }

        return true;
    }

    public function calculateDiscount($amount): float
    {
        if ($this->discount_type === 'percentage') {
            return ($amount * $this->discount_value) / 100;
        }

        return min($this->discount_value, $amount);
    }

    public function incrementUsage(): void
    {
        $this->increment('used_count');
    }
}