<?php

namespace App\Models\Erp\Crm;

use App\Models\Erp\Crm\Feedback;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'feedback_id',
        'aspect',
        'rating',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    // Relationships
    public function feedback(): BelongsTo
    {
        return $this->belongsTo(Feedback::class);
    }
}