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
        // Settings Table - Enhanced Configuration System
        Schema::create('settings', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Core Settings Data
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text'); // text, number, boolean, json, select
            $table->string('group')->default('general'); // general, system, payment, email
            $table->text('options')->nullable(); // JSON options for select fields
            $table->text('description')->nullable();

            // Security & Visibility
            $table->boolean('is_public')->default(false); // Whether to expose to frontend
            $table->boolean('is_encrypted')->default(false);
            $table->timestamps();

            // Indexes
            $table->index(['group', 'key']);
            $table->index('is_public');
        });

        // Taxes Table - Comprehensive Tax Management
        Schema::create('taxes', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Basic Tax Information
            $table->string('name');
            $table->string('identifier')->unique(); // Machine-readable identifier
            $table->decimal('rate', 5, 2);

            // Geographic Scope
            $table->string('country')->nullable();
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();

            // Tax Type Configuration
            $table->enum('type', ['percentage', 'fixed', 'compound'])->default('percentage');
            $table->boolean('is_inclusive')->default(false); // Tax included in price
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);

            // Priority and Application Rules
            $table->integer('priority')->default(0);
            $table->json('apply_to')->nullable(); // Specific product categories/classes
            $table->json('exceptions')->nullable(); // Excluded products/categories

            // Additional Information
            $table->text('description')->nullable();
            $table->string('tax_number')->nullable(); // Official tax registration number
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['country', 'state', 'is_active']);
            $table->index(['type', 'is_active']);
            $table->index('is_default');
        });

        // Currencies Table - Enhanced Multi-Currency Support
        Schema::create('currencies', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Basic Currency Information
            $table->string('name');
            $table->string('code', 3)->unique(); // ISO 4217 code
            $table->string('symbol');
            $table->string('symbol_position')->default('before'); // before or after
            $table->integer('decimal_places')->default(2);
            $table->string('thousands_separator')->default(',');
            $table->string('decimal_separator')->default('.');
            $table->string('format')->default('{symbol}{amount}');

            // Exchange Rate Management
            $table->decimal('exchange_rate', 10, 6);
            $table->boolean('auto_update')->default(false);
            $table->string('exchange_rate_service')->nullable();
            $table->timestamp('last_updated')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);

            // Additional Information
            $table->string('iso_numeric')->nullable();
            $table->string('subunit')->nullable();
            $table->integer('subunit_to_unit')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['code', 'is_active']);
            $table->index('is_default');
            $table->index('auto_update');
        });

        // Languages Table - Multi-language Support
        Schema::create('languages', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Language Information
            $table->string('name');
            $table->string('code', 10)->unique(); // en, fr, etc.
            $table->string('locale')->nullable(); // en_US, fr_FR, etc.
            $table->string('direction')->default('ltr'); // ltr or rtl

            // Status & Ordering
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->integer('order')->default(0);

            // Additional Information
            $table->string('flag')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['is_active', 'is_default']);
            $table->index('order');
        });

        // Payment Methods Table
        Schema::create('payment_methods', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Basic Information
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();

            // Status & Configuration
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->boolean('requires_approval')->default(false);

            // Fee Structure
            $table->decimal('processing_fee', 10, 2)->default(0);
            $table->enum('fee_type', ['fixed', 'percentage'])->default('fixed');

            // Account Information
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('bank_name')->nullable();

            // Metadata
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['is_active', 'is_default']);
            $table->index('code');
        });

        // Shipping Methods Table
        Schema::create('shipping_methods', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Basic Information
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Cost Configuration
            $table->decimal('base_cost', 12, 2)->default(0);
            $table->decimal('free_shipping_threshold', 12, 2)->nullable();
            $table->boolean('is_free')->default(false);

            // Delivery Information
            $table->integer('delivery_days_min')->nullable();
            $table->integer('delivery_days_max')->nullable();
            $table->string('delivery_timeframe')->nullable();

            // Carrier Information
            $table->string('carrier_name')->nullable();
            $table->string('carrier_service')->nullable();
            $table->string('tracking_url_template')->nullable();

            // Configuration & Coverage
            $table->json('configuration')->nullable();
            $table->json('supported_countries')->nullable();
            $table->json('supported_states')->nullable();

            // Status & Ordering
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index(['is_active', 'order']);
            $table->index('slug');
            $table->index('base_cost');
        });

        // Coupons Table
        Schema::create('coupons', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Basic Information
            $table->string('code')->unique();
            $table->string('name')->nullable();
            $table->text('description')->nullable();

            // Discount Configuration
            $table->enum('type', ['percentage', 'fixed_amount', 'free_shipping']);
            $table->decimal('value', 12, 2);
            $table->decimal('min_order_amount', 12, 2)->nullable();
            $table->decimal('max_discount_amount', 12, 2)->nullable();

            // Validity Period
            $table->dateTime('start_date');
            $table->dateTime('end_date');

            // Usage Limits
            $table->boolean('is_active')->default(true);
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_limit_per_user')->nullable();
            $table->integer('usage_count')->default(0);

            // Application Rules
            $table->boolean('apply_to_all_products')->default(true);
            $table->json('product_ids')->nullable();
            $table->json('excluded_product_ids')->nullable();
            $table->json('category_ids')->nullable();
            $table->boolean('apply_to_all_customers')->default(true);
            $table->json('customer_ids')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['code', 'is_active']);
            $table->index(['start_date', 'end_date']);
            $table->index(['is_active', 'type']);
            $table->index('usage_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('shipping_methods');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('languages');
        Schema::dropIfExists('currencies');
        Schema::dropIfExists('taxes');
        Schema::dropIfExists('settings');
    }
};