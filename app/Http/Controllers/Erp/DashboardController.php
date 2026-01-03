<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\RepairOrder;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->hasAnyRole(['director', 'admin'])) {
            return Inertia::render('Backend/ERP/Dashboard/Director', [
                'dashboardData' => $this->getDirectorData(),
            ]);
        } elseif ($user->hasRole('hr')) {
            return Inertia::render('Backend/ERP/Dashboard/HR', [
                'dashboardData' => $this->getHRData(),
            ]);
        } elseif ($user->hasRole('finance')) {
            return Inertia::render('Backend/ERP/Dashboard/Finance', [
                'dashboardData' => $this->getFinanceData(),
            ]);
        } elseif ($user->hasRole('technician')) {
            return Inertia::render('Backend/ERP/Dashboard/Technician', [
                'dashboardData' => $this->getTechnicianData($user),
            ]);
        } elseif ($user->hasRole('supplier')) {
            return Inertia::render('Backend/ERP/Dashboard/Supplier', [
                'dashboardData' => $this->getSupplierData($user),
            ]);
        } elseif ($user->hasAnyRole(['receptionist', 'sales'])) {
            return Inertia::render('Backend/ERP/Sale/SaleForm');
        } else {
            return Inertia::render('Backend/ERP/Dashboard/Customer', [
                'dashboardData' => $this->getCustomerData($user),
            ]);
        }
    }

    public function getDirectorData()
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

        // Sales Data
        $totalSales = Order::sum('total');
        $monthlySales = Order::whereBetween('created_at', [$startOfMonth, now()])->sum('total');
        $lastMonthSales = Order::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->sum('total');
        $salesChange = $lastMonthSales > 0 ? (($monthlySales - $lastMonthSales) / $lastMonthSales * 100) : 0;

        // Orders Data
        $totalOrders = Order::count();
        $onlineOrders = Order::whereNotNull('user_id')->count();
        $instoreOrders = Order::whereNull('user_id')->count();
        $todayOrders = Order::whereDate('created_at', $today)->count();

        // Product Data (replacing inventory data)
        $productsValue = Product::sum(DB::raw('base_price * total_quantity'));

        // // Get low stock products
        // $lowStockProducts = Product::where('track_quantity', true)
        //     ->where('total_quantity', '>', 0)
        //     ->whereRaw('total_quantity <= low_stock_alert')
        //     ->with('category')
        //     ->take(10)
        //     ->get()
        //     ->map(function ($product) {
        //         return [
        //             'id' => $product->id,
        //             'name' => $product->name,
        //             'sku' => $product->sku,
        //             'image' => $product->default_image_url,
        //             'category' => $product->category->name ?? 'Uncategorized',
        //             'total_quantity' => $product->total_quantity,
        //             'low_stock_alert' => $product->low_stock_alert,
        //         ];
        //     });

        $lowStockProducts = [];

        $lowStockItemsCount = Product::where('track_quantity', true)
            ->where('total_quantity', '>', 0)
            ->whereRaw('total_quantity <= low_stock_alert')
            ->count();

        $outOfStockCount = Product::where('track_quantity', true)
            ->where('total_quantity', 0)
            ->count();

        $activeProductsCount = Product::where('is_active', true)->count();
        $featuredProductsCount = Product::where('is_featured', true)->count();

        // Repair Data
        $repairRevenue = RepairOrder::whereIn('status', ['completed', 'delivered'])->sum('total_amount');
        $completedRepairs = RepairOrder::whereIn('status', ['completed', 'delivered'])->count();
        $inProgressRepairs = RepairOrder::whereIn('status', ['diagnosing', 'repairing', 'awaiting_parts'])->count();

        // Get top selling products
        $topSellingProducts = DB::table('order_items')
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                'products.total_quantity',
                'products.low_stock_alert',
                'products.is_active',
                'categories.name as category_name',
                DB::raw('SUM(order_items.quantity) as sales_count'),
                DB::raw('SUM(order_items.quantity * order_items.unit_price) as revenue')
            )
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->groupBy('products.id', 'products.name', 'products.sku', 'products.total_quantity', 'products.low_stock_alert', 'products.is_active', 'categories.name')
            ->orderByDesc('sales_count')
            ->take(10)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'image' => '',
                    'category' => $product->category_name ?? 'Uncategorized',
                    'total_quantity' => $product->total_quantity,
                    'low_stock_alert' => $product->low_stock_alert,
                    'is_active' => $product->is_active,
                    'sales_count' => $product->sales_count,
                    'revenue' => $product->revenue,
                ];
            });

        // Additional Metrics
        $pendingOrders = Order::where('status', 'pending')->count();
        $unpaidOrders = Order::where('payment_status', '!=', 'paid')->count();
        $overdueRepairs = RepairOrder::where('expected_completion_date', '<', now())
            ->whereNotIn('status', ['completed', 'delivered', 'cancelled'])
            ->count();

        // Recent Orders
        $recentOrders = Order::with(['customer', 'branch'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($order) {
                return [
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer->name ?? 'Walk-in Customer',
                    'total' => $order->total,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->format('M d, Y H:i'),
                ];
            });

        // Revenue Chart Data (Last 6 months)
        $revenueData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            $salesRevenue = Order::whereBetween('created_at', [$monthStart, $monthEnd])->sum('total');
            $repairRevenueMonth = RepairOrder::whereBetween('completion_date', [$monthStart, $monthEnd])
                ->whereIn('status', ['completed', 'delivered'])
                ->sum('total_amount');

            $revenueData[] = [
                'month' => $month->format('M'),
                'sales' => $salesRevenue,
                'repairs' => $repairRevenueMonth,
                'total' => $salesRevenue + $repairRevenueMonth,
            ];
        }

        // Calculate stock health percentage
        $totalProducts = Product::where('track_quantity', true)->count();
        $healthyStockProducts = Product::where('track_quantity', true)
            ->where('total_quantity', '>', DB::raw('low_stock_alert'))
            ->count();

        $stockHealth = $totalProducts > 0 ? ($healthyStockProducts / $totalProducts) * 100 : 100;

        return [
            'statCards' => [
                [
                    'title' => 'Total Sales',
                    'amount' => number_format($totalSales, 2),
                    'subtitle' => sprintf('%+.1f%% vs last month', $salesChange),
                    'icon' => '💰',
                    'color' => $salesChange >= 0 ? 'success' : 'danger',
                ],
                [
                    'title' => 'Total Orders',
                    'amount' => $totalOrders,
                    'subtitle' => sprintf('%d online • %d in-store', $onlineOrders, $instoreOrders),
                    'icon' => '🛒',
                    'color' => 'info',
                ],
                [
                    'title' => 'Products Value',
                    'amount' => number_format($productsValue, 2),
                    'subtitle' => sprintf('%d low stock items', $lowStockItemsCount),
                    'icon' => '📦',
                    'color' => $lowStockItemsCount > 10 ? 'danger' : 'warning',
                ],
                [
                    'title' => 'Repair Revenue',
                    'amount' => number_format($repairRevenue, 2),
                    'subtitle' => sprintf('%d completed • %d in progress', $completedRepairs, $inProgressRepairs),
                    'icon' => '🛠️',
                    'color' => 'primary',
                ],
            ],
            'additionalMetrics' => [
                [
                    'title' => 'Pending Orders',
                    'value' => $pendingOrders,
                    'icon' => '⏳',
                ],
                [
                    'title' => 'Unpaid Orders',
                    'value' => $unpaidOrders,
                    'icon' => '💳',
                ],
                [
                    'title' => 'Overdue Repairs',
                    'value' => $overdueRepairs,
                    'icon' => '⚠️',
                ],
                [
                    'title' => "Today's Orders",
                    'value' => $todayOrders,
                    'icon' => '📈',
                ],
            ],
            'recentOrders' => $recentOrders,
            'revenueChart' => $revenueData,
            'lowStockProducts' => $lowStockProducts,
            'topSellingProducts' => $topSellingProducts,
            'summary' => [
                'totalRevenue' => number_format($totalSales + $repairRevenue, 2),
                'averageOrderValue' => $totalOrders > 0 ? number_format($totalSales / $totalOrders, 2) : 0,
                'customerCount' => 0,
                'stockHealth' => round($stockHealth, 1),
                'lowStockCount' => $lowStockItemsCount,
                'outOfStock' => $outOfStockCount,
                'activeProducts' => $activeProductsCount,
                'featuredProducts' => $featuredProductsCount,
            ],
        ];
    }
}