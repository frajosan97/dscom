<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RepairOrderInitialCheck extends Model
{
    use HasFactory;

    protected $fillable = [
        'repair_order_id',
        'power_on',
        'visible_damage',
        'buttons_working',
        'screen_condition',
        'battery_condition',
        'other_notes',
    ];

    protected $casts = [
        'power_on' => 'boolean',
        'buttons_working' => 'boolean',
    ];

    /**
     * Get the repair order that owns the initial check.
     */
    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }
}