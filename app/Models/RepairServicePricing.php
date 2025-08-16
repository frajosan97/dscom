<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RepairServicePricing extends Pivot
{
    protected $table = 'repair_service_pricings';

    protected $fillable = [
        'price',
        'min_price',
        'max_price',
        'is_flat_rate',
        'price_notes'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'min_price' => 'decimal:2',
        'max_price' => 'decimal:2',
        'is_flat_rate' => 'boolean'
    ];
}
