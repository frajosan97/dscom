import DashboardStatsCard from "@/Components/Cards/DashboardStatsCard";
import ErpLayout from "@/Layouts/ErpLayout";
import { Head, usePage } from "@inertiajs/react";
import { Col, Row, Card, ProgressBar, Badge } from "react-bootstrap";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Link } from "@inertiajs/react";
import { useRef, useEffect } from "react";

const DirectorDashboard = ({ dashboardData }) => {
    const { auth } = usePage().props;

    // Refs for DataTables
    const lowStockTableRef = useRef(null);
    const topSellingTableRef = useRef(null);
    const recentOrdersTableRef = useRef(null);

    // Track if DataTables have been initialized
    const tablesInitialized = useRef({
        lowStock: false,
        topSelling: false,
        recentOrders: false,
    });

    // Destructure data from backend
    const {
        statCards,
        additionalMetrics,
        recentOrders,
        revenueChart,
        summary,
        lowStockProducts = [], // Default to empty array
        topSellingProducts = [],
    } = dashboardData;

    // Initialize DataTables
    useEffect(() => {
        // Initialize Low Stock Products DataTable
        if (lowStockTableRef.current && !tablesInitialized.current.lowStock) {
            $(lowStockTableRef.current).DataTable({
                data: lowStockProducts || [],
                columns: [
                    {
                        data: "name",
                        title: "Product",
                        className: "text-start",
                        render: function (data, type, row) {
                            if (!data)
                                return '<div class="text-center text-muted">-</div>';

                            return `
                                <div class="d-flex align-items-center">
                                    <div class="avatar-sm bg-light rounded me-2">
                                        <img src="${
                                            row.image ||
                                            "/images/default-product.jpg"
                                        }" 
                                             alt="${row.name}" 
                                             class="img-fluid rounded"
                                             style="width: 40px; height: 40px; object-fit: cover;"
                                             onerror="this.src='/images/default-product.jpg'">
                                    </div>
                                    <div>
                                        <h6 class="mb-0">${row.name || "-"}</h6>
                                        <small class="text-muted">${
                                            row.category || "Uncategorized"
                                        }</small>
                                    </div>
                                </div>
                            `;
                        },
                    },
                    {
                        data: "sku",
                        title: "SKU",
                        className: "text-start",
                        defaultContent: "-",
                    },
                    {
                        data: "total_quantity",
                        title: "Current Stock",
                        className: "text-center",
                        defaultContent: "-",
                        render: function (data, type, row) {
                            if (data === undefined || data === null) return "-";

                            const isCritical =
                                data <= (row.low_stock_alert || 0);
                            const colorClass = isCritical
                                ? "text-danger fw-bold"
                                : "text-warning";
                            return `<span class="${colorClass}">${data}</span>`;
                        },
                    },
                    {
                        data: "low_stock_alert",
                        title: "Alert Level",
                        className: "text-center",
                        defaultContent: "-",
                    },
                    {
                        data: "total_quantity",
                        title: "Status",
                        className: "text-center",
                        defaultContent: "-",
                        render: function (data, type, row) {
                            if (data === undefined || data === null)
                                return '<span class="badge bg-secondary">N/A</span>';

                            let badgeClass = "success";
                            let statusText = "In Stock";

                            if (data <= 0) {
                                badgeClass = "danger";
                                statusText = "Out of Stock";
                            } else if (data <= (row.low_stock_alert || 0)) {
                                badgeClass = "warning";
                                statusText = "Low Stock";
                            }

                            return `<span class="badge bg-${badgeClass}">${statusText}</span>`;
                        },
                    },
                ],
                responsive: true,
                searching: false,
                paging: false,
                info: false,
                lengthChange: false,
                order: [[2, "asc"]],
                language: {
                    emptyTable:
                        '<div class="text-center py-5"><i class="bi bi-check-circle display-4 text-success"></i><p class="mt-2">All products are well stocked</p></div>',
                },
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>tip',
                initComplete: function () {
                    $(this).addClass("table-striped table-hover");
                },
                drawCallback: function (settings) {
                    if (settings.fnRecordsTotal() === 0) {
                        $(this)
                            .find("tbody")
                            .html(
                                '<tr><td colspan="5" class="text-center py-4">' +
                                    '<i class="bi bi-check-circle display-4 text-success"></i>' +
                                    '<p class="mt-2">All products are well stocked</p>' +
                                    "</td></tr>"
                            );
                    }
                },
            });

            tablesInitialized.current.lowStock = true;
        }

        // Initialize Top Selling Products DataTable
        if (
            topSellingTableRef.current &&
            !tablesInitialized.current.topSelling
        ) {
            $(topSellingTableRef.current).DataTable({
                data: topSellingProducts || [],
                columns: [
                    {
                        data: "name",
                        title: "Product",
                        className: "text-start",
                        render: function (data, type, row) {
                            if (!data)
                                return '<div class="text-center text-muted">-</div>';

                            return `
                                <div class="d-flex align-items-center">
                                    <div class="avatar-sm bg-light rounded me-2">
                                        <img src="${
                                            row.image ||
                                            "/images/default-product.jpg"
                                        }" 
                                             alt="${row.name}" 
                                             class="img-fluid rounded"
                                             style="width: 40px; height: 40px; object-fit: cover;"
                                             onerror="this.src='/images/default-product.jpg'">
                                    </div>
                                    <div>
                                        <h6 class="mb-0">${row.name || "-"}</h6>
                                        <small class="text-muted">${
                                            row.category || "Uncategorized"
                                        }</small>
                                    </div>
                                </div>
                            `;
                        },
                    },
                    {
                        data: "sales_count",
                        title: "Sales",
                        className: "text-center",
                        defaultContent: "-",
                        render: function (data, type, row) {
                            if (data === undefined || data === null) return "-";

                            return `
                                <div>
                                    <span class="fw-bold">${data}</span>
                                    <br>
                                    <small class="text-muted">units sold</small>
                                </div>
                            `;
                        },
                    },
                    {
                        data: "revenue",
                        title: "Revenue",
                        className: "text-end",
                        defaultContent: "-",
                        render: function (data) {
                            if (data === undefined || data === null) return "-";

                            return `<span class="fw-bold text-success">$${Number(
                                data
                            ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}</span>`;
                        },
                    },
                    {
                        data: "total_quantity",
                        title: "Stock",
                        className: "text-center",
                        defaultContent: "-",
                        render: function (data, type, row) {
                            if (data === undefined || data === null) return "-";

                            const isLow = data <= (row.low_stock_alert || 0);
                            const colorClass = isLow ? "text-danger" : "";
                            return `<span class="fw-bold ${colorClass}">${data}</span>`;
                        },
                    },
                    {
                        data: "is_active",
                        title: "Status",
                        className: "text-center",
                        defaultContent: "-",
                        render: function (data) {
                            if (data === undefined || data === null)
                                return '<span class="badge bg-secondary">N/A</span>';

                            const badgeClass = data ? "success" : "secondary";
                            const statusText = data ? "Active" : "Inactive";
                            return `<span class="badge bg-${badgeClass}">${statusText}</span>`;
                        },
                    },
                ],
                responsive: true,
                searching: false,
                paging: false,
                info: false,
                lengthChange: false,
                order: [[2, "asc"]],
                language: {
                    emptyTable:
                        '<div class="text-center py-5"><i class="bi bi-graph-up display-4 text-muted"></i><p class="mt-2">No sales data available</p></div>',
                },
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>tip',
                initComplete: function () {
                    $(this).addClass("table-striped table-hover");
                },
                drawCallback: function (settings) {
                    // Handle empty state
                    if (settings.fnRecordsTotal() === 0) {
                        $(this)
                            .find("tbody")
                            .html(
                                '<tr><td colspan="5" class="text-center py-4">' +
                                    '<i class="bi bi-graph-up display-4 text-muted"></i>' +
                                    '<p class="mt-2">No sales data available</p>' +
                                    "</td></tr>"
                            );
                    }
                },
            });

            tablesInitialized.current.topSelling = true;
        }

        // Initialize Recent Orders DataTable
        if (
            recentOrdersTableRef.current &&
            !tablesInitialized.current.recentOrders
        ) {
            $(recentOrdersTableRef.current).DataTable({
                data: recentOrders || [],
                columns: [
                    {
                        data: "order_number",
                        title: "Order #",
                        className: "text-start",
                        defaultContent: "-",
                        render: function (data) {
                            if (!data) return "-";
                            return `<a href="${
                                route("erp.orders.show", data) || "#"
                            }" class="text-decoration-none fw-bold">${data}</a>`;
                        },
                    },
                    {
                        data: "customer_name",
                        title: "Customer",
                        className: "text-start",
                        defaultContent: "-",
                    },
                    {
                        data: "total",
                        title: "Amount",
                        className: "text-end",
                        defaultContent: "-",
                        render: function (data) {
                            if (data === undefined || data === null) return "-";
                            return `<span class="fw-bold">$${Number(
                                data
                            ).toFixed(2)}</span>`;
                        },
                    },
                    {
                        data: "status",
                        title: "Status",
                        className: "text-center",
                        defaultContent: "-",
                        render: function (data) {
                            if (!data)
                                return '<span class="badge bg-secondary">-</span>';

                            const colors = {
                                pending: "warning",
                                processing: "info",
                                completed: "success",
                                cancelled: "danger",
                                refunded: "secondary",
                            };
                            const color = colors[data] || "secondary";
                            return `<span class="badge bg-${color}">${data}</span>`;
                        },
                    },
                    {
                        data: "payment_status",
                        title: "Payment",
                        className: "text-center",
                        defaultContent: "-",
                        render: function (data) {
                            if (!data)
                                return '<span class="badge bg-secondary">-</span>';

                            const colors = {
                                pending: "warning",
                                paid: "success",
                                partially_paid: "info",
                                failed: "danger",
                                refunded: "secondary",
                            };
                            const color = colors[data] || "secondary";
                            return `<span class="badge bg-${color}">${data}</span>`;
                        },
                    },
                    {
                        data: "created_at",
                        title: "Date",
                        className: "text-center",
                        defaultContent: "-",
                    },
                    {
                        data: "order_number",
                        title: "Actions",
                        className: "text-center",
                        orderable: false,
                        searchable: false,
                        defaultContent: "-",
                        render: function (data) {
                            if (!data) return "-";
                            return `
                                <a href="${
                                    route("erp.orders.show", data) || "#"
                                }" 
                                   class="btn btn-sm btn-outline-primary">
                                    View
                                </a>
                            `;
                        },
                    },
                ],
                responsive: true,
                searching: false,
                paging: false,
                info: false,
                lengthChange: false,
                order: [[5, "asc"]],
                language: {
                    emptyTable:
                        '<div class="text-center py-5"><i class="bi bi-receipt display-4 text-muted"></i><p class="mt-2">No orders found</p></div>',
                },
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>tip',
                initComplete: function () {
                    $(this).addClass("table-striped table-hover");
                },
                drawCallback: function (settings) {
                    // Handle empty state
                    if (settings.fnRecordsTotal() === 0) {
                        $(this)
                            .find("tbody")
                            .html(
                                '<tr><td colspan="7" class="text-center py-4">' +
                                    '<i class="bi bi-receipt display-4 text-muted"></i>' +
                                    '<p class="mt-2">No orders found</p>' +
                                    "</td></tr>"
                            );
                    }
                },
            });

            tablesInitialized.current.recentOrders = true;
        }

        // Cleanup function
        return () => {
            // Destroy DataTables instances
            [
                lowStockTableRef,
                topSellingTableRef,
                recentOrdersTableRef,
            ].forEach((ref) => {
                if (ref.current && $.fn.DataTable.isDataTable(ref.current)) {
                    $(ref.current).DataTable().destroy(true);
                }
            });

            // Reset initialization flags
            tablesInitialized.current = {
                lowStock: false,
                topSelling: false,
                recentOrders: false,
            };
        };
    }, [lowStockProducts, topSellingProducts, recentOrders]);

    return (
        <ErpLayout>
            <Head title="Director Dashboard" />

            {/* Main Statistics Cards */}
            <Row className="mb-3 g-3">
                {statCards.map((card, index) => (
                    <Col key={index} lg={3} md={6}>
                        <DashboardStatsCard {...card} />
                    </Col>
                ))}
            </Row>

            {/* Additional Metrics */}
            <Row className="mb-3 g-3">
                {additionalMetrics?.map((metric, index) => (
                    <Col key={index} lg={3} md={6}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body className="d-flex align-items-center">
                                <div className="flex-shrink-0 me-3 fs-2">
                                    {metric.icon}
                                </div>
                                <div className="flex-grow-1">
                                    <Card.Title
                                        as="h6"
                                        className="text-muted mb-1"
                                    >
                                        {metric.title}
                                    </Card.Title>
                                    <Card.Text as="h4" className="mb-0">
                                        {metric.value}
                                    </Card.Text>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Revenue Chart */}
            <Row className="mb-3 g-3">
                <Col lg={8} md={12}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Revenue Overview (Last 6 Months)
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div style={{ width: "100%", height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={revenueChart}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f0f0f0"
                                        />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [
                                                `$${Number(
                                                    value
                                                ).toLocaleString()}`,
                                                "Amount",
                                            ]}
                                            labelFormatter={(label) =>
                                                `Month: ${label}`
                                            }
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="sales"
                                            name="Sales Revenue"
                                            fill="#8884d8"
                                        />
                                        <Bar
                                            dataKey="repairs"
                                            name="Repair Revenue"
                                            fill="#82ca9d"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Summary Stats */}
                <Col lg={4} md={12}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Business Summary
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-4">
                                <h6 className="text-muted mb-2">
                                    Total Revenue
                                </h6>
                                <h3 className="text-success">
                                    {summary?.totalRevenue}
                                </h3>
                            </div>

                            <div className="mb-4">
                                <h6 className="text-muted mb-2">
                                    Average Order Value
                                </h6>
                                <h4>${summary?.averageOrderValue}</h4>
                            </div>

                            <div className="mb-4">
                                <h6 className="text-muted mb-2">
                                    Active Customers
                                </h6>
                                <h4>{summary?.customerCount}</h4>
                            </div>

                            <div className="mb-3">
                                <h6 className="text-muted mb-2">
                                    Stock Health
                                </h6>
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1 me-3">
                                        <ProgressBar
                                            now={summary?.stockHealth || 0}
                                            label={`${
                                                summary?.stockHealth || 0
                                            }%`}
                                            variant={getStockHealthColor(
                                                summary?.stockHealth || 0
                                            )}
                                        />
                                    </div>
                                    <small className="text-muted">
                                        {summary?.lowStockCount || 0} low stock
                                    </small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-3 g-3">
                {/* Low Stock Products */}
                <Col lg={6} md={12}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <Card.Title as="h5" className="mb-0">
                                Low Stock Products
                                <Badge bg="danger" className="ms-2">
                                    {lowStockProducts?.length || 0}
                                </Badge>
                            </Card.Title>
                            <Link
                                href={route("product.index")}
                                className="btn btn-sm btn-outline-primary"
                            >
                                Manage Products
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <table
                                    ref={lowStockTableRef}
                                    className="table table-hover mb-0"
                                    style={{ width: "100%" }}
                                >
                                    {/* Table headers will be auto-generated by DataTables */}
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>SKU</th>
                                            <th>Current Stock</th>
                                            <th>Alert Level</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* DataTables will populate this */}
                                    </tbody>
                                </table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Top Selling Products */}
                <Col lg={6} md={12}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Top Selling Products
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <table
                                    ref={topSellingTableRef}
                                    className="table table-hover mb-0"
                                    style={{ width: "100%" }}
                                >
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Sales</th>
                                            <th>Revenue</th>
                                            <th>Stock</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* DataTables will populate this */}
                                    </tbody>
                                </table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Orders */}
            <Row className="mb-3 g-3">
                <Col lg={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <Card.Title as="h5" className="mb-0">
                                Recent Orders
                            </Card.Title>
                            <Link
                                href={route("sales.index")}
                                className="btn btn-sm btn-outline-primary"
                            >
                                View All
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <table
                                    ref={recentOrdersTableRef}
                                    className="table table-hover mb-0"
                                    style={{ width: "100%" }}
                                >
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Customer</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* DataTables will populate this */}
                                    </tbody>
                                </table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </ErpLayout>
    );
};

const getStockHealthColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "info";
    if (percentage >= 40) return "warning";
    return "danger";
};

export default DirectorDashboard;
