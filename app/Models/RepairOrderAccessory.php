<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RepairOrderAccessory extends Model
{
    use HasFactory;

    protected $fillable = [
        'repair_order_id',
        'name',
        'quantity',
        'condition',
        'notes',
    ];

    /**
     * Get the repair order that owns the accessory.
     */
    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }
}