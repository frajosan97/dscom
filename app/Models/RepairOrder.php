<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RepairOrder extends Model
{
    use HasFactory, SoftDeletes;

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
        'device_metadata' => 'array',
        'initial_check_metadata' => 'array',
        'custom_fields' => 'array',
        'customer_rating' => 'integer',
    ];

    // Relationships
    public function repairService(): BelongsTo
    {
        return $this->belongsTo(RepairService::class);
    }

    public function deviceType(): BelongsTo
    {
        return $this->belongsTo(RepairServiceDeviceType::class, 'device_type_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function assignedTechnician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(RepairOrderStatusHistory::class);
    }

    public function parts(): HasMany
    {
        return $this->hasMany(RepairPart::class);
    }

    // Computed Attributes
    public function getBalanceDueAttribute()
    {
        return $this->total_amount - $this->amount_paid;
    }

    public function getIsPaidAttribute()
    {
        return $this->amount_paid >= $this->total_amount;
    }

    public function getIsCompletedAttribute()
    {
        return in_array($this->status, ['completed', 'delivered']);
    }

    public function getIsInProgressAttribute()
    {
        return in_array($this->status, ['diagnosing', 'repairing', 'awaiting_parts']);
    }

    public function getIsPendingCustomerActionAttribute()
    {
        return in_array($this->status, ['awaiting_customer_approval', 'awaiting_customer_response']);
    }

    public function getTotalPartsCostAttribute()
    {
        return $this->parts->sum('total');
    }

    // Business Logic Methods
    public function updateStatus($newStatus, $changedBy, $notes = null)
    {
        $previousStatus = $this->status;

        $this->update(['status' => $newStatus]);

        // Record status change
        RepairOrderStatusHistory::create([
            'repair_order_id' => $this->id,
            'status' => $newStatus,
            'previous_status' => $previousStatus,
            'notes' => $notes,
            'changed_by' => $changedBy,
        ]);

        // Update completion date if completed
        if (in_array($newStatus, ['completed', 'delivered']) && !$this->completion_date) {
            $this->update(['completion_date' => now()]);
        }
    }

    public function calculateTotalAmount()
    {
        $partsTotal = $this->parts()->where('status', '!=', 'returned')->sum('total');
        $serviceCost = $this->final_cost ?? $this->estimated_cost ?? 0;

        $total = $this->diagnosis_fee + $serviceCost + $partsTotal + $this->tax_amount - $this->discount_amount;

        $this->update(['total_amount' => max(0, $total)]);
    }

    public function addPayment($amount)
    {
        $this->increment('amount_paid', $amount);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->whereIn('status', ['diagnosing', 'repairing', 'awaiting_parts']);
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['completed', 'delivered']);
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeByTechnician($query, $technicianId)
    {
        return $query->where('assigned_technician_id', $technicianId);
    }

    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeOverdue($query)
    {
        return $query->where('expected_completion_date', '<', now())
            ->whereNotIn('status', ['completed', 'delivered', 'cancelled']);
    }

    public function scopeWithHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }
}