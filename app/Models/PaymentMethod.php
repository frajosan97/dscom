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
        'metadata'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'requires_approval' => 'boolean',
        'processing_fee' => 'decimal:2',
        'metadata' => 'array'
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
