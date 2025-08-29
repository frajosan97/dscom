<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class RepairOrder extends Model
{
    use SoftDeletes;

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_RECEIVED = 'received';
    const STATUS_REPAIRING = 'repairing';
    const STATUS_AWAITING_PARTS = 'awaiting_parts';
    const STATUS_AWAITING_CUSTOMER_RESPONSE = 'awaiting_customer_response';
    const STATUS_COMPLETED = 'completed';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REJECTED = 'rejected';

    // Priority constants
    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    protected $fillable = [
        'order_number',
        'repair_service_id',
        'device_type_id',
        'device_metadata',
        'initial_check_metadata',
        'status',
        'priority',
        'diagnosis_fee',
        'estimated_cost',
        'final_cost',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'amount_paid',
        'expected_completion_date',
        'completion_date',
        'delivery_date',
        'customer_id',
        'branch_id',
        'assigned_technician_id',
        'created_by',
        'diagnosis_details',
        'repair_notes',
        'technician_notes',
        'custom_fields',
        'customer_feedback',
        'customer_rating',
    ];

    protected $casts = [
        'device_metadata' => 'array',
        'initial_check_metadata' => 'array',
        'custom_fields' => 'array',
        'diagnosis_fee' => 'decimal:2',
        'estimated_cost' => 'decimal:2',
        'final_cost' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'expected_completion_date' => 'date',
        'completion_date' => 'date',
        'delivery_date' => 'date',
    ];

    protected $appends = ['progress', 'is_completed', 'is_active', 'balance_due'];

    /**
     * Calculate the balance due for the repair order.
     */
    protected function balanceDue(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->total_amount - $this->amount_paid
        );
    }

    /**
     * Calculate the progress percentage of the repair order.
     */
    protected function progress(): Attribute
    {
        return Attribute::make(
            get: function () {
                $statusWeights = [
                    self::STATUS_PENDING => 10,
                    self::STATUS_RECEIVED => 20,
                    self::STATUS_REPAIRING => 50,
                    self::STATUS_AWAITING_PARTS => 60,
                    self::STATUS_AWAITING_CUSTOMER_RESPONSE => 70,
                    self::STATUS_COMPLETED => 90,
                    self::STATUS_DELIVERED => 100,
                    self::STATUS_CANCELLED => 0,
                    self::STATUS_REJECTED => 0,
                ];

                return $statusWeights[$this->status] ?? 0;
            }
        );
    }

    /**
     * Check if the repair order is completed.
     */
    protected function isCompleted(): Attribute
    {
        return Attribute::make(
            get: fn() => in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_DELIVERED])
        );
    }

    /**
     * Check if the repair order is active.
     */
    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn() => !in_array($this->status, [self::STATUS_CANCELLED, self::STATUS_REJECTED, self::STATUS_DELIVERED])
        );
    }

    /**
     * Get the customer for the repair order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    /**
     * Get the branch associated with the repair order.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the repair service associated with the repair order.
     */
    public function repairService(): BelongsTo
    {
        return $this->belongsTo(RepairService::class);
    }

    /**
     * Get the device type associated with the repair order.
     */
    public function deviceType(): BelongsTo
    {
        return $this->belongsTo(RepairServiceDeviceType::class, 'device_type_id');
    }

    /**
     * Get the technician assigned to the repair order.
     */
    public function assignedTechnician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    /**
     * Get the user that created the repair order.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the status history for the repair order.
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(RepairOrderStatusHistory::class);
    }

    /**
     * Get the payments for the repair order.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class,'order_id');
    }

    /**
     * Scope a query to only include active repair orders.
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_CANCELLED, self::STATUS_REJECTED, self::STATUS_DELIVERED]);
    }

    /**
     * Scope a query to only include completed repair orders.
     */
    public function scopeCompleted($query)
    {
        return $query->whereIn('status', [self::STATUS_COMPLETED, self::STATUS_DELIVERED]);
    }

    /**
     * Scope a query to only include pending repair orders.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope a query to only include repair orders assigned to a specific technician.
     */
    public function scopeAssignedTo($query, $technicianId)
    {
        return $query->where('assigned_technician_id', $technicianId);
    }

    /**
     * Scope a query to only include repair orders for a specific customer.
     */
    public function scopeForCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }
}