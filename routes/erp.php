<?php

use App\Http\Controllers\Erp\DashboardController;
use App\Http\Controllers\Erp\Hrm\AttendanceController;
use App\Http\Controllers\Erp\Crm\CustomerController;
use App\Http\Controllers\Erp\Crm\FeedbackController;
use App\Http\Controllers\Erp\Crm\PromotionController;
use App\Http\Controllers\Erp\Crm\TicketController;
use App\Http\Controllers\Erp\Hrm\EmployeeController;
use App\Http\Controllers\Erp\Hrm\SalaryController;
use App\Http\Controllers\Erp\Product\BarcodeController;
use App\Http\Controllers\Erp\Product\ProductController;
use App\Http\Controllers\Erp\Product\SaleController;
use App\Http\Controllers\Erp\Service\DeviceTypeController;
use App\Http\Controllers\Erp\Service\RepairOrderController;
use App\Http\Controllers\Erp\Service\RepairServiceController;
use App\Http\Controllers\Erp\Setting\BranchController;
use App\Http\Controllers\Erp\Setting\BrandController;
use App\Http\Controllers\Erp\Setting\CategoryController;
use App\Http\Controllers\Erp\Setting\PaymentMethodController;
use App\Http\Controllers\Erp\Setting\SliderController;
use App\Http\Controllers\Erp\Setting\SliderItemController;
use App\Http\Controllers\Erp\Setting\WarehouseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
| All routes here are protected by auth, verified, and permission middleware.
| These routes are only accessible to authenticated users with the appropriate permissions.
*/

Route::middleware(['auth', 'verified'])->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Dashboard Routes
    |--------------------------------------------------------------------------
    */

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Resourceful Routes
    |--------------------------------------------------------------------------
    | These routes handle all CRUD operations for the application's resources.
    | Each resource is mapped to its corresponding controller.
    */
    Route::prefix('settings')->group(function () {
        Route::resources([
            'branch' => BranchController::class,
            'warehouse' => WarehouseController::class,
            'payment-method' => PaymentMethodController::class,
            'category' => CategoryController::class,
            'brand' => BrandController::class,
            'slider' => SliderController::class,
            'slider-item' => SliderItemController::class,
        ]);
    });

    Route::prefix('store')->group(function () {
        Route::resources([
            'product' => ProductController::class,
            'barcode' => BarcodeController::class,
            'sales' => SaleController::class,
        ]);
    });

    Route::prefix('service')->group(function () {
        Route::resources([
            'device-type' => DeviceTypeController::class,
            'repair-service' => RepairServiceController::class,
            'repair-orders' => RepairOrderController::class,
        ]);

        // assign technician
        Route::get('assign-technician', [RepairOrderController::class, 'assign'])->name('repair-orders.assign-technician');
        Route::post('assign-technician', [RepairOrderController::class, 'assignStore'])->name('repair-orders.assign-technician');
    });

    Route::prefix('hrm')->group(function () {
        Route::resources([
            'employee' => EmployeeController::class,
            'attendance' => AttendanceController::class,
            'salary' => SalaryController::class,
        ]);
    });

    Route::prefix('crm')->group(function () {
        Route::resources([
            'customers' => CustomerController::class,
            'promotion' => PromotionController::class,
            'feedback' => FeedbackController::class,
            'ticket' => TicketController::class,
        ]);

        Route::post('send-sms', [CustomerController::class, 'sendSms'])->name('send-sms');
    });

    Route::prefix('finance')->group(function () {
        Route::get('/chart-of-accounts', function () {
            return Inertia::render('Backend/ERP/Finance/ChartOfAccounts');
        })->name('finance.chart-of-accounts');
        Route::get('/transactions', function () {
            return Inertia::render('Backend/ERP/Finance/Transactions');
        })->name('finance.transactions');
        Route::get('/invoices', function () {
            return Inertia::render('Backend/ERP/Finance/Invoices');
        })->name('finance.invoices');
        Route::get('/payments', function () {
            return Inertia::render('Backend/ERP/Finance/Payments');
        })->name('finance.payments');
        Route::get('/bank-reconciliation', function () {
            return Inertia::render('Backend/ERP/Finance/BankReconciliation');
        })->name('finance.bank-reconciliation');
        Route::get('/reports', function () {
            return Inertia::render('Backend/ERP/Finance/Reports');
        })->name('finance.reports');
    });

    // routes/web.php
    Route::post('/employees/import', [EmployeeController::class, 'import'])->name('employee.import');
    Route::get('/employees/import/template', [EmployeeController::class, 'downloadTemplate'])->name('employee.import.template');
});
