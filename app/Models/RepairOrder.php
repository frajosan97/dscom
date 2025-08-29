<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RepairOrder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_number',
        'invoice_number',
        'customer_id',
        'branch_id',
        'repair_service_id',
        'device_type_id',
        'device_brand',
        'device_model',
        'device_serial',
        'device_age',
        'device_issue',
        'device_notes',
        'device_images',
        'device_specifications',
        'status',
        'priority',
        'diagnosis_details',
        'repair_notes',
        'technician_notes',
        'diagnosis_fee',
        'estimated_cost',
        'final_cost',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'amount_paid',
        'balance_due',
        'currency',
        'expected_completion_date',
        'completion_date',
        'delivery_date',
        'assigned_technician_id',
        'created_by',
        'custom_fields',
        'customer_feedback',
        'customer_rating',
    ];

    protected $casts = [
        'device_images' => 'array',
        'device_specifications' => 'array',
        'custom_fields' => 'array',
        'diagnosis_fee' => 'decimal:2',
        'estimated_cost' => 'decimal:2',
        'final_cost' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance_due' => 'decimal:2',
        'expected_completion_date' => 'date',
        'completion_date' => 'date',
        'delivery_date' => 'date',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_DIAGNOSIS = 'diagnosis';
    const STATUS_QUOTED = 'quoted';
    const STATUS_APPROVED = 'approved';
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

    /**
     * Calculate the progress percentage of the repair order.
     */
    public function getProgressAttribute(): int
    {
        $statusWeights = [
            self::STATUS_PENDING => 0,
            self::STATUS_DIAGNOSIS => 20,
            self::STATUS_QUOTED => 30,
            self::STATUS_APPROVED => 40,
            self::STATUS_REPAIRING => 60,
            self::STATUS_AWAITING_PARTS => 70,
            self::STATUS_AWAITING_CUSTOMER_RESPONSE => 80,
            self::STATUS_COMPLETED => 90,
            self::STATUS_DELIVERED => 100,
            self::STATUS_CANCELLED => 0,
            self::STATUS_REJECTED => 0,
        ];

        return $statusWeights[$this->status] ?? 0;
    }

    /**
     * Get the user/customer that owns the repair order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
     * Get the customer for the repair order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Get the complaint for the repair order.
     */
    public function complaint(): HasOne
    {
        return $this->hasOne(RepairOrderComplaint::class);
    }

    /**
     * Get the initial checks for the repair order.
     */
    public function initialChecks(): HasOne
    {
        return $this->hasOne(RepairOrderInitialCheck::class);
    }

    /**
     * Get the physical conditions for the repair order.
     */
    public function physicalConditions(): HasOne
    {
        return $this->hasOne(RepairOrderPhysicalCondition::class);
    }

    /**
     * Get the risk agreements for the repair order.
     */
    public function riskAgreements(): HasOne
    {
        return $this->hasOne(RepairOrderRiskAgreement::class);
    }

    /**
     * Get the accessories for the repair order.
     */
    public function accessories(): HasMany
    {
        return $this->hasMany(RepairOrderAccessory::class);
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
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
        return $this->hasMany(RepairOrderPayment::class);
    }

    /**
     * Check if the repair order is completed.
     */
    public function getIsCompletedAttribute(): bool
    {
        return in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_DELIVERED]);
    }

    /**
     * Check if the repair order is active.
     */
    public function getIsActiveAttribute(): bool
    {
        return !in_array($this->status, [self::STATUS_CANCELLED, self::STATUS_REJECTED, self::STATUS_DELIVERED]);
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
    public function scopeForCustomer($query, $userId)
    {
        return $query->where('customer_id', $userId);
    }
}