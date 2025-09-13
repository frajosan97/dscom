import { Head, usePage, Link } from "@inertiajs/react";
import { useState } from "react";
import {
    Button,
    Card,
    Row,
    Col,
    Badge,
    Tab,
    Tabs,
    ListGroup,
    ButtonGroup,
    Modal,
    Form,
    InputGroup,
} from "react-bootstrap";
import {
    Telephone,
    Envelope,
    GeoAlt,
    Calendar,
    Person,
    CashCoin,
    Star,
    Clock,
    Pencil,
    Chat,
    Phone,
    Journal,
    CreditCard,
    ThreeDots,
    Eye,
    Search,
} from "react-bootstrap-icons";

import ErpLayout from "@/Layouts/ErpLayout";
import { FaArrowCircleLeft } from "react-icons/fa";

export default function CustomerAccount({ customer }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState("overview");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddNoteModal, setShowAddNoteModal] = useState(false);
    const [noteText, setNoteText] = useState("");

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);
    };

    // Get customer type badge color
    const getCustomerTypeBadge = (type) => {
        switch (type) {
            case "retail":
                return "info";
            case "wholesale":
                return "warning";
            case "corporate":
                return "success";
            default:
                return "secondary";
        }
    };

    // Get gender display text
    const getGenderText = (gender) => {
        switch (gender) {
            case "male":
                return "Male";
            case "female":
                return "Female";
            case "other":
                return "Other";
            case "prefer_not_to_say":
                return "Prefer not to say";
            default:
                return "Not specified";
        }
    };

    // Handle note submission
    const handleAddNote = () => {
        // In a real implementation, you would make an API call here
        console.log("Adding note:", noteText);
        setNoteText("");
        setShowAddNoteModal(false);
    };

    return (
        <ErpLayout>
            <Head title={`Customer - ${customer.full_name}`} />

            {/* Header with back button and actions */}
            <div className="d-flex justify-content-between align-items-center">
                <h2 className="h4 mb-0">Customer Account</h2>
                <ButtonGroup>
                    <Button
                        variant="outline-secondary"
                        as={Link}
                        href={route("customers.index")}
                    >
                        <FaArrowCircleLeft className="me-1" /> Back
                    </Button>
                    <Button
                        variant="outline-primary"
                        onClick={() => setShowEditModal(true)}
                    >
                        <Pencil className="me-1" /> Edit
                    </Button>
                    <Button variant="outline-secondary">
                        <ThreeDots />
                    </Button>
                </ButtonGroup>
            </div>

            <hr className="dashed-hr my-2" />

            <Row>
                {/* Customer Profile Card */}
                <Col md={4} lg={3}>
                    <Card className="border-0 rounded-0 shadow-sm mb-4">
                        <Card.Body className="text-center p-4">
                            <div className="mb-3">
                                {customer.avatar_url ? (
                                    <img
                                        src={customer.avatar_url}
                                        alt="Avatar"
                                        className="rounded-circle"
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                        }}
                                    >
                                        <Person size={40} />
                                    </div>
                                )}
                            </div>

                            <h4>
                                {customer.first_name} {customer.last_name}
                            </h4>
                            <Badge
                                bg={getCustomerTypeBadge(
                                    customer.customer_type
                                )}
                                className="text-capitalize mb-2"
                            >
                                {customer.customer_type}
                            </Badge>

                            <div className="d-flex justify-content-center mb-3">
                                <Badge
                                    bg={
                                        customer.is_active
                                            ? "success"
                                            : "secondary"
                                    }
                                    className="me-2"
                                >
                                    {customer.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge
                                    bg={
                                        customer.is_verified
                                            ? "info"
                                            : "warning"
                                    }
                                >
                                    {customer.is_verified
                                        ? "Verified"
                                        : "Unverified"}
                                </Badge>
                            </div>

                            <ListGroup variant="flush" className="text-start">
                                <ListGroup.Item className="px-0 d-flex align-items-center">
                                    <Envelope className="text-muted me-2" />
                                    <span>{customer.email}</span>
                                </ListGroup.Item>

                                <ListGroup.Item className="px-0 d-flex align-items-center">
                                    <Telephone className="text-muted me-2" />
                                    <span>{customer.phone || "N/A"}</span>
                                </ListGroup.Item>

                                {customer.alternate_phone && (
                                    <ListGroup.Item className="px-0 d-flex align-items-center">
                                        <Telephone className="text-muted me-2" />
                                        <span>{customer.alternate_phone}</span>
                                    </ListGroup.Item>
                                )}

                                <ListGroup.Item className="px-0 d-flex align-items-center">
                                    <GeoAlt className="text-muted me-2" />
                                    <span>
                                        {customer.city && customer.state
                                            ? `${customer.city}, ${customer.state}`
                                            : "Location not specified"}
                                    </span>
                                </ListGroup.Item>

                                <ListGroup.Item className="px-0 d-flex align-items-center">
                                    <Calendar className="text-muted me-2" />
                                    <span>
                                        Joined:{" "}
                                        {formatDate(customer.created_at)}
                                    </span>
                                </ListGroup.Item>

                                <ListGroup.Item className="px-0 d-flex align-items-center">
                                    <Clock className="text-muted me-2" />
                                    <span>
                                        Last login:{" "}
                                        {formatDate(customer.last_login_at) ||
                                            "Never"}
                                    </span>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    {/* Loyalty Points & Balance */}
                    <Card className="border-0 rounded-0 shadow-sm mb-4">
                        <Card.Header className="bg-white">
                            <h6 className="mb-0">Account Summary</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center">
                                    <Star className="text-warning me-2" />
                                    <span>Loyalty Points</span>
                                </div>
                                <span className="fw-bold">
                                    {customer.loyalty_points || 0}
                                </span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <CashCoin className="text-success me-2" />
                                    <span>Account Balance</span>
                                </div>
                                <span className="fw-bold">
                                    {formatCurrency(customer.balance)}
                                </span>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-0 rounded-0 shadow-sm">
                        <Card.Header className="bg-white">
                            <h6 className="mb-0">Quick Actions</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button
                                    variant="outline-primary"
                                    className="d-flex align-items-center"
                                >
                                    <Phone className="me-2" /> Call Customer
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    className="d-flex align-items-center"
                                >
                                    <Chat className="me-2" /> Send Message
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    className="d-flex align-items-center"
                                >
                                    <CreditCard className="me-2" /> Process
                                    Payment
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    className="d-flex align-items-center"
                                    onClick={() => setShowAddNoteModal(true)}
                                >
                                    <Journal className="me-2" /> Add Note
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Main Content Area */}
                <Col md={8} lg={9}>
                    <Card className="border-0 rounded-0 shadow-sm">
                        <Card.Body className="p-0">
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="px-3 pt-3"
                            >
                                <Tab eventKey="overview" title="Overview">
                                    <div className="p-3">
                                        <Row className="mb-4">
                                            <Col md={6}>
                                                <h5>Personal Information</h5>
                                                <ListGroup variant="flush">
                                                    <ListGroup.Item className="px-0 d-flex justify-content-between">
                                                        <span className="text-muted">
                                                            Full Name:
                                                        </span>
                                                        <span>
                                                            {
                                                                customer.first_name
                                                            }{" "}
                                                            {customer.last_name}
                                                        </span>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="px-0 d-flex justify-content-between">
                                                        <span className="text-muted">
                                                            Gender:
                                                        </span>
                                                        <span>
                                                            {getGenderText(
                                                                customer.gender
                                                            )}
                                                        </span>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="px-0 d-flex justify-content-between">
                                                        <span className="text-muted">
                                                            Birth Date:
                                                        </span>
                                                        <span>
                                                            {formatDate(
                                                                customer.birth_date
                                                            )}
                                                        </span>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="px-0 d-flex justify-content-between">
                                                        <span className="text-muted">
                                                            Customer ID:
                                                        </span>
                                                        <span>
                                                            {customer.id}
                                                        </span>
                                                    </ListGroup.Item>
                                                </ListGroup>
                                            </Col>
                                            <Col md={6}>
                                                <h5>Address Information</h5>
                                                <ListGroup variant="flush">
                                                    <ListGroup.Item className="px-0">
                                                        <div className="text-muted mb-1">
                                                            Address
                                                        </div>
                                                        <div>
                                                            {customer.address ||
                                                                "N/A"}
                                                        </div>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="px-0 d-flex justify-content-between">
                                                        <span className="text-muted">
                                                            City:
                                                        </span>
                                                        <span>
                                                            {customer.city ||
                                                                "N/A"}
                                                        </span>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="px-0 d-flex justify-content-between">
                                                        <span className="text-muted">
                                                            State:
                                                        </span>
                                                        <span>
                                                            {customer.state ||
                                                                "N/A"}
                                                        </span>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="px-0 d-flex justify-content-between">
                                                        <span className="text-muted">
                                                            Postal Code:
                                                        </span>
                                                        <span>
                                                            {customer.postal_code ||
                                                                "N/A"}
                                                        </span>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="px-0 d-flex justify-content-between">
                                                        <span className="text-muted">
                                                            Country:
                                                        </span>
                                                        <span>
                                                            {customer.country ||
                                                                "N/A"}
                                                        </span>
                                                    </ListGroup.Item>
                                                </ListGroup>
                                            </Col>
                                        </Row>

                                        <h5 className="mb-3">
                                            Recent Activity
                                        </h5>
                                        {customer.orders &&
                                        customer.orders.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table hover>
                                                    <thead>
                                                        <tr>
                                                            <th>Order ID</th>
                                                            <th>Date</th>
                                                            <th>Amount</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {customer.orders
                                                            .slice(0, 5)
                                                            .map((order) => (
                                                                <tr
                                                                    key={
                                                                        order.id
                                                                    }
                                                                >
                                                                    <td>
                                                                        #
                                                                        {
                                                                            order.id
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {formatDate(
                                                                            order.created_at
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {formatCurrency(
                                                                            order.total_amount
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        <Badge
                                                                            bg={
                                                                                order.status ===
                                                                                "completed"
                                                                                    ? "success"
                                                                                    : order.status ===
                                                                                      "pending"
                                                                                    ? "warning"
                                                                                    : order.status ===
                                                                                      "cancelled"
                                                                                    ? "danger"
                                                                                    : "secondary"
                                                                            }
                                                                        >
                                                                            {
                                                                                order.status
                                                                            }
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                        >
                                                                            <Eye
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-muted">
                                                No recent orders found.
                                            </div>
                                        )}
                                    </div>
                                </Tab>

                                <Tab eventKey="orders" title="Orders">
                                    <div className="p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0">
                                                Order History
                                            </h5>
                                            <InputGroup
                                                style={{ width: "300px" }}
                                            >
                                                <InputGroup.Text>
                                                    <Search />
                                                </InputGroup.Text>
                                                <Form.Control placeholder="Search orders..." />
                                            </InputGroup>
                                        </div>

                                        {customer.orders &&
                                        customer.orders.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table hover>
                                                    <thead>
                                                        <tr>
                                                            <th>Order ID</th>
                                                            <th>Date</th>
                                                            <th>Items</th>
                                                            <th>Amount</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {customer.orders.map(
                                                            (order) => (
                                                                <tr
                                                                    key={
                                                                        order.id
                                                                    }
                                                                >
                                                                    <td>
                                                                        #
                                                                        {
                                                                            order.id
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {formatDate(
                                                                            order.created_at
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {order.items_count ||
                                                                            1}
                                                                    </td>
                                                                    <td>
                                                                        {formatCurrency(
                                                                            order.total_amount
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        <Badge
                                                                            bg={
                                                                                order.status ===
                                                                                "completed"
                                                                                    ? "success"
                                                                                    : order.status ===
                                                                                      "pending"
                                                                                    ? "warning"
                                                                                    : order.status ===
                                                                                      "cancelled"
                                                                                    ? "danger"
                                                                                    : "secondary"
                                                                            }
                                                                        >
                                                                            {
                                                                                order.status
                                                                            }
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                        >
                                                                            <Eye
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                No orders found for this
                                                customer.
                                            </div>
                                        )}
                                    </div>
                                </Tab>

                                <Tab eventKey="services" title="Services">
                                    <div className="p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0">
                                                Service History
                                            </h5>
                                            <InputGroup
                                                style={{ width: "300px" }}
                                            >
                                                <InputGroup.Text>
                                                    <Search />
                                                </InputGroup.Text>
                                                <Form.Control placeholder="Search services..." />
                                            </InputGroup>
                                        </div>

                                        {customer.services &&
                                        customer.services.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table hover>
                                                    <thead>
                                                        <tr>
                                                            <th>Service ID</th>
                                                            <th>Date</th>
                                                            <th>
                                                                Service Type
                                                            </th>
                                                            <th>Technician</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {customer.services.map(
                                                            (service) => (
                                                                <tr
                                                                    key={
                                                                        service.id
                                                                    }
                                                                >
                                                                    <td>
                                                                        #
                                                                        {
                                                                            service.id
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {formatDate(
                                                                            service.created_at
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            service.service_type
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {service
                                                                            .technician
                                                                            ?.name ||
                                                                            "N/A"}
                                                                    </td>
                                                                    <td>
                                                                        <Badge
                                                                            bg={
                                                                                service.status ===
                                                                                "completed"
                                                                                    ? "success"
                                                                                    : service.status ===
                                                                                      "in_progress"
                                                                                    ? "primary"
                                                                                    : service.status ===
                                                                                      "pending"
                                                                                    ? "warning"
                                                                                    : service.status ===
                                                                                      "cancelled"
                                                                                    ? "danger"
                                                                                    : "secondary"
                                                                            }
                                                                        >
                                                                            {
                                                                                service.status
                                                                            }
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                        >
                                                                            <Eye
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                No service history found for
                                                this customer.
                                            </div>
                                        )}
                                    </div>
                                </Tab>

                                <Tab eventKey="payments" title="Payments">
                                    <div className="p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0">
                                                Payment History
                                            </h5>
                                            <InputGroup
                                                style={{ width: "300px" }}
                                            >
                                                <InputGroup.Text>
                                                    <Search />
                                                </InputGroup.Text>
                                                <Form.Control placeholder="Search payments..." />
                                            </InputGroup>
                                        </div>

                                        {customer.payments &&
                                        customer.payments.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table hover>
                                                    <thead>
                                                        <tr>
                                                            <th>Payment ID</th>
                                                            <th>Date</th>
                                                            <th>Amount</th>
                                                            <th>Method</th>
                                                            <th>Status</th>
                                                            <th>Reference</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {customer.payments.map(
                                                            (payment) => (
                                                                <tr
                                                                    key={
                                                                        payment.id
                                                                    }
                                                                >
                                                                    <td>
                                                                        #
                                                                        {
                                                                            payment.id
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {formatDate(
                                                                            payment.created_at
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {formatCurrency(
                                                                            payment.amount
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            payment.method
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        <Badge
                                                                            bg={
                                                                                payment.status ===
                                                                                "completed"
                                                                                    ? "success"
                                                                                    : "warning"
                                                                            }
                                                                        >
                                                                            {
                                                                                payment.status
                                                                            }
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        {payment.reference ||
                                                                            "N/A"}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                No payment history found for
                                                this customer.
                                            </div>
                                        )}
                                    </div>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Edit Customer Modal */}
            <Modal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Customer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        defaultValue={customer.first_name}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        defaultValue={customer.last_name}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                defaultValue={customer.email}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        defaultValue={customer.phone}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Alternate Phone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        defaultValue={customer.alternate_phone}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                defaultValue={customer.address}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        defaultValue={customer.city}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>State</Form.Label>
                                    <Form.Control
                                        type="text"
                                        defaultValue={customer.state}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Postal Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        defaultValue={customer.postal_code}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowEditModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setShowEditModal(false)}
                    >
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Note Modal */}
            <Modal
                show={showAddNoteModal}
                onHide={() => setShowAddNoteModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Note</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Note</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Enter notes about this customer..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowAddNoteModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddNote}>
                        Save Note
                    </Button>
                </Modal.Footer>
            </Modal>
        </ErpLayout>
    );
}
