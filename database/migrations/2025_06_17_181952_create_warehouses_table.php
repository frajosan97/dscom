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
        // Warehouses Table - Enhanced with Location Tracking
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');

            // Location Information
            $table->text('address');
            $table->string('city');
            $table->string('state');
            $table->string('country')->default('Nigeria');
            $table->string('postal_code');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 11, 7)->nullable();

            // Contact Information
            $table->string('contact_person');
            $table->string('contact_phone');
            $table->string('contact_email');
            $table->string('contact_position')->nullable();

            // Operational Information
            $table->time('opening_time')->nullable();
            $table->time('closing_time')->nullable();
            $table->json('working_days')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true);

            // Additional Information
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['is_active', 'is_primary']);
        });

        // Inventory Items Table - Enhanced Stock Management
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');

            // Stock Information
            $table->integer('quantity_on_hand')->default(0);
            $table->integer('quantity_available')->default(0);
            $table->integer('quantity_reserved')->default(0);
            $table->integer('quantity_in_transit')->default(0);
            $table->integer('low_stock_threshold')->default(5);
            $table->integer('high_stock_threshold')->nullable();
            $table->decimal('unit_cost', 12, 2)->nullable();

            // Location Tracking
            $table->string('aisle')->nullable();
            $table->string('rack')->nullable();
            $table->string('shelf')->nullable();
            $table->string('bin')->nullable();

            // Status
            $table->date('last_counted_at')->nullable();
            $table->date('last_received_at')->nullable();
            $table->date('last_sold_at')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'product_variant_id', 'warehouse_id'], 'inventory_item_unique');

            // Indexes
            $table->index(['quantity_available', 'low_stock_threshold']);
            $table->index('last_sold_at');
        });

        // Inventory Movements Table - Comprehensive Tracking
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('set null');

            // Movement Details
            $table->integer('quantity_before');
            $table->integer('quantity_change');
            $table->integer('quantity_after');
            $table->enum('movement_type', [
                'purchase',
                'sale',
                'return',
                'adjustment',
                'transfer_in',
                'transfer_out',
                'damage',
                'loss',
                'production',
                'assembly'
            ]);

            // Reference Information
            $table->text('description')->nullable();
            $table->foreignId('reference_id')->nullable();
            $table->string('reference_type')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Cost Information
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->decimal('total_cost', 12, 2)->nullable();

            // Additional Information
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['movement_type', 'created_at']);
            $table->index(['reference_id', 'reference_type']);
            $table->index('expiry_date');
        });

        // Suppliers Table - Enhanced Vendor Management
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique()->nullable();
            $table->string('company')->nullable();
            $table->string('tax_number')->nullable();

            // Contact Information
            $table->string('email')->nullable();
            $table->string('phone');
            $table->string('alternate_phone')->nullable();
            $table->string('website')->nullable();

            // Address Information
            $table->text('address');
            $table->string('city');
            $table->string('state');
            $table->string('country')->default('Nigeria');
            $table->string('postal_code');

            // Primary Contact Person
            $table->string('contact_person');
            $table->string('contact_position')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();

            // Financial Information
            $table->string('currency')->default('NGN');
            $table->string('payment_terms')->nullable();
            $table->decimal('credit_limit', 12, 2)->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_approved')->default(false);

            // Additional Information
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['is_active', 'is_approved']);
        });

        // Purchase Orders Table - Comprehensive Procurement
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number')->unique();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->onDelete('set null');

            // Dates
            $table->date('order_date');
            $table->date('expected_delivery_date')->nullable();
            $table->date('delivery_date')->nullable();

            // Status
            $table->enum('status', [
                'draft',
                'sent',
                'confirmed',
                'partially_received',
                'received',
                'cancelled',
                'closed'
            ])->default('draft');

            // Financial Information
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('balance_due', 12, 2)->default(0);

            // Payment Information
            $table->string('payment_terms')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_status')->default('unpaid');

            // Additional Information
            $table->text('notes')->nullable();
            $table->text('terms_and_conditions')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['po_number', 'status']);
            $table->index(['supplier_id', 'order_date']);
            $table->index('expected_delivery_date');
        });

        // Purchase Order Items Table - Detailed Line Items
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('cascade');

            // Item Details
            $table->string('product_name');
            $table->string('product_sku')->nullable();
            $table->text('description')->nullable();

            // Pricing Information
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('original_unit_cost', 12, 2)->nullable();
            $table->integer('quantity');
            $table->integer('received_quantity')->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_rate', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_cost', 12, 2);

            // Inventory Information
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();

            // Status
            $table->boolean('is_received')->default(false);
            $table->timestamps();

            // Indexes
            $table->index(['purchase_order_id', 'product_id']);
            $table->index('expiry_date');
        });

        // Inventory Transfers Table - Enhanced for Warehouse Transfers
        Schema::create('inventory_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_number')->unique();
            $table->foreignId('from_warehouse_id')->constrained('warehouses')->onDelete('cascade');
            $table->foreignId('to_warehouse_id')->constrained('warehouses')->onDelete('cascade');

            // Status
            $table->enum('status', [
                'draft',
                'requested',
                'approved',
                'in_transit',
                'completed',
                'cancelled'
            ])->default('draft');

            // Dates
            $table->date('transfer_date');
            $table->date('expected_arrival_date')->nullable();
            $table->date('arrival_date')->nullable();

            // Additional Information
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['transfer_number', 'status']);
            $table->index(['from_warehouse_id', 'to_warehouse_id']);
        });

        // Inventory Transfer Items Table
        Schema::create('inventory_transfer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transfer_id')->constrained('inventory_transfers')->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('cascade');

            // Transfer Details
            $table->integer('quantity');
            $table->integer('quantity_received')->default(0);
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();

            // Status
            $table->boolean('is_complete')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['transfer_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_transfer_items');
        Schema::dropIfExists('inventory_transfers');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('warehouses');
    }
};
