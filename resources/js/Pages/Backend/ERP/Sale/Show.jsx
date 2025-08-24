import { Head, Link, router } from "@inertiajs/react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    ButtonGroup,
    Badge,
    Table,
    Tab,
    Nav,
    Alert,
    Spinner,
    Form,
} from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import StatusBadge from "@/Components/Partials/Orders/StatusBadge";
import PaymentStatusBadge from "@/Components/Partials/Orders/PaymentStatusBadge";
import OrderTimeline from "@/Components/Partials/Orders/OrderTimeline";
import OrderItemsTable from "@/Components/Partials/Orders/OrderItemsTable";
import OrderPaymentsTable from "@/Components/Partials/Orders/OrderPaymentsTable";

export default function SaleShow({ order }) {
    const [activeTab, setActiveTab] = useState("details");
    const [processing, setProcessing] = useState(false);
    const [statusNote, setStatusNote] = useState("");

    const handleStatusChange = (newStatus) => {
        setProcessing(true);
        router.patch(
            route("sales.update-status", order.id),
            {
                status: newStatus,
                note: statusNote,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Order status updated successfully");
                    setStatusNote("");
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString();
    };

    const formatAddress = (address) => {
        if (!address) return "-";
        return (
            <>
                {address.street && <div>{address.street}</div>}
                {address.city && (
                    <div>
                        {address.city}, {address.state} {address.postal_code}
                    </div>
                )}
                {address.country && <div>{address.country}</div>}
            </>
        );
    };

    return (
        <ErpLayout>
            <Head title={`Order #${order.order_number}`} />

            <Container fluid className="mt-4">
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <h2 className="mb-0">
                                Order #
                                <span className="text-primary">
                                    {order.order_number}
                                </span>
                            </h2>
                            <div>
                                <ButtonGroup className="gap-2">
                                    <Button
                                        variant="outline-primary"
                                        className="rounded"
                                        as={Link}
                                        href={route("sales.edit", order.id)}
                                    >
                                        <i className="bi bi-pencil me-2"></i>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline-primary"
                                        className="rounded"
                                        as={Link}
                                        href={route("sales.index")}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Back to Orders
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </div>
                        <hr className="dashed-hr mt-3" />
                    </Col>
                </Row>

                <Row className="mb-4">
                    <Col md={8}>
                        <Card>
                            <Card.Body>
                                <Tab.Container
                                    activeKey={activeTab}
                                    onSelect={setActiveTab}
                                >
                                    <Nav variant="tabs" className="mb-4">
                                        <Nav.Item>
                                            <Nav.Link eventKey="details">
                                                <i className="bi bi-list-ul me-2"></i>
                                                Order Details
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="items">
                                                <i className="bi bi-box-seam me-2"></i>
                                                Items (
                                                {order.items?.length || 0})
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="payments">
                                                <i className="bi bi-credit-card me-2"></i>
                                                Payments (
                                                {order.payments?.length || 0})
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="history">
                                                <i className="bi bi-clock-history me-2"></i>
                                                Status History
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>

                                    <Tab.Content>
                                        <Tab.Pane eventKey="details">
                                            <Row>
                                                <Col md={6}>
                                                    <h5 className="mb-3">
                                                        Order Information
                                                    </h5>
                                                    <Table borderless size="sm">
                                                        <tbody>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Order Date
                                                                </td>
                                                                <td>
                                                                    {formatDate(
                                                                        order.created_at
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Order Status
                                                                </td>
                                                                <td>
                                                                    <StatusBadge
                                                                        status={
                                                                            order.status
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Payment
                                                                    Status
                                                                </td>
                                                                <td>
                                                                    <PaymentStatusBadge
                                                                        status={
                                                                            order.payment_status
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Fulfillment
                                                                    Status
                                                                </td>
                                                                <td>
                                                                    <Badge bg="secondary">
                                                                        {order.fulfillment_status ||
                                                                            "Not fulfilled"}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Payment
                                                                    Method
                                                                </td>
                                                                <td>
                                                                    {order.payment_method_name ||
                                                                        "-"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Shipping
                                                                    Method
                                                                </td>
                                                                <td>
                                                                    {order
                                                                        .shipping_method
                                                                        ?.name ||
                                                                        "-"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Tracking
                                                                    Number
                                                                </td>
                                                                <td>
                                                                    {order.tracking_number ? (
                                                                        <a
                                                                            href={
                                                                                order.tracking_url
                                                                            }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            {
                                                                                order.tracking_number
                                                                            }
                                                                        </a>
                                                                    ) : (
                                                                        "-"
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                </Col>
                                                <Col md={6}>
                                                    <h5 className="mb-3">
                                                        Customer Information
                                                    </h5>
                                                    <Table borderless size="sm">
                                                        <tbody>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Customer
                                                                </td>
                                                                <td>
                                                                    {order.customer ? (
                                                                        <Link
                                                                            href={route(
                                                                                "customers.show",
                                                                                order
                                                                                    .customer
                                                                                    .id
                                                                            )}
                                                                        >
                                                                            {
                                                                                order.customer_full_name
                                                                            }
                                                                        </Link>
                                                                    ) : (
                                                                        `${order.customer_first_name} ${order.customer_last_name}`
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Email
                                                                </td>
                                                                <td>
                                                                    {order.customer_email ||
                                                                        "-"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Phone
                                                                </td>
                                                                <td>
                                                                    {order.customer_phone ||
                                                                        "-"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Company
                                                                </td>
                                                                <td>
                                                                    {order.customer_company ||
                                                                        "-"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-muted">
                                                                    Tax Number
                                                                </td>
                                                                <td>
                                                                    {order.customer_tax_number ||
                                                                        "-"}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                </Col>
                                            </Row>

                                            <Row className="mt-4">
                                                <Col md={6}>
                                                    <h5 className="mb-3">
                                                        Billing Address
                                                    </h5>
                                                    <div className="p-3 bg-light rounded">
                                                        {formatAddress(
                                                            order.billing_address
                                                        )}
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <h5 className="mb-3">
                                                        Shipping Address
                                                    </h5>
                                                    <div className="p-3 bg-light rounded">
                                                        {order.shipping_same_as_billing ? (
                                                            <span className="text-muted">
                                                                Same as billing
                                                                address
                                                            </span>
                                                        ) : (
                                                            formatAddress(
                                                                order.shipping_address
                                                            )
                                                        )}
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row className="mt-4">
                                                <Col>
                                                    <h5 className="mb-3">
                                                        Customer Note
                                                    </h5>
                                                    <div className="p-3 bg-light rounded">
                                                        {order.customer_note || (
                                                            <span className="text-muted">
                                                                No customer note
                                                            </span>
                                                        )}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="items">
                                            <OrderItemsTable
                                                items={order.items}
                                                currency={order.currency}
                                            />
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="payments">
                                            <OrderPaymentsTable
                                                payments={order.payments}
                                                currency={order.currency}
                                            />
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="history">
                                            <OrderTimeline
                                                history={
                                                    order.order_status_history
                                                }
                                            />
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Tab.Container>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">Order Summary</h5>
                            </Card.Header>
                            <Card.Body>
                                <Table borderless size="sm">
                                    <tbody>
                                        <tr>
                                            <td className="text-muted">
                                                Subtotal
                                            </td>
                                            <td className="text-end">
                                                {order.currency}{" "}
                                                {order.subtotal}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">
                                                Shipping
                                            </td>
                                            <td className="text-end">
                                                {order.currency}{" "}
                                                {order.shipping_cost}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">Tax</td>
                                            <td className="text-end">
                                                {order.currency} {order.tax}
                                            </td>
                                        </tr>
                                        {order.discount > 0 && (
                                            <tr>
                                                <td className="text-muted">
                                                    Discount
                                                </td>
                                                <td className="text-end text-danger">
                                                    -{order.currency}{" "}
                                                    {order.discount}
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="border-top">
                                            <td className="fw-bold">Total</td>
                                            <td className="text-end fw-bold">
                                                {order.currency} {order.total}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">
                                                Total Paid
                                            </td>
                                            <td className="text-end">
                                                {order.currency}{" "}
                                                {order.total_paid}
                                            </td>
                                        </tr>
                                        {order.total_refunded > 0 && (
                                            <tr>
                                                <td className="text-muted">
                                                    Total Refunded
                                                </td>
                                                <td className="text-end">
                                                    {order.currency}{" "}
                                                    {order.total_refunded}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>

                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">Update Status</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status Note</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={statusNote}
                                        onChange={(e) =>
                                            setStatusNote(e.target.value)
                                        }
                                        placeholder="Add a note about this status change"
                                    />
                                </Form.Group>
                                <div className="d-flex flex-wrap gap-2">
                                    <Button
                                        variant="outline-primary"
                                        onClick={() =>
                                            handleStatusChange("processing")
                                        }
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner size="sm" />
                                        ) : (
                                            "Mark as Processing"
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline-warning"
                                        onClick={() =>
                                            handleStatusChange("shipped")
                                        }
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner size="sm" />
                                        ) : (
                                            "Mark as Shipped"
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline-success"
                                        onClick={() =>
                                            handleStatusChange("delivered")
                                        }
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner size="sm" />
                                        ) : (
                                            "Mark as Delivered"
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        onClick={() =>
                                            handleStatusChange("cancelled")
                                        }
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner size="sm" />
                                        ) : (
                                            "Cancel Order"
                                        )}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">Actions</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-grid gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        as={Link}
                                        href={""}
                                    >
                                        <i className="bi bi-file-earmark-text me-2"></i>
                                        View Invoice
                                    </Button>
                                    <Button variant="outline-secondary">
                                        <i className="bi bi-envelope me-2"></i>
                                        Send Invoice
                                    </Button>
                                    <Button variant="outline-secondary">
                                        <i className="bi bi-truck me-2"></i>
                                        Create Shipment
                                    </Button>
                                    {order.payment_status !== "refunded" &&
                                        order.total_paid > 0 && (
                                            <Button variant="outline-secondary">
                                                <i className="bi bi-arrow-counterclockwise me-2"></i>
                                                Issue Refund
                                            </Button>
                                        )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </ErpLayout>
    );
}
