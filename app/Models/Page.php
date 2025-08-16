<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'canonical_url',
        'og_image',
        'template',
        'is_active',
        'is_protected',
        'show_in_nav',
        'nav_order',
        'parent_id',
        'lft',
        'rgt',
        'depth',
        'published_at',
        'unpublished_at',
        'custom_fields',
        'scripts',
    ];

    protected $casts = [
        'meta_keywords' => 'array',
        'custom_fields' => 'array',
        'scripts' => 'array',
        'published_at' => 'datetime',
        'unpublished_at' => 'datetime',
        'is_active' => 'boolean',
        'is_protected' => 'boolean',
        'show_in_nav' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Page::class, 'parent_id');
    }

    public function menuItems()
    {
        return $this->morphMany(MenuItem::class, 'linkable');
    }
}
