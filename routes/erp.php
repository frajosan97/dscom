<?php

use App\Http\Controllers\Erp\DashboardController;
use App\Http\Controllers\Erp\Hrm\AttendanceController;
use App\Http\Controllers\Erp\Hrm\CustomerController;
use App\Http\Controllers\Erp\Hrm\EmployeeController;
use App\Http\Controllers\Erp\Hrm\SalaryController;
use App\Http\Controllers\Erp\Product\ProductController;
use App\Http\Controllers\Erp\Product\SaleController;
use App\Http\Controllers\Erp\Service\DeviceTypeController;
use App\Http\Controllers\Erp\Service\RepairOrderController;
use App\Http\Controllers\Erp\Service\RepairServiceController;
use App\Http\Controllers\Erp\Service\ServiceController;
use App\Http\Controllers\Erp\Setting\BranchController;
use App\Http\Controllers\Erp\Setting\BrandController;
use App\Http\Controllers\Erp\Setting\CategoryController;
use App\Http\Controllers\Erp\Setting\PaymentMethodController;
use App\Http\Controllers\Erp\Setting\SliderController;
use App\Http\Controllers\Erp\Setting\SliderItemController;
use App\Http\Controllers\Erp\Setting\WarehouseController;
use Illuminate\Support\Facades\Route;

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
            'customers' => CustomerController::class,
        ]);
    });
});
