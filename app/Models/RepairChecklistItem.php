<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairChecklistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'checklist_id',
        'name',
        'description',
        'is_required',
        'order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'order' => 'integer',
    ];

    // Relationships
    public function checklist(): BelongsTo
    {
        return $this->belongsTo(RepairChecklist::class, 'checklist_id');
    }

    // Computed Attributes
    public function getStatusBadgeAttribute()
    {
        return $this->is_required ? 'Required' : 'Optional';
    }

    // Scopes
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeOptional($query)
    {
        return $query->where('is_required', false);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }
}