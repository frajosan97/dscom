<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BlogCategory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'icon',
        'parent_id',
        'lft',
        'rgt',
        'depth',
        'meta_title',
        'meta_description',
        'is_active',
        'show_in_menu',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_in_menu' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(BlogCategory::class, 'parent_id');
    }

    public function blogs(): BelongsToMany
    {
        return $this->belongsToMany(Blog::class, 'blog_blog_category');
    }

    public function menuItems()
    {
        return $this->morphMany(MenuItem::class, 'linkable');
    }
}
