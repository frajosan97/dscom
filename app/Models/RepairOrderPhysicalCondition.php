<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RepairOrderPhysicalCondition extends Model
{
    use HasFactory;

    protected $fillable = [
        'repair_order_id',
        'screen_condition',
        'body_condition',
        'ports_condition',
        'buttons_condition',
        'accessories_included',
        'additional_notes',
    ];

    /**
     * Get the repair order that owns the physical condition.
     */
    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }
}