<?php

namespace App\Models\Erp\Crm;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'user_id',
        'customer_id',
        'message',
        'is_internal_note',
        'attachments',
    ];

    protected $casts = [
        'is_internal_note' => 'boolean',
        'attachments' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(related: User::class);
    }

    // Accessors
    public function getIsFromStaffAttribute(): bool
    {
        return !is_null($this->user_id) && $this->user->isStaff();
    }

    public function getIsFromCustomerAttribute(): bool
    {
        return !is_null($this->customer_id);
    }

    public function getSenderNameAttribute(): string
    {
        if ($this->is_internal_note) {
            return $this->user->name . ' (Internal Note)';
        }

        return $this->is_from_staff
            ? $this->user->name . ' (Support)'
            : $this->customer->name ?? $this->ticket->customer_name;
    }
}