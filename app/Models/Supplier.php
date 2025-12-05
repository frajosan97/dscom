<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'company',
        'tax_number',
        'email',
        'phone',
        'alternate_phone',
        'website',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'contact_person',
        'contact_position',
        'contact_email',
        'contact_phone',
        'currency',
        'payment_terms',
        'credit_limit',
        'is_active',
        'is_approved',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_approved' => 'boolean',
        'credit_limit' => 'decimal:2',
        'metadata' => 'array',
    ];
}