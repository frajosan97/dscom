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
        // Categories Table - Enhanced for Ecommerce
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('image')->nullable();
            $table->string('icon')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->json('additional_fields')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['parent_id', 'is_active']);
            $table->index('order');
        });

        // Brands Table - Enhanced with SEO and Social Media
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('logo')->nullable();
            $table->string('website_url')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['is_active', 'is_featured']);
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->text('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('brand_id')->nullable()->constrained()->onDelete('set null');

            // Pricing Information - Modified for 3 price levels
            $table->decimal('price', 12, 2);
            $table->decimal('agent_price', 12, 2)->nullable();
            $table->decimal('wholesaler_price', 12, 2)->nullable();
            $table->decimal('compare_price', 12, 2)->nullable();
            $table->decimal('cost_per_item', 12, 2)->nullable();
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->foreignId('tax_id')->nullable()->constrained()->onDelete('set null');

            // Inventory Management
            $table->string('sku')->unique()->nullable();
            $table->string('barcode')->nullable();
            $table->integer('quantity')->default(0);
            $table->integer('low_stock_threshold')->default(5);
            $table->string('stock_status')->default('in_stock');
            $table->boolean('track_inventory')->default(true);
            $table->boolean('allow_backorders')->default(false);

            // Shipping Information
            $table->boolean('is_digital')->default(false);
            $table->boolean('requires_shipping')->default(true);
            $table->decimal('weight', 8, 2)->nullable();
            $table->string('weight_unit')->default('kg');
            $table->decimal('length', 8, 2)->nullable();
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('height', 8, 2)->nullable();
            $table->string('dimension_unit')->default('cm');

            // Product Status
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_bestseller')->default(false);
            $table->boolean('is_new')->default(true);
            $table->date('new_until')->nullable();
            $table->boolean('has_variants')->default(false);

            // Additional Fields
            $table->json('tags')->nullable();
            $table->json('specifications')->nullable();
            $table->json('custom_fields')->nullable();
            $table->json('related_products')->nullable();
            $table->integer('view_count')->default(0);
            $table->integer('sold_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['category_id', 'is_active']);
            $table->index(['brand_id', 'is_featured']);
            $table->index('price');
            $table->index('agent_price');
            $table->index('wholesaler_price');
            $table->index('stock_status');
            $table->index('created_at');
        });

        // Product Images Table
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('image_path');
            $table->string('alt_text')->nullable();
            $table->string('title')->nullable();
            $table->boolean('is_default')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index(['product_id', 'is_default']);
        });

        // Product Variants Table (changed to 'product_variants')
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('sku')->unique()->nullable();
            $table->string('barcode')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('compare_price', 12, 2)->nullable();
            $table->decimal('cost_per_item', 12, 2)->nullable();
            $table->integer('quantity')->default(0);
            $table->string('stock_status')->default('in_stock');
            $table->boolean('track_inventory')->default(true);
            $table->json('options')->nullable();
            $table->string('image')->nullable();
            $table->decimal('weight', 8, 2)->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['product_id', 'stock_status', 'sku']);
        });

        // Product Attributes Table (changed to 'product_attributes')
        Schema::create('product_attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('type')->default('select');
            $table->string('display_type')->default('dropdown');
            $table->boolean('is_filterable')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->index(['is_active', 'is_filterable']);
        });

        // Product Attribute Values Table (changed to 'product_attr_values')
        Schema::create('product_attr_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_attribute_id')->constrained()->onDelete('cascade');
            $table->string('value');
            $table->string('slug')->unique();
            $table->string('color_code')->nullable();
            $table->string('image_url')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index(['product_attribute_id', 'order']);
        });

        Schema::create('product_product_attr_values', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_attribute_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_attr_value_id')->constrained()->onDelete('cascade');
            $table->primary(['product_id', 'product_attribute_id', 'product_attr_value_id']);
        });

        // Product Reviews Table (changed to 'product_reviews')
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->integer('rating')->default(5);
            $table->text('title');
            $table->text('body');
            $table->boolean('is_approved')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['product_id', 'is_approved', 'rating']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
        Schema::dropIfExists('product_product_attr_values');
        Schema::dropIfExists('product_attr_values');
        Schema::dropIfExists('product_attributes');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
    }
};
