<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'attendance_date',
        'clock_in',
        'clock_out',
        'mode',
        'status',
        'remarks',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'attendance_date' => 'date',
        'clock_in' => 'datetime',
        'clock_out' => 'datetime',
        'mode' => 'string',
        'status' => 'string',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'clock_in_display',
        'clock_out_display',
        'total_hours'
    ];

    /**
     * Get the user that owns the attendance record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include records for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include records for a specific date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('attendance_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include records with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Check if the attendance record is completed (has both clock in and clock out).
     */
    public function isCompleted(): bool
    {
        return !is_null($this->clock_in) && !is_null($this->clock_out);
    }

    /**
     * Check if the attendance record is for today.
     */
    public function isToday(): bool
    {
        return $this->attendance_date->isToday();
    }

    /**
     * Format clock_in time for display
     */
    public function getClockInDisplayAttribute(): ?string
    {
        return $this->clock_in ? $this->clock_in->format('h:i A') : null;
    }

    /**
     * Format clock_out time for display
     */
    public function getClockOutDisplayAttribute(): ?string
    {
        return $this->clock_out ? $this->clock_out->format('h:i A') : null;
    }

    /**
     * Calculate total hours worked
     */
    public function getTotalHoursAttribute(): ?string
    {
        if ($this->clock_in && $this->clock_out) {
            $start = $this->clock_in;
            $end = $this->clock_out;

            // Handle overnight shifts
            if ($end->lessThan($start)) {
                $end->addDay();
            }

            $diff = $start->diff($end);
            return sprintf('%02d:%02d', $diff->h + ($diff->days * 24), $diff->i);
        }

        return null;
    }
}
