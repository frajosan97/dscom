<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RepairOrderComplaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'repair_order_id',
        'complaint',
        'remarks',
    ];

    /**
     * Get the repair order that owns the complaint.
     */
    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }
}