<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Blog extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'featured_image',
        'gallery_images',
        'video_url',
        'user_id',
        'author_id',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'canonical_url',
        'og_image',
        'is_published',
        'is_featured',
        'published_at',
        'unpublished_at',
        'views',
        'shares',
        'reading_time',
        'custom_fields',
        'related_posts',
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'meta_keywords' => 'array',
        'custom_fields' => 'array',
        'related_posts' => 'array',
        'published_at' => 'datetime',
        'unpublished_at' => 'datetime',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(BlogCategory::class, 'blog_blog_category');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(BlogTag::class, 'blog_blog_tag');
    }

    public function menuItems()
    {
        return $this->morphMany(MenuItem::class, 'linkable');
    }
}
