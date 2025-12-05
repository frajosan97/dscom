<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_item_id',
        'product_name',
        'description',
        'sku',
        'barcode',
        'unit_price',
        'original_price',
        'tax_amount',
        'discount_amount',
        'quantity',
        'total',
        'size',
        'color',
        'material',
        'attributes',
        'quantity_shipped',
        'quantity_delivered',
        'inventory_updated',
        'inventory_updated_at',
        'status',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'quantity' => 'integer',
        'quantity_shipped' => 'integer',
        'quantity_delivered' => 'integer',
        'inventory_updated' => 'boolean',
        'inventory_updated_at' => 'datetime',
        'attributes' => 'array',
    ];

    // Relationships
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productItem(): BelongsTo
    {
        return $this->belongsTo(ProductItem::class);
    }

    // Computed Attributes
    public function getIsShippedAttribute()
    {
        return $this->quantity_shipped >= $this->quantity;
    }

    public function getIsDeliveredAttribute()
    {
        return $this->quantity_delivered >= $this->quantity;
    }

    public function getPendingShipmentAttribute()
    {
        return $this->quantity - $this->quantity_shipped;
    }

    public function getPendingDeliveryAttribute()
    {
        return $this->quantity_shipped - $this->quantity_delivered;
    }

    public function getLineTotalAttribute()
    {
        return $this->unit_price * $this->quantity;
    }

    // Business Logic Methods
    public function markAsShipped($quantity = null)
    {
        $quantityToShip = $quantity ?? $this->pending_shipment;

        if ($quantityToShip > 0) {
            $this->increment('quantity_shipped', $quantityToShip);

            if ($this->quantity_shipped >= $this->quantity) {
                $this->update(['status' => 'shipped']);
            } elseif ($this->quantity_shipped > 0) {
                $this->update(['status' => 'partially_shipped']);
            }

            // Update order fulfillment status
            $this->order->updateFulfillmentStatus();
        }
    }

    public function markAsDelivered($quantity = null)
    {
        $quantityToDeliver = $quantity ?? $this->pending_delivery;

        if ($quantityToDeliver > 0) {
            $this->increment('quantity_delivered', $quantityToDeliver);

            if ($this->quantity_delivered >= $this->quantity) {
                $this->update(['status' => 'delivered']);
            }

            // Check if all items are delivered
            $allDelivered = $this->order->items->every(function ($item) {
                return $item->quantity_delivered >= $item->quantity;
            });

            if ($allDelivered) {
                $this->order->update([
                    'status' => 'delivered',
                    'delivered_at' => now()
                ]);
            }
        }
    }

    public function updateInventory()
    {
        if (!$this->inventory_updated && $this->product_item_id) {
            $productItem = $this->productItem;
            if ($productItem) {
                $productItem->update(['status' => 'sold']);
                $this->update([
                    'inventory_updated' => true,
                    'inventory_updated_at' => now()
                ]);
            }
        }
    }

    // Scopes
    public function scopeShipped($query)
    {
        return $query->where('status', 'shipped');
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopePendingShipment($query)
    {
        return $query->whereRaw('quantity_shipped < quantity');
    }

    public function scopePendingDelivery($query)
    {
        return $query->whereRaw('quantity_delivered < quantity_shipped');
    }
}