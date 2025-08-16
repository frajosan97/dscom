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
        // Support Departments (must come first as it's referenced by other tables)
        Schema::create('support_departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Customer Support Tickets (depends on support_departments)
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();

            // Customer Information
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();

            // Ticket Details
            $table->string('subject');
            $table->text('message');
            $table->enum('type', [
                'general',
                'order',
                'payment',
                'shipping',
                'return',
                'technical',
                'product',
                'account'
            ])->default('general');

            // Status Management
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', [
                'open',
                'pending',
                'in_progress',
                'resolved',
                'closed',
                'reopened'
            ])->default('open');

            // Assignment
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('support_departments')->onDelete('set null');

            // Related Entities
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');

            // Timestamps
            $table->timestamp('first_response_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();

            // Additional Information
            $table->json('custom_fields')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['ticket_number', 'status']);
            $table->index(['user_id', 'created_at']);
            $table->index(['assigned_to', 'status']);
        });

        // Ticket Replies (depends on tickets)
        Schema::create('ticket_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            // Reply Content
            $table->text('message');
            $table->boolean('is_customer_reply')->default(false);
            $table->boolean('is_internal_note')->default(false);
            $table->json('attachments')->nullable();

            // Status Update
            $table->string('status_change')->nullable();
            $table->string('priority_change')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['ticket_id', 'created_at']);
        });

        // Ticket Attachments (depends on tickets and ticket_replies)
        Schema::create('ticket_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('reply_id')->nullable()->constrained('ticket_replies')->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type');
            $table->integer('file_size');
            $table->timestamps();
        });

        // Wishlists Table
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('cascade');

            // Wishlist Organization
            $table->string('name')->nullable()->default('My Wishlist');
            $table->integer('position')->default(0);

            // Notification Preferences
            $table->boolean('notify_price_change')->default(false);
            $table->boolean('notify_back_in_stock')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'product_id', 'product_variant_id'], 'unique_wishlist_item');
            $table->index(['user_id', 'created_at']);
        });

        // Multiple Wishlists Support
        Schema::create('wishlist_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->boolean('is_private')->default(true);
            $table->integer('position')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'position']);
        });

        // Wishlist Folder Items
        Schema::create('wishlist_folder_items', function (Blueprint $table) {
            $table->foreignId('wishlist_id')->constrained()->onDelete('cascade');
            $table->foreignId('folder_id')->constrained('wishlist_folders')->onDelete('cascade');
            $table->primary(['wishlist_id', 'folder_id']);
        });

        // Reviews Table
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');

            // Rating Details
            $table->integer('rating');
            $table->string('title');
            $table->text('comment')->nullable();
            $table->json('pros')->nullable();
            $table->json('cons')->nullable();

            // Verification
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();

            // Helpfulness Tracking
            $table->integer('helpful_count')->default(0);
            $table->integer('unhelpful_count')->default(0);

            // Media
            $table->json('images')->nullable();
            $table->json('videos')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['product_id', 'is_approved']);
            $table->index(['user_id', 'created_at']);
        });

        // Review Helpfulness Tracking
        Schema::create('review_helpfulness', function (Blueprint $table) {
            $table->foreignId('review_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('is_helpful');
            $table->primary(['review_id', 'user_id']);
        });

        // Notifications Table
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable'); // This already creates an index automatically

            // Notification Content
            $table->text('data');
            $table->string('subject')->nullable();
            $table->text('message')->nullable();

            // Delivery Status
            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('failed_at')->nullable();

            // Channel Information
            $table->string('channel')->default('database');
            $table->json('channel_response')->nullable();

            $table->timestamps();

            $table->index('read_at');
        });

        // Notification Preferences
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('notification_type');
            $table->boolean('email_enabled')->default(true);
            $table->boolean('sms_enabled')->default(false);
            $table->boolean('push_enabled')->default(true);
            $table->boolean('in_app_enabled')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'notification_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order of creation
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('review_helpfulness');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('wishlist_folder_items');
        Schema::dropIfExists('wishlist_folders');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('ticket_attachments');
        Schema::dropIfExists('ticket_replies');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('support_departments');
    }
};
