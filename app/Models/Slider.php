<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Slider extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'is_active',
        'autoplay',
        'autoplay_speed',
        'arrows',
        'dots',
        'infinite',
        'slides_to_show',
        'slides_to_scroll',
        'breakpoints',
        'custom_settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'autoplay' => 'boolean',
        'arrows' => 'boolean',
        'dots' => 'boolean',
        'infinite' => 'boolean',
        'breakpoints' => 'array',
        'custom_settings' => 'array',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(SliderItem::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            $category->slug = $category->generateUniqueSlug($category->name);
        });

        static::updating(function ($category) {
            if ($category->isDirty('name')) {
                $category->slug = $category->generateUniqueSlug($category->name);
            }
        });
    }

    public function generateUniqueSlug($name)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (
            static::where('slug', $slug)
            ->when($this->exists, fn($query) => $query->where('id', '!=', $this->id))
            ->exists()
        ) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return $slug;
    }
}
