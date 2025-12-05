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
        // Categories Table - Enhanced for Ecommerce
        Schema::create('categories', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Basic Information
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // SEO Information
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            // Media
            $table->string('image')->nullable();
            $table->string('icon')->nullable();

            // Relationships
            $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('set null');

            // Status & Display
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);

            // Additional Data
            $table->json('additional_fields')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['parent_id', 'is_active']);
            $table->index(['is_active', 'is_featured']);
            $table->index('order');
            $table->index('slug');
        });

        // Brands Table - Enhanced with SEO and Social Media
        Schema::create('brands', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Basic Information
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // SEO Information
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            // Media
            $table->string('logo')->nullable();

            // Social Media & Links
            $table->string('website_url')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('twitter_url')->nullable();

            // Status & Display
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['is_active', 'is_featured']);
            $table->index('slug');
            $table->index('order');
        });

        // Products Table - Core Product Information (Master Data)
        Schema::create('products', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Relationships
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('brand_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('tax_id')->nullable()->constrained()->onDelete('set null');

            // Basic Information
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();

            // SKU & Identification
            $table->string('sku')->unique()->nullable();
            $table->string('product_type')->default('physical'); // physical, digital, service

            // Product Variations (Simple approach)
            $table->json('sizes')->nullable(); // ['S', 'M', 'L', 'XL']
            $table->json('colors')->nullable(); // ['Red', 'Blue', 'Green']
            $table->json('materials')->nullable(); // ['Cotton', 'Polyester']
            $table->json('variations')->nullable(); // For other custom variations

            // Master Pricing Information
            $table->decimal('base_price', 12, 2)->default(0);
            $table->decimal('agent_price', 12, 2)->nullable();
            $table->decimal('wholesaler_price', 12, 2)->nullable();
            $table->decimal('compare_price', 12, 2)->nullable();
            $table->decimal('cost_per_item', 12, 2)->nullable();

            // Master Inventory Settings
            $table->integer('total_quantity')->default(0); // Aggregate across all warehouses
            $table->integer('low_stock_alert')->default(5);
            $table->boolean('track_quantity')->default(true);
            $table->boolean('allow_backorders')->default(false);
            $table->enum('stock_status', ['in_stock', 'out_of_stock', 'on_backorder'])->default('in_stock');

            // Shipping Information
            $table->boolean('is_digital')->default(false);
            $table->boolean('requires_shipping')->default(true);
            $table->decimal('weight', 8, 2)->nullable();
            $table->decimal('length', 8, 2)->nullable();
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('height', 8, 2)->nullable();

            // Product Status
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_bestseller')->default(false);
            $table->boolean('is_new')->default(true);
            $table->date('new_until')->nullable();

            // SEO & Metadata
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['category_id', 'is_active']);
            $table->index(['brand_id', 'is_active']);
            $table->index(['is_active', 'is_featured']);
            $table->index('stock_status');
            $table->index('sku');
            $table->index('slug');
        });

        // Product Images Table
        Schema::create('product_images', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Relationships
            $table->foreignId('product_id')->constrained()->onDelete('cascade');

            // Image Information
            $table->string('image_path');
            $table->string('alt_text')->nullable();
            $table->string('title')->nullable();

            // Display & Ordering
            $table->boolean('is_default')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index(['product_id', 'is_default']);
            $table->index(['product_id', 'order']);
        });

        // Product Items Table - Individual physical items with unique identification
        Schema::create('product_items', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Relationships
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');

            // Unique Identification
            $table->string('serial_number')->unique()->nullable();
            $table->string('barcode')->unique()->nullable();
            $table->string('item_code')->nullable();

            // Item Specifications (Variant attributes)
            $table->string('size')->nullable();
            $table->string('color')->nullable();
            $table->string('material')->nullable();
            $table->json('attributes')->nullable(); // For other custom attributes

            // Item Status
            $table->enum('status', ['available', 'reserved', 'sold', 'damaged', 'returned', 'quarantined'])->default('available');
            $table->enum('condition', ['new', 'used', 'refurbished', 'damaged'])->default('new');

            // Location tracking within warehouse
            $table->string('aisle')->nullable();
            $table->string('rack')->nullable();
            $table->string('shelf')->nullable();
            $table->string('bin')->nullable();

            // Additional Information
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['product_id', 'warehouse_id']);
            $table->index(['warehouse_id', 'status']);
            $table->index('barcode');
            $table->index('serial_number');
            $table->index('status');
            $table->index(['size', 'color']);
        });

        // Stock Movements Table - Track inventory changes for product items
        Schema::create('stock_movements', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Relationships
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_item_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('reference_id')->nullable();
            $table->string('reference_type')->nullable();

            // Movement Details
            $table->enum('type', ['initial_load', 'transfer_in', 'transfer_out', 'sale', 'return', 'adjustment', 'damage', 'write_off']);
            $table->enum('direction', ['in', 'out']);
            $table->integer('quantity');
            $table->integer('previous_stock');
            $table->integer('new_stock');
            $table->decimal('unit_cost', 12, 2)->nullable();

            // Reason & Metadata
            $table->string('reason');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['product_id', 'warehouse_id']);
            $table->index(['product_item_id', 'type']);
            $table->index(['type', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
            $table->index(['direction', 'created_at']);
        });

        // Stock Transfers Table - Transfer between warehouses
        Schema::create('stock_transfers', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Transfer Information
            $table->string('transfer_number')->unique();
            $table->enum('status', ['draft', 'pending', 'approved', 'in_transit', 'partially_received', 'completed', 'cancelled'])->default('draft');
            $table->enum('transfer_type', ['main_to_branch', 'branch_to_branch', 'branch_to_main', 'adjustment']);

            // Locations
            $table->foreignId('from_warehouse_id')->constrained('warehouses')->onDelete('cascade');
            $table->foreignId('to_warehouse_id')->constrained('warehouses')->onDelete('cascade');

            // Personnel
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('shipped_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('received_by')->nullable()->constrained('users')->onDelete('set null');

            // Dates
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('received_at')->nullable();

            // Additional Information
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['from_warehouse_id', 'to_warehouse_id']);
            $table->index(['status', 'transfer_type']);
            $table->index('transfer_number');
            $table->index('requested_at');
        });

        // Stock Transfer Items Table
        Schema::create('stock_transfer_items', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Relationships
            $table->foreignId('stock_transfer_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_item_id')->nullable()->constrained()->onDelete('set null');

            // Transfer Details
            $table->integer('quantity_requested');
            $table->integer('quantity_shipped')->default(0);
            $table->integer('quantity_received')->default(0);
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['stock_transfer_id', 'product_id']);
            $table->index('product_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_transfer_items');
        Schema::dropIfExists('stock_transfers');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('product_items');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
    }
};