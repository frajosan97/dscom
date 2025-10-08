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
            $table->json('working_days')->nullable(); // Array of working days (e.g., [1,2,3,4,5] for Mon-Fri)

            // E-commerce Specific Fields
            $table->boolean('is_active')->default(true);
            $table->boolean('is_online')->default(false);
            $table->boolean('has_pickup')->default(false);
            $table->boolean('has_delivery')->default(false);
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

        Schema::create('departments', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Department Information
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('branch_id')->nullable()->constrained('branches')->onDelete('set null');
            $table->foreignId('parent_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->boolean('is_active')->default(true);

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('name');
            $table->index('code');
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
            $table->enum('gender', ['Male', 'Female'])->nullable();
            $table->integer('age')->nullable();
            $table->date('birth_date')->nullable();
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
            $table->enum('salary_type', ['Monthly', 'Weekly', 'Daily'])->nullable();
            $table->decimal('salary', 12, 2)->nullable()->default(0);
            $table->enum('role', ['admin', 'manager', 'technician', 'receptionist', 'supervisor', 'sales']);
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');

            // Medical Information
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();

            // Financial Information
            $table->decimal('opening_balance', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);
            $table->date('ending_date');

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

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['first_name', 'last_name']);
            $table->index(['phone', 'email']);
            $table->index('role');
            $table->index('status');
            $table->index('department_id');
        });

        Schema::create('attendances', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Attendance Data
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('attendance_date');
            $table->time('clock_in')->nullable();
            $table->time('clock_out')->nullable();
            $table->enum('mode', ['manual', 'fingerprint'])->default('manual');
            $table->enum('status', ['present', 'absent', 'late', 'half-day'])->default('present');
            $table->text('remarks')->nullable();

            // Timestamps
            $table->timestamps();
        });

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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('users');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('branches');
    }
};
