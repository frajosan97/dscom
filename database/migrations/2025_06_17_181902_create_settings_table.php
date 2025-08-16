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
        // Settings Table - Enhanced Configuration System
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text'); // text, number, boolean, json, select, etc.
            $table->string('group')->default('general'); // general, system, payment, email, etc.
            $table->text('options')->nullable(); // JSON options for select fields
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false); // Whether to expose to frontend
            $table->boolean('is_encrypted')->default(false);
            $table->timestamps();

            // Indexes
            $table->index(['group', 'key']);
        });

        // Taxes Table - Comprehensive Tax Management
        Schema::create('taxes', function (Blueprint $table) {
            $table->id();
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
        });

        // Currencies Table - Enhanced Multi-Currency Support
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
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
        });

        // Languages Table - Multi-language Support
        Schema::create('languages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 10)->unique(); // en, fr, etc.
            $table->string('locale')->nullable(); // en_US, fr_FR, etc.
            $table->string('direction')->default('ltr'); // ltr or rtl
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->integer('order')->default(0);
            $table->string('flag')->nullable();
            $table->timestamps();
        });

        // Payment Methods Table
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->boolean('requires_approval')->default(false);
            $table->decimal('processing_fee', 10, 2)->default(0);
            $table->enum('fee_type', ['fixed', 'percentage'])->default('fixed');
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('bank_name')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'is_default']);
        });

        // Shipping Zones Table
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->json('countries')->nullable();
            $table->json('states')->nullable();
            $table->json('postal_codes')->nullable();
            $table->timestamps();
        });

        // System Logs Table
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->string('level'); // info, warning, error, critical
            $table->string('event'); // login, order_created, etc.
            $table->text('message');
            $table->json('context')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['level', 'created_at']);
            $table->index('event');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_logs');
        Schema::dropIfExists('shipping_zones');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('languages');
        Schema::dropIfExists('currencies');
        Schema::dropIfExists('taxes');
        Schema::dropIfExists('settings');
    }
};
