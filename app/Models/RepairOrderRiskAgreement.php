<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RepairOrderRiskAgreement extends Model
{
    use HasFactory;

    protected $fillable = [
        'repair_order_id',
        'data_loss_accepted',
        'further_damage_accepted',
        'parts_replacement_accepted',
        'diagnostic_fee_accepted',
        'terms_accepted',
        'signed_at',
        'customer_signature',
    ];

    protected $casts = [
        'data_loss_accepted' => 'boolean',
        'further_damage_accepted' => 'boolean',
        'parts_replacement_accepted' => 'boolean',
        'diagnostic_fee_accepted' => 'boolean',
        'terms_accepted' => 'boolean',
        'signed_at' => 'datetime',
    ];

    /**
     * Get the repair order that owns the risk agreement.
     */
    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }
}