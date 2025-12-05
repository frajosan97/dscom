<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'serial_number',
        'barcode',
        'item_code',
        'size',
        'color',
        'material',
        'attributes',
        'status',
        'condition',
        'aisle',
        'rack',
        'shelf',
        'bin',
        'manufacture_date',
        'expiry_date',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'attributes' => 'array',
        'metadata' => 'array',
        'manufacture_date' => 'date',
        'expiry_date' => 'date',
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

    /**
     * Scope for available items
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope for items in a specific warehouse
     */
    public function scopeInWarehouse($query, $warehouseId)
    {
        return $query->where('warehouse_id', $warehouseId);
    }

    /**
     * Check if item is available
     */
    public function getIsAvailableAttribute()
    {
        return $this->status === 'available';
    }

    /**
     * Check if item is expired
     */
    // public function getIsExpiredAttribute()
    // {
    //     return $this->expiry_date && $this->expiry_date->isPast();
    // }

    /**
     * Get full location path
     */
    public function getFullLocationAttribute()
    {
        $location = [];
        if ($this->aisle)
            $location[] = "Aisle: {$this->aisle}";
        if ($this->rack)
            $location[] = "Rack: {$this->rack}";
        if ($this->shelf)
            $location[] = "Shelf: {$this->shelf}";
        if ($this->bin)
            $location[] = "Bin: {$this->bin}";

        return implode(', ', $location);
    }

    /**
     * Update status
     */
    public function updateStatus($status)
    {
        $this->update(['status' => $status]);
    }
}