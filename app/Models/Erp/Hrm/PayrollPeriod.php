<?php

namespace App\Models\Erp\Hrm;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class PayrollPeriod extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'payroll_periods';

    protected $fillable = [
        'name',
        'type',
        'start_date',
        'end_date',
        'payment_date',
        'working_days',
        'status',
        'description',
        'closed_by',
        'closed_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'payment_date' => 'date',
        'working_days' => 'integer',
        'closed_at' => 'datetime',
    ];

    // Type constants
    const TYPE_MONTHLY = 'monthly';
    const TYPE_BIWEEKLY = 'biweekly';
    const TYPE_WEEKLY = 'weekly';
    const TYPE_DAILY = 'daily';
    const TYPE_CUSTOM = 'custom';

    // Status constants
    const STATUS_OPEN = 'open';
    const STATUS_PROCESSING = 'processing';
    const STATUS_CLOSED = 'closed';
    const STATUS_LOCKED = 'locked';

    public static function getTypes()
    {
        return [
            self::TYPE_MONTHLY,
            self::TYPE_BIWEEKLY,
            self::TYPE_WEEKLY,
            self::TYPE_DAILY,
            self::TYPE_CUSTOM,
        ];
    }

    public static function getStatuses()
    {
        return [
            self::STATUS_OPEN,
            self::STATUS_PROCESSING,
            self::STATUS_CLOSED,
            self::STATUS_LOCKED,
        ];
    }

    // Relationships
    public function salaries()
    {
        return $this->hasMany(Salary::class);
    }

    public function closedByUser()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', self::STATUS_OPEN);
    }

    public function scopeClosed($query)
    {
        return $query->where('status', self::STATUS_CLOSED);
    }

    public function scopeCurrent($query)
    {
        $now = Carbon::now();
        return $query->where('start_date', '<=', $now)
            ->where('end_date', '>=', $now)
            ->where('status', self::STATUS_OPEN);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', Carbon::now())
            ->where('status', self::STATUS_OPEN);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Methods
    public function isOpen()
    {
        return $this->status === self::STATUS_OPEN;
    }

    public function isClosed()
    {
        return $this->status === self::STATUS_CLOSED;
    }

    public function close($userId)
    {
        $this->update([
            'status' => self::STATUS_CLOSED,
            'closed_by' => $userId,
            'closed_at' => now(),
        ]);
    }

    public function getDurationInDays()
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    public function getFormattedPeriod()
    {
        return $this->start_date->format('M d, Y') . ' - ' . $this->end_date->format('M d, Y');
    }

    public static function createMonthlyPeriod($month, $year)
    {
        $startDate = Carbon::create($year, $month, 1);
        $endDate = $startDate->copy()->endOfMonth();

        return self::create([
            'name' => $startDate->format('F Y'),
            'type' => self::TYPE_MONTHLY,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'payment_date' => $endDate->copy()->addDays(7),
            'working_days' => $startDate->diffInWeekdays($endDate) + 1,
            'status' => self::STATUS_OPEN,
            'created_by' => Auth::id(),
        ]);
    }
}