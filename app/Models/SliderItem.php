<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SliderItem extends Model
{
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
        'content_position' => 'array',
        'is_active' => 'boolean',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'custom_fields' => 'array',
    ];

    public function slider(): BelongsTo
    {
        return $this->belongsTo(Slider::class);
    }
}
