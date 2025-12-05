<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'meta_title',
        'meta_description',
        'logo',
        'website_url',
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'is_active',
        'is_featured',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        // Auto-generate slug on create
        static::creating(function ($brand) {
            if (empty($brand->slug)) {
                $brand->slug = static::generateSlug($brand->name);
            }
        });

        // Auto-update slug if name changes
        static::updating(function ($brand) {
            if ($brand->isDirty('name')) {
                $brand->slug = static::generateSlug($brand->name);
            }
        });
    }

    /**
     * Generate a unique slug
     */
    protected static function generateSlug($name)
    {
        $slug = Str::slug($name);
        $original = $slug;
        $count = 1;

        // Ensure uniqueness
        while (static::where('slug', $slug)->exists()) {
            $slug = $original . '-' . $count++;
        }

        return $slug;
    }

    // Relationships
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }
}
