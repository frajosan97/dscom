<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'user_id',
        'reference_id',
        'reference_type',
        'type',
        'direction',
        'quantity',
        'previous_stock',
        'new_stock',
        'unit_cost',
        'reason',
        'description',
        'metadata',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'previous_stock' => 'integer',
        'new_stock' => 'integer',
        'unit_cost' => 'decimal:2',
        'metadata' => 'array',
    ];

    // Relationships
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope for incoming movements
     */
    public function scopeIncoming($query)
    {
        return $query->where('direction', 'in');
    }

    /**
     * Scope for outgoing movements
     */
    public function scopeOutgoing($query)
    {
        return $query->where('direction', 'out');
    }

    /**
     * Scope for movements in date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get movement value
     */
    public function getValueAttribute()
    {
        return $this->quantity * ($this->unit_cost ?? 0);
    }
}