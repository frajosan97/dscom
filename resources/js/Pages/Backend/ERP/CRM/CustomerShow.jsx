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
    Form,
    InputGroup,
    Table,
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
    Eye,
    Search,
} from "react-bootstrap-icons";

import ErpLayout from "@/Layouts/ErpLayout";
import { FaArrowCircleLeft, FaUser } from "react-icons/fa";
import { formatCurrency, formatDate } from "@/Utils/helpers";
import CallModal from "@/Components/Modals/CallModal";
import SendSmsModal from "@/Components/Modals/SmsModal";
import { toast } from "react-toastify";
import { useErrorToast } from "@/Hooks/useErrorToast";
import xios from "@/Utils/axios";
import Swal from "sweetalert2";
import CustomerModal from "@/Components/Modals/CustomerModal";

export default function CustomerAccount({ customer }) {
    const { showErrorToast } = useErrorToast();
    const [activeTab, setActiveTab] = useState("overview");
    const [showCallModal, setShowCallModal] = useState(false);
    const [showSendSmsModal, setShowSendSmsModal] = useState(false);
    const [showAddNoteModal, setShowAddNoteModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);

    const [callDetails, setCallDetails] = useState({
        phoneNumber: customer.phone || "",
        callType: "outgoing",
        notes: "",
        duration: "",
        status: "completed",
    });

    const [smsDetails, setSmsDetails] = useState({
        customerId: customer.id,
        phoneNumber: customer?.phone || "",
        message: "",
    });

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

    const handleCallSubmit = async (e) => {
        e.preventDefault();
        // implement the place call
    };

    const handleSmsSubmit = async (e) => {
        e.preventDefault();

        const confirm = await Swal.fire({
            title: "Send SMS?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, send it!",
        });

        if (!confirm.isConfirmed) return;

        Swal.fire({
            title: "Sending SMS...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        // Send SMS
        try {
            const response = await xios.post(route("send-sms"), smsDetails);

            if (response.data.success === true) {
                toast.success(response.data.message);
            }
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
            setShowSendSmsModal(false);
        }
    };

    const handleCallNow = async (e) => {
        e.preventDefault();

        const confirm = await Swal.fire({
            title: "Call Now?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, call it!",
        });

        if (!confirm.isConfirmed) {
            return;
        }

        // 📞 Direct phone call via tel:
        if (customer?.phone) {
            window.location.href = `tel:${customer.phone}`;
        } else {
            Swal.fire("Error", "No phone number available.", "error");
        }
    };

    return (
        <ErpLayout>
            <Head title={`Customer - ${customer.full_name}`} />

            {/* Header with back button and actions */}
            <div className="d-flex justify-content-between align-items-center">
                <h2 className="h4 mb-0">Customer Account</h2>
                <ButtonGroup className="gap-2">
                    <Button
                        variant="outline-secondary"
                        as={Link}
                        href={route("customers.index")}
                        className="rounded"
                    >
                        <FaArrowCircleLeft className="me-1" /> Back
                    </Button>
                    <Button
                        variant="outline-primary"
                        onClick={() => setShowCustomerModal(true)}
                        className="rounded"
                    >
                        <Pencil className="me-1" /> Edit
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
                            <ButtonGroup className="d-grid gap-2">
                                <Button
                                    onClick={() => setShowCallModal(true)}
                                    variant="outline-primary"
                                    className="text-start rounded-pill"
                                >
                                    <Phone /> Call Customer
                                </Button>
                                <Button
                                    onClick={() => setShowSendSmsModal(true)}
                                    variant="outline-primary"
                                    className="text-start rounded-pill"
                                >
                                    <Chat /> Send Message
                                </Button>
                                {/* <Button
                                    variant="outline-primary"
                                    className="text-start rounded-pill"
                                >
                                    <CreditCard /> Process Payment
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    className="text-start rounded-pill"
                                    onClick={() => setShowAddNoteModal(true)}
                                >
                                    <Journal /> Add Note
                                </Button> */}
                            </ButtonGroup>
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
                                                            {customer.full_name}
                                                        </span>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="px-0 d-flex justify-content-between">
                                                        <span className="text-muted">
                                                            Gender:
                                                        </span>
                                                        <span>
                                                            {customer.gender ||
                                                                "Not Specified"}
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
                                                    <ListGroup.Item className="px-0 d-flex justify-content-between">
                                                        <span className="text-muted">
                                                            Address
                                                        </span>
                                                        <span>
                                                            {customer.address ||
                                                                "N/A"}
                                                        </span>
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

            <CallModal
                showCallModal={showCallModal}
                setShowCallModal={setShowCallModal}
                customer={customer}
                callDetails={callDetails}
                setCallDetails={setCallDetails}
                handleCallSubmit={handleCallSubmit}
                handleCallNow={handleCallNow}
            />

            <SendSmsModal
                showSendSmsModal={showSendSmsModal}
                setShowSendSmsModal={setShowSendSmsModal}
                customer={customer}
                smsDetails={smsDetails}
                setSmsDetails={setSmsDetails}
                handleSmsSubmit={handleSmsSubmit}
            />

            <CustomerModal
                show={showCustomerModal}
                customer={customer}
                onHide={() => setShowCustomerModal(false)}
                onClose={() => setShowCustomerModal(false)}
            />
        </ErpLayout>
    );
}
