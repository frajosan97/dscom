<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'status',
        'previous_status',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Relationships
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Computed Attributes
    public function getStatusChangeDescriptionAttribute()
    {
        if ($this->previous_status) {
            return "Changed from {$this->previous_status} to {$this->status}";
        }

        return "Set to {$this->status}";
    }

    // Business Logic Methods
    public static function recordStatusChange($order, $newStatus, $userId = null, $notes = null)
    {
        return self::create([
            'order_id' => $order->id,
            'user_id' => $userId,
            'status' => $newStatus,
            'previous_status' => $order->status,
            'notes' => $notes,
        ]);
    }

    // Scopes
    public function scopeForOrder($query, $orderId)
    {
        return $query->where('order_id', $orderId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}