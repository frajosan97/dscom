<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained('users', 'id')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->string('subject')->nullable();
            $table->text('message');
            $table->integer('rating')->default(5);
            $table->enum('status', ['pending', 'reviewed', 'archived'])->default('pending');
            $table->boolean('is_anonymous')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->text('admin_response')->nullable();
            $table->foreignId('responded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('responded_at')->nullable();
            $table->json('attachments')->nullable();
            $table->string('source')->default('website'); // website, email, api, etc.
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'rating']);
            $table->index(['customer_id', 'created_at']);
            $table->index(['is_featured', 'status']);
        });

        Schema::create('feedback_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_id')->constrained()->onDelete('cascade');
            $table->enum('aspect', ['product_quality', 'delivery', 'customer_service', 'value_for_money', 'ease_of_use']);
            $table->integer('rating')->default(5);
            $table->timestamps();
        });

        Schema::create('feedback_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('is_helpful')->default(true);
            $table->timestamps();

            $table->unique(['feedback_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_votes');
        Schema::dropIfExists('feedback_ratings');
        Schema::dropIfExists('feedback');
    }
};