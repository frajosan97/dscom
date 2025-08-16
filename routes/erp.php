<?php

use App\Http\Controllers\Erp\BranchController;
use App\Http\Controllers\Erp\DashboardController;
use App\Http\Controllers\Erp\BrandController;
use App\Http\Controllers\Erp\CategoryController;
use App\Http\Controllers\Erp\CustomerController;
use App\Http\Controllers\Erp\PaymentMethodController;
use App\Http\Controllers\Erp\ProductController;
use App\Http\Controllers\Erp\RepairServiceController;
use App\Http\Controllers\Erp\DeviceTypeController;
use App\Http\Controllers\Erp\EmployeeController;
use App\Http\Controllers\Erp\SaleController;
use App\Http\Controllers\Erp\ServiceController;
use App\Http\Controllers\Erp\SliderController;
use App\Http\Controllers\Erp\SliderItemController;
use App\Http\Controllers\Erp\WarehouseController;
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
    Route::resources([
        'branch'         => BranchController::class,
        'warehouse'      => WarehouseController::class,
        'payment-method' => PaymentMethodController::class,
        'category'       => CategoryController::class,
        'brand'          => BrandController::class,
        'slider'         => SliderController::class,
        'slider-item'    => SliderItemController::class,
        'product'        => ProductController::class,
        'device-type'    => DeviceTypeController::class,
        'repair-service' => RepairServiceController::class,
        'sales'          => SaleController::class,
        'customers'      => CustomerController::class,
        'services'       => ServiceController::class,
        'employee'       => EmployeeController::class,
    ]);
});
