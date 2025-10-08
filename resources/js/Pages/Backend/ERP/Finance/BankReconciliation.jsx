// resources/js/Pages/Finance/BankReconciliation.jsx
import React, { useState, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import {
    Row,
    Col,
    Card,
    Button,
    Table,
    Form,
    InputGroup,
    Badge,
    Alert,
    Modal,
    ProgressBar,
    Dropdown,
} from "react-bootstrap";
import {
    FileEarmarkArrowUp,
    Check2Square,
    Download,
    Upload,
    Bank,
    Calculator,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    ArrowRepeat,
    Receipt,
} from "react-bootstrap-icons";
import ErpLayout from "@/Layouts/ErpLayout";

export default function BankReconciliation() {
    const { flash } = usePage().props;
    const [statementFile, setStatementFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showReconcileModal, setShowReconcileModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAccount, setSelectedAccount] = useState("1002");
    const [reconciliationDate, setReconciliationDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    // Sample bank accounts
    const bankAccounts = [
        {
            code: "1001",
            name: "Cash on Hand",
            balance: 12450.0,
            lastReconciled: "2025-09-30",
        },
        {
            code: "1002",
            name: "Main Business Account",
            balance: 85420.0,
            lastReconciled: "2025-09-30",
        },
        {
            code: "1003",
            name: "M-Pesa Business",
            balance: 15200.0,
            lastReconciled: "2025-10-05",
        },
        {
            code: "1004",
            name: "PayPal Business",
            balance: 8900.0,
            lastReconciled: "2025-10-10",
        },
    ];

    const [bankTxns, setBankTxns] = useState([
        {
            id: "BT-001",
            date: "2025-10-01",
            description: "Deposit - Acme Corporation",
            reference: "CHQ-45892",
            amount: 2000,
            type: "deposit",
            matched: false,
            reconciled: false,
            transaction_id: "TXN-789456",
        },
        {
            id: "BT-002",
            date: "2025-10-04",
            description: "Withdrawal - Office Rent",
            reference: "BT-784512",
            amount: -1000,
            type: "withdrawal",
            matched: false,
            reconciled: false,
            transaction_id: "BT7845122025",
        },
        {
            id: "BT-003",
            date: "2025-10-05",
            description: "Bank Charges",
            reference: "BCH-001",
            amount: -25,
            type: "charge",
            matched: false,
            reconciled: false,
            transaction_id: "CHG-458793",
        },
        {
            id: "BT-004",
            date: "2025-10-08",
            description: "M-Pesa Deposit - Global Tech",
            reference: "MP-458793",
            amount: 1500,
            type: "deposit",
            matched: false,
            reconciled: false,
            transaction_id: "MP4587932025",
        },
        {
            id: "BT-005",
            date: "2025-10-10",
            description: "Payment - Paper Supplies Ltd",
            reference: "BT-784513",
            amount: -495,
            type: "withdrawal",
            matched: false,
            reconciled: false,
            transaction_id: "BT7845132025",
        },
    ]);

    const [bookTxns, setBookTxns] = useState([
        {
            id: "BK-001",
            date: "2025-10-01",
            description: "Invoice Payment - Acme Corporation",
            reference: "INV-2025-001",
            amount: 2000,
            type: "receipt",
            matched: false,
            reconciled: false,
            account: "1002",
        },
        {
            id: "BK-002",
            date: "2025-10-03",
            description: "Utility Payment",
            reference: "UTL-001",
            amount: -120,
            type: "payment",
            matched: false,
            reconciled: false,
            account: "1002",
        },
        {
            id: "BK-003",
            date: "2025-10-05",
            description: "Office Supplies Purchase",
            reference: "POS-001",
            amount: -350,
            type: "payment",
            matched: false,
            reconciled: false,
            account: "1002",
        },
        {
            id: "BK-004",
            date: "2025-10-08",
            description: "M-Pesa Receipt - Global Tech",
            reference: "INV-2025-003",
            amount: 1500,
            type: "receipt",
            matched: false,
            reconciled: false,
            account: "1003",
        },
        {
            id: "BK-005",
            date: "2025-10-10",
            description: "Vendor Payment - Paper Supplies",
            reference: "INV-2025-002",
            amount: -495,
            type: "payment",
            matched: false,
            reconciled: false,
            account: "1002",
        },
        {
            id: "BK-006",
            date: "2025-10-12",
            description: "Bank Charges",
            reference: "BCH-001",
            amount: -25,
            type: "charge",
            matched: false,
            reconciled: false,
            account: "1002",
        },
    ]);

    const filteredBankTxns = useMemo(() => {
        return bankTxns.filter(
            (txn) =>
                txn.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                txn.reference
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                txn.transaction_id
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
    }, [bankTxns, searchTerm]);

    const filteredBookTxns = useMemo(() => {
        return bookTxns.filter(
            (txn) =>
                (txn.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                    txn.reference
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())) &&
                txn.account === selectedAccount
        );
    }, [bookTxns, searchTerm, selectedAccount]);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatementFile(file);

        // Simulate file upload and parsing
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    // Simulate adding parsed transactions
                    setTimeout(() => {
                        setBankTxns((prev) => [
                            ...prev,
                            {
                                id: `BT-${Date.now()}`,
                                date: "2025-10-15",
                                description: "Parsed Transaction - Test",
                                reference: "CSV-001",
                                amount: 500,
                                type: "deposit",
                                matched: false,
                                reconciled: false,
                                transaction_id: "CSV-IMPORT",
                            },
                        ]);
                    }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 100);
    };

    const toggleMatch = (list, id) => {
        if (list === "bank") {
            setBankTxns(
                bankTxns.map((t) =>
                    t.id === id ? { ...t, matched: !t.matched } : t
                )
            );
        } else {
            setBookTxns(
                bookTxns.map((t) =>
                    t.id === id ? { ...t, matched: !t.matched } : t
                )
            );
        }
    };

    const autoMatchTransactions = () => {
        const updatedBankTxns = [...bankTxns];
        const updatedBookTxns = [...bookTxns];

        updatedBankTxns.forEach((bankTxn) => {
            if (bankTxn.reconciled) return;

            const match = updatedBookTxns.find(
                (bookTxn) =>
                    !bookTxn.reconciled &&
                    Math.abs(bankTxn.amount) === Math.abs(bookTxn.amount) &&
                    bankTxn.date === bookTxn.date &&
                    bankTxn.account === selectedAccount
            );

            if (match) {
                bankTxn.matched = true;
                match.matched = true;
            }
        });

        setBankTxns(updatedBankTxns);
        setBookTxns(updatedBookTxns);
    };

    const calculateReconciliationSummary = () => {
        const matchedBank = bankTxns.filter((t) => t.matched && !t.reconciled);
        const matchedBook = bookTxns.filter(
            (t) => t.matched && !t.reconciled && t.account === selectedAccount
        );

        const bankBalance = bankTxns
            .filter((t) => !t.reconciled)
            .reduce((sum, t) => sum + t.amount, 0);

        const bookBalance = bookTxns
            .filter((t) => !t.reconciled && t.account === selectedAccount)
            .reduce((sum, t) => sum + t.amount, 0);

        const selectedAccountData = bankAccounts.find(
            (acc) => acc.code === selectedAccount
        );

        return {
            matchedBankCount: matchedBank.length,
            matchedBookCount: matchedBook.length,
            bankBalance,
            bookBalance,
            difference: bankBalance - bookBalance,
            accountBalance: selectedAccountData?.balance || 0,
        };
    };

    const reconciliationSummary = calculateReconciliationSummary();

    const reconcileSelected = () => {
        const matchedBank = bankTxns.filter((t) => t.matched && !t.reconciled);
        const matchedBook = bookTxns.filter(
            (t) => t.matched && !t.reconciled && t.account === selectedAccount
        );

        if (matchedBank.length === 0 && matchedBook.length === 0) {
            alert("Please select transactions to reconcile.");
            return;
        }

        setShowReconcileModal(true);
    };

    const confirmReconciliation = () => {
        // Mark transactions as reconciled
        setBankTxns(
            bankTxns.map((t) =>
                t.matched ? { ...t, reconciled: true, matched: false } : t
            )
        );
        setBookTxns(
            bookTxns.map((t) =>
                t.matched ? { ...t, reconciled: true, matched: false } : t
            )
        );

        setShowReconcileModal(false);
    };

    const getTransactionBadge = (type) => {
        switch (type) {
            case "deposit":
            case "receipt":
                return <Badge bg="success">Deposit</Badge>;
            case "withdrawal":
            case "payment":
                return <Badge bg="danger">Withdrawal</Badge>;
            case "charge":
                return (
                    <Badge bg="warning" text="dark">
                        Charge
                    </Badge>
                );
            default:
                return <Badge bg="secondary">Other</Badge>;
        }
    };

    const formatAmount = (amount) => {
        const isNegative = amount < 0;
        const absAmount = Math.abs(amount);
        return (
            <span className={isNegative ? "text-danger" : "text-success"}>
                {isNegative ? "-" : "+"}${absAmount.toLocaleString()}
            </span>
        );
    };

    const getStatusBadge = (reconciled) => {
        return reconciled ? (
            <Badge bg="success">
                <CheckCircle className="me-1" size={12} /> Reconciled
            </Badge>
        ) : (
            <Badge bg="warning" text="dark">
                <Clock className="me-1" size={12} /> Unreconciled
            </Badge>
        );
    };

    return (
        <ErpLayout>
            <Head title="Bank Reconciliation" />

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
                        <FileEarmarkArrowUp
                            className="me-3 text-primary"
                            size={32}
                        />
                        <div>
                            <h4 className="fw-semibold mb-1">
                                Bank Reconciliation
                            </h4>
                            <p className="text-muted mb-0">
                                Match bank statement transactions with your
                                accounting records
                            </p>
                        </div>
                    </div>
                </Col>
                <Col className="text-end">
                    <Button variant="outline-secondary" className="me-2">
                        <Download className="me-2" />
                        Reconciliation Report
                    </Button>
                    <Button variant="primary">
                        <ArrowRepeat className="me-2" />
                        Reconciliation History
                    </Button>
                </Col>
            </Row>

            {/* Reconciliation Summary */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 bg-primary bg-opacity-10">
                        <Card.Body className="py-3">
                            <div className="d-flex align-items-center">
                                <Bank className="text-primary me-3" size={24} />
                                <div>
                                    <div className="text-muted small">
                                        Bank Balance
                                    </div>
                                    <div className="h5 fw-bold text-primary mb-0">
                                        $
                                        {reconciliationSummary.bankBalance.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-info bg-opacity-10">
                        <Card.Body className="py-3">
                            <div className="d-flex align-items-center">
                                <Calculator
                                    className="text-info me-3"
                                    size={24}
                                />
                                <div>
                                    <div className="text-muted small">
                                        Book Balance
                                    </div>
                                    <div className="h5 fw-bold text-info mb-0">
                                        $
                                        {reconciliationSummary.bookBalance.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card
                        className={`border-0 ${
                            reconciliationSummary.difference === 0
                                ? "bg-success bg-opacity-10"
                                : "bg-danger bg-opacity-10"
                        }`}
                    >
                        <Card.Body className="py-3">
                            <div className="d-flex align-items-center">
                                {reconciliationSummary.difference === 0 ? (
                                    <CheckCircle
                                        className="text-success me-3"
                                        size={24}
                                    />
                                ) : (
                                    <XCircle
                                        className="text-danger me-3"
                                        size={24}
                                    />
                                )}
                                <div>
                                    <div className="text-muted small">
                                        Difference
                                    </div>
                                    <div
                                        className={`h5 fw-bold ${
                                            reconciliationSummary.difference ===
                                            0
                                                ? "text-success"
                                                : "text-danger"
                                        } mb-0`}
                                    >
                                        $
                                        {Math.abs(
                                            reconciliationSummary.difference
                                        ).toLocaleString()}
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
                                <Check2Square
                                    className="text-warning me-3"
                                    size={24}
                                />
                                <div>
                                    <div className="text-muted small">
                                        Matched Transactions
                                    </div>
                                    <div className="h5 fw-bold text-warning mb-0">
                                        {reconciliationSummary.matchedBankCount}{" "}
                                        /{" "}
                                        {reconciliationSummary.matchedBookCount}
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Controls Section */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Bank Account</Form.Label>
                                <Form.Select
                                    value={selectedAccount}
                                    onChange={(e) =>
                                        setSelectedAccount(e.target.value)
                                    }
                                >
                                    {bankAccounts.map((account) => (
                                        <option
                                            key={account.code}
                                            value={account.code}
                                        >
                                            {account.name} ($
                                            {account.balance.toLocaleString()})
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Reconciliation Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={reconciliationDate}
                                    onChange={(e) =>
                                        setReconciliationDate(e.target.value)
                                    }
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Upload Bank Statement</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="file"
                                        accept=".csv, .ofx, .qbo, .qfx"
                                        onChange={handleUpload}
                                    />
                                    <Button variant="outline-secondary">
                                        <Upload className="me-2" />
                                        Upload
                                    </Button>
                                </InputGroup>
                                {statementFile && (
                                    <div className="small text-muted mt-1">
                                        Uploaded: {statementFile.name}
                                        {uploadProgress > 0 &&
                                            uploadProgress < 100 && (
                                                <ProgressBar
                                                    now={uploadProgress}
                                                    className="mt-1"
                                                    label={`${uploadProgress}%`}
                                                />
                                            )}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Button
                                variant="outline-primary"
                                onClick={autoMatchTransactions}
                                className="w-100"
                            >
                                Auto-Match
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Search */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Search />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search transactions by description, reference..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </InputGroup>
                        </Col>
                        <Col md={6} className="text-end">
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="outline-secondary">
                                    Export Unreconciled
                                </Button>
                                <Button
                                    variant="success"
                                    onClick={reconcileSelected}
                                    disabled={
                                        reconciliationSummary.matchedBankCount ===
                                            0 &&
                                        reconciliationSummary.matchedBookCount ===
                                            0
                                    }
                                >
                                    <Check2Square className="me-2" />
                                    Reconcile Selected (
                                    {reconciliationSummary.matchedBankCount})
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Transactions Comparison */}
            <Row>
                <Col lg={6}>
                    <Card className="shadow-sm border-0 mb-3">
                        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <span>Bank Statement Transactions</span>
                            <Badge bg="primary">
                                {
                                    filteredBankTxns.filter(
                                        (t) => !t.reconciled
                                    ).length
                                }{" "}
                                unreconciled
                            </Badge>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table hover>
                                    <thead className="table-light">
                                        <tr>
                                            <th width="50"></th>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Reference</th>
                                            <th className="text-end">Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBankTxns.map((tx) => (
                                            <tr
                                                key={tx.id}
                                                className={
                                                    tx.reconciled
                                                        ? "table-success"
                                                        : tx.matched
                                                        ? "table-warning"
                                                        : ""
                                                }
                                            >
                                                <td>
                                                    {!tx.reconciled && (
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={
                                                                !!tx.matched
                                                            }
                                                            onChange={() =>
                                                                toggleMatch(
                                                                    "bank",
                                                                    tx.id
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </td>
                                                <td className="fw-semibold">
                                                    {tx.date}
                                                </td>
                                                <td>
                                                    <div>{tx.description}</div>
                                                    <small className="text-muted">
                                                        {tx.transaction_id}
                                                    </small>
                                                </td>
                                                <td>
                                                    <Badge
                                                        bg="outline-secondary"
                                                        text="dark"
                                                    >
                                                        {tx.reference}
                                                    </Badge>
                                                </td>
                                                <td className="text-end fw-semibold">
                                                    {formatAmount(tx.amount)}
                                                </td>
                                                <td>
                                                    {getStatusBadge(
                                                        tx.reconciled
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="shadow-sm border-0 mb-3">
                        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <span>Book Transactions</span>
                            <Badge bg="info">
                                {
                                    filteredBookTxns.filter(
                                        (t) => !t.reconciled
                                    ).length
                                }{" "}
                                unreconciled
                            </Badge>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table hover>
                                    <thead className="table-light">
                                        <tr>
                                            <th width="50"></th>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Reference</th>
                                            <th className="text-end">Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBookTxns.map((tx) => (
                                            <tr
                                                key={tx.id}
                                                className={
                                                    tx.reconciled
                                                        ? "table-success"
                                                        : tx.matched
                                                        ? "table-warning"
                                                        : ""
                                                }
                                            >
                                                <td>
                                                    {!tx.reconciled && (
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={
                                                                !!tx.matched
                                                            }
                                                            onChange={() =>
                                                                toggleMatch(
                                                                    "book",
                                                                    tx.id
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </td>
                                                <td className="fw-semibold">
                                                    {tx.date}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {getTransactionBadge(
                                                            tx.type
                                                        )}
                                                        <span className="ms-2">
                                                            {tx.description}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge
                                                        bg="outline-secondary"
                                                        text="dark"
                                                    >
                                                        {tx.reference}
                                                    </Badge>
                                                </td>
                                                <td className="text-end fw-semibold">
                                                    {formatAmount(tx.amount)}
                                                </td>
                                                <td>
                                                    {getStatusBadge(
                                                        tx.reconciled
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Reconciliation Confirmation Modal */}
            <Modal
                show={showReconcileModal}
                onHide={() => setShowReconcileModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Reconciliation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        You are about to reconcile{" "}
                        {reconciliationSummary.matchedBankCount} bank
                        transactions and{" "}
                        {reconciliationSummary.matchedBookCount} book
                        transactions.
                    </Alert>

                    <div className="mb-3">
                        <strong>Reconciliation Summary:</strong>
                        <ul className="mt-2">
                            <li>
                                Bank Account:{" "}
                                {
                                    bankAccounts.find(
                                        (acc) => acc.code === selectedAccount
                                    )?.name
                                }
                            </li>
                            <li>Reconciliation Date: {reconciliationDate}</li>
                            <li>
                                Bank Balance: $
                                {reconciliationSummary.bankBalance.toLocaleString()}
                            </li>
                            <li>
                                Book Balance: $
                                {reconciliationSummary.bookBalance.toLocaleString()}
                            </li>
                            <li>
                                Difference:
                                <span
                                    className={
                                        reconciliationSummary.difference === 0
                                            ? "text-success"
                                            : "text-danger"
                                    }
                                >
                                    $
                                    {Math.abs(
                                        reconciliationSummary.difference
                                    ).toLocaleString()}
                                </span>
                            </li>
                        </ul>
                    </div>

                    {reconciliationSummary.difference !== 0 && (
                        <Alert variant="warning">
                            <strong>Warning:</strong> There is a difference of $
                            {Math.abs(
                                reconciliationSummary.difference
                            ).toLocaleString()}
                            between bank and book balances. You may want to
                            investigate this before proceeding.
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowReconcileModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="success" onClick={confirmReconciliation}>
                        <Check2Square className="me-2" />
                        Confirm Reconciliation
                    </Button>
                </Modal.Footer>
            </Modal>
        </ErpLayout>
    );
}
