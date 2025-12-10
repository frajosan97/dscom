<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\RepairService;
use App\Models\RepairServiceDeviceType;
use App\Models\Slider;
use App\Models\Tax;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

class ApiController extends Controller
{
    public function roles()
    {
        try {
            $roles = Role::all();
            return response()->json($roles);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'roles not found']);
        }
    }

    public function slider(string $type)
    {
        try {
            $slider = Slider::with('items')
                ->where('name', $type)
                ->first();

            if (!$slider) {
                return response()->json(['message' => 'Slider not found']);
            }

            return response()->json($slider);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Slider not found']);
        }
    }

    public function categories(Request $request)
    {
        try {
            $categories = Category::with(['children', 'parent'])
                ->whereNull('parent_id')
                ->orderBy('order')
                ->get();

            // Add product count including children's products
            $categories->each(function ($category) {
                $category->products_count = $this->countProductsRecursively($category);
            });

            return response()->json($categories);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Categories not found']);
        }
    }

    private function countProductsRecursively($category)
    {
        $count = $category->products()->count();

        foreach ($category->children as $child) {
            $count += $this->countProductsRecursively($child);
        }

        return $count;
    }

    public function brands()
    {
        try {
            $brands = Brand::all();
            return response()->json($brands);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Brands not found']);
        }
    }

    public function branches()
    {
        try {
            $branches = Branch::all();
            return response()->json($branches);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Branches not found']);
        }
    }

    public function warehouses()
    {
        try {
            $warehouses = Warehouse::all();
            return response()->json($warehouses);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Warehouses not found']);
        }
    }

    public function taxes()
    {
        try {
            $taxes = Tax::all();
            return response()->json($taxes);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Taxes not found']);
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
            return response()->json(['message' => 'Customers not found']);
        }
    }

    public function technicians()
    {
        try {
            $technicians = User::role('technician')
                ->with('roles:id,name')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($technicians);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'technicians not found']);
        }
    }

    public function staff()
    {
        try {
            $staff = User::withoutRole('customer')
                ->with('roles:id,name')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($staff);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'staff not found']);
        }
    }

    public function employees()
    {
        try {
            $employees = User::withoutRole('customer')
                ->with('roles:id,name')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($employees);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'employees not found']);
        }
    }

    public function customerSearch(Request $request)
    {
        try {
            $request->validate([
                'value' => 'required|string|min:2|max:255',
                'field' => 'nullable|string|in:name,email,phone,username'
            ]);

            $searchValue = '%' . $request->value . '%';

            if ($request->has('field') && $request->field) {
                // Search in specific field (whitelisted)
                $customers = User::where($request->field, 'like', $searchValue)
                    ->get();
            } else {
                // Search across multiple fields
                $customers = User::where('name', 'like', $searchValue)
                    ->orWhere('phone', 'like', $searchValue)
                    ->orWhere('email', 'like', $searchValue)
                    ->get();
            }

            return response()->json([
                'success' => true,
                'customers' => $customers
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Customers not found'
            ]);
        }
    }

    public function paymentMethods()
    {
        try {
            $paymentMethods = PaymentMethod::all();
            return response()->json($paymentMethods);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Payment methods not found']);
        }
    }

    public function products(Request $request)
    {
        try {
            $products = Product::with([
                'category',
                'brand',
                'defaultImage',
                'items'
            ])
                ->active()->get();

            return response()->json($products);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Products not found']);
        }
    }

    public function services(Request $request)
    {
        try {
            $services = RepairService::all();

            return response()->json($services);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Services not found']);
        }
    }

    public function deviceTypes(Request $request)
    {
        try {
            $deviceTypes = RepairServiceDeviceType::all();

            return response()->json($deviceTypes);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Device types not found']);
        }
    }

    public function orderTrack($id)
    {
        try {
            $order = Order::with([
                'items',
                'statusHistory' => function ($query) {
                    $query->orderBy('created_at', 'desc');
                }
                ,
                'shippingMethod',
                'payments' => function ($query) {
                    $query->orderBy('created_at', 'desc');
                }
                ,
                'customer'
            ])->find($id);

            if (!$order) {
                return response()->json(['message' => 'Order not found']);
            }

            return response()->json($order);
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Order not found']);
        }
    }
}
