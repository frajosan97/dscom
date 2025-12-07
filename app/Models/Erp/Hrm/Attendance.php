<?php

namespace App\Models\Erp\Hrm;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendances';

    protected $fillable = [
        'employee_id',
        'date',
        'check_in',
        'check_out',
        'status',
        'hours_worked',
        'overtime_hours',
        'late_minutes',
        'early_leaving_minutes',
        'notes',
        'approved_by',
        'approved_at',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'hours_worked' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'late_minutes' => 'integer',
        'early_leaving_minutes' => 'integer',
        'approved_at' => 'datetime',
    ];

    // Status constants
    const STATUS_PRESENT = 'present';
    const STATUS_ABSENT = 'absent';
    const STATUS_HALF_DAY = 'half_day';
    const STATUS_LEAVE = 'leave';
    const STATUS_HOLIDAY = 'holiday';
    const STATUS_WEEKEND = 'weekend';

    public static function getStatuses()
    {
        return [
            self::STATUS_PRESENT,
            self::STATUS_ABSENT,
            self::STATUS_HALF_DAY,
            self::STATUS_LEAVE,
            self::STATUS_HOLIDAY,
            self::STATUS_WEEKEND,
        ];
    }

    // Relationships
    public function employee()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopePresent($query)
    {
        return $query->where('status', self::STATUS_PRESENT);
    }

    public function scopeAbsent($query)
    {
        return $query->where('status', self::STATUS_ABSENT);
    }

    public function scopeHalfDay($query)
    {
        return $query->where('status', self::STATUS_HALF_DAY);
    }

    public function scopeLeave($query)
    {
        return $query->where('status', self::STATUS_LEAVE);
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    // Methods
    public function calculateSalaryAdjustment($dailyRate)
    {
        switch ($this->status) {
            case self::STATUS_ABSENT:
                return $dailyRate;
            case self::STATUS_HALF_DAY:
                return $dailyRate / 2;
            case self::STATUS_PRESENT:
                // Check for late deductions
                $lateDeduction = 0;
                if ($this->late_minutes > 30) {
                    // Deduct 1 hour for late > 30 minutes
                    $lateDeduction = $dailyRate / 8; // Assuming 8-hour workday
                }
                return $lateDeduction;
            default:
                return 0;
        }
    }

    public function isApproved()
    {
        return !is_null($this->approved_at);
    }
}