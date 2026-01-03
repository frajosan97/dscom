<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\RepairOrder;
use App\Models\User;
use App\Models\Product;
use App\Models\Inventory;
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

        // Inventory Data
        $inventoryValue = Inventory::with('product')
            ->get()
            ->sum(function ($inventory) {
                return $inventory->quantity * ($inventory->product->cost_price ?? 0);
            });

        $lowStockItems = Inventory::whereColumn('quantity', '<=', 'low_stock_threshold')->count();

        // Repair Data
        $repairRevenue = RepairOrder::whereIn('status', ['completed', 'delivered'])->sum('total_amount');
        $completedRepairs = RepairOrder::whereIn('status', ['completed', 'delivered'])->count();
        $inProgressRepairs = RepairOrder::whereIn('status', ['diagnosing', 'repairing', 'awaiting_parts'])->count();

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
                    'title' => 'Inventory Value',
                    'amount' => number_format($inventoryValue, 2),
                    'subtitle' => sprintf('%d low stock items', $lowStockItems),
                    'icon' => '📦',
                    'color' => $lowStockItems > 10 ? 'danger' : 'warning',
                ],
                [
                    'title' => 'Repair Revenue',
                    'amount' => number_format($repairRevenue, 2),
                    'subtitle' => sprintf('%d completed • %d in progress', $completedRepairs, $inProgressRepairs),
                    'icon' => '🛠️',
                    'color' => 'warning',
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
            'summary' => [
                'totalRevenue' => number_format($totalSales + $repairRevenue, 2),
                'averageOrderValue' => $totalOrders > 0 ? number_format($totalSales / $totalOrders, 2) : 0,
                'conversionRate' => 'N/A', // Would need more data
                'customerCount' => User::whereHas('orders')->count(),
            ],
        ];
    }

    public function getHRData()
    {
        $totalEmployees = User::whereHas('roles', function ($q) {
            $q->whereNotIn('name', ['customer']);
        })->count();

        $onLeave = User::whereHas('leaveRequests', function ($q) {
            $q->where('status', 'approved')
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now());
        })->count();

        $newHires = User::whereHas('roles', function ($q) {
            $q->whereNotIn('name', ['customer']);
        })->where('created_at', '>=', Carbon::now()->subDays(30))->count();

        // $pendingLeaveRequests = LeaveRequest::where('status', 'pending')->count();
        $pendingLeaveRequests = 0;

        return [
            'statCards' => [
                [
                    'title' => 'Total Employees',
                    'amount' => $totalEmployees,
                    'subtitle' => 'Active staff members',
                    'icon' => '👥',
                    'color' => 'info',
                ],
                [
                    'title' => 'On Leave',
                    'amount' => $onLeave,
                    'subtitle' => 'Currently away',
                    'icon' => '🏖️',
                    'color' => 'warning',
                ],
                [
                    'title' => 'New Hires',
                    'amount' => $newHires,
                    'subtitle' => 'Last 30 days',
                    'icon' => '🎯',
                    'color' => 'success',
                ],
                [
                    'title' => 'Leave Requests',
                    'amount' => $pendingLeaveRequests,
                    'subtitle' => 'Awaiting approval',
                    'icon' => '📋',
                    'color' => 'danger',
                ],
            ],
            'recentActivities' => [
                // Add recent HR activities
            ],
        ];
    }

    public function getFinanceData()
    {
        $totalRevenue = Order::sum('total') + RepairOrder::whereIn('status', ['completed', 'delivered'])->sum('total_amount');
        $totalReceivables = Order::whereColumn('total_paid', '<', 'total')->sum(DB::raw('total - total_paid'));
        $monthlyExpenses = 0; // You'll need to implement an Expense model
        $profitMargin = $totalRevenue > 0 ? (($totalRevenue - $monthlyExpenses) / $totalRevenue * 100) : 0;

        // Top customers by revenue
        $topCustomers = Order::select('customer_id', DB::raw('SUM(total) as total_spent'))
            ->whereNotNull('customer_id')
            ->groupBy('customer_id')
            ->with('customer')
            ->orderByDesc('total_spent')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->customer->name ?? 'Unknown',
                    'email' => $item->customer->email ?? '',
                    'total_spent' => number_format($item->total_spent, 2),
                    'order_count' => $item->customer->orders->count() ?? 0,
                ];
            });

        return [
            'statCards' => [
                [
                    'title' => 'Total Revenue',
                    'amount' => number_format($totalRevenue, 2),
                    'subtitle' => 'All-time total',
                    'icon' => '💰',
                    'color' => 'success',
                ],
                [
                    'title' => 'Accounts Receivable',
                    'amount' => number_format($totalReceivables, 2),
                    'subtitle' => 'Outstanding payments',
                    'icon' => '📊',
                    'color' => 'warning',
                ],
                [
                    'title' => 'Monthly Expenses',
                    'amount' => number_format($monthlyExpenses, 2),
                    'subtitle' => 'Current month',
                    'icon' => '💸',
                    'color' => 'danger',
                ],
                [
                    'title' => 'Profit Margin',
                    'amount' => number_format($profitMargin, 1) . '%',
                    'subtitle' => 'Net profit percentage',
                    'icon' => '📈',
                    'color' => $profitMargin > 20 ? 'success' : ($profitMargin > 10 ? 'warning' : 'danger'),
                ],
            ],
            'topCustomers' => $topCustomers,
            'paymentMethods' => [
                // Add payment method distribution
            ],
        ];
    }

    public function getTechnicianData($user)
    {
        $assignedRepairs = RepairOrder::where('assigned_technician_id', $user->id)
            ->whereNotIn('status', ['completed', 'delivered', 'cancelled'])
            ->count();

        $completedThisMonth = RepairOrder::where('assigned_technician_id', $user->id)
            ->whereIn('status', ['completed', 'delivered'])
            ->whereMonth('completion_date', Carbon::now()->month)
            ->count();

        $overdueRepairs = RepairOrder::where('assigned_technician_id', $user->id)
            ->where('expected_completion_date', '<', now())
            ->whereNotIn('status', ['completed', 'delivered', 'cancelled'])
            ->count();

        $awaitingParts = RepairOrder::where('assigned_technician_id', $user->id)
            ->where('status', 'awaiting_parts')
            ->count();

        $myRepairs = RepairOrder::where('assigned_technician_id', $user->id)
            ->whereNotIn('status', ['completed', 'delivered', 'cancelled'])
            ->with(['repairService', 'customer'])
            ->orderBy('priority', 'desc')
            ->orderBy('expected_completion_date')
            ->take(10)
            ->get()
            ->map(function ($repair) {
                return [
                    'id' => $repair->id,
                    'order_number' => $repair->order_number,
                    'service' => $repair->repairService->name ?? 'Unknown',
                    'customer' => $repair->customer->name ?? 'Walk-in',
                    'status' => $repair->status,
                    'priority' => $repair->priority,
                    'expected_date' => $repair->expected_completion_date?->format('M d, Y'),
                    'is_overdue' => $repair->expected_completion_date && $repair->expected_completion_date < now(),
                ];
            });

        return [
            'statCards' => [
                [
                    'title' => 'Assigned Repairs',
                    'amount' => $assignedRepairs,
                    'subtitle' => 'Currently working on',
                    'icon' => '🛠️',
                    'color' => 'info',
                ],
                [
                    'title' => 'Completed (Month)',
                    'amount' => $completedThisMonth,
                    'subtitle' => 'This month',
                    'icon' => '✅',
                    'color' => 'success',
                ],
                [
                    'title' => 'Overdue',
                    'amount' => $overdueRepairs,
                    'subtitle' => 'Past due date',
                    'icon' => '⚠️',
                    'color' => 'danger',
                ],
                [
                    'title' => 'Awaiting Parts',
                    'amount' => $awaitingParts,
                    'subtitle' => 'Waiting for inventory',
                    'icon' => '📦',
                    'color' => 'warning',
                ],
            ],
            'myRepairs' => $myRepairs,
            'recentActivity' => [
                // Add recent repair activity
            ],
        ];
    }

    public function getSupplierData($user)
    {
        // Assuming supplier is linked via user_id in supplier_products or similar
        $activeProducts = 0; // You'll need to implement this based on your supplier model
        $pendingOrders = 0;
        $totalRevenue = 0;
        $averageRating = 0;

        return [
            'statCards' => [
                [
                    'title' => 'Active Products',
                    'amount' => $activeProducts,
                    'subtitle' => 'Supplied items',
                    'icon' => '📦',
                    'color' => 'info',
                ],
                [
                    'title' => 'Pending Orders',
                    'amount' => $pendingOrders,
                    'subtitle' => 'Awaiting fulfillment',
                    'icon' => '📋',
                    'color' => 'warning',
                ],
                [
                    'title' => 'Total Revenue',
                    'amount' => number_format($totalRevenue, 2),
                    'subtitle' => 'All-time sales',
                    'icon' => '💰',
                    'color' => 'success',
                ],
                [
                    'title' => 'Average Rating',
                    'amount' => number_format($averageRating, 1),
                    'subtitle' => 'Customer feedback',
                    'icon' => '⭐',
                    'color' => $averageRating >= 4 ? 'success' : ($averageRating >= 3 ? 'warning' : 'danger'),
                ],
            ],
            'recentOrders' => [
                // Add recent supplier orders
            ],
        ];
    }

    public function getCustomerData($user)
    {
        $totalOrders = Order::where('customer_id', $user->id)->count();
        $totalSpent = Order::where('customer_id', $user->id)->sum('total');
        $pendingOrders = Order::where('customer_id', $user->id)
            ->where('status', 'pending')
            ->count();

        $repairOrders = RepairOrder::where('customer_id', $user->id)->count();

        $recentOrders = Order::where('customer_id', $user->id)
            ->with(['branch', 'items'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'order_number' => $order->order_number,
                    'total' => $order->total,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->format('M d, Y'),
                    'item_count' => $order->items->count(),
                ];
            });

        $activeRepairs = RepairOrder::where('customer_id', $user->id)
            ->whereNotIn('status', ['completed', 'delivered', 'cancelled'])
            ->with(['repairService', 'assignedTechnician'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($repair) {
                return [
                    'order_number' => $repair->order_number,
                    'service' => $repair->repairService->name ?? 'Unknown',
                    'status' => $repair->status,
                    'estimated_cost' => $repair->estimated_cost,
                    'expected_date' => $repair->expected_completion_date?->format('M d, Y'),
                    'technician' => $repair->assignedTechnician->name ?? 'Not assigned',
                ];
            });

        return [
            'statCards' => [
                [
                    'title' => 'Total Orders',
                    'amount' => $totalOrders,
                    'subtitle' => 'All purchases',
                    'icon' => '🛒',
                    'color' => 'info',
                ],
                [
                    'title' => 'Total Spent',
                    'amount' => number_format($totalSpent, 2),
                    'subtitle' => 'Lifetime value',
                    'icon' => '💰',
                    'color' => 'success',
                ],
                [
                    'title' => 'Pending Orders',
                    'amount' => $pendingOrders,
                    'subtitle' => 'Awaiting processing',
                    'icon' => '⏳',
                    'color' => 'warning',
                ],
                [
                    'title' => 'Repair Orders',
                    'amount' => $repairOrders,
                    'subtitle' => 'Device repairs',
                    'icon' => '🛠️',
                    'color' => 'danger',
                ],
            ],
            'recentOrders' => $recentOrders,
            'activeRepairs' => $activeRepairs,
            'loyaltyPoints' => $user->loyalty_points ?? 0,
        ];
    }
}