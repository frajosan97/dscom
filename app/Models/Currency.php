<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'symbol',
        'symbol_position',
        'decimal_places',
        'thousands_separator',
        'decimal_separator',
        'format',
        'exchange_rate',
        'auto_update',
        'exchange_rate_service',
        'last_updated',
        'is_active',
        'is_default',
        'iso_numeric',
        'subunit',
        'subunit_to_unit',
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:6',
        'auto_update' => 'boolean',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'decimal_places' => 'integer',
        'subunit_to_unit' => 'integer',
        'last_updated' => 'datetime',
    ];

    // Relationships
    // Currencies can be used by branches, orders, products, etc.

    /**
     * Get the default currency
     */
    public static function getDefault()
    {
        return static::where('is_default', true)->first();
    }

    /**
     * Get active currencies
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Format amount according to currency settings
     */
    public function format($amount)
    {
        $formattedAmount = number_format(
            $amount,
            $this->decimal_places,
            $this->decimal_separator,
            $this->thousands_separator
        );

        return str_replace(
            ['{symbol}', '{amount}'],
            [$this->symbol, $formattedAmount],
            $this->format
        );
    }
}