<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slider_items');
        Schema::dropIfExists('sliders');
    }
};
