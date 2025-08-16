<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Erp\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

switch (systemMode()) {
    case 'erp':
        /*
        |--------------------------------------------------------------------------
        | ERP Routes
        |--------------------------------------------------------------------------
        */
        include_once "erp.php";
        break;

    default:
        /*
        |--------------------------------------------------------------------------
        | Ecommerce Routes
        |--------------------------------------------------------------------------
        */
        Route::get('/', function () {
            return Inertia::render('Frontend/Home');
        });

        Route::get('/about-us', function () {
            return Inertia::render('Frontend/About');
        });

        Route::get('/contact-us', function () {
            return Inertia::render('Frontend/Contact');
        });

        Route::get('/track-order', function () {
            return Inertia::render('Frontend/TrackOrder');
        });

        Route::get('/cart', function () {
            return Inertia::render('Frontend/Cart');
        });

        Route::resources([
            'category' => CategoryController::class,
            'product'  => ProductController::class,
        ]);

        Route::middleware(['auth'])->group(function () {
            Route::post('/cart-cehckout', [CartController::class, 'checkout'])->name('cart.checkout');
        });
        break;
}

require __DIR__ . '/auth.php';
