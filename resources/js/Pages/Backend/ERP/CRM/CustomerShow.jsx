import { Head, Link } from "@inertiajs/react";
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
    Container,
} from "react-bootstrap";
import {
    Telephone,
    Envelope,
    GeoAlt,
    Calendar,
    Person,
    CashCoin,
    Star,
    Chat,
    Phone,
    Eye,
    Search,
    Pencil,
} from "react-bootstrap-icons";
import { FaArrowCircleLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import ErpLayout from "@/Layouts/ErpLayout";
import { formatCurrency, formatDate } from "@/Utils/helpers";
import CallModal from "@/Components/Modals/CallModal";
import SendSmsModal from "@/Components/Modals/SmsModal";
import CustomerModal from "@/Components/Modals/CustomerModal";
import xios from "@/Utils/axios";
import { useErrorToast } from "@/Hooks/useErrorToast";

export default function CustomerAccount({ customer }) {
    const { showErrorToast } = useErrorToast();

    const [activeTab, setActiveTab] = useState("overview");
    const [showCallModal, setShowCallModal] = useState(false);
    const [showSendSmsModal, setShowSendSmsModal] = useState(false);
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

    /** Get badge color for customer type */
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

    /** SMS Sending */
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
            didOpen: () => Swal.showLoading(),
        });

        try {
            const response = await xios.post(route("send-sms"), smsDetails);
            if (response.data.success) toast.success(response.data.message);
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
            setShowSendSmsModal(false);
        }
    };

    /** Phone Call */
    const handleCallNow = async (e) => {
        e.preventDefault();

        const confirm = await Swal.fire({
            title: "Call Now?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, call!",
        });

        if (!confirm.isConfirmed) return;

        if (customer?.phone) {
            window.location.href = `tel:${customer.phone}`;
        } else {
            Swal.fire("Error", "No phone number available.", "error");
        }
    };

    return (
        <ErpLayout>
            <Head title={`Customer - ${customer.full_name}`} />

            <Container fluid className="py-4">
                {/* Page Header */}
                <Row className="mb-4">
                    <Col>
                        <h3 className="fw-bold text-primary text-capitalize">
                            {customer?.full_name}
                        </h3>
                        <p className="text-muted mb-0">
                            Managing the customer account
                        </p>
                    </Col>
                    <Col className="text-end">
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
                                as={Link}
                                href={route("customers.edit", customer.id)}
                                className="rounded"
                            >
                                <Pencil className="me-1" /> Edit
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>

                <Card>
                    <Card.Body>
                        <Row>
                            {/* Sidebar Profile */}
                            <Col md={4} lg={3}>
                                <Card className="border-0 shadow-sm mb-3">
                                    <Card.Body className="text-center p-4">
                                        {/* Profile Image */}
                                        <div className="mb-3">
                                            {customer?.profile_image_url ? (
                                                <img
                                                    src={
                                                        customer.profile_image_url
                                                    }
                                                    alt="Profile"
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

                                        <h5 className="fw-bold mb-1">
                                            {customer.first_name}{" "}
                                            {customer.last_name}
                                        </h5>
                                        <Badge
                                            bg={getCustomerTypeBadge(
                                                customer.customer_type
                                            )}
                                            className="text-capitalize mb-2"
                                        >
                                            {customer.customer_type}
                                        </Badge>

                                        {/* Status */}
                                        <div className="d-flex justify-content-center mb-3">
                                            <Badge
                                                bg={
                                                    customer.is_active
                                                        ? "success"
                                                        : "secondary"
                                                }
                                                className="me-2"
                                            >
                                                {customer.is_active
                                                    ? "Active"
                                                    : "Inactive"}
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

                                        {/* Contact Info */}
                                        <ListGroup
                                            variant="flush"
                                            className="text-start"
                                        >
                                            <ListGroup.Item className="px-0 d-flex align-items-center">
                                                <Envelope className="text-muted me-2" />
                                                {customer.email || "N/A"}
                                            </ListGroup.Item>
                                            <ListGroup.Item className="px-0 d-flex align-items-center">
                                                <Telephone className="text-muted me-2" />
                                                {customer.phone || "N/A"}
                                            </ListGroup.Item>
                                            <ListGroup.Item className="px-0 d-flex align-items-center">
                                                <GeoAlt className="text-muted me-2" />
                                                {customer.city
                                                    ? `${customer.city}, ${customer.state}`
                                                    : "Location not specified"}
                                            </ListGroup.Item>
                                            <ListGroup.Item className="px-0 d-flex align-items-center">
                                                <Calendar className="text-muted me-2" />
                                                Joined:{" "}
                                                {formatDate(
                                                    customer.created_at
                                                )}
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Card.Body>
                                </Card>

                                {/* Account Summary */}
                                <Card className="border-0 shadow-sm mb-3">
                                    <Card.Header className="bg-white fw-semibold">
                                        Account Summary
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>
                                                <Star className="text-warning me-2" />
                                                Loyalty Points
                                            </span>
                                            <span className="fw-bold">
                                                {customer.loyalty_points || 0}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span>
                                                <CashCoin className="text-success me-2" />
                                                Balance
                                            </span>
                                            <span className="fw-bold">
                                                {formatCurrency(
                                                    customer.balance
                                                )}
                                            </span>
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Quick Actions */}
                                <Card className="border-0 shadow-sm">
                                    <Card.Header className="bg-white fw-semibold">
                                        Quick Actions
                                    </Card.Header>
                                    <Card.Body>
                                        <ButtonGroup className="d-grid gap-2">
                                            <Button
                                                variant="outline-primary"
                                                className="text-start rounded-pill"
                                                onClick={() =>
                                                    setShowCallModal(true)
                                                }
                                            >
                                                <Phone /> Call Customer
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                className="text-start rounded-pill"
                                                onClick={() =>
                                                    setShowSendSmsModal(true)
                                                }
                                            >
                                                <Chat /> Send Message
                                            </Button>
                                        </ButtonGroup>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Main Content */}
                            <Col md={8} lg={9}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="p-0">
                                        <Tabs
                                            activeKey={activeTab}
                                            onSelect={(k) => setActiveTab(k)}
                                            className="px-3 pt-3"
                                        >
                                            <Tab
                                                eventKey="overview"
                                                title="Overview"
                                            >
                                                <OverviewTab
                                                    customer={customer}
                                                />
                                            </Tab>
                                            <Tab
                                                eventKey="orders"
                                                title="Orders"
                                            >
                                                <OrdersTab
                                                    customer={customer}
                                                />
                                            </Tab>
                                            <Tab
                                                eventKey="services"
                                                title="Services"
                                            >
                                                <ServicesTab
                                                    customer={customer}
                                                />
                                            </Tab>
                                            <Tab
                                                eventKey="payments"
                                                title="Payments"
                                            >
                                                <PaymentsTab
                                                    customer={customer}
                                                />
                                            </Tab>
                                        </Tabs>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>

            {/* Modals */}
            <CallModal
                showCallModal={showCallModal}
                setShowCallModal={setShowCallModal}
                customer={customer}
                callDetails={callDetails}
                setCallDetails={setCallDetails}
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
            />
        </ErpLayout>
    );
}

