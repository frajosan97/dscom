<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Salary Components Table
        Schema::create('salary_components', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('type', ['allowance', 'deduction']);
            $table->text('description')->nullable();
            $table->enum('calculation_type', ['fixed', 'percentage', 'formula'])->default('fixed');
            $table->decimal('calculation_value', 15, 2)->nullable()->default(0);
            $table->boolean('is_taxable')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->integer('order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['type', 'is_active']);
            $table->index(['code', 'is_active']);
        });

        // 2. Payroll Periods Table
        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['monthly', 'biweekly', 'weekly', 'daily', 'custom'])->default('monthly');
            $table->date('start_date');
            $table->date('end_date');
            $table->date('payment_date')->nullable();
            $table->integer('working_days')->default(0);
            $table->enum('status', ['open', 'processing', 'closed', 'locked'])->default('open');
            $table->text('description')->nullable();
            $table->foreignId('closed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['start_date', 'end_date']);
            $table->index(['type', 'status']);
            $table->unique(['start_date', 'end_date', 'type']);
        });

        // 3. Salaries Table
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('payroll_period_id')->constrained('payroll_periods')->onDelete('cascade');
            $table->decimal('basic_salary', 15, 2)->default(0);
            $table->decimal('total_allowances', 15, 2)->default(0);
            $table->decimal('total_deductions', 15, 2)->default(0);
            $table->decimal('gross_salary', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2)->default(0);
            $table->date('salary_date');
            $table->enum('status', ['pending', 'calculated', 'approved', 'paid', 'cancelled'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_notes')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['user_id', 'payroll_period_id']);
            $table->index(['status', 'salary_date']);
            $table->index(['user_id', 'status']);
            $table->index(['payroll_period_id', 'status']);
        });

        // 4. Salary Component Values Table
        Schema::create('salary_component_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_id')->constrained('salaries')->onDelete('cascade');
            $table->foreignId('salary_component_id')->constrained('salary_components')->onDelete('cascade');
            $table->decimal('amount', 15, 2)->default(0);
            $table->enum('type', ['allowance', 'deduction']);
            $table->text('calculation_note')->nullable();
            $table->timestamps();

            $table->unique(['salary_id', 'salary_component_id']);
            $table->index(['type', 'salary_id']);
        });

        // 5. Allowances Table
        Schema::create('allowances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('salary_component_id')->constrained('salary_components')->onDelete('cascade');
            $table->decimal('amount', 15, 2)->default(0);
            $table->enum('calculation_type', ['fixed', 'percentage'])->default('fixed');
            $table->decimal('calculation_value', 15, 2)->nullable()->default(0);
            $table->boolean('is_active')->default(true);
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index(['valid_from', 'valid_until']);
        });

        // 6. Deductions Table
        Schema::create('deductions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('salary_component_id')->constrained('salary_components')->onDelete('cascade');
            $table->decimal('amount', 15, 2)->default(0);
            $table->enum('calculation_type', ['fixed', 'percentage'])->default('fixed');
            $table->decimal('calculation_value', 15, 2)->nullable()->default(0);
            $table->boolean('is_active')->default(true);
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index(['valid_from', 'valid_until']);
        });

        // 7. Salary Payments Table
        Schema::create('salary_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_id')->constrained('salaries')->onDelete('cascade');
            $table->decimal('amount', 15, 2)->default(0);
            $table->date('payment_date');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'online', 'mobile'])->default('bank_transfer');
            $table->string('reference_no')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('paid_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['payment_date', 'payment_method']);
            $table->index(['salary_id', 'verified_at']);
        });
    }

    public function down(): void
    {
        // Drop tables in reverse order
        Schema::dropIfExists('salary_payments');
        Schema::dropIfExists('deductions');
        Schema::dropIfExists('allowances');
        Schema::dropIfExists('salary_component_values');
        Schema::dropIfExists('salaries');
        Schema::dropIfExists('payroll_periods');
        Schema::dropIfExists('salary_components');
    }
};