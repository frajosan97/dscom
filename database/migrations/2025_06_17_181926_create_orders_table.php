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
        // Orders Table - Core Order Management
        Schema::create('orders', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Order Identification
            $table->string('order_number')->unique();
            $table->string('invoice_number')->nullable()->unique();

            // Relationships
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('warehouse_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('customer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->onDelete('set null');
            $table->foreignId('shipping_method_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('coupon_id')->nullable()->constrained()->onDelete('set null');

            // Order Status
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
                'completed'
            ])->default('pending');

            $table->enum('fulfillment_status', [
                'unfulfilled',
                'partially_fulfilled',
                'fulfilled'
            ])->default('unfulfilled');

            // Financial Information
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->decimal('total_paid', 12, 2)->default(0);
            $table->decimal('total_refunded', 12, 2)->default(0);
            $table->string('currency')->default('$');

            // Payment Information
            $table->enum('payment_status', [
                'pending',
                'paid',
                'failed',
                'partially_paid',
                'refunded'
            ])->default('pending');
            $table->string('payment_reference')->nullable();
            $table->timestamp('payment_date')->nullable();

            // Shipping Information
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();

            // Coupon Information
            $table->string('coupon_code')->nullable();
            $table->decimal('coupon_value', 12, 2)->nullable();

            // Notes & Additional Information
            $table->text('customer_note')->nullable();
            $table->text('private_notes')->nullable();
            $table->json('custom_fields')->nullable();

            // Technical Information
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['order_number', 'status']);
            $table->index(['user_id', 'created_at']);
            $table->index(['customer_id', 'created_at']);
            $table->index(['payment_status', 'fulfillment_status']);
            $table->index(['status', 'created_at']);
            $table->index('created_at');
        });

        // Order Items Table - Individual Order Line Items
        Schema::create('order_items', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Relationships
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_item_id')->nullable()->constrained()->onDelete('set null');

            // Product Information
            $table->string('product_name');
            $table->text('description')->nullable();
            $table->string('sku')->nullable();
            $table->string('barcode')->nullable();

            // Pricing Information
            $table->decimal('unit_price', 12, 2);
            $table->decimal('original_price', 12, 2)->nullable();
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->integer('quantity');
            $table->decimal('total', 12, 2);

            // Item Specifications
            $table->string('size')->nullable();
            $table->string('color')->nullable();
            $table->string('material')->nullable();
            $table->json('attributes')->nullable();

            // Fulfillment Information
            $table->integer('quantity_shipped')->default(0);
            $table->integer('quantity_delivered')->default(0);
            $table->boolean('inventory_updated')->default(false);
            $table->timestamp('inventory_updated_at')->nullable();

            // Item Status
            $table->enum('status', [
                'pending',
                'shipped',
                'delivered',
                'cancelled',
                'returned',
                'refunded',
                'partially_shipped'
            ])->default('pending');

            $table->timestamps();

            // Indexes
            $table->index(['order_id', 'product_id']);
            $table->index(['product_id', 'status']);
            $table->index('sku');
            $table->index('barcode');
        });

        // Order Addresses Table - Separate billing and shipping addresses
        Schema::create('order_addresses', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Relationships
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            // Address Type
            $table->enum('type', ['billing', 'shipping']);

            // Contact Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');

            // Address Information
            $table->text('address_line_1');
            $table->string('address_line_2')->nullable();
            $table->string('city');
            $table->string('state');
            $table->string('country');
            $table->string('postal_code');

            // Company Information
            $table->string('company_name')->nullable();
            $table->string('tax_number')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['order_id', 'type']);
            $table->index(['country', 'state']);
        });

        // Payments Table - Payment Transaction Records
        Schema::create('order_payments', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Relationships
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('warehouse_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->onDelete('set null');

            // Payment Identification
            $table->string('transaction_id')->unique();
            $table->string('reference')->nullable();

            // Payment Amounts
            $table->decimal('amount', 12, 2);
            $table->decimal('fee', 12, 2)->default(0);
            $table->string('currency')->default('KES');

            // Payment Method Details
            $table->string('payment_method_code')->nullable();
            $table->string('payment_method_name')->nullable();

            // Payment Status
            $table->enum('status', [
                'pending',
                'completed',
                'failed',
                'refunded',
                'partially_refunded',
                'cancelled'
            ])->default('pending');

            // Gateway Information
            $table->text('gateway_response')->nullable();
            $table->json('gateway_parameters')->nullable();
            $table->json('metadata')->nullable();

            // Timestamps
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['order_id', 'status']);
            $table->index(['transaction_id', 'status']);
            $table->index(['user_id', 'created_at']);
            $table->index('paid_at');
            $table->index('created_at');
        });

        // Order Status History - Audit Trail for Order Status Changes
        Schema::create('order_status_history', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Relationships
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            // Status Information
            $table->string('status');
            $table->string('previous_status')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['order_id', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
        Schema::dropIfExists('order_payments');
        Schema::dropIfExists('order_addresses');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};