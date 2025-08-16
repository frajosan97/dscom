<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Pages Table - Enhanced CMS Pages
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content');

            // SEO Optimization
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('meta_keywords')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_image')->nullable();

            // Page Configuration
            $table->string('template')->default('default');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_protected')->default(false);
            $table->boolean('show_in_nav')->default(true);
            $table->integer('nav_order')->default(0);

            // Hierarchy
            $table->foreignId('parent_id')->nullable()->constrained('pages')->onDelete('set null');
            $table->integer('lft')->nullable()->index();
            $table->integer('rgt')->nullable()->index();
            $table->integer('depth')->nullable();

            // Publishing Control
            $table->timestamp('published_at')->nullable();
            $table->timestamp('unpublished_at')->nullable();

            // Additional Fields
            $table->json('custom_fields')->nullable();
            $table->json('scripts')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['slug', 'is_active']);
            $table->index(['parent_id', 'nav_order']);
        });

        // Blogs Table - Enhanced Blog Management
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');

            // Media
            $table->string('featured_image')->nullable();
            $table->json('gallery_images')->nullable();
            $table->string('video_url')->nullable();

            // Author Information
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('author_id')->nullable()->constrained('users')->onDelete('set null');

            // SEO Optimization
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('meta_keywords')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_image')->nullable();

            // Publishing Control
            $table->boolean('is_published')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('unpublished_at')->nullable();

            // Engagement Metrics
            $table->integer('views')->default(0);
            $table->integer('shares')->default(0);
            $table->float('reading_time')->nullable();

            // Additional Fields
            $table->json('custom_fields')->nullable();
            $table->json('related_posts')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['slug', 'is_published']);
            $table->index(['published_at', 'is_featured']);
        });

        // Blog Categories Table - Enhanced with Hierarchy
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Visual Representation
            $table->string('image')->nullable();
            $table->string('icon')->nullable();

            // Hierarchy
            $table->foreignId('parent_id')->nullable()->constrained('blog_categories')->onDelete('set null');
            $table->integer('lft')->nullable()->index();
            $table->integer('rgt')->nullable()->index();
            $table->integer('depth')->nullable();

            // SEO Optimization
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('show_in_menu')->default(true);
            $table->integer('order')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['slug', 'is_active']);
        });

        // Blog Tags Table
        Schema::create('blog_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
        });

        // Blog to Category Relationship
        Schema::create('blog_blog_category', function (Blueprint $table) {
            $table->foreignId('blog_id')->constrained()->onDelete('cascade');
            $table->foreignId('blog_category_id')->constrained()->onDelete('cascade');
            $table->primary(['blog_id', 'blog_category_id']);
        });

        // Blog to Tag Relationship
        Schema::create('blog_blog_tag', function (Blueprint $table) {
            $table->foreignId('blog_id')->constrained()->onDelete('cascade');
            $table->foreignId('blog_tag_id')->constrained()->onDelete('cascade');
            $table->primary(['blog_id', 'blog_tag_id']);
        });

        // Sliders Table - Enhanced for Multiple Slider Types
        Schema::create('sliders', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type')->default('default'); // hero, banner, testimonial, etc.

            // Display Settings
            $table->boolean('is_active')->default(true);
            $table->boolean('autoplay')->default(true);
            $table->integer('autoplay_speed')->default(3000);
            $table->boolean('arrows')->default(true);
            $table->boolean('dots')->default(false);
            $table->boolean('infinite')->default(true);

            // Responsive Settings
            $table->integer('slides_to_show')->default(1);
            $table->integer('slides_to_scroll')->default(1);

            // Additional Fields
            $table->json('breakpoints')->nullable();
            $table->json('custom_settings')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['slug', 'is_active']);
        });

        // Slider Items Table - Enhanced with Multiple Content Types
        Schema::create('slider_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('slider_id')->constrained()->onDelete('cascade');

            // Content
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();

            // Media
            $table->string('image');
            $table->string('mobile_image')->nullable();
            $table->string('video_url')->nullable();

            // Actions
            $table->string('button_text')->nullable();
            $table->string('button_url')->nullable();
            $table->string('secondary_button_text')->nullable();
            $table->string('secondary_button_url')->nullable();

            // Display Settings
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('content_position')->nullable();
            $table->string('text_color')->default('#ffffff');
            $table->string('overlay_color')->nullable();
            $table->integer('overlay_opacity')->nullable();

            // Scheduling
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();

            // Additional Fields
            $table->json('custom_fields')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['slider_id', 'order']);
        });

        // Menu Management System
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('location')->nullable(); // header, footer, sidebar, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Menu Items
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('menu_items')->onDelete('cascade');

            // Content
            $table->string('title');
            $table->string('url')->nullable();
            $table->string('target')->default('_self');
            $table->string('icon')->nullable();

            // Relationship
            $table->string('linkable_type')->nullable(); // Page, Blog, Category, etc.
            $table->unsignedBigInteger('linkable_id')->nullable();

            // Display
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('custom_classes')->nullable();

            // Hierarchy
            $table->integer('lft')->nullable()->index();
            $table->integer('rgt')->nullable()->index();
            $table->integer('depth')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['menu_id', 'parent_id', 'order']);
            $table->index(['linkable_type', 'linkable_id']);
        });

        // Content Blocks - Reusable Content Elements
        Schema::create('content_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type'); // html, text, image, video, etc.
            $table->longText('content')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_blocks');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('slider_items');
        Schema::dropIfExists('sliders');
        Schema::dropIfExists('blog_blog_tag');
        Schema::dropIfExists('blog_blog_category');
        Schema::dropIfExists('blog_tags');
        Schema::dropIfExists('blog_categories');
        Schema::dropIfExists('blogs');
        Schema::dropIfExists('pages');
    }
};
