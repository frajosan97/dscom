<?php

namespace App\Models\Erp\Hrm;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendances';

    /**
     * Mass assignable attributes
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
     * Attribute casting
     */
    protected $casts = [
        'attendance_date' => 'date',
        'clock_in' => 'datetime:H:i:s',
        'clock_out' => 'datetime:H:i:s',
    ];

    /**
     * Attendance Modes
     */
    public const MODE_MANUAL = 'manual';
    public const MODE_FINGERPRINT = 'fingerprint';

    /**
     * Attendance Statuses
     */
    public const STATUS_PRESENT = 'present';
    public const STATUS_ABSENT = 'absent';
    public const STATUS_LATE = 'late';
    public const STATUS_HALF_DAY = 'half-day';

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOnDate($query, $date)
    {
        return $query->whereDate('attendance_date', $date);
    }

    public function scopeBetweenDates($query, $start, $end)
    {
        return $query->whereBetween('attendance_date', [$start, $end]);
    }

    public function scopePresent($query)
    {
        return $query->where('status', self::STATUS_PRESENT);
    }

    public function scopeAbsent($query)
    {
        return $query->where('status', self::STATUS_ABSENT);
    }

    public function scopeLate($query)
    {
        return $query->where('status', self::STATUS_LATE);
    }

    public function hasClockedOut(): bool
    {
        return !is_null($this->clock_out);
    }

    public function workedMinutes(): ?int
    {
        if (!$this->clock_in || !$this->clock_out) {
            return null;
        }

        return $this->clock_in->diffInMinutes($this->clock_out);
    }
}
