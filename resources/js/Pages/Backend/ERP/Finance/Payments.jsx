// resources/js/Pages/Finance/Payments.jsx
import React, { useState, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import {
    Row,
    Col,
    Card,
    Button,
    Table,
    Modal,
    Form,
    InputGroup,
    Badge,
    Alert,
    Tabs,
    Tab,
    Dropdown,
} from "react-bootstrap";
import {
    CurrencyDollar,
    PlusCircle,
    Search,
    Download,
    Eye,
    Pencil,
    Trash,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    Bank,
    Cash,
    Receipt,
    ArrowDownCircle,
    ArrowUpCircle,
} from "react-bootstrap-icons";
import ErpLayout from "@/Layouts/ErpLayout";

export default function Payments() {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [editingPayment, setEditingPayment] = useState(null);

    // Sample data for parties and invoices
    const parties = [
        {
            id: 1,
            name: "Acme Corporation",
            type: "customer",
            email: "acme@example.com",
        },
        {
            id: 2,
            name: "Global Tech Solutions",
            type: "customer",
            email: "tech@example.com",
        },
        {
            id: 3,
            name: "Paper Supplies Ltd",
            type: "vendor",
            email: "paper@example.com",
        },
        {
            id: 4,
            name: "Office Equipment Co",
            type: "vendor",
            email: "office@example.com",
        },
    ];

    const outstandingInvoices = [
        {
            id: "INV-2025-001",
            party: "Acme Corporation",
            amount: 1320.0,
            due_date: "2025-10-15",
            type: "sales",
        },
        {
            id: "INV-2025-003",
            party: "Global Tech Solutions",
            amount: 3025.0,
            due_date: "2025-10-25",
            type: "sales",
        },
        {
            id: "INV-2025-002",
            party: "Paper Supplies Ltd",
            amount: 495.0,
            due_date: "2025-10-20",
            type: "purchase",
        },
    ];

    const [payments, setPayments] = useState([
        {
            id: "PAY-2025-001",
            date: "2025-10-02",
            party: "Acme Corporation",
            partyEmail: "acme@example.com",
            method: "card",
            amount: 1320.0,
            type: "receipt",
            reference: "CHQ-45892",
            status: "completed",
            invoice: "INV-2025-001",
            notes: "Payment for website development",
            bank_account: "Main Business Account",
            transaction_id: "TXN-789456",
        },
        {
            id: "PAY-2025-002",
            date: "2025-10-06",
            party: "Paper Supplies Ltd",
            partyEmail: "paper@example.com",
            method: "bank_transfer",
            amount: 495.0,
            type: "payment",
            reference: "BT-784512",
            status: "completed",
            invoice: "INV-2025-002",
            notes: "Monthly office supplies payment",
            bank_account: "Vendor Account",
            transaction_id: "BT-784512",
        },
        {
            id: "PAY-2025-003",
            date: "2025-10-08",
            party: "Global Tech Solutions",
            partyEmail: "tech@example.com",
            method: "mpesa",
            amount: 1500.0,
            type: "receipt",
            reference: "MP-458793",
            status: "pending",
            invoice: "INV-2025-003",
            notes: "Partial payment for e-commerce platform",
            bank_account: "M-Pesa Business",
            transaction_id: "MP4587932025",
        },
        {
            id: "PAY-2025-004",
            date: "2025-10-10",
            party: "Office Equipment Co",
            partyEmail: "office@example.com",
            method: "cash",
            amount: 850.0,
            type: "payment",
            reference: "CSH-001",
            status: "completed",
            invoice: null,
            notes: "Office chair purchase",
            bank_account: "Cash",
            transaction_id: null,
        },
        {
            id: "PAY-2025-005",
            date: "2025-10-12",
            party: "Acme Corporation",
            partyEmail: "acme@example.com",
            method: "card",
            amount: 2000.0,
            type: "receipt",
            reference: "CHQ-45901",
            status: "failed",
            invoice: null,
            notes: "Card payment declined",
            bank_account: "Main Business Account",
            transaction_id: "TXN-DECLINED",
        },
    ]);

    const [newPayment, setNewPayment] = useState({
        date: new Date().toISOString().split("T")[0],
        party: "",
        partyEmail: "",
        method: "cash",
        amount: "",
        type: "receipt",
        reference: "",
        status: "pending",
        invoice: "",
        notes: "",
        bank_account: "Main Business Account",
        transaction_id: "",
    });

    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            const matchesSearch =
                payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.party
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                payment.reference
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                payment.transaction_id
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesTab =
                activeTab === "all" ||
                (activeTab === "receipts" && payment.type === "receipt") ||
                (activeTab === "payments" && payment.type === "payment") ||
                activeTab === payment.status;

            return matchesSearch && matchesTab;
        });
    }, [payments, searchTerm, activeTab]);

    const addPayment = () => {
        const paymentId = `PAY-${new Date().getFullYear()}-${String(
            payments.length + 1
        ).padStart(3, "0")}`;

        const payment = {
            ...newPayment,
            id: paymentId,
            amount: parseFloat(newPayment.amount) || 0,
        };

        setPayments([payment, ...payments]);
        setShowModal(false);
        resetNewPayment();
    };

    const updatePayment = () => {
        const updatedPayment = {
            ...editingPayment,
            ...newPayment,
            amount: parseFloat(newPayment.amount) || 0,
        };

        setPayments(
            payments.map((p) =>
                p.id === editingPayment.id ? updatedPayment : p
            )
        );
        setShowModal(false);
        setEditingPayment(null);
        resetNewPayment();
    };

    const editPayment = (payment) => {
        setEditingPayment(payment);
        setNewPayment({
            ...payment,
            amount: payment.amount.toString(),
        });
        setShowModal(true);
    };

    const deletePayment = (payment) => {
        setPaymentToDelete(payment);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setPayments(payments.filter((p) => p.id !== paymentToDelete.id));
        setShowDeleteModal(false);
        setPaymentToDelete(null);
    };

    const resetNewPayment = () => {
        setNewPayment({
            date: new Date().toISOString().split("T")[0],
            party: "",
            partyEmail: "",
            method: "cash",
            amount: "",
            type: "receipt",
            reference: "",
            status: "pending",
            invoice: "",
            notes: "",
            bank_account: "Main Business Account",
            transaction_id: "",
        });
    };

    const updateParty = (partyName) => {
        const party = parties.find((p) => p.name === partyName);
        setNewPayment({
            ...newPayment,
            party: partyName,
            partyEmail: party?.email || "",
            type: party?.type === "customer" ? "receipt" : "payment",
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return (
                    <Badge bg="success">
                        <CheckCircle className="me-1" size={12} /> Completed
                    </Badge>
                );
            case "pending":
                return (
                    <Badge bg="warning" text="dark">
                        <Clock className="me-1" size={12} /> Pending
                    </Badge>
                );
            case "failed":
                return (
                    <Badge bg="danger">
                        <XCircle className="me-1" size={12} /> Failed
                    </Badge>
                );
            case "cancelled":
                return <Badge bg="secondary">Cancelled</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const getMethodBadge = (method) => {
        switch (method) {
            case "card":
                return (
                    <Badge bg="primary">
                        <CreditCard className="me-1" size={12} /> Card
                    </Badge>
                );
            case "bank_transfer":
                return (
                    <Badge bg="info">
                        <Bank className="me-1" size={12} /> Bank Transfer
                    </Badge>
                );
            case "cash":
                return (
                    <Badge bg="success">
                        <Cash className="me-1" size={12} /> Cash
                    </Badge>
                );
            case "mpesa":
                return (
                    <Badge bg="success" style={{ backgroundColor: "#0cb74b" }}>
                        M-Pesa
                    </Badge>
                );
            case "paypal":
                return <Badge bg="primary">PayPal</Badge>;
            default:
                return <Badge bg="secondary">{method}</Badge>;
        }
    };

    const getTypeIcon = (type) => {
        return type === "receipt" ? (
            <ArrowDownCircle className="text-success" size={16} />
        ) : (
            <ArrowUpCircle className="text-danger" size={16} />
        );
    };

    const calculateSummary = () => {
        return payments.reduce(
            (summary, payment) => {
                if (payment.status === "completed") {
                    if (payment.type === "receipt") {
                        summary.totalReceipts += payment.amount;
                    } else {
                        summary.totalPayments += payment.amount;
                    }
                } else if (payment.status === "pending") {
                    summary.totalPending += payment.amount;
                }
                return summary;
            },
            { totalReceipts: 0, totalPayments: 0, totalPending: 0 }
        );
    };

    const summary = calculateSummary();

    const paymentMethods = [
        { value: "cash", label: "Cash", icon: <Cash className="me-2" /> },
        {
            value: "card",
            label: "Credit/Debit Card",
            icon: <CreditCard className="me-2" />,
        },
        {
            value: "bank_transfer",
            label: "Bank Transfer",
            icon: <Bank className="me-2" />,
        },
        {
            value: "mpesa",
            label: "M-Pesa",
            icon: <CurrencyDollar className="me-2" />,
        },
        {
            value: "paypal",
            label: "PayPal",
            icon: <CurrencyDollar className="me-2" />,
        },
        { value: "check", label: "Check", icon: <Receipt className="me-2" /> },
    ];

    const bankAccounts = [
        "Main Business Account",
        "Vendor Account",
        "M-Pesa Business",
        "PayPal Business",
        "Cash",
    ];

    return (
        <ErpLayout>
            <Head title="Payments Management" />

            {/* Flash Messages */}
            {flash.success && (
                <Alert variant="success" className="mb-3">
                    {flash.success}
                </Alert>
            )}

            {/* Header Section */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex align-items-center">
                        <CurrencyDollar
                            className="me-3 text-primary"
                            size={32}
                        />
                        <div>
                            <h4 className="fw-semibold mb-1">
                                Payments Management
                            </h4>
                            <p className="text-muted mb-0">
                                Track customer receipts and vendor payments with
                                complete audit trail
                            </p>
                        </div>
                    </div>
                </Col>
                <Col className="text-end">
                    <Button
                        variant="primary"
                        className="px-4"
                        onClick={() => {
                            setEditingPayment(null);
                            resetNewPayment();
                            setShowModal(true);
                        }}
                    >
                        <PlusCircle className="me-2" /> New Payment
                    </Button>
                </Col>
            </Row>

            {/* Summary Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 bg-success bg-opacity-10">
                        <Card.Body className="py-3">
                            <div className="d-flex align-items-center">
                                <ArrowDownCircle
                                    className="text-success me-3"
                                    size={24}
                                />
                                <div>
                                    <div className="text-muted small">
                                        Total Receipts
                                    </div>
                                    <div className="h5 fw-bold text-success mb-0">
                                        $
                                        {summary.totalReceipts.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-danger bg-opacity-10">
                        <Card.Body className="py-3">
                            <div className="d-flex align-items-center">
                                <ArrowUpCircle
                                    className="text-danger me-3"
                                    size={24}
                                />
                                <div>
                                    <div className="text-muted small">
                                        Total Payments
                                    </div>
                                    <div className="h5 fw-bold text-danger mb-0">
                                        $
                                        {summary.totalPayments.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-warning bg-opacity-10">
                        <Card.Body className="py-3">
                            <div className="d-flex align-items-center">
                                <Clock
                                    className="text-warning me-3"
                                    size={24}
                                />
                                <div>
                                    <div className="text-muted small">
                                        Pending
                                    </div>
                                    <div className="h5 fw-bold text-warning mb-0">
                                        ${summary.totalPending.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-primary bg-opacity-10">
                        <Card.Body className="py-3">
                            <div className="d-flex align-items-center">
                                <CurrencyDollar
                                    className="text-primary me-3"
                                    size={24}
                                />
                                <div>
                                    <div className="text-muted small">
                                        Net Cash Flow
                                    </div>
                                    <div
                                        className={`h5 fw-bold ${
                                            summary.totalReceipts -
                                                summary.totalPayments >=
                                            0
                                                ? "text-success"
                                                : "text-danger"
                                        } mb-0`}
                                    >
                                        $
                                        {(
                                            summary.totalReceipts -
                                            summary.totalPayments
                                        ).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters and Search */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Search />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search by payment ID, party, reference..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </InputGroup>
                        </Col>
                        <Col md={6}>
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(tab) => setActiveTab(tab)}
                                className="mb-0"
                            >
                                <Tab eventKey="all" title="All Payments" />
                                <Tab eventKey="receipts" title="Receipts" />
                                <Tab eventKey="payments" title="Payments" />
                                <Tab eventKey="pending" title="Pending" />
                                <Tab eventKey="completed" title="Completed" />
                            </Tabs>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Payments Table */}
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Payment ID</th>
                                    <th>Date</th>
                                    <th>Party</th>
                                    <th>Method</th>
                                    <th className="text-end">Amount</th>
                                    <th>Status</th>
                                    <th>Reference</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {getTypeIcon(payment.type)}
                                                    <div className="ms-2">
                                                        <div className="fw-semibold">
                                                            {payment.id}
                                                        </div>
                                                        <small className="text-muted text-capitalize">
                                                            {payment.type}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="fw-semibold">
                                                {payment.date}
                                            </td>
                                            <td>
                                                <div>
                                                    <div>{payment.party}</div>
                                                    <small className="text-muted">
                                                        {payment.partyEmail}
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                {getMethodBadge(payment.method)}
                                            </td>
                                            <td className="text-end">
                                                <div
                                                    className={`fw-semibold ${
                                                        payment.type ===
                                                        "receipt"
                                                            ? "text-success"
                                                            : "text-danger"
                                                    }`}
                                                >
                                                    {payment.type === "receipt"
                                                        ? "+"
                                                        : "-"}
                                                    $
                                                    {payment.amount.toLocaleString()}
                                                </div>
                                                <small className="text-muted">
                                                    {payment.bank_account}
                                                </small>
                                            </td>
                                            <td>
                                                {getStatusBadge(payment.status)}
                                            </td>
                                            <td>
                                                <div>{payment.reference}</div>
                                                {payment.transaction_id && (
                                                    <small className="text-muted">
                                                        {payment.transaction_id}
                                                    </small>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <Dropdown>
                                                    <Dropdown.Toggle
                                                        variant="outline-primary"
                                                        size="sm"
                                                        id="dropdown-basic"
                                                    >
                                                        Actions
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item>
                                                            <Eye
                                                                className="me-2"
                                                                size={14}
                                                            />
                                                            View Details
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            onClick={() =>
                                                                editPayment(
                                                                    payment
                                                                )
                                                            }
                                                        >
                                                            <Pencil
                                                                className="me-2"
                                                                size={14}
                                                            />
                                                            Edit
                                                        </Dropdown.Item>
                                                        <Dropdown.Item>
                                                            <Download
                                                                className="me-2"
                                                                size={14}
                                                            />
                                                            Receipt
                                                        </Dropdown.Item>
                                                        <Dropdown.Divider />
                                                        <Dropdown.Item
                                                            className="text-danger"
                                                            onClick={() =>
                                                                deletePayment(
                                                                    payment
                                                                )
                                                            }
                                                        >
                                                            <Trash
                                                                className="me-2"
                                                                size={14}
                                                            />
                                                            Delete
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="text-center text-muted py-4"
                                        >
                                            <CurrencyDollar
                                                size={48}
                                                className="mb-2"
                                            />
                                            <div>No payments found</div>
                                            <small>
                                                Try adjusting your search or
                                                create a new payment
                                            </small>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Add/Edit Payment Modal */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingPayment ? "Edit Payment" : "Record New Payment"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Type *</Form.Label>
                                    <Form.Select
                                        value={newPayment.type}
                                        onChange={(e) =>
                                            setNewPayment({
                                                ...newPayment,
                                                type: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="receipt">
                                            Customer Receipt (Money In)
                                        </option>
                                        <option value="payment">
                                            Vendor Payment (Money Out)
                                        </option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status *</Form.Label>
                                    <Form.Select
                                        value={newPayment.status}
                                        onChange={(e) =>
                                            setNewPayment({
                                                ...newPayment,
                                                status: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="completed">
                                            Completed
                                        </option>
                                        <option value="failed">Failed</option>
                                        <option value="cancelled">
                                            Cancelled
                                        </option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        {newPayment.type === "receipt"
                                            ? "Customer"
                                            : "Vendor"}{" "}
                                        *
                                    </Form.Label>
                                    <Form.Select
                                        value={newPayment.party}
                                        onChange={(e) =>
                                            updateParty(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Select{" "}
                                            {newPayment.type === "receipt"
                                                ? "Customer"
                                                : "Vendor"}
                                        </option>
                                        {parties
                                            .filter(
                                                (party) =>
                                                    party.type ===
                                                    (newPayment.type ===
                                                    "receipt"
                                                        ? "customer"
                                                        : "vendor")
                                            )
                                            .map((party) => (
                                                <option
                                                    key={party.id}
                                                    value={party.name}
                                                >
                                                    {party.name}
                                                </option>
                                            ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Date *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newPayment.date}
                                        onChange={(e) =>
                                            setNewPayment({
                                                ...newPayment,
                                                date: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Method *</Form.Label>
                                    <Form.Select
                                        value={newPayment.method}
                                        onChange={(e) =>
                                            setNewPayment({
                                                ...newPayment,
                                                method: e.target.value,
                                            })
                                        }
                                    >
                                        {paymentMethods.map((method) => (
                                            <option
                                                key={method.value}
                                                value={method.value}
                                            >
                                                {method.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Bank Account *</Form.Label>
                                    <Form.Select
                                        value={newPayment.bank_account}
                                        onChange={(e) =>
                                            setNewPayment({
                                                ...newPayment,
                                                bank_account: e.target.value,
                                            })
                                        }
                                    >
                                        {bankAccounts.map((account) => (
                                            <option
                                                key={account}
                                                value={account}
                                            >
                                                {account}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Amount *</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={newPayment.amount}
                                onChange={(e) =>
                                    setNewPayment({
                                        ...newPayment,
                                        amount: e.target.value,
                                    })
                                }
                                placeholder="0.00"
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Reference Number</Form.Label>
                                    <Form.Control
                                        value={newPayment.reference}
                                        onChange={(e) =>
                                            setNewPayment({
                                                ...newPayment,
                                                reference: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., CHQ-001, BT-458792"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Transaction ID</Form.Label>
                                    <Form.Control
                                        value={newPayment.transaction_id}
                                        onChange={(e) =>
                                            setNewPayment({
                                                ...newPayment,
                                                transaction_id: e.target.value,
                                            })
                                        }
                                        placeholder="Bank/M-Pesa transaction ID"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Related Invoice</Form.Label>
                            <Form.Select
                                value={newPayment.invoice}
                                onChange={(e) =>
                                    setNewPayment({
                                        ...newPayment,
                                        invoice: e.target.value,
                                    })
                                }
                            >
                                <option value="">
                                    Select Invoice (Optional)
                                </option>
                                {outstandingInvoices
                                    .filter(
                                        (inv) =>
                                            (newPayment.type === "receipt" &&
                                                inv.type === "sales") ||
                                            (newPayment.type === "payment" &&
                                                inv.type === "purchase")
                                    )
                                    .map((invoice) => (
                                        <option
                                            key={invoice.id}
                                            value={invoice.id}
                                        >
                                            {invoice.id} - {invoice.party} ($
                                            {invoice.amount})
                                        </option>
                                    ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newPayment.notes}
                                onChange={(e) =>
                                    setNewPayment({
                                        ...newPayment,
                                        notes: e.target.value,
                                    })
                                }
                                placeholder="Payment notes or description..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={editingPayment ? updatePayment : addPayment}
                    >
                        {editingPayment ? "Update Payment" : "Record Payment"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete payment{" "}
                    <strong>{paymentToDelete?.id}</strong>?
                    <br />
                    <small className="text-muted">
                        This action cannot be undone and will remove the payment
                        record permanently.
                    </small>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete Payment
                    </Button>
                </Modal.Footer>
            </Modal>
        </ErpLayout>
    );
}
