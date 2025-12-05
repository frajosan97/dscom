<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Slider extends Model
{
    use HasFactory, SoftDeletes;

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
        'autoplay_speed' => 'integer',
        'slides_to_show' => 'integer',
        'slides_to_scroll' => 'integer',
        'breakpoints' => 'array',
        'custom_settings' => 'array',
    ];

    /**
     * Boot method for auto-generating slugs
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($slider) {
            $slider->generateSlug();
        });

        static::updating(function ($slider) {
            // Regenerate slug only if name has changed and slug wasn't manually modified
            if ($slider->isDirty('name') && !$slider->isDirty('slug')) {
                $slider->generateSlug();
            }
        });
    }

    /**
     * Generate a unique slug for the slider
     */
    public function generateSlug()
    {
        $slug = Str::slug($this->name);
        $originalSlug = $slug;
        $count = 1;

        // Check if slug already exists
        while (
            static::where('slug', $slug)
                ->where('id', '!=', $this->id ?? null)
                ->withTrashed() // Include soft deleted records to avoid conflicts
                ->exists()
        ) {
            $slug = $originalSlug . '-' . $count++;
        }

        $this->slug = $slug;
    }

    /**
     * Set the name attribute and auto-generate slug if needed
     */
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;

        // Auto-generate slug only if creating or if slug is empty
        if (!$this->exists || empty($this->slug)) {
            $this->generateSlug();
        }
    }

    // Relationships
    public function items(): HasMany
    {
        return $this->hasMany(SliderItem::class);
    }

    // Computed Attributes
    public function getActiveItemsCountAttribute()
    {
        return $this->items()->active()->count();
    }

    public function getIsHeroSliderAttribute()
    {
        return $this->type === 'hero';
    }

    public function getIsBannerSliderAttribute()
    {
        return $this->type === 'banner';
    }

    public function getIsTestimonialSliderAttribute()
    {
        return $this->type === 'testimonial';
    }

    public function getSliderConfigAttribute()
    {
        return [
            'autoplay' => $this->autoplay,
            'autoplaySpeed' => $this->autoplay_speed,
            'arrows' => $this->arrows,
            'dots' => $this->dots,
            'infinite' => $this->infinite,
            'slidesToShow' => $this->slides_to_show,
            'slidesToScroll' => $this->slides_to_scroll,
            'breakpoints' => $this->breakpoints ?? [],
        ];
    }

    // Business Logic Methods
    public function getActiveItems()
    {
        return $this->items()
            ->active()
            ->ordered()
            ->get();
    }

    public function hasActiveItems()
    {
        return $this->items()->active()->exists();
    }

    /**
     * Find a slider by its slug
     */
    public static function findBySlug($slug)
    {
        return static::where('slug', $slug)->first();
    }

    /**
     * Find an active slider by its slug
     */
    public static function findActiveBySlug($slug)
    {
        return static::active()->where('slug', $slug)->first();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeHero($query)
    {
        return $query->where('type', 'hero');
    }

    public function scopeBanner($query)
    {
        return $query->where('type', 'banner');
    }

    public function scopeTestimonial($query)
    {
        return $query->where('type', 'testimonial');
    }

    public function scopeWithActiveItems($query)
    {
        return $query->with([
            'items' => function ($q) {
                $q->active()->ordered();
            }
        ]);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%")
            ->orWhere('slug', 'like', "%{$search}%");
    }

    /**
     * Scope for finding by slug
     */
    public function scopeBySlug($query, $slug)
    {
        return $query->where('slug', $slug);
    }
}