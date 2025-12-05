<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentMethod extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
        'is_default',
        'requires_approval',
        'processing_fee',
        'fee_type',
        'account_number',
        'account_name',
        'bank_name',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'requires_approval' => 'boolean',
        'processing_fee' => 'decimal:2',
        'metadata' => 'array',
    ];

    // Relationships
    // Payment methods can be used in orders, transactions, etc.

    /**
     * Calculate processing fee for an amount
     */
    public function calculateFee($amount)
    {
        if ($this->fee_type === 'percentage') {
            return ($amount * $this->processing_fee) / 100;
        }

        return $this->processing_fee;
    }

    /**
     * Scope for active payment methods
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for default payment method
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}