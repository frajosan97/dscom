<?php

use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;

/**
 * ---------------------------------------------------
 * Public API Endpoints for Fetching Site Data
 * ---------------------------------------------------
 * These routes provide data for frontend components.
 * All data-related API endpoints are prefixed with "/data".
 */
Route::prefix('/data')->group(function () {
    Route::get('/order-tracking/{id}', [ApiController::class, 'orderTrack'])->name('order.track');
    Route::get('/slider/{slider}', [ApiController::class, 'slider'])->name('api.slider');

    // Use filter apis
    Route::get('/categories', [ApiController::class, 'categories'])->name('api.categories');
    Route::get('/brands', [ApiController::class, 'brands'])->name('api.brands');
    Route::get('/branches', [ApiController::class, 'branches'])->name('api.branches');
    Route::get('/warehouses', [ApiController::class, 'warehouses'])->name('api.warehouses');
    Route::get('/taxes', [ApiController::class, 'taxes'])->name('api.taxes');
    Route::get('/customers', [ApiController::class, 'customers'])->name('api.customers');
    Route::get('/products', [ApiController::class, 'products'])->name('api.products');
    Route::get('/services', [ApiController::class, 'services'])->name('api.services');
    Route::get('/device-types', [ApiController::class, 'deviceTypes'])->name('api.device-types');
    Route::get('/payment-methods', [ApiController::class, 'paymentMethods'])->name('api.payment-methods');
});
