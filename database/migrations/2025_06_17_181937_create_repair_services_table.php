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
        Schema::create('technicians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('specialization');
            $table->text('skills')->nullable();
            $table->string('certification')->nullable();
            $table->integer('experience_years')->default(0);
            $table->string('service_area')->nullable();
            $table->boolean('is_available')->default(true);
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Repair Services Table - Enhanced with Additional Fields
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
        });

        // Device Types Table - Enhanced with Hierarchy Support
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
        });

        // Repair Service Pricings Table - Enhanced with Conditions
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
        });

        // Repair Orders Table - Comprehensive Repair Management
        Schema::create('repair_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('repair_service_id')->constrained()->onDelete('cascade');
            $table->foreignId('device_type_id')->constrained('repair_service_device_types')->onDelete('cascade');
            $table->json('device_metadata')->nullable();
            $table->json('initial_check_metadata')->nullable();
            $table->enum('status', ['pending', 'received', 'repairing', 'awaiting_parts', 'awaiting_customer_response', 'completed', 'delivered', 'cancelled', 'rejected',])->default('pending');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->decimal('diagnosis_fee', 12, 2)->default(0);
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->decimal('final_cost', 12, 2)->nullable();
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->date('expected_completion_date')->nullable();
            $table->date('completion_date')->nullable();
            $table->date('delivery_date')->nullable();
            $table->foreignId('customer_id')->nullable()->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('assigned_technician_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('diagnosis_details')->nullable();
            $table->text('repair_notes')->nullable();
            $table->text('technician_notes')->nullable();
            $table->json('custom_fields')->nullable();
            $table->text('customer_feedback')->nullable();
            $table->integer('customer_rating')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Repair Order Status History - Enhanced Tracking
        Schema::create('repair_order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_order_id')->constrained()->onDelete('cascade');
            $table->string('status');
            $table->text('notes')->nullable();
            $table->foreignId('changed_by')->constrained('users')->onDelete('cascade');
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['repair_order_id', 'created_at']);
        });

        // // Repair Order Payments - Comprehensive Payment Tracking
        // Schema::create('repair_order_payments', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('repair_order_id')->constrained()->onDelete('cascade');
        //     $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
        //     $table->decimal('amount', 12, 2);
        //     $table->string('payment_method');
        //     $table->string('transaction_id')->nullable();
        //     $table->string('receipt_number')->nullable();
        //     $table->enum('payment_type', ['deposit', 'partial', 'full', 'refund'])->default('full');
        //     $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('completed');
        //     $table->text('notes')->nullable();
        //     $table->json('metadata')->nullable();
        //     $table->date('payment_date')->nullable();
        //     $table->timestamps();

        //     // Indexes
        //     $table->index(['repair_order_id', 'status']);
        //     $table->index('transaction_id');
        // });

        // Repair Parts Table - Track Parts Used in Repairs
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
            $table->enum('status', ['ordered', 'installed', 'returned'])->default('ordered');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['repair_order_id', 'product_id']);
        });

        // Repair Checklists Table - Standardize Repair Processes
        Schema::create('repair_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_service_id')->constrained()->onDelete('cascade');
            $table->foreignId('device_type_id')->constrained('repair_service_device_types')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes
            $table->index(['repair_service_id', 'device_type_id']);
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
        });

        // // Repair Order Checklists Table - Track Completion
        // Schema::create('repair_order_checklists', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('repair_order_id')->constrained()->onDelete('cascade');
        //     $table->foreignId('checklist_item_id')->constrained('repair_checklist_items')->onDelete('cascade');
        //     $table->boolean('is_completed')->default(false);
        //     $table->foreignId('completed_by')->nullable()->constrained('users')->onDelete('set null');
        //     $table->timestamp('completed_at')->nullable();
        //     $table->text('notes')->nullable();
        //     $table->timestamps();

        //     // Indexes
        //     $table->index(['repair_order_id', 'is_completed']);
        // });

        // // Repair Order Complaints Table
        // Schema::create('repair_order_complaints', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('repair_order_id')->constrained()->onDelete('cascade');
        //     $table->text('complaint');
        //     $table->text('remarks')->nullable();
        //     $table->timestamps();
        // });

        // // Repair Order Initial Checks Table
        // Schema::create('repair_order_initial_checks', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('repair_order_id')->constrained()->onDelete('cascade');
        //     $table->boolean('power_on')->default(false);
        //     $table->string('visible_damage')->nullable();
        //     $table->boolean('buttons_working')->default(true);
        //     $table->string('screen_condition')->nullable();
        //     $table->string('battery_condition')->nullable();
        //     $table->text('other_notes')->nullable();
        //     $table->timestamps();
        // });

        // // Repair Order Physical Conditions Table
        // Schema::create('repair_order_physical_conditions', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('repair_order_id')->constrained()->onDelete('cascade');
        //     $table->string('screen_condition')->nullable();
        //     $table->string('body_condition')->nullable();
        //     $table->string('ports_condition')->nullable();
        //     $table->string('buttons_condition')->nullable();
        //     $table->text('accessories_included')->nullable();
        //     $table->text('additional_notes')->nullable();
        //     $table->timestamps();
        // });

        // // Repair Order Risk Agreements Table
        // Schema::create('repair_order_risk_agreements', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('repair_order_id')->constrained()->onDelete('cascade');
        //     $table->boolean('data_loss_accepted')->default(false);
        //     $table->boolean('further_damage_accepted')->default(false);
        //     $table->boolean('parts_replacement_accepted')->default(false);
        //     $table->boolean('diagnostic_fee_accepted')->default(false);
        //     $table->boolean('terms_accepted')->default(false);
        //     $table->timestamp('signed_at')->nullable();
        //     $table->text('customer_signature')->nullable(); // Could store signature data or image path
        //     $table->timestamps();
        // });

        // // Repair Order Accessories Table
        // Schema::create('repair_order_accessories', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('repair_order_id')->constrained()->onDelete('cascade');
        //     $table->string('name');
        //     $table->integer('quantity')->default(1);
        //     $table->string('condition')->nullable();
        //     $table->text('notes')->nullable();
        //     $table->timestamps();
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Schema::dropIfExists('repair_order_accessories');
        // Schema::dropIfExists('repair_order_risk_agreements');
        // Schema::dropIfExists('repair_order_physical_conditions');
        // Schema::dropIfExists('repair_order_initial_checks');
        // Schema::dropIfExists('repair_order_complaints');
        // Schema::dropIfExists('repair_order_checklists');
        Schema::dropIfExists('repair_checklist_items');
        Schema::dropIfExists('repair_checklists');
        Schema::dropIfExists('repair_parts');
        // Schema::dropIfExists('repair_order_payments');
        Schema::dropIfExists('repair_order_status_history');
        Schema::dropIfExists('repair_orders');
        Schema::dropIfExists('repair_service_pricings');
        Schema::dropIfExists('repair_service_device_types');
        Schema::dropIfExists('repair_services');
    }
};
