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
        Schema::create('branches', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('name');
            $table->string('code')->unique();
            $table->string('email')->nullable();
            $table->string('phone');
            $table->string('manager_name')->nullable();
            $table->string('manager_contact')->nullable();

            // Location Information
            $table->text('address');
            $table->string('city');
            $table->string('state');
            $table->string('country')->default('drc');
            $table->string('postal_code');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 11, 7)->nullable();

            // Operational Information
            $table->time('opening_time')->nullable();
            $table->time('closing_time')->nullable();
            $table->json('working_days')->nullable(); // Array of working days (e.g., [1,2,3,4,5] for Mon-Fri)

            // Ecommerce Specific Fields
            $table->boolean('is_active')->default(true);
            $table->boolean('is_online')->default(false); // If branch supports online orders
            $table->boolean('has_pickup')->default(false); // If branch supports pickup
            $table->boolean('has_delivery')->default(false); // If branch supports delivery
            $table->integer('delivery_radius')->nullable(); // In kilometers
            $table->decimal('delivery_fee', 10, 2)->nullable();

            // Financial Information
            $table->string('currency')->default('CDF');

            // Status and Metadata
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['is_active', 'is_online']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
