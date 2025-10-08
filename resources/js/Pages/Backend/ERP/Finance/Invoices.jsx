// resources/js/Pages/Finance/Invoices.jsx
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
    FileEarmarkText,
    PlusCircle,
    Search,
    Download,
    Eye,
    Pencil,
    Trash,
    Clock,
    CheckCircle,
    XCircle,
    Cash,
    Calendar,
    Person,
    Receipt,
} from "react-bootstrap-icons";
import ErpLayout from "@/Layouts/ErpLayout";

export default function Invoices() {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [editingInvoice, setEditingInvoice] = useState(null);

    // Sample customers and suppliers
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
            type: "supplier",
            email: "paper@example.com",
        },
        {
            id: 4,
            name: "Office Equipment Co",
            type: "supplier",
            email: "office@example.com",
        },
        {
            id: 5,
            name: "Digital Marketing Pro",
            type: "supplier",
            email: "marketing@example.com",
        },
    ];

    const [invoices, setInvoices] = useState([
        {
            id: "INV-2025-001",
            type: "sales",
            party: "Acme Corporation",
            partyEmail: "acme@example.com",
            date: "2025-10-01",
            due_date: "2025-10-15",
            amount: 1200.0,
            tax: 120.0,
            total: 1320.0,
            status: "paid",
            reference: "SO-001",
            items: [
                {
                    description: "Website Development",
                    quantity: 1,
                    price: 1000.0,
                    amount: 1000.0,
                },
                {
                    description: "Domain Registration",
                    quantity: 1,
                    price: 200.0,
                    amount: 200.0,
                },
            ],
            notes: "Thank you for your business!",
        },
        {
            id: "INV-2025-002",
            type: "purchase",
            party: "Paper Supplies Ltd",
            partyEmail: "paper@example.com",
            date: "2025-10-05",
            due_date: "2025-10-20",
            amount: 450.0,
            tax: 45.0,
            total: 495.0,
            status: "pending",
            reference: "PO-001",
            items: [
                {
                    description: "Office Paper",
                    quantity: 10,
                    price: 45.0,
                    amount: 450.0,
                },
            ],
            notes: "Monthly office supplies",
        },
        {
            id: "INV-2025-003",
            type: "sales",
            party: "Global Tech Solutions",
            partyEmail: "tech@example.com",
            date: "2025-10-10",
            due_date: "2025-10-25",
            amount: 2750.0,
            tax: 275.0,
            total: 3025.0,
            status: "overdue",
            reference: "SO-002",
            items: [
                {
                    description: "E-commerce Platform",
                    quantity: 1,
                    price: 2000.0,
                    amount: 2000.0,
                },
                {
                    description: "SSL Certificate",
                    quantity: 1,
                    price: 750.0,
                    amount: 750.0,
                },
            ],
            notes: "Project completion invoice",
        },
        {
            id: "INV-2025-004",
            type: "purchase",
            party: "Digital Marketing Pro",
            partyEmail: "marketing@example.com",
            date: "2025-10-12",
            due_date: "2025-10-27",
            amount: 1500.0,
            tax: 150.0,
            total: 1650.0,
            status: "draft",
            reference: "PO-002",
            items: [
                {
                    description: "Google Ads Management",
                    quantity: 1,
                    price: 1500.0,
                    amount: 1500.0,
                },
            ],
            notes: "Q4 Marketing campaign",
        },
    ]);

    const [newInvoice, setNewInvoice] = useState({
        type: "sales",
        party: "",
        partyEmail: "",
        date: new Date().toISOString().split("T")[0],
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        reference: "",
        items: [{ description: "", quantity: 1, price: 0, amount: 0 }],
        tax_rate: 10,
        notes: "",
        status: "draft",
    });

    const filteredInvoices = useMemo(() => {
        return invoices.filter((invoice) => {
            const matchesSearch =
                invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.party
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                invoice.reference
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesTab =
                activeTab === "all" ||
                (activeTab === "sales" && invoice.type === "sales") ||
                (activeTab === "purchase" && invoice.type === "purchase") ||
                activeTab === invoice.status;

            return matchesSearch && matchesTab;
        });
    }, [invoices, searchTerm, activeTab]);

    const calculateInvoiceTotals = (invoice) => {
        const amount = invoice.items.reduce(
            (sum, item) => sum + (item.amount || 0),
            0
        );
        const tax = amount * (invoice.tax_rate / 100);
        const total = amount + tax;

        return { amount, tax, total };
    };

    const addInvoice = () => {
        const totals = calculateInvoiceTotals(newInvoice);
        const invoiceId = `INV-${new Date().getFullYear()}-${String(
            invoices.length + 1
        ).padStart(3, "0")}`;

        const invoice = {
            ...newInvoice,
            id: invoiceId,
            ...totals,
            items: newInvoice.items.map((item) => ({
                ...item,
                amount: (item.quantity || 0) * (item.price || 0),
            })),
        };

        setInvoices([invoice, ...invoices]);
        setShowModal(false);
        resetNewInvoice();
    };

    const updateInvoice = () => {
        const totals = calculateInvoiceTotals(newInvoice);
        const updatedInvoice = {
            ...editingInvoice,
            ...newInvoice,
            ...totals,
            items: newInvoice.items.map((item) => ({
                ...item,
                amount: (item.quantity || 0) * (item.price || 0),
            })),
        };

        setInvoices(
            invoices.map((inv) =>
                inv.id === editingInvoice.id ? updatedInvoice : inv
            )
        );
        setShowModal(false);
        setEditingInvoice(null);
        resetNewInvoice();
    };

    const editInvoice = (invoice) => {
        setEditingInvoice(invoice);
        setNewInvoice({
            ...invoice,
            items: invoice.items.map((item) => ({ ...item })),
        });
        setShowModal(true);
    };

    const deleteInvoice = (invoice) => {
        setInvoiceToDelete(invoice);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setInvoices(invoices.filter((inv) => inv.id !== invoiceToDelete.id));
        setShowDeleteModal(false);
        setInvoiceToDelete(null);
    };

    const resetNewInvoice = () => {
        setNewInvoice({
            type: "sales",
            party: "",
            partyEmail: "",
            date: new Date().toISOString().split("T")[0],
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            reference: "",
            items: [{ description: "", quantity: 1, price: 0, amount: 0 }],
            tax_rate: 10,
            notes: "",
            status: "draft",
        });
    };

    const updateItem = (index, field, value) => {
        const updatedItems = [...newInvoice.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };

        // Calculate amount if quantity or price changes
        if (field === "quantity" || field === "price") {
            updatedItems[index].amount =
                (updatedItems[index].quantity || 0) *
                (updatedItems[index].price || 0);
        }

        setNewInvoice({
            ...newInvoice,
            items: updatedItems,
        });
    };

    const addItem = () => {
        setNewInvoice({
            ...newInvoice,
            items: [
                ...newInvoice.items,
                { description: "", quantity: 1, price: 0, amount: 0 },
            ],
        });
    };

    const removeItem = (index) => {
        if (newInvoice.items.length <= 1) return;
        const updatedItems = newInvoice.items.filter((_, i) => i !== index);
        setNewInvoice({
            ...newInvoice,
            items: updatedItems,
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "paid":
                return (
                    <Badge bg="success">
                        <CheckCircle className="me-1" size={12} /> Paid
                    </Badge>
                );
            case "pending":
                return (
                    <Badge bg="warning" text="dark">
                        <Clock className="me-1" size={12} /> Pending
                    </Badge>
                );
            case "overdue":
                return (
                    <Badge bg="danger">
                        <XCircle className="me-1" size={12} /> Overdue
                    </Badge>
                );
            case "draft":
                return <Badge bg="secondary">Draft</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type) => {
        return type === "sales" ? (
            <Badge bg="primary">Sales</Badge>
        ) : (
            <Badge bg="info">Purchase</Badge>
        );
    };

    const updateParty = (partyName) => {
        const party = parties.find((p) => p.name === partyName);
        setNewInvoice({
            ...newInvoice,
            party: partyName,
            partyEmail: party?.email || "",
        });
    };

    const calculateSummary = () => {
        return invoices.reduce(
            (summary, invoice) => {
                if (invoice.status === "paid") {
                    summary.totalPaid += invoice.total;
                } else if (invoice.status === "pending") {
                    summary.totalPending += invoice.total;
                } else if (invoice.status === "overdue") {
                    summary.totalOverdue += invoice.total;
                }
                return summary;
            },
            { totalPaid: 0, totalPending: 0, totalOverdue: 0 }
        );
    };

    const summary = calculateSummary();

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    return (
        <ErpLayout>
            <Head title="Invoices Management" />

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
                        <FileEarmarkText
                            className="me-3 text-primary"
                            size={32}
                        />
                        <div>
                            <h4 className="fw-semibold mb-1">
                                Invoices Management
                            </h4>
                            <p className="text-muted mb-0">
                                Manage sales and purchase invoices with
                                automated tracking
                            </p>
                        </div>
                    </div>
                </Col>
                <Col className="text-end">
                    <Button
                        variant="primary"
                        className="px-4"
                        onClick={() => {
                            setEditingInvoice(null);
                            resetNewInvoice();
                            setShowModal(true);
                        }}
                    >
                        <PlusCircle className="me-2" /> New Invoice
                    </Button>
                </Col>
            </Row>

            {/* Summary Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 bg-success bg-opacity-10">
                        <Card.Body className="py-3">
                            <div className="d-flex align-items-center">
                                <CheckCircle
                                    className="text-success me-3"
                                    size={24}
                                />
                                <div>
                                    <div className="text-muted small">
                                        Total Paid
                                    </div>
                                    <div className="h5 fw-bold text-success mb-0">
                                        ${summary.totalPaid.toLocaleString()}
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
                    <Card className="border-0 bg-danger bg-opacity-10">
                        <Card.Body className="py-3">
                            <div className="d-flex align-items-center">
                                <XCircle
                                    className="text-danger me-3"
                                    size={24}
                                />
                                <div>
                                    <div className="text-muted small">
                                        Overdue
                                    </div>
                                    <div className="h5 fw-bold text-danger mb-0">
                                        ${summary.totalOverdue.toLocaleString()}
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
                                <Receipt
                                    className="text-primary me-3"
                                    size={24}
                                />
                                <div>
                                    <div className="text-muted small">
                                        Total Invoices
                                    </div>
                                    <div className="h5 fw-bold text-primary mb-0">
                                        {invoices.length}
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
                                    placeholder="Search by invoice ID, party, reference..."
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
                                <Tab eventKey="all" title="All Invoices" />
                                <Tab eventKey="sales" title="Sales" />
                                <Tab eventKey="purchase" title="Purchases" />
                                <Tab eventKey="pending" title="Pending" />
                                <Tab eventKey="overdue" title="Overdue" />
                            </Tabs>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Invoices Table */}
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Type</th>
                                    <th>Party</th>
                                    <th>Date / Due</th>
                                    <th className="text-end">Amount</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length > 0 ? (
                                    filteredInvoices.map((invoice) => (
                                        <tr
                                            key={invoice.id}
                                            className={
                                                isOverdue(invoice.due_date) &&
                                                invoice.status !== "paid"
                                                    ? "table-warning"
                                                    : ""
                                            }
                                        >
                                            <td>
                                                <div className="fw-semibold">
                                                    {invoice.id}
                                                </div>
                                                <small className="text-muted">
                                                    {invoice.reference}
                                                </small>
                                            </td>
                                            <td>
                                                {getTypeBadge(invoice.type)}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <Person
                                                        className="me-2 text-muted"
                                                        size={14}
                                                    />
                                                    <div>
                                                        <div>
                                                            {invoice.party}
                                                        </div>
                                                        <small className="text-muted">
                                                            {invoice.partyEmail}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <Calendar
                                                        className="me-2 text-muted"
                                                        size={14}
                                                    />
                                                    <div>
                                                        <div>
                                                            {invoice.date}
                                                        </div>
                                                        <small
                                                            className={
                                                                isOverdue(
                                                                    invoice.due_date
                                                                ) &&
                                                                invoice.status !==
                                                                    "paid"
                                                                    ? "text-danger"
                                                                    : "text-muted"
                                                            }
                                                        >
                                                            Due:{" "}
                                                            {invoice.due_date}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                <div className="fw-semibold">
                                                    $
                                                    {invoice.total.toLocaleString()}
                                                </div>
                                                <small className="text-muted">
                                                    $
                                                    {invoice.amount.toLocaleString()}{" "}
                                                    + $
                                                    {invoice.tax.toLocaleString()}{" "}
                                                    tax
                                                </small>
                                            </td>
                                            <td>
                                                {getStatusBadge(invoice.status)}
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
                                                            View
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            onClick={() =>
                                                                editInvoice(
                                                                    invoice
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
                                                            Download PDF
                                                        </Dropdown.Item>
                                                        <Dropdown.Divider />
                                                        <Dropdown.Item
                                                            className="text-danger"
                                                            onClick={() =>
                                                                deleteInvoice(
                                                                    invoice
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
                                            colSpan="7"
                                            className="text-center text-muted py-4"
                                        >
                                            <FileEarmarkText
                                                size={48}
                                                className="mb-2"
                                            />
                                            <div>No invoices found</div>
                                            <small>
                                                Try adjusting your search or
                                                create a new invoice
                                            </small>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Add/Edit Invoice Modal */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Invoice Type *</Form.Label>
                                    <Form.Select
                                        value={newInvoice.type}
                                        onChange={(e) =>
                                            setNewInvoice({
                                                ...newInvoice,
                                                type: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="sales">
                                            Sales Invoice
                                        </option>
                                        <option value="purchase">
                                            Purchase Invoice
                                        </option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={newInvoice.status}
                                        onChange={(e) =>
                                            setNewInvoice({
                                                ...newInvoice,
                                                status: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        {newInvoice.type === "sales"
                                            ? "Customer"
                                            : "Supplier"}{" "}
                                        *
                                    </Form.Label>
                                    <Form.Select
                                        value={newInvoice.party}
                                        onChange={(e) =>
                                            updateParty(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Select{" "}
                                            {newInvoice.type === "sales"
                                                ? "Customer"
                                                : "Supplier"}
                                        </option>
                                        {parties
                                            .filter(
                                                (party) =>
                                                    party.type ===
                                                    (newInvoice.type === "sales"
                                                        ? "customer"
                                                        : "supplier")
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
                                    <Form.Label>Reference</Form.Label>
                                    <Form.Control
                                        value={newInvoice.reference}
                                        onChange={(e) =>
                                            setNewInvoice({
                                                ...newInvoice,
                                                reference: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., PO-001, SO-001"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Invoice Date *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newInvoice.date}
                                        onChange={(e) =>
                                            setNewInvoice({
                                                ...newInvoice,
                                                date: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Due Date *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newInvoice.due_date}
                                        onChange={(e) =>
                                            setNewInvoice({
                                                ...newInvoice,
                                                due_date: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Line Items */}
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Form.Label className="fw-semibold">
                                    Items
                                </Form.Label>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={addItem}
                                >
                                    <PlusCircle size={12} className="me-1" />
                                    Add Item
                                </Button>
                            </div>

                            {newInvoice.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="border rounded p-3 mb-2"
                                >
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-muted">
                                            Item #{index + 1}
                                        </small>
                                        {newInvoice.items.length > 1 && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>
                                                    Description *
                                                </Form.Label>
                                                <Form.Control
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Item description"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Qty</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "quantity",
                                                            parseFloat(
                                                                e.target.value
                                                            ) || 0
                                                        )
                                                    }
                                                    min="1"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Price</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    value={item.price}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "price",
                                                            parseFloat(
                                                                e.target.value
                                                            ) || 0
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Amount</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    value={item.amount}
                                                    readOnly
                                                    className="bg-light"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </div>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tax Rate (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        value={newInvoice.tax_rate}
                                        onChange={(e) =>
                                            setNewInvoice({
                                                ...newInvoice,
                                                tax_rate:
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Card className="bg-light">
                                    <Card.Body>
                                        <Row>
                                            <Col>
                                                <div className="text-muted">
                                                    Subtotal:
                                                </div>
                                                <div className="fw-semibold">
                                                    $
                                                    {newInvoice.items
                                                        .reduce(
                                                            (sum, item) =>
                                                                sum +
                                                                (item.amount ||
                                                                    0),
                                                            0
                                                        )
                                                        .toFixed(2)}
                                                </div>
                                            </Col>
                                            <Col>
                                                <div className="text-muted">
                                                    Tax:
                                                </div>
                                                <div className="fw-semibold">
                                                    $
                                                    {(
                                                        newInvoice.items.reduce(
                                                            (sum, item) =>
                                                                sum +
                                                                (item.amount ||
                                                                    0),
                                                            0
                                                        ) *
                                                        (newInvoice.tax_rate /
                                                            100)
                                                    ).toFixed(2)}
                                                </div>
                                            </Col>
                                            <Col>
                                                <div className="text-muted">
                                                    Total:
                                                </div>
                                                <div className="h6 fw-bold text-primary">
                                                    $
                                                    {(
                                                        newInvoice.items.reduce(
                                                            (sum, item) =>
                                                                sum +
                                                                (item.amount ||
                                                                    0),
                                                            0
                                                        ) *
                                                        (1 +
                                                            newInvoice.tax_rate /
                                                                100)
                                                    ).toFixed(2)}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Form.Group>
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newInvoice.notes}
                                onChange={(e) =>
                                    setNewInvoice({
                                        ...newInvoice,
                                        notes: e.target.value,
                                    })
                                }
                                placeholder="Additional notes or terms..."
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
                        onClick={editingInvoice ? updateInvoice : addInvoice}
                    >
                        {editingInvoice ? "Update Invoice" : "Create Invoice"}
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
                    Are you sure you want to delete invoice{" "}
                    <strong>{invoiceToDelete?.id}</strong>?
                    <br />
                    <small className="text-muted">
                        This action cannot be undone.
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
                        Delete Invoice
                    </Button>
                </Modal.Footer>
            </Modal>
        </ErpLayout>
    );
}
