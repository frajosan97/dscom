<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Brand;
use App\Models\Category;
use App\Models\DeviceType;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\RepairService;
use App\Models\Slider;
use App\Models\Tax;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ApiController extends Controller
{
    public function slider(string $type)
    {
        try {
            $slider = Slider::with('items')
                ->where('type', $type)
                ->first();

            if (!$slider) {
                return response()->json(['message' => 'Slider not found'], 404);
            }

            return response()->json($slider);
        } catch (\Throwable $th) {
            Log::error('Slider not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Slider not found'], 404);
        }
    }

    public function categories(Request $request)
    {
        try {
            $categories = Category::with(['children', 'parent'])
                ->withCount('products')
                ->whereNull('parent_id')
                ->orderBy('order')
                ->get();

            return response()->json($categories);
        } catch (\Throwable $th) {
            Log::error('Categories not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Categories not found'], 404);
        }
    }

    public function brands()
    {
        try {
            $brands = Brand::all();
            return response()->json($brands);
        } catch (\Throwable $th) {
            Log::error('Brands not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Brands not found'], 404);
        }
    }

    public function branches()
    {
        try {
            $branches = Branch::all();
            return response()->json($branches);
        } catch (\Throwable $th) {
            Log::error('Branches not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Branches not found'], 404);
        }
    }

    public function warehouses()
    {
        try {
            $warehouses = Warehouse::all();
            return response()->json($warehouses);
        } catch (\Throwable $th) {
            Log::error('Warehouses not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Warehouses not found'], 404);
        }
    }


    public function taxes()
    {
        try {
            $taxes = Tax::all();
            return response()->json($taxes);
        } catch (\Throwable $th) {
            Log::error('Taxes not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Taxes not found'], 404);
        }
    }

    public function customers()
    {
        try {
            $customers = User::role('customer')
                ->with('roles:id,name')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($customers);
        } catch (\Throwable $th) {
            Log::error('Customers not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Customers not found'], 404);
        }
    }

    public function paymentMethods()
    {
        try {
            $paymentMethods = PaymentMethod::all();
            return response()->json($paymentMethods);
        } catch (\Throwable $th) {
            Log::error('Payment methods not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Payment methods not found'], 404);
        }
    }

    public function products(Request $request)
    {
        try {
            $products = Product::with(['category', 'brand'])
                ->active()->get();

            return response()->json($products);
        } catch (\Throwable $th) {
            Log::error('Taxes not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Taxes not found'], 404);
        }
    }

    public function services(Request $request)
    {
        try {
            $services = RepairService::all();

            return response()->json($services);
        } catch (\Throwable $th) {
            Log::error('Services not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Services not found'], 404);
        }
    }

    public function deviceTypes(Request $request)
    {
        try {
            $deviceTypes = DeviceType::all();

            return response()->json($deviceTypes);
        } catch (\Throwable $th) {
            Log::error('Device types not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Device types not found'], 404);
        }
    }

    public function orderTrack($id)
    {
        try {
            $order = Order::with([
                'items',
                'statusHistory' => function ($query) {
                    $query->orderBy('created_at', 'desc');
                },
                'shippingMethod',
                'payments' => function ($query) {
                    $query->orderBy('created_at', 'desc');
                },
                'customer'
            ])->find($id);

            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            return response()->json($order);
        } catch (\Throwable $th) {
            Log::error('Order not found', ['error' => $th->getMessage()]);
            return response()->json(['message' => 'Order not found'], 404);
        }
    }
}
