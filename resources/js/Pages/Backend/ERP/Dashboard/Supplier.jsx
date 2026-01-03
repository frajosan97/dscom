import DashboardStatsCard from "@/Components/Cards/DashboardStatsCard";
import ErpLayout from "@/Layouts/ErpLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    Col,
    Row,
    Card,
    Table,
    Badge,
    Button,
    ProgressBar,
    Form,
} from "react-bootstrap";

const SupplierDashboard = ({ dashboardData }) => {
    const { auth } = usePage().props;

    const { statCards } = dashboardData;

    // Sample data
    const recentOrders = [
        {
            id: "PO-2024-001",
            product: "iPhone Screens",
            quantity: 50,
            amount: 2500,
            status: "pending",
            date: "2024-01-05",
        },
        {
            id: "PO-2024-002",
            product: "Laptop Batteries",
            quantity: 30,
            amount: 1500,
            status: "shipped",
            date: "2024-01-03",
        },
        {
            id: "PO-2024-003",
            product: "USB-C Ports",
            quantity: 100,
            amount: 800,
            status: "delivered",
            date: "2024-01-01",
        },
        {
            id: "PO-2023-125",
            product: "Tool Kits",
            quantity: 20,
            amount: 1200,
            status: "cancelled",
            date: "2023-12-28",
        },
    ];

    const topProducts = [
        { name: "iPhone 14 Screen", sales: 150, revenue: 7500, growth: "+15%" },
        { name: "Samsung Battery", sales: 120, revenue: 4800, growth: "+8%" },
        { name: "MacBook Keyboard", sales: 80, revenue: 6400, growth: "+22%" },
        { name: "Charging Ports", sales: 200, revenue: 2000, growth: "+5%" },
    ];

    const performanceMetrics = [
        { metric: "On-time Delivery", value: 95, target: 98 },
        { metric: "Quality Rating", value: 4.7, target: 4.5 },
        { metric: "Order Accuracy", value: 99, target: 98 },
        { metric: "Response Time", value: 2.5, target: 4 },
    ];

    return (
        <ErpLayout>
            <Head title="Supplier Dashboard" />

            {/* Welcome Header */}
            <Row className="mb-4">
                <Col lg={12}>
                    <Card className="shadow-sm border-0 bg-success bg-opacity-10">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-1">Supplier Portal</h4>
                                    <p className="text-muted mb-0">
                                        Manage your products, orders, and
                                        performance metrics.
                                    </p>
                                </div>
                                <Button variant="success">
                                    Add New Product
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Statistics Cards */}
            <Row className="mb-4">
                {statCards?.map((card, index) => (
                    <Col key={index} lg={3} md={6} className="mb-3">
                        <DashboardStatsCard {...card} />
                    </Col>
                ))}
            </Row>

            <Row className="mb-4">
                {/* Recent Orders */}
                <Col lg={8} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <Card.Title as="h5" className="mb-0">
                                Recent Purchase Orders
                            </Card.Title>
                            <Button variant="outline-primary" size="sm">
                                View All Orders
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead>
                                    <tr className="bg-light">
                                        <th>PO #</th>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order, index) => (
                                        <tr key={index}>
                                            <td>
                                                <a
                                                    href="#"
                                                    className="text-decoration-none fw-semibold"
                                                >
                                                    {order.id}
                                                </a>
                                            </td>
                                            <td>{order.product}</td>
                                            <td>{order.quantity}</td>
                                            <td className="fw-semibold">
                                                ${order.amount}
                                            </td>
                                            <td>
                                                <Badge
                                                    bg={getOrderStatusColor(
                                                        order.status
                                                    )}
                                                >
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td>{order.date}</td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    className="me-1"
                                                >
                                                    Update
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-info"
                                                >
                                                    Track
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Performance Metrics */}
                <Col lg={4} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Performance Metrics
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {performanceMetrics.map((metric, index) => (
                                <div key={index} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted">
                                            {metric.metric}
                                        </span>
                                        <span
                                            className={`fw-semibold ${
                                                typeof metric.value ===
                                                    "number" &&
                                                metric.value >= metric.target
                                                    ? "text-success"
                                                    : "text-danger"
                                            }`}
                                        >
                                            {typeof metric.value === "number"
                                                ? metric.value.toFixed(
                                                      metric.value % 1 === 0
                                                          ? 0
                                                          : 1
                                                  )
                                                : metric.value}
                                            {metric.metric === "Quality Rating"
                                                ? "/5"
                                                : "%"}
                                        </span>
                                    </div>
                                    <ProgressBar
                                        now={
                                            typeof metric.value === "number"
                                                ? (metric.value /
                                                      (metric.metric ===
                                                      "Quality Rating"
                                                          ? 5
                                                          : 100)) *
                                                  100
                                                : 0
                                        }
                                        variant={
                                            metric.value >= metric.target
                                                ? "success"
                                                : "warning"
                                        }
                                        label={`Target: ${
                                            typeof metric.target === "number"
                                                ? metric.target.toFixed(
                                                      metric.target % 1 === 0
                                                          ? 0
                                                          : 1
                                                  )
                                                : metric.target
                                        }${
                                            metric.metric === "Quality Rating"
                                                ? "/5"
                                                : "%"
                                        }`}
                                    />
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Top Selling Products */}
                <Col lg={6} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Top Selling Products
                            </Card.Title>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead>
                                    <tr className="bg-light">
                                        <th>Product</th>
                                        <th>Sales</th>
                                        <th>Revenue</th>
                                        <th>Growth</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map((product, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm bg-light rounded me-2">
                                                        <div className="avatar-title bg-info-subtle text-info rounded fs-16">
                                                            {product.name.charAt(
                                                                0
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0">
                                                            {product.name}
                                                        </h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{product.sales}</td>
                                            <td className="fw-semibold">
                                                ${product.revenue}
                                            </td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        product.growth.startsWith(
                                                            "+"
                                                        )
                                                            ? "success"
                                                            : "danger"
                                                    }
                                                >
                                                    {product.growth}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Quick Update Form */}
                <Col lg={6} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Quick Inventory Update
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product</Form.Label>
                                    <Form.Select>
                                        <option>Select Product</option>
                                        <option>iPhone Screens</option>
                                        <option>Laptop Batteries</option>
                                        <option>USB-C Ports</option>
                                        <option>Tool Kits</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Stock Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter new quantity"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Price Update</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter new price"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Estimated Delivery Time
                                    </Form.Label>
                                    <Form.Select>
                                        <option>Select timeframe</option>
                                        <option>24-48 hours</option>
                                        <option>3-5 days</option>
                                        <option>1-2 weeks</option>
                                        <option>2-4 weeks</option>
                                    </Form.Select>
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button
                                        variant="primary"
                                        className="flex-grow-1"
                                    >
                                        Update Inventory
                                    </Button>
                                    <Button variant="outline-secondary">
                                        Cancel
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </ErpLayout>
    );
};

// Helper functions
const getOrderStatusColor = (status) => {
    const colors = {
        pending: "warning",
        confirmed: "info",
        processing: "primary",
        shipped: "success",
        delivered: "success",
        cancelled: "danger",
    };
    return colors[status] || "secondary";
};

export default SupplierDashboard;
