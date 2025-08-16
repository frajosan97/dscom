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
        // Visits Table - Comprehensive Visitor Tracking
        Schema::create('visits', function (Blueprint $table) {
            $table->id();

            // Visitor Identification
            $table->string('session_id')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('visitor_id')->nullable(); // Persistent visitor ID

            // Technical Information
            $table->string('ip_address', 45);
            $table->string('user_agent')->nullable();
            $table->string('device_type')->nullable(); // desktop, mobile, tablet
            $table->string('browser')->nullable();
            $table->string('browser_version')->nullable();
            $table->string('platform')->nullable();
            $table->string('platform_version')->nullable();
            $table->boolean('is_robot')->default(false);

            // Visit Details
            $table->string('referrer')->nullable();
            $table->string('referrer_domain')->nullable();
            $table->string('path');
            $table->string('query_string')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('utm_content')->nullable();

            // Geographic Information
            $table->string('country')->nullable();
            $table->string('country_code')->nullable();
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 11, 7)->nullable();

            // Timing Information
            $table->timestamp('entry_time')->useCurrent();
            $table->timestamp('exit_time')->nullable();
            $table->integer('duration')->nullable(); // in seconds

            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'entry_time']);
            $table->index(['ip_address', 'entry_time']);
            $table->index(['path', 'entry_time']);
            $table->index(['utm_source', 'utm_campaign']);
            $table->index(['country_code', 'entry_time']);
        });

        // Product Views Table - Enhanced Product Analytics
        Schema::create('product_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            // Visitor Information
            $table->string('ip_address', 45);
            $table->string('session_id')->nullable();
            $table->string('visitor_id')->nullable();

            // View Details
            $table->integer('view_duration')->nullable(); // in seconds
            $table->boolean('added_to_cart')->default(false);
            $table->boolean('added_to_wishlist')->default(false);
            $table->string('referrer')->nullable();
            $table->string('source')->nullable(); // search, category, direct, etc.

            // Device Information
            $table->string('device_type')->nullable();
            $table->string('browser')->nullable();
            $table->string('platform')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['product_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['product_variant_id', 'created_at']);
            $table->index(['ip_address', 'created_at']);
        });

        // Search Queries Table - Track Customer Searches
        Schema::create('search_queries', function (Blueprint $table) {
            $table->id();
            $table->string('query');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address', 45);
            $table->integer('results_count')->default(0);
            $table->string('device_type')->nullable();
            $table->string('session_id')->nullable();
            $table->json('filters')->nullable();
            $table->string('sort_by')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['query', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        // Cart Activities Table - Track Cart Interactions
        Schema::create('cart_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('session_id');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('set null');

            // Activity Details
            $table->enum('activity_type', [
                'add',
                'remove',
                'quantity_change',
                'coupon_applied',
                'coupon_removed',
                'checkout_started'
            ]);

            $table->integer('quantity')->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->string('coupon_code')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'created_at']);
            $table->index(['session_id', 'created_at']);
            $table->index(['product_id', 'activity_type']);
        });

        // Conversion Funnel Table - Track User Journey
        Schema::create('conversion_funnel', function (Blueprint $table) {
            $table->id();
            $table->string('session_id');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            // Funnel Steps
            $table->timestamp('landing_page_visited_at')->nullable();
            $table->timestamp('product_viewed_at')->nullable();
            $table->timestamp('cart_updated_at')->nullable();
            $table->timestamp('checkout_started_at')->nullable();
            $table->timestamp('payment_processed_at')->nullable();
            $table->timestamp('order_completed_at')->nullable();

            // Additional Data
            $table->string('entry_point')->nullable();
            $table->string('exit_point')->nullable();
            $table->integer('funnel_drop_off_step')->nullable();
            $table->json('funnel_data')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'order_completed_at']);
            $table->index(['session_id']);
            $table->index(['funnel_drop_off_step']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversion_funnel');
        Schema::dropIfExists('cart_activities');
        Schema::dropIfExists('search_queries');
        Schema::dropIfExists('product_views');
        Schema::dropIfExists('visits');
    }
};
