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
    Dropdown,
} from "react-bootstrap";

const TechnicianDashboard = ({ dashboardData }) => {
    const { auth } = usePage().props;

    const { statCards, myRepairs } = dashboardData;

    const inventoryNeeded = [
        { part: "iPhone 14 Screen", quantity: 5, priority: "high" },
        { part: "Samsung Battery", quantity: 3, priority: "medium" },
        { part: "MacBook Keyboard", quantity: 2, priority: "high" },
        { part: "USB-C Port", quantity: 10, priority: "low" },
    ];

    const pendingApprovals = [
        { id: 1, customer: "John Smith", device: "iPhone 13", quote: 199.99 },
        { id: 2, customer: "Emma Wilson", device: "MacBook Pro", quote: 450.0 },
        {
            id: 3,
            customer: "Mike Johnson",
            device: "Samsung S22",
            quote: 120.0,
        },
    ];

    return (
        <ErpLayout>
            <Head title="Technician Dashboard" />

            {/* Welcome Header */}
            <Row className="mb-4">
                <Col lg={12}>
                    <Card className="shadow-sm border-0 bg-primary bg-opacity-10">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-1">
                                        Welcome back, {auth.user.name}!
                                    </h4>
                                    <p className="text-muted mb-0">
                                        Here's what's on your repair schedule
                                        today.
                                    </p>
                                </div>
                                <Button variant="primary">
                                    Start New Repair
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
                {/* My Repair Queue */}
                <Col lg={8} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <Card.Title as="h5" className="mb-0">
                                My Repair Queue
                            </Card.Title>
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="outline-primary"
                                    size="sm"
                                    id="sort-dropdown"
                                >
                                    Sort by: Priority
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item>Priority</Dropdown.Item>
                                    <Dropdown.Item>Due Date</Dropdown.Item>
                                    <Dropdown.Item>Status</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead>
                                    <tr className="bg-light">
                                        <th>Order #</th>
                                        <th>Device/Service</th>
                                        <th>Customer</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Due Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myRepairs?.map((repair, index) => (
                                        <tr
                                            key={index}
                                            className={
                                                repair.is_overdue
                                                    ? "table-warning"
                                                    : ""
                                            }
                                        >
                                            <td>
                                                <Link
                                                    href={route(
                                                        "erp.repairs.show",
                                                        repair.id
                                                    )}
                                                    className="text-decoration-none fw-semibold"
                                                >
                                                    {repair.order_number}
                                                </Link>
                                            </td>
                                            <td>{repair.service}</td>
                                            <td>{repair.customer}</td>
                                            <td>
                                                <Badge
                                                    bg={getPriorityColor(
                                                        repair.priority
                                                    )}
                                                >
                                                    {repair.priority}
                                                </Badge>
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
                                                {repair.expected_date}
                                                {repair.is_overdue && (
                                                    <Badge
                                                        bg="danger"
                                                        className="ms-1"
                                                    >
                                                        Overdue
                                                    </Badge>
                                                )}
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    as={Link}
                                                    href={route(
                                                        "erp.repairs.edit",
                                                        repair.id
                                                    )}
                                                >
                                                    Update
                                                </Button>
                                            </td>
                                        </tr>
                                    )) || (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="text-center text-muted py-3"
                                            >
                                                No repairs assigned
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Sidebar */}
                <Col lg={4} md={12} className="mb-3">
                    {/* Inventory Needed */}
                    <Card className="shadow-sm border-0 mb-3">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Inventory Needed
                            </Card.Title>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="list-group list-group-flush">
                                {inventoryNeeded.map((item, index) => (
                                    <div
                                        key={index}
                                        className="list-group-item border-0 px-3 py-2"
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-0">
                                                    {item.part}
                                                </h6>
                                                <small className="text-muted">
                                                    Need: {item.quantity} units
                                                </small>
                                            </div>
                                            <Badge
                                                bg={getPriorityColor(
                                                    item.priority
                                                )}
                                            >
                                                {item.priority}
                                            </Badge>
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
                                Request Parts
                            </Button>
                        </Card.Footer>
                    </Card>

                    {/* Pending Customer Approvals */}
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Pending Approvals
                            </Card.Title>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="list-group list-group-flush">
                                {pendingApprovals.map((approval, index) => (
                                    <div
                                        key={index}
                                        className="list-group-item border-0 px-3 py-2"
                                    >
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <div>
                                                <h6 className="mb-0">
                                                    {approval.customer}
                                                </h6>
                                                <small className="text-muted">
                                                    {approval.device}
                                                </small>
                                            </div>
                                            <Badge bg="warning">
                                                ${approval.quote}
                                            </Badge>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline-success"
                                                className="flex-grow-1"
                                            >
                                                Call
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-info"
                                                className="flex-grow-1"
                                            >
                                                Message
                                            </Button>
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
                                >
                                    <i className="bi bi-plus-circle"></i>
                                    New Diagnosis
                                </Button>
                                <Button
                                    variant="outline-success"
                                    className="d-flex align-items-center gap-2"
                                >
                                    <i className="bi bi-clock-history"></i>
                                    View Schedule
                                </Button>
                                <Button
                                    variant="outline-info"
                                    className="d-flex align-items-center gap-2"
                                >
                                    <i className="bi bi-tools"></i>
                                    My Tools
                                </Button>
                                <Button
                                    variant="outline-warning"
                                    className="d-flex align-items-center gap-2"
                                >
                                    <i className="bi bi-clipboard-data"></i>
                                    Reports
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    className="d-flex align-items-center gap-2"
                                >
                                    <i className="bi bi-box-seam"></i>
                                    Inventory Check
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
const getPriorityColor = (priority) => {
    const colors = {
        urgent: "danger",
        high: "warning",
        medium: "info",
        low: "secondary",
    };
    return colors[priority?.toLowerCase()] || "secondary";
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

export default TechnicianDashboard;
