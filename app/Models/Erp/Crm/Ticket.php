<?php

namespace App\Models\Erp\Crm;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Auth;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ticket_number',
        'customer_id',
        'customer_name',
        'customer_email',
        'subject',
        'description',
        'priority',
        'status',
        'category',
        'assigned_to',
        'department_id',
        'tags',
        'first_response_time',
        'resolved_at',
        'closed_at',
        'satisfaction_score',
        'custom_fields',
    ];

    protected $casts = [
        'tags' => 'array',
        'first_response_time' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'custom_fields' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'time_to_first_response',
        'time_to_resolution',
        'last_reply_at',
        'reply_count',
    ];

    // Boot method for generating ticket number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = 'TICKET-' . strtoupper(uniqid());
            }
        });
    }

    // Relationships
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TicketReply::class)->orderBy('created_at', 'asc');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TicketActivity::class)->orderBy('created_at', 'desc');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(TicketTag::class, 'ticket_ticket_tag');
    }

    public function latestReply(): BelongsTo
    {
        return $this->belongsTo(TicketReply::class)->latestOfMany();
    }

    // Accessors
    public function getTimeToFirstResponseAttribute(): ?string
    {
        if (!$this->first_response_time) {
            return null;
        }

        $minutes = $this->created_at->diffInMinutes($this->first_response_time);

        if ($minutes < 60) {
            return "{$minutes} minutes";
        }

        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        return "{$hours}h {$remainingMinutes}m";
    }

    public function getTimeToResolutionAttribute(): ?string
    {
        if (!$this->resolved_at) {
            return null;
        }

        $minutes = $this->created_at->diffInMinutes($this->resolved_at);

        if ($minutes < 60) {
            return "{$minutes} minutes";
        }

        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        return $hours < 24
            ? "{$hours}h {$remainingMinutes}m"
            : floor($hours / 24) . ' days';
    }

    public function getLastReplyAtAttribute(): ?string
    {
        $latestReply = $this->replies()->latest()->first();
        return $latestReply ? $latestReply->created_at->diffForHumans() : null;
    }

    public function getReplyCountAttribute(): int
    {
        return $this->replies()->count();
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'critical']);
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'closed')
            ->where('status', '!=', 'resolved')
            ->where('created_at', '<', now()->subDays(3));
    }

    // Methods
    public function assignTo($userId): void
    {
        $oldAssignee = $this->assigned_to;

        $this->update(['assigned_to' => $userId]);

        // Log activity
        TicketActivity::create([
            'ticket_id' => $this->id,
            'user_id' => Auth::id(),
            'action' => 'assigned',
            'old_data' => ['assigned_to' => $oldAssignee],
            'new_data' => ['assigned_to' => $userId],
            'description' => 'Ticket assigned to ' . User::find($userId)->name,
        ]);
    }

    public function changeStatus($status): void
    {
        $oldStatus = $this->status;

        $this->update(['status' => $status]);

        // Update timestamps based on status
        if ($status === 'resolved' && !$this->resolved_at) {
            $this->update(['resolved_at' => now()]);
        }

        if ($status === 'closed' && !$this->closed_at) {
            $this->update(['closed_at' => now()]);
        }

        // Log activity
        TicketActivity::create([
            'ticket_id' => $this->id,
            'user_id' => Auth::id(),
            'action' => 'status_changed',
            'old_data' => ['status' => $oldStatus],
            'new_data' => ['status' => $status],
            'description' => "Status changed from {$oldStatus} to {$status}",
        ]);
    }

    // public function addReply($data): TicketReply
    // {
    //     $reply = $this->replies()->create(array_merge($data, [
    //         'user_id' => Auth::id(),
    //     ]));

    //     // Update first response time if this is the first staff reply
    //     if (Auth::user()->isStaff() && !$this->first_response_time) {
    //         $this->update(['first_response_time' => now()]);
    //     }

    //     // Update ticket status if needed
    //     if ($this->status === 'open' && Auth::user()->isStaff()) {
    //         $this->changeStatus('in_progress');
    //     }

    //     // Log activity
    //     TicketActivity::create([
    //         'ticket_id' => $this->id,
    //         'user_id' => Auth::id(),
    //         'action' => 'replied',
    //         'description' => 'New reply added to ticket',
    //     ]);

    //     return $reply;
    // }

    public function calculateSlaCompliance(): float
    {
        // Calculate SLA compliance based on first response time and resolution time
        // This is a simplified version - adjust based on your SLA requirements
        $score = 100;

        if ($this->first_response_time) {
            $responseTime = $this->created_at->diffInHours($this->first_response_time);
            if ($responseTime > 24) { // 24-hour SLA for first response
                $score -= 20;
            }
        }

        if ($this->resolved_at) {
            $resolutionTime = $this->created_at->diffInHours($this->resolved_at);
            if ($resolutionTime > 72) { // 72-hour SLA for resolution
                $score -= 30;
            }
        }

        return max($score, 0);
    }
}