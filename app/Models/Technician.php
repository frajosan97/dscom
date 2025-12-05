<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Technician extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialization',
        'skills',
        'certification',
        'experience_years',
        'service_area',
        'is_available',
        'hourly_rate',
        'notes',
    ];

    protected $casts = [
        'skills' => 'array',
        'is_available' => 'boolean',
        'hourly_rate' => 'decimal:2',
        'experience_years' => 'integer',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}