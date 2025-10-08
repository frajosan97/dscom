import { useState, useMemo } from "react";
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
} from "react-bootstrap";
import {
    Journal,
    PlusCircle,
    Search,
    Calculator,
    Receipt,
    CheckCircle,
    XCircle,
} from "react-bootstrap-icons";
import ErpLayout from "@/Layouts/ErpLayout";
import { BsFillJournalBookmarkFill } from "react-icons/bs";

export default function Transactions() {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [validationErrors, setValidationErrors] = useState([]);

    // Sample chart of accounts for dropdown
    const chartOfAccounts = [
        { code: "1001", name: "Cash on Hand", type: "Asset" },
        { code: "1002", name: "Bank Account", type: "Asset" },
        { code: "1101", name: "Accounts Receivable", type: "Asset" },
        { code: "1201", name: "Inventory", type: "Asset" },
        { code: "2001", name: "Accounts Payable", type: "Liability" },
        { code: "2002", name: "Credit Card Payable", type: "Liability" },
        { code: "4001", name: "Online Sales", type: "Income" },
        { code: "4002", name: "Shipping Revenue", type: "Income" },
        { code: "5001", name: "Cost of Goods Sold", type: "Expense" },
        { code: "5002", name: "Shipping Costs", type: "Expense" },
        { code: "5003", name: "Payment Processing Fees", type: "Expense" },
        { code: "5004", name: "Digital Marketing", type: "Expense" },
        { code: "5005", name: "Salaries & Wages", type: "Expense" },
    ];

    const [transactions, setTransactions] = useState([
        {
            id: 1,
            date: "2025-10-01",
            reference: "INIT-001",
            entries: [
                {
                    account: "1001",
                    name: "Cash on Hand",
                    debit: 2000,
                    credit: 0,
                    description: "Initial capital investment",
                },
                {
                    account: "3001",
                    name: "Owner's Capital",
                    debit: 0,
                    credit: 2000,
                    description: "Initial capital investment",
                },
            ],
            description: "Initial capital investment",
            status: "posted",
            type: "Capital Contribution",
        },
        {
            id: 2,
            date: "2025-10-03",
            reference: "SALE-001",
            entries: [
                {
                    account: "1002",
                    name: "Bank Account",
                    debit: 5000,
                    credit: 0,
                    description: "Online sales revenue",
                },
                {
                    account: "4001",
                    name: "Online Sales",
                    debit: 0,
                    credit: 5000,
                    description: "Online sales revenue",
                },
            ],
            description: "Online sales for October 3",
            status: "posted",
            type: "Sales",
        },
        {
            id: 3,
            date: "2025-10-05",
            reference: "EXP-001",
            entries: [
                {
                    account: "5001",
                    name: "Cost of Goods Sold",
                    debit: 1200,
                    credit: 0,
                    description: "Inventory cost for sales",
                },
                {
                    account: "1201",
                    name: "Inventory",
                    debit: 0,
                    credit: 1200,
                    description: "Inventory cost for sales",
                },
            ],
            description: "COGS for October sales",
            status: "posted",
            type: "Cost of Sales",
        },
        {
            id: 4,
            date: "2025-10-07",
            reference: "PMT-001",
            entries: [
                {
                    account: "2002",
                    name: "Credit Card Payable",
                    debit: 800,
                    credit: 0,
                    description: "Credit card payment",
                },
                {
                    account: "1002",
                    name: "Bank Account",
                    debit: 0,
                    credit: 800,
                    description: "Credit card payment",
                },
            ],
            description: "Credit card payment",
            status: "draft",
            type: "Payment",
        },
    ]);

    const [newTransaction, setNewTransaction] = useState({
        date: new Date().toISOString().split("T")[0],
        reference: `TRX-${Date.now().toString().slice(-4)}`,
        description: "",
        entries: [
            { account: "", name: "", debit: "", credit: "", description: "" },
            { account: "", name: "", debit: "", credit: "", description: "" },
        ],
    });

    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const matchesSearch =
                transaction.reference
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                transaction.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                transaction.entries.some(
                    (entry) =>
                        entry.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        entry.description
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                );

            const matchesTab =
                activeTab === "all" || transaction.status === activeTab;

            return matchesSearch && matchesTab;
        });
    }, [transactions, searchTerm, activeTab]);

    const validateTransaction = (transaction) => {
        const errors = [];

        // Check if debit equals credit
        const totalDebit = transaction.entries.reduce(
            (sum, entry) => sum + (parseFloat(entry.debit) || 0),
            0
        );
        const totalCredit = transaction.entries.reduce(
            (sum, entry) => sum + (parseFloat(entry.credit) || 0),
            0
        );

        if (totalDebit !== totalCredit) {
            errors.push(
                `Debit (${totalDebit}) must equal Credit (${totalCredit})`
            );
        }

        // Check for empty accounts
        transaction.entries.forEach((entry, index) => {
            if (!entry.account) {
                errors.push(`Entry ${index + 1}: Account is required`);
            }
            if (!entry.debit && !entry.credit) {
                errors.push(
                    `Entry ${index + 1}: Either debit or credit must be entered`
                );
            }
            if (entry.debit && entry.credit) {
                errors.push(
                    `Entry ${index + 1}: Cannot have both debit and credit`
                );
            }
        });

        // Check for duplicate accounts
        const accounts = transaction.entries
            .map((entry) => entry.account)
            .filter(Boolean);
        const uniqueAccounts = new Set(accounts);
        if (uniqueAccounts.size !== accounts.length) {
            errors.push("Duplicate accounts in transaction");
        }

        return errors;
    };

    const addTransaction = () => {
        const errors = validateTransaction(newTransaction);

        if (errors.length > 0) {
            setValidationErrors(errors);
            setShowValidationModal(true);
            return;
        }

        const transaction = {
            ...newTransaction,
            id: Date.now(),
            status: "posted",
            entries: newTransaction.entries.map((entry) => ({
                ...entry,
                debit: parseFloat(entry.debit) || 0,
                credit: parseFloat(entry.credit) || 0,
                name:
                    chartOfAccounts.find((acc) => acc.code === entry.account)
                        ?.name || entry.name,
            })),
        };

        setTransactions([...transactions, transaction]);
        setShowModal(false);
        setNewTransaction({
            date: new Date().toISOString().split("T")[0],
            reference: `TRX-${Date.now().toString().slice(-4)}`,
            description: "",
            entries: [
                {
                    account: "",
                    name: "",
                    debit: "",
                    credit: "",
                    description: "",
                },
                {
                    account: "",
                    name: "",
                    debit: "",
                    credit: "",
                    description: "",
                },
            ],
        });
    };

    const updateEntry = (index, field, value) => {
        const updatedEntries = [...newTransaction.entries];
        updatedEntries[index] = {
            ...updatedEntries[index],
            [field]: value,
        };

        // Auto-fill account name when account code is selected
        if (field === "account" && value) {
            const account = chartOfAccounts.find((acc) => acc.code === value);
            if (account) {
                updatedEntries[index].name = account.name;
            }
        }

        setNewTransaction({
            ...newTransaction,
            entries: updatedEntries,
        });
    };

    const addEntry = () => {
        setNewTransaction({
            ...newTransaction,
            entries: [
                ...newTransaction.entries,
                {
                    account: "",
                    name: "",
                    debit: "",
                    credit: "",
                    description: "",
                },
            ],
        });
    };

    const removeEntry = (index) => {
        if (newTransaction.entries.length <= 2) return;
        const updatedEntries = newTransaction.entries.filter(
            (_, i) => i !== index
        );
        setNewTransaction({
            ...newTransaction,
            entries: updatedEntries,
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "posted":
                return <Badge bg="success">Posted</Badge>;
            case "draft":
                return <Badge bg="warning">Draft</Badge>;
            case "void":
                return <Badge bg="danger">Void</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const getTransactionType = (transaction) => {
        const debitAccounts = transaction.entries.filter(
            (entry) => entry.debit > 0
        );
        const creditAccounts = transaction.entries.filter(
            (entry) => entry.credit > 0
        );

        if (
            debitAccounts.some((entry) => entry.account.startsWith("4")) &&
            creditAccounts.some((entry) => entry.account.startsWith("1"))
        ) {
            return "Sales";
        }
        if (
            debitAccounts.some((entry) => entry.account.startsWith("5")) &&
            creditAccounts.some((entry) => entry.account.startsWith("1"))
        ) {
            return "Expense";
        }
        if (
            debitAccounts.some((entry) => entry.account.startsWith("1")) &&
            creditAccounts.some((entry) => entry.account.startsWith("2"))
        ) {
            return "Payment";
        }
        return "General";
    };

    const calculateTotals = () => {
        return transactions.reduce(
            (totals, transaction) => {
                if (transaction.status === "posted") {
                    transaction.entries.forEach((entry) => {
                        totals.totalDebit += entry.debit;
                        totals.totalCredit += entry.credit;
                    });
                }
                return totals;
            },
            { totalDebit: 0, totalCredit: 0 }
        );
    };

    const totals = calculateTotals();

    return (
        <ErpLayout>
            <Head title="Journal Transactions" />

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
                        <Journal className="me-3 text-primary" size={32} />
                        <div>
                            <h4 className="fw-semibold mb-1">
                                Journal Transactions
                            </h4>
                            <p className="text-muted mb-0">
                                Manage all accounting entries and double-entry
                                transactions
                            </p>
                        </div>
                    </div>
                </Col>
                <Col className="text-end">
                    <div className="d-flex align-items-center justify-content-end gap-3">
                        <div className="text-end">
                            <small className="text-muted d-block">
                                Total Debit
                            </small>
                            <strong className="text-success">
                                ${totals.totalDebit.toLocaleString()}
                            </strong>
                        </div>
                        <div className="text-end">
                            <small className="text-muted d-block">
                                Total Credit
                            </small>
                            <strong className="text-primary">
                                ${totals.totalCredit.toLocaleString()}
                            </strong>
                        </div>
                        <Button
                            variant="primary"
                            className="px-4"
                            onClick={() => setShowModal(true)}
                        >
                            <PlusCircle className="me-2" /> New Entry
                        </Button>
                    </div>
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
                                    placeholder="Search by reference, description, or account..."
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
                                <Tab eventKey="all" title="All Transactions" />
                                <Tab eventKey="posted" title="Posted" />
                                <Tab eventKey="draft" title="Draft" />
                            </Tabs>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Transactions Table */}
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <div className="table-responsive">
                        <Table bordered hover className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th width="120">Date</th>
                                    <th width="140">Reference</th>
                                    <th>Description</th>
                                    <th width="120">Type</th>
                                    <th width="100">Status</th>
                                    <th width="120" className="text-end">
                                        Debit Total
                                    </th>
                                    <th width="120" className="text-end">
                                        Credit Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction) => {
                                        const transactionTotal =
                                            transaction.entries.reduce(
                                                (sum, entry) =>
                                                    sum + entry.debit,
                                                0
                                            );
                                        return (
                                            <tr key={transaction.id}>
                                                <td className="fw-semibold">
                                                    {transaction.date}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <Receipt
                                                            className="me-2 text-muted"
                                                            size={14}
                                                        />
                                                        {transaction.reference}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        {
                                                            transaction.description
                                                        }
                                                    </div>
                                                    <small className="text-muted">
                                                        {transaction.entries
                                                            .map(
                                                                (entry) =>
                                                                    `${
                                                                        entry.name
                                                                    }${
                                                                        entry.debit >
                                                                        0
                                                                            ? ` (Dr)`
                                                                            : ` (Cr)`
                                                                    }`
                                                            )
                                                            .join(" → ")}
                                                    </small>
                                                </td>
                                                <td>
                                                    <Badge
                                                        bg="outline-primary"
                                                        text="dark"
                                                    >
                                                        {getTransactionType(
                                                            transaction
                                                        )}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {getStatusBadge(
                                                        transaction.status
                                                    )}
                                                </td>
                                                <td className="text-end text-success fw-semibold">
                                                    $
                                                    {transactionTotal.toLocaleString()}
                                                </td>
                                                <td className="text-end text-primary fw-semibold">
                                                    $
                                                    {transactionTotal.toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center text-muted py-4"
                                        >
                                            <Journal
                                                size={48}
                                                className="mb-2"
                                            />
                                            <div>No transactions found</div>
                                            <small>
                                                Try adjusting your search or
                                                create a new transaction
                                            </small>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Add Transaction Modal */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <BsFillJournalBookmarkFill className="me-2" />
                        New Journal Entry
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newTransaction.date}
                                        onChange={(e) =>
                                            setNewTransaction({
                                                ...newTransaction,
                                                date: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Reference *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newTransaction.reference}
                                        onChange={(e) =>
                                            setNewTransaction({
                                                ...newTransaction,
                                                reference: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., TRX-001"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={newTransaction.description}
                                onChange={(e) =>
                                    setNewTransaction({
                                        ...newTransaction,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Brief description of the transaction..."
                            />
                        </Form.Group>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <Form.Label className="fw-semibold">
                                    Journal Entries
                                </Form.Label>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={addEntry}
                                >
                                    <PlusCircle size={12} className="me-1" />
                                    Add Line
                                </Button>
                            </div>

                            {newTransaction.entries.map((entry, index) => (
                                <div
                                    key={index}
                                    className="border rounded p-3 mb-2"
                                >
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-muted">
                                            Entry #{index + 1}
                                        </small>
                                        {newTransaction.entries.length > 2 && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() =>
                                                    removeEntry(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    <Row>
                                        <Col md={5}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>
                                                    Account *
                                                </Form.Label>
                                                <Form.Select
                                                    value={entry.account}
                                                    onChange={(e) =>
                                                        updateEntry(
                                                            index,
                                                            "account",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select Account
                                                    </option>
                                                    {chartOfAccounts.map(
                                                        (account) => (
                                                            <option
                                                                key={
                                                                    account.code
                                                                }
                                                                value={
                                                                    account.code
                                                                }
                                                            >
                                                                {account.code} -{" "}
                                                                {account.name}
                                                            </option>
                                                        )
                                                    )}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Debit</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    value={entry.debit}
                                                    onChange={(e) =>
                                                        updateEntry(
                                                            index,
                                                            "debit",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Credit</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    value={entry.credit}
                                                    onChange={(e) =>
                                                        updateEntry(
                                                            index,
                                                            "credit",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group>
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={entry.description}
                                            onChange={(e) =>
                                                updateEntry(
                                                    index,
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Line item description..."
                                        />
                                    </Form.Group>
                                </div>
                            ))}
                        </div>

                        {/* Balance Check */}
                        <Card className="bg-light">
                            <Card.Body className="py-2">
                                <Row>
                                    <Col>
                                        <small className="text-muted">
                                            Total Debit:
                                        </small>
                                        <div className="fw-semibold">
                                            $
                                            {newTransaction.entries
                                                .reduce(
                                                    (sum, entry) =>
                                                        sum +
                                                        (parseFloat(
                                                            entry.debit
                                                        ) || 0),
                                                    0
                                                )
                                                .toFixed(2)}
                                        </div>
                                    </Col>
                                    <Col>
                                        <small className="text-muted">
                                            Total Credit:
                                        </small>
                                        <div className="fw-semibold">
                                            $
                                            {newTransaction.entries
                                                .reduce(
                                                    (sum, entry) =>
                                                        sum +
                                                        (parseFloat(
                                                            entry.credit
                                                        ) || 0),
                                                    0
                                                )
                                                .toFixed(2)}
                                        </div>
                                    </Col>
                                    <Col>
                                        <small className="text-muted">
                                            Balance:
                                        </small>
                                        <div
                                            className={`fw-semibold ${
                                                newTransaction.entries.reduce(
                                                    (sum, entry) =>
                                                        sum +
                                                        (parseFloat(
                                                            entry.debit
                                                        ) || 0),
                                                    0
                                                ) ===
                                                newTransaction.entries.reduce(
                                                    (sum, entry) =>
                                                        sum +
                                                        (parseFloat(
                                                            entry.credit
                                                        ) || 0),
                                                    0
                                                )
                                                    ? "text-success"
                                                    : "text-danger"
                                            }`}
                                        >
                                            {newTransaction.entries.reduce(
                                                (sum, entry) =>
                                                    sum +
                                                    (parseFloat(entry.debit) ||
                                                        0),
                                                0
                                            ) -
                                                newTransaction.entries.reduce(
                                                    (sum, entry) =>
                                                        sum +
                                                        (parseFloat(
                                                            entry.credit
                                                        ) || 0),
                                                    0
                                                )}
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={addTransaction}>
                        <CheckCircle className="me-2" />
                        Post Transaction
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Validation Errors Modal */}
            <Modal
                show={showValidationModal}
                onHide={() => setShowValidationModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">
                        <XCircle className="me-2" />
                        Validation Errors
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="danger">
                        <strong>Please fix the following errors:</strong>
                        <ul className="mb-0 mt-2">
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="danger"
                        onClick={() => setShowValidationModal(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </ErpLayout>
    );
}
