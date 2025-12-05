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
        Schema::create('branches', function (Blueprint $table) {
            // Primary Key
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
            $table->json('working_days')->nullable();

            // E-commerce Features
            $table->boolean('is_active')->default(true);
            $table->boolean('is_online')->default(false);
            $table->boolean('has_pickup')->default(false);
            $table->boolean('has_delivery')->default(false);
            $table->integer('delivery_radius')->nullable();
            $table->decimal('delivery_fee', 10, 2)->nullable();

            // Financial Information
            $table->string('currency')->default('CDF');

            // Metadata
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['is_active', 'is_online']);
        });

        Schema::create('warehouses', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Basic Information
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

            // Metadata
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['is_active', 'is_primary']);
        });

        Schema::create('departments', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Basic Information
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('parent_id')->nullable()->constrained('departments')->onDelete('set null');

            // Status
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['name', 'code']);
            $table->index(['branch_id', 'is_active']);
        });

        Schema::create('users', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Authentication
            $table->string('email')->unique()->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->string('username')->nullable()->unique();

            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('name')->virtualAs('CONCAT(first_name, \' \', last_name)');
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->date('date_of_birth')->nullable();

            // Contact Information
            $table->string('phone')->unique();
            $table->string('alternate_phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable()->default('Kenya');
            $table->string('postal_code')->nullable();

            // Professional Information
            $table->string('qualification')->nullable();
            $table->string('designation')->nullable();
            $table->enum('salary_type', ['monthly', 'weekly', 'daily'])->nullable();
            $table->decimal('salary', 12, 2)->nullable()->default(0);
            $table->enum('role', ['admin', 'manager', 'technician', 'receptionist', 'supervisor', 'sales']);
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');

            // Medical Information
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();

            // Financial Information
            $table->decimal('opening_balance', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);
            $table->date('ending_date')->nullable();

            // Files and Documents
            $table->string('profile_image')->nullable();
            $table->string('id_card')->nullable();
            $table->string('document')->nullable();

            // Additional Information
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');

            // Location Coordinates
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 11, 7)->nullable();

            // Status Flags
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['first_name', 'last_name']);
            $table->index(['phone', 'email']);
            $table->index(['role', 'status']);
            $table->index(['branch_id', 'department_id']);
            $table->index('created_at');
        });

        Schema::create('attendances', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Relationships
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Attendance Data
            $table->date('attendance_date');
            $table->time('clock_in')->nullable();
            $table->time('clock_out')->nullable();
            $table->enum('mode', ['manual', 'fingerprint'])->default('manual');
            $table->enum('status', ['present', 'absent', 'late', 'half-day'])->default('present');
            $table->text('remarks')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'attendance_date']);
            $table->index('attendance_date');
            $table->index(['status', 'attendance_date']);
        });

        // Laravel Default Tables
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('technicians');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('users');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('warehouses');
        Schema::dropIfExists('branches');
    }
};