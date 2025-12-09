<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {

        $user = Auth::user();

        $dashboardData = $this->getDashboardData();

        if ($user->hasRole('director')) {
            return Inertia::render('Backend/ERP/Dashboard/Director', [
                'dashboardData' => $dashboardData,
            ]);
        } elseif ($user->hasRole('admin')) {
            return Inertia::render('Backend/ERP/Dashboard/Admin', [
                'dashboardData' => $dashboardData,
            ]);
        } elseif ($user->hasRole('hr')) {
            return Inertia::render('Backend/ERP/Dashboard/HR');
        } elseif ($user->hasRole('finance')) {
            return Inertia::render('Backend/ERP/Dashboard/Finance');
        } elseif ($user->hasRole('technician')) {
            return Inertia::render('Backend/ERP/Dashboard/Technician');
        } elseif ($user->hasRole('supplier')) {
            return Inertia::render('Backend/ERP/Dashboard/Supplier');
        } elseif ($user->hasRole('receptionist')) {
            return Inertia::render('Backend/ERP/Sale/SaleForm');
        } elseif ($user->hasRole('sales')) {
            return Inertia::render('Backend/ERP/Sale/SaleForm');
        } else {
            return Inertia::render('Backend/ERP/Dashboard/Customer');
        }
    }

    public function getDashboardData()
    {
        // Generate sales data for the last 7 months
        $salesData = [];
        $repairData = [];
        $months = [];

        for ($i = 6; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthName = $month->format('M');
            $months[] = $monthName;

            $salesData[] = [
                'name' => $monthName,
                'online' => rand(2000, 5000),
                'retail' => rand(1000, 4000)
            ];

            $repairData[] = [
                'name' => $monthName,
                'completed' => rand(15, 50),
                'pending' => rand(5, 30)
            ];
        }

        return [
            'summaryMetrics' => [
                'totalSales' => 125000,
                'salesGrowth' => 12.5,
                'totalOrders' => 342,
                'onlineOrders' => 224,
                'retailOrders' => 118,
                'inventoryValue' => 587000,
                'lowStockItems' => 18,
                'repairRevenue' => 28750,
                'completedRepairs' => 42,
                'repairOrders' => 56
            ],

            'salesData' => $salesData,

            'revenueSources' => [
                ['name' => 'Product Sales', 'value' => 75],
                ['name' => 'Repair Services', 'value' => 15],
                ['name' => 'Accessories', 'value' => 7],
                ['name' => 'Other', 'value' => 3]
            ],

            'repairData' => $repairData,

            'inventoryData' => [
                ['name' => 'Laptops', 'value' => 400],
                ['name' => 'Phones', 'value' => 300],
                ['name' => 'Tablets', 'value' => 200],
                ['name' => 'Accessories', 'value' => 150]
            ],

            'topProducts' => [
                ['id' => 1, 'name' => 'MacBook Pro M2', 'sales' => 142, 'revenue' => 284000],
                ['id' => 2, 'name' => 'iPhone 15 Pro', 'sales' => 98, 'revenue' => 137200],
                ['id' => 3, 'name' => 'Samsung Galaxy S23', 'sales' => 76, 'revenue' => 83600],
                ['id' => 4, 'name' => 'AirPods Pro', 'sales' => 65, 'revenue' => 16250],
                ['id' => 5, 'name' => 'iPad Air', 'sales' => 54, 'revenue' => 32400]
            ],

            'recentOrders' => [
                ['id' => '#ORD-1001', 'customer' => 'John Doe', 'amount' => 1250, 'status' => 'completed'],
                ['id' => '#ORD-1002', 'customer' => 'Jane Smith', 'amount' => 899, 'status' => 'processing'],
                ['id' => '#ORD-1003', 'customer' => 'Robert Johnson', 'amount' => 450, 'status' => 'pending'],
                ['id' => '#ORD-1004', 'customer' => 'Emily Davis', 'amount' => 2200, 'status' => 'completed'],
                ['id' => '#ORD-1005', 'customer' => 'Michael Wilson', 'amount' => 650, 'status' => 'shipped']
            ],

            'repairStatus' => [
                ['id' => '#REP-2001', 'device' => 'iPhone 12', 'issue' => 'Screen replacement', 'status' => 'completed'],
                ['id' => '#REP-2002', 'device' => 'MacBook Air', 'issue' => 'Battery replacement', 'status' => 'in_progress'],
                ['id' => '#REP-2003', 'device' => 'Samsung S22', 'issue' => 'Water damage', 'status' => 'diagnosis'],
                ['id' => '#REP-2004', 'device' => 'iPad Pro', 'issue' => 'Charging port', 'status' => 'pending'],
                ['id' => '#REP-2005', 'device' => 'Dell XPS', 'issue' => 'Motherboard', 'status' => 'awaiting_parts']
            ],

            'customerAcquisition' => [
                'metrics' => [
                    [
                        'label' => 'New Customers',
                        'value' => 87,
                        'trend' => 12.5,
                        'percentage' => 65
                    ],
                    [
                        'label' => 'Repeat Customers',
                        'value' => 124,
                        'trend' => 8.3,
                        'percentage' => 80
                    ],
                    [
                        'label' => 'Online vs In-Store',
                        'value' => '2.5:1 ratio',
                        'components' => [
                            ['value' => 72, 'variant' => 'info'],
                            ['value' => 28, 'variant' => 'warning']
                        ]
                    ]
                ]
            ]
        ];
    }
}
