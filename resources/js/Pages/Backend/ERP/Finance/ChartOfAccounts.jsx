import { useState, useMemo } from "react";
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
    Modal,
    Alert,
    Tabs,
    Tab,
} from "react-bootstrap";
import {
    PlusCircle,
    Search,
    Wallet2,
    Pencil,
    Trash,
    Calculator,
} from "react-bootstrap-icons";
import ErpLayout from "@/Layouts/ErpLayout";
import { BiTrendingDown, BiTrendingUp } from "react-icons/bi";

const ChartOfAccounts = () => {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [editingAccount, setEditingAccount] = useState(null);

    // Enhanced sample data with proper eCommerce accounts
    const [accounts, setAccounts] = useState([
        // Assets
        {
            id: 1,
            code: "1001",
            name: "Cash on Hand",
            type: "Asset",
            category: "Current Assets",
            balance: 12450.0,
            isActive: true,
        },
        {
            id: 2,
            code: "1002",
            name: "Bank Account",
            type: "Asset",
            category: "Current Assets",
            balance: 85420.0,
            isActive: true,
        },
        {
            id: 3,
            code: "1101",
            name: "Accounts Receivable",
            type: "Asset",
            category: "Current Assets",
            balance: 23400.0,
            isActive: true,
        },
        {
            id: 4,
            code: "1201",
            name: "Inventory",
            type: "Asset",
            category: "Current Assets",
            balance: 156800.0,
            isActive: true,
        },
        {
            id: 5,
            code: "1501",
            name: "Computer Equipment",
            type: "Asset",
            category: "Fixed Assets",
            balance: 25000.0,
            isActive: true,
        },

        // Liabilities
        {
            id: 6,
            code: "2001",
            name: "Accounts Payable",
            type: "Liability",
            category: "Current Liabilities",
            balance: 35600.0,
            isActive: true,
        },
        {
            id: 7,
            code: "2002",
            name: "Credit Card Payable",
            type: "Liability",
            category: "Current Liabilities",
            balance: 12500.0,
            isActive: true,
        },
        {
            id: 8,
            code: "2501",
            name: "Bank Loan",
            type: "Liability",
            category: "Long-term Liabilities",
            balance: 50000.0,
            isActive: true,
        },

        // Equity
        {
            id: 9,
            code: "3001",
            name: "Owner's Capital",
            type: "Equity",
            category: "Equity",
            balance: 100000.0,
            isActive: true,
        },
        {
            id: 10,
            code: "3002",
            name: "Retained Earnings",
            type: "Equity",
            category: "Equity",
            balance: 45270.0,
            isActive: true,
        },

        // Income
        {
            id: 11,
            code: "4001",
            name: "Online Sales",
            type: "Income",
            category: "Operating Revenue",
            balance: 245000.0,
            isActive: true,
        },
        {
            id: 12,
            code: "4002",
            name: "Shipping Revenue",
            type: "Income",
            category: "Operating Revenue",
            balance: 12500.0,
            isActive: true,
        },
        {
            id: 13,
            code: "4003",
            name: "Sales Returns",
            type: "Income",
            category: "Contra Revenue",
            balance: -3200.0,
            isActive: true,
        },

        // Expenses
        {
            id: 14,
            code: "5001",
            name: "Cost of Goods Sold",
            type: "Expense",
            category: "Cost of Sales",
            balance: 156000.0,
            isActive: true,
        },
        {
            id: 15,
            code: "5002",
            name: "Shipping Costs",
            type: "Expense",
            category: "Operating Expenses",
            balance: 9800.0,
            isActive: true,
        },
        {
            id: 16,
            code: "5003",
            name: "Payment Processing Fees",
            type: "Expense",
            category: "Operating Expenses",
            balance: 7350.0,
            isActive: true,
        },
        {
            id: 17,
            code: "5004",
            name: "Digital Marketing",
            type: "Expense",
            category: "Marketing",
            balance: 12500.0,
            isActive: true,
        },
        {
            id: 18,
            code: "5005",
            name: "Salaries & Wages",
            type: "Expense",
            category: "Operating Expenses",
            balance: 45000.0,
            isActive: true,
        },
        {
            id: 19,
            code: "5006",
            name: "Software Subscriptions",
            type: "Expense",
            category: "Operating Expenses",
            balance: 2400.0,
            isActive: true,
        },
    ]);

    const [newAccount, setNewAccount] = useState({
        name: "",
        code: "",
        type: "Asset",
        category: "",
        isActive: true,
    });

    // Account type options with categories
    const accountTypes = {
        Asset: ["Current Assets", "Fixed Assets", "Other Assets"],
        Liability: ["Current Liabilities", "Long-term Liabilities"],
        Equity: ["Equity"],
        Income: ["Operating Revenue", "Other Revenue", "Contra Revenue"],
        Expense: [
            "Cost of Sales",
            "Operating Expenses",
            "Marketing",
            "Administrative",
            "Other Expenses",
        ],
    };

    const filteredAccounts = useMemo(() => {
        return accounts.filter((account) => {
            const matchesSearch =
                account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.code.includes(searchTerm) ||
                account.category
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesTab =
                activeTab === "all" || account.type === activeTab;

            return matchesSearch && matchesTab && account.isActive;
        });
    }, [accounts, searchTerm, activeTab]);

    const handleAddAccount = () => {
        if (!newAccount.name || !newAccount.code || !newAccount.category) {
            alert("Please fill all required fields");
            return;
        }

        if (accounts.find((acc) => acc.code === newAccount.code)) {
            alert("Account code already exists");
            return;
        }

        setAccounts([
            ...accounts,
            {
                ...newAccount,
                id: Date.now(),
                balance: 0,
            },
        ]);
        setShowModal(false);
        setNewAccount({
            name: "",
            code: "",
            type: "Asset",
            category: "",
            isActive: true,
        });
    };

    const handleEditAccount = (account) => {
        setEditingAccount(account);
        setNewAccount({
            name: account.name,
            code: account.code,
            type: account.type,
            category: account.category,
            isActive: account.isActive,
        });
        setShowModal(true);
    };

    const handleUpdateAccount = () => {
        if (!newAccount.name || !newAccount.code || !newAccount.category) {
            alert("Please fill all required fields");
            return;
        }

        setAccounts(
            accounts.map((acc) =>
                acc.id === editingAccount.id ? { ...acc, ...newAccount } : acc
            )
        );
        setShowModal(false);
        setEditingAccount(null);
        setNewAccount({
            name: "",
            code: "",
            type: "Asset",
            category: "",
            isActive: true,
        });
    };

    const handleDeleteAccount = (account) => {
        setAccountToDelete(account);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setAccounts(
            accounts.map((acc) =>
                acc.id === accountToDelete.id
                    ? { ...acc, isActive: false }
                    : acc
            )
        );
        setShowDeleteModal(false);
        setAccountToDelete(null);
    };

    const getBadgeVariant = (type) => {
        switch (type) {
            case "Asset":
                return "success";
            case "Liability":
                return "warning";
            case "Income":
                return "info";
            case "Expense":
                return "danger";
            case "Equity":
                return "secondary";
            default:
                return "light";
        }
    };

    const formatBalance = (balance, type) => {
        const amount = Math.abs(balance).toLocaleString();
        return (
            <span
                className={`fw-semibold ${
                    balance < 0 ? "text-danger" : "text-dark"
                }`}
            >
                {balance < 0 && "-"}${amount}
                {type === "Income" && balance > 0 && (
                    <BiTrendingUp className="ms-1 text-success" size={12} />
                )}
                {type === "Expense" && balance > 0 && (
                    <BiTrendingDown className="ms-1 text-danger" size={12} />
                )}
            </span>
        );
    };

    const getBalanceSummary = () => {
        const summary = accounts.reduce((acc, account) => {
            if (!account.isActive) return acc;
            acc[account.type] = (acc[account.type] || 0) + account.balance;
            return acc;
        }, {});

        return summary;
    };

    const balanceSummary = getBalanceSummary();

    return (
        <ErpLayout>
            <Head title="Chart of Accounts" />

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
                        <Wallet2 className="me-3 text-primary" size={32} />
                        <div>
                            <h4 className="fw-semibold mb-1">
                                Chart of Accounts
                            </h4>
                            <p className="text-muted mb-0">
                                Manage your financial accounts and track
                                balances
                            </p>
                        </div>
                    </div>
                </Col>
                <Col className="text-end">
                    <Button
                        variant="primary"
                        className="rounded-pill px-4"
                        onClick={() => {
                            setEditingAccount(null);
                            setNewAccount({
                                name: "",
                                code: "",
                                type: "Asset",
                                category: "",
                                isActive: true,
                            });
                            setShowModal(true);
                        }}
                    >
                        <PlusCircle className="me-2" /> Add Account
                    </Button>
                </Col>
            </Row>

            {/* Balance Summary Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center border-0 shadow-sm">
                        <Card.Body>
                            <div className="text-muted small">Total Assets</div>
                            <div className="h5 fw-bold text-success">
                                ${(balanceSummary.Asset || 0).toLocaleString()}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center border-0 shadow-sm">
                        <Card.Body>
                            <div className="text-muted small">
                                Total Liabilities
                            </div>
                            <div className="h5 fw-bold text-warning">
                                $
                                {(
                                    balanceSummary.Liability || 0
                                ).toLocaleString()}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center border-0 shadow-sm">
                        <Card.Body>
                            <div className="text-muted small">Total Equity</div>
                            <div className="h5 fw-bold text-secondary">
                                ${(balanceSummary.Equity || 0).toLocaleString()}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center border-0 shadow-sm">
                        <Card.Body>
                            <div className="text-muted small">Net Income</div>
                            <div
                                className={`h5 fw-bold ${
                                    (balanceSummary.Income || 0) +
                                        (balanceSummary.Expense || 0) >=
                                    0
                                        ? "text-success"
                                        : "text-danger"
                                }`}
                            >
                                $
                                {(
                                    (balanceSummary.Income || 0) +
                                    (balanceSummary.Expense || 0)
                                ).toLocaleString()}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Main Content Card */}
            <Card className="shadow-sm border-0">
                <Card.Body>
                    {/* Filters and Search */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Search />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search by name, code, or category..."
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
                                <Tab eventKey="all" title="All Accounts" />
                                <Tab eventKey="Asset" title="Assets" />
                                <Tab eventKey="Liability" title="Liabilities" />
                                <Tab eventKey="Equity" title="Equity" />
                                <Tab eventKey="Income" title="Income" />
                                <Tab eventKey="Expense" title="Expenses" />
                            </Tabs>
                        </Col>
                    </Row>

                    {/* Accounts Table */}
                    <div className="table-responsive">
                        <Table bordered hover className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th width="100">Code</th>
                                    <th>Account Name</th>
                                    <th width="150">Category</th>
                                    <th width="120">Type</th>
                                    <th width="150" className="text-end">
                                        Balance
                                    </th>
                                    <th width="100" className="text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAccounts.length > 0 ? (
                                    filteredAccounts.map((account) => (
                                        <tr key={account.id}>
                                            <td className="fw-semibold text-muted">
                                                {account.code}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <Calculator
                                                        className="me-2 text-muted"
                                                        size={16}
                                                    />
                                                    {account.name}
                                                </div>
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {account.category}
                                                </small>
                                            </td>
                                            <td>
                                                <Badge
                                                    bg={getBadgeVariant(
                                                        account.type
                                                    )}
                                                >
                                                    {account.type}
                                                </Badge>
                                            </td>
                                            <td className="text-end">
                                                {formatBalance(
                                                    account.balance,
                                                    account.type
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() =>
                                                        handleEditAccount(
                                                            account
                                                        )
                                                    }
                                                >
                                                    <Pencil size={12} />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteAccount(
                                                            account
                                                        )
                                                    }
                                                >
                                                    <Trash size={12} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center text-muted py-4"
                                        >
                                            <Wallet2
                                                size={48}
                                                className="mb-2"
                                            />
                                            <div>No accounts found</div>
                                            <small>
                                                Try adjusting your search or
                                                filters
                                            </small>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Add/Edit Account Modal */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingAccount ? "Edit Account" : "Add New Account"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Account Code *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newAccount.code}
                                        onChange={(e) =>
                                            setNewAccount({
                                                ...newAccount,
                                                code: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. 1001"
                                    />
                                    <Form.Text className="text-muted">
                                        Unique identifier for the account
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Account Type *</Form.Label>
                                    <Form.Select
                                        value={newAccount.type}
                                        onChange={(e) =>
                                            setNewAccount({
                                                ...newAccount,
                                                type: e.target.value,
                                                category: "",
                                            })
                                        }
                                    >
                                        <option value="Asset">Asset</option>
                                        <option value="Liability">
                                            Liability
                                        </option>
                                        <option value="Equity">Equity</option>
                                        <option value="Income">Income</option>
                                        <option value="Expense">Expense</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Account Name *</Form.Label>
                            <Form.Control
                                type="text"
                                value={newAccount.name}
                                onChange={(e) =>
                                    setNewAccount({
                                        ...newAccount,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="e.g. Cash in Bank, Online Sales, etc."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category *</Form.Label>
                            <Form.Select
                                value={newAccount.category}
                                onChange={(e) =>
                                    setNewAccount({
                                        ...newAccount,
                                        category: e.target.value,
                                    })
                                }
                            >
                                <option value="">Select a category</option>
                                {accountTypes[newAccount.type]?.map(
                                    (category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    )
                                )}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Check
                                type="switch"
                                label="Active Account"
                                checked={newAccount.isActive}
                                onChange={(e) =>
                                    setNewAccount({
                                        ...newAccount,
                                        isActive: e.target.checked,
                                    })
                                }
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
                        onClick={
                            editingAccount
                                ? handleUpdateAccount
                                : handleAddAccount
                        }
                    >
                        {editingAccount ? "Update Account" : "Save Account"}
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
                    <Modal.Title>Confirm Deactivation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to deactivate account{" "}
                    {accountToDelete?.code} - {accountToDelete?.name}?
                    <br />
                    <small className="text-muted">
                        The account will be marked as inactive and hidden from
                        views.
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
                        Deactivate Account
                    </Button>
                </Modal.Footer>
            </Modal>
        </ErpLayout>
    );
};

export default ChartOfAccounts;