/** ---------------- Sub Components ---------------- */

const OverviewTab = ({ customer }) => (
    <div className="p-3">
        <Row>
            <Col md={6}>
                <h6 className="fw-semibold mb-3">Personal Information</h6>
                <ListGroup variant="flush">
                    <InfoItem label="Full Name" value={customer.full_name} />
                    <InfoItem label="Gender" value={customer.gender} />
                    <InfoItem
                        label="Birth Date"
                        value={formatDate(customer.date_of_birth)}
                    />
                    <InfoItem label="Customer ID" value={customer.id} />
                </ListGroup>
            </Col>
            <Col md={6}>
                <h6 className="fw-semibold mb-3">Address Information</h6>
                <ListGroup variant="flush">
                    <InfoItem label="Address" value={customer.address} />
                    <InfoItem label="City" value={customer.city} />
                    <InfoItem label="State" value={customer.state} />
                    <InfoItem
                        label="Postal Code"
                        value={customer.postal_code}
                    />
                    <InfoItem label="Country" value={customer.country} />
                </ListGroup>
            </Col>
        </Row>
    </div>
);

const OrdersTab = ({ customer }) => (
    <TabTable
        title="Order History"
        placeholder="Search orders..."
        data={customer.orders}
        columns={["Order ID", "Date", "Items", "Amount", "Status", "Actions"]}
    />
);

const ServicesTab = ({ customer }) => (
    <TabTable
        title="Service History"
        placeholder="Search services..."
        data={customer.services}
        columns={[
            "Service ID",
            "Date",
            "Service Type",
            "Technician",
            "Status",
            "Actions",
        ]}
    />
);

const PaymentsTab = ({ customer }) => (
    <TabTable
        title="Payment History"
        placeholder="Search payments..."
        data={customer.payments}
        columns={[
            "Payment ID",
            "Date",
            "Amount",
            "Method",
            "Status",
            "Reference",
        ]}
    />
);

/** Info Item */
const InfoItem = ({ label, value }) => (
    <ListGroup.Item className="px-0 d-flex justify-content-between">
        <span className="text-muted">{label}:</span>
        <span>{value || "N/A"}</span>
    </ListGroup.Item>
);

/** Generic Table Template for Tabs */
const TabTable = ({ title, placeholder, data, columns }) => (
    <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-semibold mb-0">{title}</h6>
            <InputGroup style={{ width: "300px" }}>
                <InputGroup.Text>
                    <Search />
                </InputGroup.Text>
                <Form.Control placeholder={placeholder} />
            </InputGroup>
        </div>

        {data && data.length > 0 ? (
            <div className="table-responsive">
                <Table hover bordered>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.id}>
                                <td>#{item.id}</td>
                                <td>{formatDate(item.created_at)}</td>
                                <td>{item.amount || "—"}</td>
                                <td>
                                    <Badge bg="secondary">
                                        {item.status || "—"}
                                    </Badge>
                                </td>
                                <td>
                                    <Button variant="outline-primary" size="sm">
                                        <Eye size={14} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        ) : (
            <div className="text-center text-muted py-5">
                No records found for this customer.
            </div>
        )}
    </div>
);
