import { Head, Link } from "@inertiajs/react";
import { useState, useMemo } from "react";
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
    ProgressBar,
    Alert,
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
    Shop,
    Tools,
    CreditCard,
    Activity,
    ShieldCheck,
    Bell,
    Download,
    Upload,
    GraphUp,
} from "react-bootstrap-icons";
import { FaArrowCircleLeft, FaCrown, FaFire } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import ErpLayout from "@/Layouts/ErpLayout";
import { formatCurrency, formatDate, calculateAge } from "@/Utils/helpers";
import CallModal from "@/Components/Modals/CallModal";
import SendSmsModal from "@/Components/Modals/SmsModal";
import CustomerModal from "@/Components/Modals/CustomerModal";
import CustomerStatsCard from "@/Components/Cards/CustomerStatsCard";
import xios from "@/Utils/axios";
import { useErrorToast } from "@/Hooks/useErrorToast";
import { BiImage } from "react-icons/bi";

export default function CustomerAccount({ customer }) {
    const { showErrorToast } = useErrorToast();

    const [activeTab, setActiveTab] = useState("overview");
    const [showCallModal, setShowCallModal] = useState(false);
    const [showSendSmsModal, setShowSendSmsModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Customer stats
    const customerStats = useMemo(
        () => ({
            totalSpent:
                customer.orders?.reduce(
                    (sum, order) => sum + (order.total_amount || 0),
                    0
                ) || 0,
            orderCount: customer.orders?.length || 0,
            serviceCount: customer.services?.length || 0,
            avgOrderValue: customer.orders?.length
                ? customer.orders.reduce(
                      (sum, order) => sum + (order.total_amount || 0),
                      0
                  ) / customer.orders.length
                : 0,
            loyaltyTier: calculateLoyaltyTier(customer.total_spent || 0),
        }),
        [customer]
    );

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

    /** Calculate loyalty tier */
    function calculateLoyaltyTier(totalSpent) {
        if (totalSpent >= 10000)
            return { name: "Platinum", color: "primary", icon: <FaCrown /> };
        if (totalSpent >= 5000)
            return { name: "Gold", color: "warning", icon: <Star /> };
        if (totalSpent >= 1000)
            return {
                name: "Silver",
                color: "secondary",
                icon: <ShieldCheck />,
            };
        return { name: "Bronze", color: "success", icon: null };
    }

    /** Get badge color for customer type */
    const getCustomerTypeBadge = (type) => {
        const types = {
            retail: { color: "info", label: "Retail" },
            wholesale: { color: "warning", label: "Wholesale" },
            corporate: { color: "success", label: "Corporate" },
            vip: { color: "danger", label: "VIP" },
            regular: { color: "secondary", label: "Regular" },
        };
        return types[type?.toLowerCase()] || types.regular;
    };

    /** SMS Sending */
    const handleSmsSubmit = async (e) => {
        e.preventDefault();

        const confirm = await Swal.fire({
            title: "📱 Send SMS?",
            text: "This message will be sent immediately.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, send it!",
            cancelButtonText: "Cancel",
        });

        if (!confirm.isConfirmed) return;

        Swal.fire({
            title: "Sending SMS...",
            text: "Please wait while we send your message",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const response = await xios.post(route("send-sms"), smsDetails);
            toast.success("📨 SMS sent successfully!");
            setSmsDetails({ ...smsDetails, message: "" });
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
            title: "📞 Initiate Call?",
            text: "You will be redirected to your phone dialer",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, call now!",
            cancelButtonText: "Cancel",
        });

        if (!confirm.isConfirmed) return;

        if (customer?.phone) {
            window.location.href = `tel:${customer.phone}`;
            toast.info("📞 Redirecting to phone dialer...");
        } else {
            Swal.fire({
                icon: "error",
                title: "No Phone Number",
                text: "This customer doesn't have a phone number registered.",
            });
        }
    };

    /** Export customer data */
    const handleExportData = async () => {
        Swal.fire({
            title: "Exporting Data...",
            text: "Preparing your customer data for download",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const response = await xios.get(
                route("customers.export", customer.id),
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `customer-${customer.id}-data-${Date.now()}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("📥 Data exported successfully!");
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
        }
    };

    return (
        <ErpLayout>
            <Head title={`${customer.name} - Customer Account`} />

            <Container fluid className="py-4 customer-account-page">
                {/* Page Header with Stats */}
                <Row className="mb-4 align-items-center">
                    <Col lg={12}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="position-relative">
                                <img
                                    src={customer.profile_image_url}
                                    alt="Profile"
                                    className="rounded-circle border border-3 border-light shadow"
                                    style={{
                                        width: "70px",
                                        height: "70px",
                                        objectFit: "cover",
                                    }}
                                />
                                <Badge
                                    bg={
                                        customer.is_active
                                            ? "success"
                                            : "danger"
                                    }
                                    className="position-absolute bottom-0 end-0 border border-2 border-white"
                                    pill
                                >
                                    {customer.is_active ? "✓" : "✗"}
                                </Badge>
                            </div>
                            <div>
                                <h2 className="fw-bold mb-1 text-gradient-primary text-capitalize">
                                    {customer.name}
                                </h2>
                                <div className="d-flex gap-2 align-items-center text-muted">
                                    <Badge
                                        bg={
                                            getCustomerTypeBadge(
                                                customer.customer_type
                                            ).color
                                        }
                                        className="text-capitalize"
                                    >
                                        {
                                            getCustomerTypeBadge(
                                                customer.customer_type
                                            ).label
                                        }
                                    </Badge>
                                    <span className="text-muted">•</span>
                                    <span>
                                        <Calendar size={14} className="me-1" />
                                        Member since{" "}
                                        {formatDate(
                                            customer.created_at,
                                            "MMM YYYY"
                                        )}
                                    </span>
                                    <span className="text-muted">•</span>
                                    <Badge
                                        bg={customerStats.loyaltyTier.color}
                                        className="d-flex align-items-center gap-1"
                                    >
                                        {customerStats.loyaltyTier.icon}
                                        {customerStats.loyaltyTier.name}
                                    </Badge>
                                    <span className="text-muted">•</span>
                                    <Badge
                                        as={Link}
                                        href={route(
                                            "customers.edit",
                                            customer.id
                                        )}
                                    >
                                        <Pencil className="me-2" /> Edit Profile
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Row */}
                        <Row className="g-3">
                            <Col xs={6} md={3}>
                                <CustomerStatsCard
                                    title="Total Spent"
                                    value={formatCurrency(
                                        customerStats.totalSpent
                                    )}
                                    icon={<CashCoin />}
                                    color="primary"
                                    trend="+12.5%"
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <CustomerStatsCard
                                    title="Total Orders"
                                    value={customerStats.orderCount}
                                    icon={<Shop />}
                                    color="success"
                                    subtitle={`${
                                        customerStats.avgOrderValue
                                            ? formatCurrency(
                                                  customerStats.avgOrderValue
                                              )
                                            : "N/A"
                                    } avg`}
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <CustomerStatsCard
                                    title="Services"
                                    value={customerStats.serviceCount}
                                    icon={<Tools />}
                                    color="warning"
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <CustomerStatsCard
                                    title="Current Balance"
                                    value={formatCurrency(
                                        customer.balance || 0
                                    )}
                                    icon={<CreditCard />}
                                    color={
                                        customer.balance >= 0
                                            ? "info"
                                            : "danger"
                                    }
                                    subtitle={
                                        customer.balance >= 0
                                            ? "Credit Available"
                                            : "Overdue"
                                    }
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Main Content Area */}
                <Row>
                    {/* Sidebar - Customer Profile & Quick Actions */}
                    <Col xl={3} lg={4} className="mb-4">
                        {/* Profile Card */}
                        <Card className="border-0 shadow-lg h-100">
                            <Card.Body className="p-4">
                                {/* Contact Info */}
                                <h6 className="fw-semibold mb-3 text-primary d-flex align-items-center">
                                    <Person className="me-2" /> Contact
                                    Information
                                </h6>
                                <ListGroup variant="flush" className="mb-4">
                                    <ListGroup.Item className="d-flex align-items-center px-0 py-2">
                                        <Envelope className="text-primary me-3 flex-shrink-0" />
                                        <div>
                                            <small className="text-muted d-block">
                                                Email
                                            </small>
                                            <span className="text-break">
                                                {customer.email ||
                                                    "Not provided"}
                                            </span>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex align-items-center px-0 py-2">
                                        <Telephone className="text-primary me-3 flex-shrink-0" />
                                        <div>
                                            <small className="text-muted d-block">
                                                Phone
                                            </small>
                                            <span>
                                                {customer.phone ||
                                                    "Not provided"}
                                            </span>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex align-items-center px-0 py-2">
                                        <GeoAlt className="text-primary me-3 flex-shrink-0" />
                                        <div>
                                            <small className="text-muted d-block">
                                                Location
                                            </small>
                                            <span>
                                                {customer.city || customer.state
                                                    ? `${customer.city || ""}${
                                                          customer.city &&
                                                          customer.state
                                                              ? ", "
                                                              : ""
                                                      }${customer.state || ""}`
                                                    : "Not specified"}
                                            </span>
                                        </div>
                                    </ListGroup.Item>
                                </ListGroup>

                                {/* Loyalty & Balance */}
                                <h6 className="fw-semibold mb-3 text-primary d-flex align-items-center">
                                    <Star className="me-2" /> Loyalty & Balance
                                </h6>
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">
                                            Loyalty Points
                                        </span>
                                        <Badge bg="warning" className="fs-6">
                                            {customer.loyalty_points || 0}
                                        </Badge>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted">
                                            Account Balance
                                        </span>
                                        <span
                                            className={`fw-bold ${
                                                customer.balance >= 0
                                                    ? "text-success"
                                                    : "text-danger"
                                            }`}
                                        >
                                            {formatCurrency(
                                                customer.balance || 0
                                            )}
                                        </span>
                                    </div>
                                    {customer.balance < 0 && (
                                        <Alert
                                            variant="danger"
                                            className="mt-2 py-2"
                                            size="sm"
                                        >
                                            <Bell size={14} className="me-2" />
                                            Overdue balance - Consider following
                                            up
                                        </Alert>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <h6 className="fw-semibold mb-3 text-primary d-flex align-items-center">
                                    <Activity className="me-2" /> Quick Actions
                                </h6>
                                <div className="d-grid gap-2">
                                    <Button
                                        variant="outline-primary"
                                        className="rounded-pill text-start d-flex align-items-center justify-content-between"
                                        onClick={() => setShowCallModal(true)}
                                    >
                                        <span>
                                            <Phone className="me-2" /> Make a
                                            Call
                                        </span>
                                        <Badge bg="light" text="dark" pill>
                                            📞
                                        </Badge>
                                    </Button>
                                    <Button
                                        variant="outline-success"
                                        className="rounded-pill text-start d-flex align-items-center justify-content-between"
                                        onClick={() =>
                                            setShowSendSmsModal(true)
                                        }
                                    >
                                        <span>
                                            <Chat className="me-2" /> Send
                                            Message
                                        </span>
                                        <Badge bg="light" text="dark" pill>
                                            💬
                                        </Badge>
                                    </Button>
                                    <Button
                                        variant="outline-warning"
                                        className="rounded-pill text-start d-flex align-items-center justify-content-between"
                                        onClick={() =>
                                            toast.info("Feature coming soon!")
                                        }
                                    >
                                        <span>
                                            <Bell className="me-2" /> Send
                                            Reminder
                                        </span>
                                        <Badge bg="light" text="dark" pill>
                                            ⏰
                                        </Badge>
                                    </Button>
                                    <Button
                                        variant="outline-info"
                                        className="rounded-pill text-start d-flex align-items-center justify-content-between"
                                        onClick={() =>
                                            window.open(
                                                `mailto:${customer.email}`,
                                                "_blank"
                                            )
                                        }
                                        disabled={!customer.email}
                                    >
                                        <span>
                                            <Envelope className="me-2" /> Send
                                            Email
                                        </span>
                                        <Badge bg="light" text="dark" pill>
                                            📧
                                        </Badge>
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Main Content - Tabs */}
                    <Col xl={9} lg={8}>
                        <Card className="border-0 shadow-lg h-100">
                            <Card.Body className="p-0">
                                <Tabs
                                    activeKey={activeTab}
                                    onSelect={(k) => setActiveTab(k)}
                                    className="px-4 pt-4 border-bottom"
                                    fill
                                >
                                    <Tab
                                        eventKey="overview"
                                        title={
                                            <span className="d-flex align-items-center">
                                                <Person className="me-2" />{" "}
                                                Overview
                                            </span>
                                        }
                                    />
                                    <Tab
                                        eventKey="orders"
                                        title={
                                            <span className="d-flex align-items-center">
                                                <Shop className="me-2" /> Orders
                                                {customerStats.orderCount >
                                                    0 && (
                                                    <Badge
                                                        bg="primary"
                                                        pill
                                                        className="ms-2"
                                                    >
                                                        {
                                                            customerStats.orderCount
                                                        }
                                                    </Badge>
                                                )}
                                            </span>
                                        }
                                    />
                                    <Tab
                                        eventKey="services"
                                        title={
                                            <span className="d-flex align-items-center">
                                                <Tools className="me-2" />{" "}
                                                Services
                                                {customerStats.serviceCount >
                                                    0 && (
                                                    <Badge
                                                        bg="warning"
                                                        pill
                                                        className="ms-2"
                                                    >
                                                        {
                                                            customerStats.serviceCount
                                                        }
                                                    </Badge>
                                                )}
                                            </span>
                                        }
                                    />
                                    <Tab
                                        eventKey="payments"
                                        title={
                                            <span className="d-flex align-items-center">
                                                <CreditCard className="me-2" />{" "}
                                                Payments
                                            </span>
                                        }
                                    />
                                    <Tab
                                        eventKey="activity"
                                        title={
                                            <span className="d-flex align-items-center">
                                                <Activity className="me-2" />{" "}
                                                Activity
                                            </span>
                                        }
                                    />
                                </Tabs>

                                <div className="p-4">
                                    {activeTab === "overview" && (
                                        <OverviewTab customer={customer} />
                                    )}
                                    {activeTab === "orders" && (
                                        <OrdersTab
                                            customer={customer}
                                            searchTerm={searchTerm}
                                        />
                                    )}
                                    {activeTab === "services" && (
                                        <ServicesTab
                                            customer={customer}
                                            searchTerm={searchTerm}
                                        />
                                    )}
                                    {activeTab === "payments" && (
                                        <PaymentsTab
                                            customer={customer}
                                            searchTerm={searchTerm}
                                        />
                                    )}
                                    {activeTab === "activity" && (
                                        <ActivityTab customer={customer} />
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
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
        </ErpLayout>
    );
}

/** ---------------- Sub Components ---------------- */

const OverviewTab = ({ customer }) => {
    const age = customer.date_of_birth
        ? calculateAge(customer.date_of_birth)
        : null;

    return (
        <div>
            <Row className="g-4">
                <Col md={6}>
                    <Card className="border-0 bg-light">
                        <Card.Body>
                            <h6 className="fw-semibold mb-3 text-primary">
                                <Person className="me-2" /> Personal Details
                            </h6>
                            <ListGroup variant="flush">
                                <InfoItem
                                    label="Full Name"
                                    value={customer.name}
                                />
                                <InfoItem
                                    label="Gender"
                                    value={
                                        <Badge
                                            bg={
                                                customer.gender === "male"
                                                    ? "info"
                                                    : "danger"
                                            }
                                        >
                                            {customer.gender
                                                ? customer.gender
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  customer.gender.slice(1)
                                                : "N/A"}
                                        </Badge>
                                    }
                                />
                                <InfoItem
                                    label="Date of Birth"
                                    value={
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>
                                                {formatDate(
                                                    customer.date_of_birth
                                                ) || "N/A"}
                                            </span>
                                            {age && (
                                                <Badge bg="secondary">
                                                    {age} years
                                                </Badge>
                                            )}
                                        </div>
                                    }
                                />
                                <InfoItem
                                    label="Customer ID"
                                    value={
                                        <code className="text-primary">
                                            {customer.id}
                                        </code>
                                    }
                                />
                                <InfoItem
                                    label="Customer Since"
                                    value={
                                        <div className="d-flex align-items-center">
                                            <Calendar
                                                size={14}
                                                className="me-2 text-muted"
                                            />
                                            {formatDate(
                                                customer.created_at,
                                                "MMMM DD, YYYY"
                                            )}
                                        </div>
                                    }
                                />
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="border-0 bg-light">
                        <Card.Body>
                            <h6 className="fw-semibold mb-3 text-primary">
                                <GeoAlt className="me-2" /> Address Details
                            </h6>
                            <ListGroup variant="flush">
                                <InfoItem
                                    label="Address"
                                    value={customer.address || "Not provided"}
                                />
                                <InfoItem label="City" value={customer.city} />
                                <InfoItem
                                    label="State/Province"
                                    value={customer.state}
                                />
                                <InfoItem
                                    label="Postal Code"
                                    value={customer.postal_code}
                                />
                                <InfoItem
                                    label="Country"
                                    value={customer.country}
                                />
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={12}>
                    <Card className="border-0 bg-light">
                        <Card.Body>
                            <h6 className="fw-semibold mb-3 text-primary">
                                <Activity className="me-2" /> Customer Insights
                            </h6>
                            <Row className="g-3">
                                <Col md={4}>
                                    <div className="text-center p-3 bg-white rounded">
                                        <div className="text-primary mb-2">
                                            <FaFire size={24} />
                                        </div>
                                        <h4 className="fw-bold">
                                            {customer.orders?.length || 0}
                                        </h4>
                                        <p className="text-muted mb-0">
                                            Total Orders
                                        </p>
                                        <small className="text-success">
                                            +12% from last month
                                        </small>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="text-center p-3 bg-white rounded">
                                        <div className="text-warning mb-2">
                                            <Star size={24} />
                                        </div>
                                        <h4 className="fw-bold">
                                            {customer.loyalty_points || 0}
                                        </h4>
                                        <p className="text-muted mb-0">
                                            Loyalty Points
                                        </p>
                                        <small className="text-success">
                                            Earn 50 more for next tier
                                        </small>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="text-center p-3 bg-white rounded">
                                        <div className="text-success mb-2">
                                            <CashCoin size={24} />
                                        </div>
                                        <h4 className="fw-bold">
                                            {formatCurrency(
                                                customer.total_spent || 0
                                            )}
                                        </h4>
                                        <p className="text-muted mb-0">
                                            Lifetime Value
                                        </p>
                                        <small className="text-success">
                                            Top 15% customer
                                        </small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

const OrdersTab = ({ customer, searchTerm }) => {
    const filteredOrders =
        customer.orders?.filter(
            (order) =>
                !searchTerm ||
                order.id.toString().includes(searchTerm) ||
                order.status?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

    return (
        <TabTable
            title="Order History"
            data={filteredOrders}
            columns={[
                { key: "id", label: "Order ID", render: (val) => `#${val}` },
                {
                    key: "created_at",
                    label: "Date",
                    render: (val) => formatDate(val),
                },
                {
                    key: "items_count",
                    label: "Items",
                    render: (val) => val || 0,
                },
                {
                    key: "total_amount",
                    label: "Amount",
                    render: (val) => formatCurrency(val),
                },
                {
                    key: "status",
                    label: "Status",
                    render: (val) => (
                        <Badge bg={getStatusColor(val)} pill>
                            {val || "Pending"}
                        </Badge>
                    ),
                },
                {
                    key: "actions",
                    label: "Actions",
                    render: () => (
                        <Button variant="outline-primary" size="sm">
                            <Eye size={14} />
                        </Button>
                    ),
                },
            ]}
            emptyMessage="No orders found for this customer."
            searchPlaceholder="Search orders by ID or status..."
            // onSearch={setSearchTerm}
        />
    );
};

const ServicesTab = ({ customer, searchTerm }) => (
    <TabTable
        title="Service History"
        data={customer.services || []}
        columns={[
            { key: "id", label: "Service ID", render: (val) => `#${val}` },
            {
                key: "created_at",
                label: "Date",
                render: (val) => formatDate(val),
            },
            { key: "service_type", label: "Service Type" },
            { key: "technician", label: "Technician" },
            {
                key: "status",
                label: "Status",
                render: (val) => (
                    <Badge bg={getStatusColor(val)} pill>
                        {val}
                    </Badge>
                ),
            },
            {
                key: "actions",
                label: "Actions",
                render: () => (
                    <Button variant="outline-warning" size="sm">
                        <Eye size={14} />
                    </Button>
                ),
            },
        ]}
        emptyMessage="No service history available."
        searchPlaceholder="Search services..."
        // onSearch={setSearchTerm}
    />
);

const PaymentsTab = ({ customer, searchTerm }) => (
    <TabTable
        title="Payment History"
        data={customer.payments || []}
        columns={[
            { key: "id", label: "Payment ID", render: (val) => `#${val}` },
            {
                key: "created_at",
                label: "Date",
                render: (val) => formatDate(val),
            },
            {
                key: "amount",
                label: "Amount",
                render: (val) => formatCurrency(val),
            },
            { key: "payment_method", label: "Method" },
            {
                key: "status",
                label: "Status",
                render: (val) => (
                    <Badge
                        bg={val === "completed" ? "success" : "warning"}
                        pill
                    >
                        {val}
                    </Badge>
                ),
            },
            { key: "reference", label: "Reference" },
        ]}
        emptyMessage="No payment records found."
        searchPlaceholder="Search payments..."
        // onSearch={setSearchTerm}
    />
);

const ActivityTab = ({ customer }) => (
    <div className="text-center py-5">
        <div className="mb-4">
            <Activity size={48} className="text-muted" />
        </div>
        <h5 className="text-muted mb-3">Activity Timeline</h5>
        <p className="text-muted">
            Recent customer activities will appear here
        </p>
        <Button variant="outline-primary">
            <GraphUp className="me-2" /> View Full Activity Log
        </Button>
    </div>
);

/** Helper Components */

const InfoItem = ({ label, value }) => (
    <ListGroup.Item className="px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
        <span className="text-muted">{label}</span>
        <span className="fw-semibold text-end">{value || "—"}</span>
    </ListGroup.Item>
);

const TabTable = ({
    title,
    data,
    columns,
    emptyMessage,
    searchPlaceholder,
    onSearch,
}) => (
    <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-semibold mb-0">{title}</h6>
            <InputGroup style={{ width: "300px" }}>
                <InputGroup.Text>
                    <Search />
                </InputGroup.Text>
                <Form.Control
                    placeholder={searchPlaceholder}
                    onChange={(e) => onSearch && onSearch(e.target.value)}
                />
            </InputGroup>
        </div>

        {data.length > 0 ? (
            <div className="table-responsive rounded border">
                <Table hover className="mb-0">
                    <thead className="table-light">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="border-0">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.id}>
                                {columns.map((col) => (
                                    <td key={`${item.id}-${col.key}`}>
                                        {col.render
                                            ? col.render(item[col.key], item)
                                            : item[col.key] || "—"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        ) : (
            <div className="text-center py-5 bg-light rounded">
                <Search size={48} className="text-muted mb-3" />
                <h5 className="text-muted">{emptyMessage}</h5>
            </div>
        )}
    </div>
);

/** Helper Functions */

const getStatusColor = (status) => {
    const colors = {
        completed: "success",
        pending: "warning",
        processing: "info",
        cancelled: "danger",
        delivered: "primary",
        shipped: "secondary",
    };
    return colors[status?.toLowerCase()] || "secondary";
};
