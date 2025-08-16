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
        // 1. First create independent tables (no foreign key dependencies)

        // Shipping Methods Table
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('base_cost', 12, 2)->default(0);
            $table->decimal('free_shipping_threshold', 12, 2)->nullable();
            $table->boolean('is_free')->default(false);
            $table->integer('delivery_days_min')->nullable();
            $table->integer('delivery_days_max')->nullable();
            $table->string('delivery_timeframe')->nullable();
            $table->string('carrier_name')->nullable();
            $table->string('carrier_service')->nullable();
            $table->string('tracking_url_template')->nullable();
            $table->json('configuration')->nullable();
            $table->json('supported_countries')->nullable();
            $table->json('supported_states')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'order']);
        });

        // Coupons Table
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->enum('type', [
                'percentage',
                'fixed_amount',
                'free_shipping'
            ]);
            $table->decimal('value', 12, 2);
            $table->decimal('min_order_amount', 12, 2)->nullable();
            $table->decimal('max_discount_amount', 12, 2)->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->boolean('is_active')->default(true);
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_limit_per_user')->nullable();
            $table->integer('usage_count')->default(0);
            $table->boolean('apply_to_all_products')->default(true);
            $table->json('product_ids')->nullable();
            $table->json('excluded_product_ids')->nullable();
            $table->json('category_ids')->nullable();
            $table->boolean('apply_to_all_customers')->default(true);
            $table->json('customer_ids')->nullable();
            $table->timestamps();

            $table->index(['code', 'is_active']);
            $table->index('start_date');
            $table->index('end_date');
        });

        // 2. Now create tables with foreign key dependencies

        // Orders Table
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('invoice_number')->nullable()->unique();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('customer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', [
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'refunded',
                'partially_refunded',
                'on_hold',
                'failed',
                'completed',
            ])->default('pending');
            $table->enum('fulfillment_status', [
                'unfulfilled',
                'partially_fulfilled',
                'fulfilled'
            ])->default('unfulfilled');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->decimal('total_paid', 12, 2)->default(0);
            $table->decimal('total_refunded', 12, 2)->default(0);
            $table->string('currency')->default('$');
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->onDelete('set null');
            $table->enum('payment_status', [
                'pending',
                'paid',
                'failed',
                'partially_paid',
                'refunded'
            ])->default('pending');
            $table->string('payment_reference')->nullable();
            $table->timestamp('payment_date')->nullable();
            $table->foreignId('shipping_method_id')->nullable()->constrained()->onDelete('set null');
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->foreignId('coupon_id')->nullable()->constrained()->onDelete('set null');
            $table->string('coupon_code')->nullable();
            $table->decimal('coupon_value', 12, 2)->nullable();
            $table->text('customer_note')->nullable();
            $table->text('private_notes')->nullable();
            $table->json('custom_fields')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['order_number', 'status']);
            $table->index(['user_id', 'created_at']);
            $table->index(['payment_status', 'fulfillment_status']);
            $table->index('created_at');
        });

        // Order Items Table
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('set null');
            $table->string('product_name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('original_price', 12, 2)->nullable();
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->integer('quantity');
            $table->integer('quantity_shipped')->default(0);
            $table->decimal('total', 12, 2);
            $table->json('options')->nullable();
            $table->json('attributes')->nullable();
            $table->boolean('inventory_updated')->default(false);
            $table->timestamp('inventory_updated_at')->nullable();
            $table->enum('status', [
                'pending',
                'shipped',
                'delivered',
                'cancelled',
                'returned',
                'refunded'
            ])->default('pending');
            $table->timestamps();

            // Indexes
            $table->index(['order_id', 'product_id']);
        });

        // Payments Table
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->onDelete('set null');
            $table->string('transaction_id')->unique();
            $table->string('reference')->nullable();
            $table->decimal('amount', 12, 2);
            $table->decimal('fee', 12, 2)->default(0);
            $table->string('currency')->default('KES');
            $table->string('payment_method_code')->nullable();
            $table->string('payment_method_name')->nullable();
            $table->enum('status', [
                'pending',
                'completed',
                'failed',
                'refunded',
                'partially_refunded',
                'cancelled'
            ])->default('pending');
            $table->text('gateway_response')->nullable();
            $table->json('gateway_parameters')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['order_id', 'status']);
            $table->index('transaction_id');
            $table->index('created_at');
        });

        // Coupon Usage Tracking
        Schema::create('coupon_user', function (Blueprint $table) {
            $table->foreignId('coupon_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('usage_count')->default(0);
            $table->primary(['coupon_id', 'user_id']);

            $table->index('usage_count');
        });

        // Order Status History
        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('status');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
        Schema::dropIfExists('coupon_user');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('shipping_methods');
    }
};
