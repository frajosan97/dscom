<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    use SoftDeletes;

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
    ];

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

    public function getSocialLinksAttribute(): array
    {
        return [
            'website' => $this->website_url,
            'facebook' => $this->facebook_url,
            'instagram' => $this->instagram_url,
            'twitter' => $this->twitter_url,
        ];
    }
}
