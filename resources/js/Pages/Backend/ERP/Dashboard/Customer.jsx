import DashboardStatsCard from "@/Components/Cards/DashboardStatsCard";
import ErpLayout from "@/Layouts/ErpLayout";
import { Head, usePage, Link } from "@inertiajs/react";
import {
    Col,
    Row,
    Card,
    Table,
    Badge,
    Button,
    ProgressBar,
    Tab,
    Nav,
} from "react-bootstrap";

const CustomerDashboard = ({ dashboardData }) => {
    const { auth } = usePage().props;

    const { statCards, recentOrders, activeRepairs, loyaltyPoints } =
        dashboardData;

    const notifications = [
        {
            id: 1,
            message: "Your order #ORD-2024-001 has been shipped",
            time: "2 hours ago",
            read: false,
        },
        {
            id: 2,
            message: "Repair #REP-2024-005 is now being tested",
            time: "1 day ago",
            read: true,
        },
        {
            id: 3,
            message: "New promotion: 20% off screen repairs",
            time: "2 days ago",
            read: true,
        },
        {
            id: 4,
            message: "Your warranty expires in 30 days",
            time: "3 days ago",
            read: false,
        },
    ];

    const wishlist = [
        { id: 1, product: "iPhone 15 Pro Case", price: 29.99, inStock: true },
        { id: 2, product: "Wireless Charger", price: 49.99, inStock: false },
        {
            id: 3,
            product: "Screen Protector Pack",
            price: 19.99,
            inStock: true,
        },
    ];

    return (
        <ErpLayout>
            <Head title="My Dashboard" />

            {/* Welcome Header */}
            <Row className="mb-4">
                <Col lg={12}>
                    <Card className="shadow-sm border-0 bg-light">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-1">
                                        Welcome back, {auth.user.name}!
                                    </h4>
                                    <p className="text-muted mb-0">
                                        Here's an overview of your account and
                                        recent activities.
                                    </p>
                                </div>
                                <div className="text-end">
                                    <h6 className="mb-1">Loyalty Points</h6>
                                    <h3 className="text-success mb-0">
                                        {loyaltyPoints || 0}
                                    </h3>
                                    <small className="text-muted">
                                        Redeem for discounts
                                    </small>
                                </div>
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
                {/* Recent Orders & Repairs */}
                <Col lg={8} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Tab.Container defaultActiveKey="orders">
                                <Nav variant="tabs" className="border-0">
                                    <Nav.Item>
                                        <Nav.Link eventKey="orders">
                                            Recent Orders
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="repairs">
                                            Active Repairs
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Tab.Container>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Tab.Content>
                                <Tab.Pane eventKey="orders">
                                    <Table responsive hover className="mb-0">
                                        <thead>
                                            <tr className="bg-light">
                                                <th>Order #</th>
                                                <th>Date</th>
                                                <th>Items</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders?.map(
                                                (order, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <Link
                                                                href={route(
                                                                    "erp.orders.show",
                                                                    order.order_number
                                                                )}
                                                                className="text-decoration-none fw-semibold"
                                                            >
                                                                {
                                                                    order.order_number
                                                                }
                                                            </Link>
                                                        </td>
                                                        <td>
                                                            {order.created_at}
                                                        </td>
                                                        <td>
                                                            {order.item_count}{" "}
                                                            items
                                                        </td>
                                                        <td className="fw-semibold">
                                                            ${order.total}
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
                                                        <td>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                as={Link}
                                                                href={route(
                                                                    "erp.orders.show",
                                                                    order.order_number
                                                                )}
                                                            >
                                                                View
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )
                                            ) || (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="text-center text-muted py-3"
                                                    >
                                                        No orders found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Tab.Pane>
                                <Tab.Pane eventKey="repairs">
                                    <Table responsive hover className="mb-0">
                                        <thead>
                                            <tr className="bg-light">
                                                <th>Repair #</th>
                                                <th>Device</th>
                                                <th>Status</th>
                                                <th>Est. Cost</th>
                                                <th>Due Date</th>
                                                <th>Technician</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeRepairs?.map(
                                                (repair, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <Link
                                                                href={route(
                                                                    "erp.repairs.show",
                                                                    repair.order_number
                                                                )}
                                                                className="text-decoration-none fw-semibold"
                                                            >
                                                                {
                                                                    repair.order_number
                                                                }
                                                            </Link>
                                                        </td>
                                                        <td>
                                                            {repair.service}
                                                        </td>
                                                        <td>
                                                            <Badge
                                                                bg={getRepairStatusColor(
                                                                    repair.status
                                                                )}
                                                            >
                                                                {repair.status}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            $
                                                            {
                                                                repair.estimated_cost
                                                            }
                                                        </td>
                                                        <td>
                                                            {
                                                                repair.expected_date
                                                            }
                                                        </td>
                                                        <td>
                                                            {repair.technician}
                                                        </td>
                                                    </tr>
                                                )
                                            ) || (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="text-center text-muted py-3"
                                                    >
                                                        No active repairs
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Tab.Pane>
                            </Tab.Content>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sidebar */}
                <Col lg={4} md={12} className="mb-3">
                    {/* Notifications */}
                    <Card className="shadow-sm border-0 mb-3">
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <Card.Title as="h5" className="mb-0">
                                Notifications
                            </Card.Title>
                            <Badge bg="primary" pill>
                                {notifications.filter((n) => !n.read).length}
                            </Badge>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="list-group list-group-flush">
                                {notifications.map((notification, index) => (
                                    <div
                                        key={index}
                                        className={`list-group-item border-0 px-3 py-2 ${
                                            !notification.read ? "bg-light" : ""
                                        }`}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1 me-2">
                                                <p className="mb-1">
                                                    {notification.message}
                                                </p>
                                                <small className="text-muted">
                                                    {notification.time}
                                                </small>
                                            </div>
                                            {!notification.read && (
                                                <Badge bg="danger" pill>
                                                    New
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                        <Card.Footer className="bg-white border-0">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="w-100"
                            >
                                View All Notifications
                            </Button>
                        </Card.Footer>
                    </Card>

                    {/* Wishlist */}
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                My Wishlist
                            </Card.Title>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="list-group list-group-flush">
                                {wishlist.map((item, index) => (
                                    <div
                                        key={index}
                                        className="list-group-item border-0 px-3 py-2"
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-0">
                                                    {item.product}
                                                </h6>
                                                <small className="text-muted">
                                                    ${item.price}
                                                </small>
                                            </div>
                                            <div className="d-flex gap-2">
                                                {item.inStock ? (
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                    >
                                                        Buy Now
                                                    </Button>
                                                ) : (
                                                    <Badge bg="warning">
                                                        Out of Stock
                                                    </Badge>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Row>
                <Col lg={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Quick Actions
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-wrap gap-3">
                                <Button
                                    variant="primary"
                                    className="d-flex align-items-center gap-2"
                                    as={Link}
                                    // href={route("erp.shop.index")}
                                >
                                    <i className="bi bi-cart-plus"></i>
                                    Shop Now
                                </Button>
                                <Button
                                    variant="outline-success"
                                    className="d-flex align-items-center gap-2"
                                    as={Link}
                                    // href={route("erp.repairs.create")}
                                >
                                    <i className="bi bi-tools"></i>
                                    Request Repair
                                </Button>
                                <Button
                                    variant="outline-info"
                                    className="d-flex align-items-center gap-2"
                                    as={Link}
                                    // href={route("erp.profile.edit")}
                                >
                                    <i className="bi bi-person"></i>
                                    Update Profile
                                </Button>
                                <Button
                                    variant="outline-warning"
                                    className="d-flex align-items-center gap-2"
                                    as={Link}
                                    // href={route("erp.orders.index")}
                                >
                                    <i className="bi bi-receipt"></i>
                                    My Orders
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    className="d-flex align-items-center gap-2"
                                    as={Link}
                                    // href={route("erp.support.create")}
                                >
                                    <i className="bi bi-headset"></i>
                                    Contact Support
                                </Button>
                            </div>
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
        processing: "info",
        completed: "success",
        cancelled: "danger",
        refunded: "secondary",
    };
    return colors[status] || "secondary";
};

const getRepairStatusColor = (status) => {
    const colors = {
        pending: "secondary",
        diagnosing: "info",
        awaiting_parts: "warning",
        repairing: "primary",
        testing: "info",
        awaiting_customer_approval: "warning",
        completed: "success",
        delivered: "success",
        cancelled: "danger",
    };
    return colors[status] || "secondary";
};

export default CustomerDashboard;
