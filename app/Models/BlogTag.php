<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BlogTag extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'meta_title',
        'meta_description',
    ];

    public function blogs(): BelongsToMany
    {
        return $this->belongsToMany(Blog::class, 'blog_blog_tag');
    }
}
