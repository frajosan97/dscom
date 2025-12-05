<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairPart extends Model
{
    use HasFactory;

    protected $fillable = [
        'repair_order_id',
        'product_id',
        'part_name',
        'part_number',
        'description',
        'cost_price',
        'selling_price',
        'quantity',
        'total',
        'status',
        'notes',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'total' => 'decimal:2',
        'quantity' => 'integer',
    ];

    // Relationships
    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Computed Attributes
    public function getProfitMarginAttribute()
    {
        if (!$this->cost_price)
            return null;

        return $this->selling_price - $this->cost_price;
    }

    public function getProfitMarginPercentageAttribute()
    {
        if (!$this->cost_price || $this->cost_price == 0)
            return null;

        return (($this->selling_price - $this->cost_price) / $this->cost_price) * 100;
    }

    public function getIsInstalledAttribute()
    {
        return $this->status === 'installed';
    }

    public function getIsReturnedAttribute()
    {
        return $this->status === 'returned';
    }

    // Business Logic Methods
    public function markAsInstalled()
    {
        $this->update(['status' => 'installed']);
    }

    public function markAsReturned($notes = null)
    {
        $this->update([
            'status' => 'returned',
            'notes' => $notes ?: $this->notes
        ]);
    }

    public function updateTotal()
    {
        $total = $this->selling_price * $this->quantity;
        $this->update(['total' => $total]);

        // Update repair order total
        $this->repairOrder->calculateTotalAmount();
    }

    // Scopes
    public function scopeInstalled($query)
    {
        return $query->where('status', 'installed');
    }

    public function scopeOrdered($query)
    {
        return $query->where('status', 'ordered');
    }

    public function scopeReturned($query)
    {
        return $query->where('status', 'returned');
    }

    public function scopeDefective($query)
    {
        return $query->where('status', 'defective');
    }
}