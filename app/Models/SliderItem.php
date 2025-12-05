<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SliderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'slider_id',
        'title',
        'subtitle',
        'description',
        'image',
        'mobile_image',
        'video_url',
        'button_text',
        'button_url',
        'secondary_button_text',
        'secondary_button_url',
        'order',
        'is_active',
        'content_position',
        'text_color',
        'overlay_color',
        'overlay_opacity',
        'start_at',
        'end_at',
        'custom_fields',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
        'overlay_opacity' => 'integer',
        'content_position' => 'array',
        'custom_fields' => 'array',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    // Relationships
    public function slider(): BelongsTo
    {
        return $this->belongsTo(Slider::class);
    }

    // Computed Attributes
    public function getIsCurrentlyActiveAttribute()
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->start_at && $this->start_at->gt($now)) {
            return false;
        }

        if ($this->end_at && $this->end_at->lt($now)) {
            return false;
        }

        return true;
    }

    public function getHasButtonAttribute()
    {
        return !empty($this->button_text) && !empty($this->button_url);
    }

    public function getHasSecondaryButtonAttribute()
    {
        return !empty($this->secondary_button_text) && !empty($this->secondary_button_url);
    }

    public function getHasVideoAttribute()
    {
        return !empty($this->video_url);
    }

    public function getHasMobileImageAttribute()
    {
        return !empty($this->mobile_image);
    }

    public function getImageUrlAttribute()
    {
        return asset('storage/' . $this->image);
    }

    public function getMobileImageUrlAttribute()
    {
        return $this->mobile_image ? asset('storage/' . $this->mobile_image) : $this->image_url;
    }

    public function getOverlayStyleAttribute()
    {
        if (!$this->overlay_color) {
            return null;
        }

        $opacity = $this->overlay_opacity ? $this->overlay_opacity / 100 : 0.5;

        return [
            'background-color' => $this->overlay_color,
            'opacity' => $opacity,
        ];
    }

    public function getTextStyleAttribute()
    {
        return [
            'color' => $this->text_color,
        ];
    }

    public function getContentPositionClassAttribute()
    {
        $position = $this->content_position ?? ['horizontal' => 'center', 'vertical' => 'center'];

        $horizontal = $position['horizontal'] ?? 'center';
        $vertical = $position['vertical'] ?? 'center';

        return "text-{$horizontal} align-{$vertical}";
    }

    // Business Logic Methods
    public function activate()
    {
        $this->update(['is_active' => true]);
    }

    public function deactivate()
    {
        $this->update(['is_active' => false]);
    }

    public function moveUp()
    {
        $previousItem = $this->slider->items()
            ->where('order', '<', $this->order)
            ->orderBy('order', 'desc')
            ->first();

        if ($previousItem) {
            $currentOrder = $this->order;
            $this->update(['order' => $previousItem->order]);
            $previousItem->update(['order' => $currentOrder]);
        }
    }

    public function moveDown()
    {
        $nextItem = $this->slider->items()
            ->where('order', '>', $this->order)
            ->orderBy('order', 'asc')
            ->first();

        if ($nextItem) {
            $currentOrder = $this->order;
            $this->update(['order' => $nextItem->order]);
            $nextItem->update(['order' => $currentOrder]);
        }
    }

    public function duplicate()
    {
        $newItem = $this->replicate();
        $newItem->order = $this->slider->items()->max('order') + 1;
        $newItem->title = $this->title . ' (Copy)';
        $newItem->save();

        return $newItem;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrentlyActive($query)
    {
        $now = now();

        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_at')
                    ->orWhere('start_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_at')
                    ->orWhere('end_at', '>=', $now);
            });
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('id');
    }

    public function scopeWithButtons($query)
    {
        return $query->whereNotNull('button_text')
            ->whereNotNull('button_url');
    }

    public function scopeWithVideo($query)
    {
        return $query->whereNotNull('video_url');
    }

    public function scopeForSlider($query, $sliderId)
    {
        return $query->where('slider_id', $sliderId);
    }

    public function scopeScheduled($query)
    {
        return $query->whereNotNull('start_at')
            ->orWhereNotNull('end_at');
    }

    public function scopeExpired($query)
    {
        return $query->where('end_at', '<', now());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_at', '>', now());
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('title', 'like', "%{$search}%")
            ->orWhere('subtitle', 'like', "%{$search}%")
            ->orWhere('description', 'like', "%{$search}%");
    }
}