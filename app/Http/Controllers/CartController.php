<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CartController extends Controller
{
    public function checkout(Request $request)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Checkout successful',
                'orderNumber' => '123456'
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ]);
        }
    }
}
