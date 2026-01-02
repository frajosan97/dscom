<?php

namespace App\Models\Erp\Crm;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Feedback extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'order_id',
        'product_id',
        'customer_name',
        'customer_email',
        'subject',
        'message',
        'rating',
        'status',
        'is_anonymous',
        'is_featured',
        'admin_response',
        'responded_by',
        'responded_at',
        'attachments',
        'source',
        'metadata',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_anonymous' => 'boolean',
        'is_featured' => 'boolean',
        'attachments' => 'array',
        'responded_at' => 'datetime',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'stars_html',
        'short_message',
        'helpful_count',
        'unhelpful_count',
    ];

    // Relationships
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function responder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responded_by');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(FeedbackRating::class);
    }

    // public function votes(): HasMany
    // {
    //     return $this->hasMany(FeedbackVote::class);
    // }

    // Accessors
    public function getStarsHtmlAttribute(): string
    {
        $stars = str_repeat('⭐', $this->rating);
        return $stars . " <small class='text-muted'>({$this->rating}/5)</small>";
    }

    public function getShortMessageAttribute(): string
    {
        return strlen($this->message) > 100 
            ? substr($this->message, 0, 100) . '...' 
            : $this->message;
    }

    public function getHelpfulCountAttribute(): int
    {
        return $this->votes()->where('is_helpful', true)->count();
    }

    public function getUnhelpfulCountAttribute(): int
    {
        return $this->votes()->where('is_helpful', false)->count();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeReviewed($query)
    {
        return $query->where('status', 'reviewed');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeWithHighRating($query, $minRating = 4)
    {
        return $query->where('rating', '>=', $minRating);
    }

    public function scopeForProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeFromCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    // Methods
    public function markAsReviewed($response = null, $userId = null): void
    {
        $this->update([
            'status' => 'reviewed',
            'admin_response' => $response,
            'responded_by' => $userId,
            'responded_at' => now(),
        ]);
    }

    public function toggleFeatured(): void
    {
        $this->update(['is_featured' => !$this->is_featured]);
    }

    public function calculateAverageAspectRating(): array
    {
        return $this->ratings()
            ->selectRaw('aspect, AVG(rating) as average')
            ->groupBy('aspect')
            ->pluck('average', 'aspect')
            ->toArray();
    }
}