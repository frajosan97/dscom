<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTransferItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_transfer_id',
        'product_id',
        'product_item_id',
        'quantity_requested',
        'quantity_shipped',
        'quantity_received',
        'notes',
    ];

    protected $casts = [
        'quantity_requested' => 'integer',
        'quantity_shipped' => 'integer',
        'quantity_received' => 'integer',
    ];

    // Accessors for calculated attributes
    protected $appends = [
        'is_fully_shipped',
        'is_fully_received',
        'pending_shipment',
        'pending_receipt',
    ];

    // Relationships
    public function stockTransfer(): BelongsTo
    {
        return $this->belongsTo(StockTransfer::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productItem(): BelongsTo
    {
        return $this->belongsTo(ProductItem::class);
    }

    /**
     * Check if item is fully shipped
     */
    public function getIsFullyShippedAttribute(): bool
    {
        return $this->quantity_shipped >= $this->quantity_requested;
    }

    /**
     * Check if item is fully received
     */
    public function getIsFullyReceivedAttribute(): bool
    {
        return $this->quantity_received >= $this->quantity_requested;
    }

    /**
     * Get pending shipment quantity
     */
    public function getPendingShipmentAttribute(): int
    {
        return max(0, $this->quantity_requested - $this->quantity_shipped);
    }

    /**
     * Get pending receipt quantity
     */
    public function getPendingReceiptAttribute(): int
    {
        return max(0, $this->quantity_shipped - $this->quantity_received);
    }

    /**
     * Update shipped quantity
     */
    public function updateShippedQuantity(int $quantity): bool
    {
        if ($quantity > $this->quantity_requested) {
            throw new \InvalidArgumentException('Shipped quantity cannot exceed requested quantity');
        }

        return $this->update(['quantity_shipped' => $quantity]);
    }

    /**
     * Update received quantity
     */
    public function updateReceivedQuantity(int $quantity): bool
    {
        if ($quantity > $this->quantity_shipped) {
            throw new \InvalidArgumentException('Received quantity cannot exceed shipped quantity');
        }

        return $this->update(['quantity_received' => $quantity]);
    }

    /**
     * Increment shipped quantity
     */
    public function incrementShippedQuantity(int $quantity = 1): bool
    {
        $newQuantity = $this->quantity_shipped + $quantity;

        if ($newQuantity > $this->quantity_requested) {
            throw new \InvalidArgumentException('Shipped quantity cannot exceed requested quantity');
        }

        return $this->update(['quantity_shipped' => $newQuantity]);
    }

    /**
     * Increment received quantity
     */
    public function incrementReceivedQuantity(int $quantity = 1): bool
    {
        $newQuantity = $this->quantity_received + $quantity;

        if ($newQuantity > $this->quantity_shipped) {
            throw new \InvalidArgumentException('Received quantity cannot exceed shipped quantity');
        }

        return $this->update(['quantity_received' => $newQuantity]);
    }

    /**
     * Scope for fully shipped items
     */
    public function scopeFullyShipped($query)
    {
        return $query->whereRaw('quantity_shipped >= quantity_requested');
    }

    /**
     * Scope for fully received items
     */
    public function scopeFullyReceived($query)
    {
        return $query->whereRaw('quantity_received >= quantity_requested');
    }

    /**
     * Scope for pending shipment
     */
    public function scopePendingShipment($query)
    {
        return $query->whereRaw('quantity_shipped < quantity_requested');
    }

    /**
     * Scope for pending receipt
     */
    public function scopePendingReceipt($query)
    {
        return $query->whereRaw('quantity_received < quantity_shipped');
    }
}