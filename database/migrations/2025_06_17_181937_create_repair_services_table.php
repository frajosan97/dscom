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
        // Device Types Table - Foundation for the repair hierarchy
        Schema::create('repair_service_device_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('repair_service_device_types')->onDelete('set null');
            $table->string('icon')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['parent_id', 'is_active']);
            $table->index(['order', 'is_active']);
        });

        // Repair Services Table - Core service definitions
        Schema::create('repair_services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('detailed_description')->nullable();
            $table->text('repair_process')->nullable();
            $table->decimal('base_price', 12, 2);
            $table->integer('estimated_duration')->nullable(); // in minutes
            $table->integer('warranty_days')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->string('image')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'is_featured']);
            $table->index('slug');
        });

        // Repair Service Pricings Table - Pricing by device type
        Schema::create('repair_service_pricings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_service_id')->constrained()->onDelete('cascade');
            $table->foreignId('device_type_id')->constrained('repair_service_device_types')->onDelete('cascade');
            $table->decimal('price', 12, 2);
            $table->decimal('min_price', 12, 2)->nullable();
            $table->decimal('max_price', 12, 2)->nullable();
            $table->boolean('is_flat_rate')->default(false);
            $table->text('price_notes')->nullable();
            $table->timestamps();

            $table->unique(['repair_service_id', 'device_type_id']);
            $table->index(['price', 'device_type_id']);
            $table->index(['repair_service_id', 'is_flat_rate']);
        });

        // Repair Checklists Table - Standardize repair processes
        Schema::create('repair_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_service_id')->constrained()->onDelete('cascade');
            $table->foreignId('device_type_id')->constrained('repair_service_device_types')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['repair_service_id', 'device_type_id']);
            $table->index(['is_active', 'order']);
        });

        // Repair Checklist Items Table
        Schema::create('repair_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_id')->constrained('repair_checklists')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_required')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['checklist_id', 'order']);
            $table->index('is_required');
        });

        // Repair Orders Table - Core repair order management
        Schema::create('repair_orders', function (Blueprint $table) {
            $table->id();

            // Order Identification
            $table->string('order_number')->unique();

            // Service & Device Information
            $table->foreignId('repair_service_id')->constrained()->onDelete('cascade');
            $table->foreignId('device_type_id')->constrained('repair_service_device_types')->onDelete('cascade');
            $table->json('device_metadata')->nullable();
            $table->json('initial_check_metadata')->nullable();

            // Status & Priority
            $table->enum('status', [
                'pending',
                'received',
                'diagnosing',
                'repairing',
                'awaiting_parts',
                'awaiting_customer_approval',
                'awaiting_customer_response',
                'ready_for_pickup',
                'completed',
                'delivered',
                'cancelled',
                'rejected'
            ])->default('pending');

            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');

            // Financial Information
            $table->decimal('diagnosis_fee', 12, 2)->default(0);
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->decimal('final_cost', 12, 2)->nullable();
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0);

            // Timeline Information
            $table->date('expected_completion_date')->nullable();
            $table->date('completion_date')->nullable();
            $table->date('delivery_date')->nullable();

            // Personnel Assignment
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('assigned_technician_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');

            // Technical Details
            $table->text('diagnosis_details')->nullable();
            $table->text('repair_notes')->nullable();
            $table->text('technician_notes')->nullable();
            $table->json('custom_fields')->nullable();

            // Customer Feedback
            $table->text('customer_feedback')->nullable();
            $table->integer('customer_rating')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['order_number', 'status']);
            $table->index(['customer_id', 'created_at']);
            $table->index(['assigned_technician_id', 'status']);
            $table->index(['status', 'priority']);
            $table->index(['expected_completion_date', 'status']);
            $table->index('created_at');
        });

        // Repair Order Status History - Complete audit trail
        Schema::create('repair_order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_order_id')->constrained()->onDelete('cascade');
            $table->string('status');
            $table->string('previous_status')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('changed_by')->constrained('users')->onDelete('cascade');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['repair_order_id', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index('changed_by');
        });

        // Repair Parts Table - Parts used in repairs
        Schema::create('repair_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->string('part_name');
            $table->string('part_number')->nullable();
            $table->text('description')->nullable();
            $table->decimal('cost_price', 12, 2)->nullable();
            $table->decimal('selling_price', 12, 2);
            $table->integer('quantity')->default(1);
            $table->decimal('total', 12, 2);
            $table->enum('status', ['ordered', 'received', 'installed', 'returned', 'defective'])->default('ordered');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['repair_order_id', 'product_id']);
            $table->index(['part_number', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repair_parts');
        Schema::dropIfExists('repair_order_status_history');
        Schema::dropIfExists('repair_orders');
        Schema::dropIfExists('repair_checklist_items');
        Schema::dropIfExists('repair_checklists');
        Schema::dropIfExists('repair_service_pricings');
        Schema::dropIfExists('repair_services');
        Schema::dropIfExists('repair_service_device_types');
    }
};