<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Technician extends Model
{
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

    /**
     * Get the user that owns the technician profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the repair orders assigned to the technician.
     */
    public function repairOrders(): HasMany
    {
        return $this->hasMany(RepairOrder::class, 'assigned_technician_id', 'user_id');
    }

    /**
     * Get the completed repair orders count.
     */
    public function getCompletedOrdersCountAttribute(): int
    {
        return $this->repairOrders()->whereIn('status', [
            RepairOrder::STATUS_COMPLETED,
            RepairOrder::STATUS_DELIVERED
        ])->count();
    }

    /**
     * Get the active repair orders count.
     */
    public function getActiveOrdersCountAttribute(): int
    {
        return $this->repairOrders()->active()->count();
    }

    /**
     * Scope a query to only include available technicians.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope a query to only include technicians with a specific specialization.
     */
    public function scopeSpecialization($query, $specialization)
    {
        return $query->where('specialization', 'like', "%{$specialization}%");
    }

    /**
     * Get the average rating of the technician.
     */
    public function getAverageRatingAttribute(): float
    {
        return (float) $this->repairOrders()
            ->whereNotNull('customer_rating')
            ->avg('customer_rating');
    }
}