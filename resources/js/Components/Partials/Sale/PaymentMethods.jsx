import useData from "@/Hooks/useData";
import { formatCurrency } from "@/Utils/helpers";
import React, { useState, useEffect, useMemo } from "react";
import {
    Button,
    Card,
    FormControl,
    Tab,
    Table,
    Tabs,
    Alert,
    Spinner,
} from "react-bootstrap";
import {
    FaCreditCard,
    FaMoneyBillAlt,
    FaMobileAlt,
    FaFileInvoiceDollar,
    FaUniversity,
    FaPaypal,
    FaBitcoin,
    FaPlus,
    FaTrash,
    FaExclamationCircle,
} from "react-icons/fa";

// Icon mapping for payment methods
const PAYMENT_ICONS = {
    cash: FaMoneyBillAlt,
    mpesa: FaMobileAlt,
    cheque: FaFileInvoiceDollar,
    bank: FaUniversity,
    card: FaCreditCard,
    paypal: FaPaypal,
    crypto: FaBitcoin,
    // Add more mappings as needed
    default: FaCreditCard,
};

// Field configurations for different payment method types
const PAYMENT_FIELD_CONFIGS = {
    cash: {
        fields: {
            date: { type: "date", label: "Date", placeholder: "Date" },
            name: { type: "text", label: "Name", placeholder: "Name" },
            phone: {
                type: "text",
                label: "Phone",
                placeholder: "Phone Number",
            },
            amount: { type: "number", label: "Amount", placeholder: "Amount" },
        },
        required: ["name", "amount"],
    },
    mpesa: {
        fields: {
            date: { type: "date", label: "Date", placeholder: "Date" },
            transId: {
                type: "text",
                label: "Transaction ID",
                placeholder: "Transaction ID",
            },
            name: { type: "text", label: "Name", placeholder: "Name" },
            phone: {
                type: "text",
                label: "Phone",
                placeholder: "Phone Number",
            },
            amount: { type: "number", label: "Amount", placeholder: "Amount" },
        },
        required: ["transId", "phone", "amount"],
    },
    cheque: {
        fields: {
            date: { type: "date", label: "Date", placeholder: "Date" },
            bankName: { type: "text", label: "Bank", placeholder: "Bank Name" },
            branch: { type: "text", label: "Branch", placeholder: "Branch" },
            chequeNo: {
                type: "text",
                label: "Cheque No",
                placeholder: "Cheque Number",
            },
            account: {
                type: "text",
                label: "Account",
                placeholder: "Account Number",
            },
            amount: { type: "number", label: "Amount", placeholder: "Amount" },
        },
        required: ["chequeNo", "bankName", "amount"],
    },
    card: {
        fields: {
            date: { type: "date", label: "Date", placeholder: "Date" },
            cardNumber: {
                type: "text",
                label: "Card No",
                placeholder: "Card Number",
            },
            cardHolder: {
                type: "text",
                label: "Card Holder",
                placeholder: "Card Holder Name",
            },
            expiry: { type: "text", label: "Expiry", placeholder: "MM/YY" },
            cvv: { type: "text", label: "CVV", placeholder: "CVV" },
            amount: { type: "number", label: "Amount", placeholder: "Amount" },
        },
        required: ["cardNumber", "cardHolder", "amount"],
    },
    bank: {
        fields: {
            date: { type: "date", label: "Date", placeholder: "Date" },
            bankName: { type: "text", label: "Bank", placeholder: "Bank Name" },
            accountNumber: {
                type: "text",
                label: "Account",
                placeholder: "Account Number",
            },
            reference: {
                type: "text",
                label: "Reference",
                placeholder: "Reference Number",
            },
            amount: { type: "number", label: "Amount", placeholder: "Amount" },
        },
        required: ["accountNumber", "reference", "amount"],
    },
    // Default configuration for other payment methods
    default: {
        fields: {
            date: { type: "date", label: "Date", placeholder: "Date" },
            reference: {
                type: "text",
                label: "Reference",
                placeholder: "Reference Number",
            },
            description: {
                type: "text",
                label: "Description",
                placeholder: "Description",
            },
            amount: { type: "number", label: "Amount", placeholder: "Amount" },
        },
        required: ["reference", "amount"],
    },
};

// Validation messages
const VALIDATION_MESSAGES = {
    required: "This field is required",
    phone: "Please enter a valid phone number",
    amount: "Please enter a valid amount",
    date: "Please select a valid date",
};

const PaymentsMethods = ({ paymentData, setPaymentData, cartTotal = 0 }) => {
    const { paymentMethods, isLoading, error } = useData();
    const [paymentForms, setPaymentForms] = useState({});
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState(null);

    // Get field configuration for a payment method
    const getFieldConfig = (methodCode) => {
        const normalizedCode = methodCode?.toLowerCase();
        return (
            PAYMENT_FIELD_CONFIGS[normalizedCode] ||
            PAYMENT_FIELD_CONFIGS.default
        );
    };

    // Get icon for a payment method
    const getMethodIcon = (methodCode) => {
        const normalizedCode = methodCode?.toLowerCase();
        const IconComponent =
            PAYMENT_ICONS[normalizedCode] || PAYMENT_ICONS.default;
        return <IconComponent className="me-2" />;
    };

    // Initialize forms based on payment methods
    useEffect(() => {
        if (!paymentMethods || paymentMethods.length === 0) return;

        const initialForms = {};
        paymentMethods.forEach((method) => {
            const config = getFieldConfig(method.code);
            const fields = config.fields;

            initialForms[method.code] = Object.keys(fields).reduce(
                (acc, field) => {
                    acc[field] =
                        field === "date"
                            ? new Date().toISOString().split("T")[0]
                            : "";
                    return acc;
                },
                {}
            );
        });

        setPaymentForms(initialForms);

        // Set first method as active tab
        if (paymentMethods[0]?.code) {
            setActiveTab(paymentMethods[0].code);
        }
    }, [paymentMethods]);

    // Calculate total payments
    const totalPayments = useMemo(() => {
        return Object.values(paymentData)
            .flat()
            .reduce(
                (total, payment) => total + (parseFloat(payment.amount) || 0),
                0
            );
    }, [paymentData]);

    // Calculate balance
    const balance = useMemo(() => {
        return cartTotal - totalPayments;
    }, [cartTotal, totalPayments]);

    // Handle form field change
    const handleFormChange = (methodCode, field, value) => {
        setPaymentForms((prev) => ({
            ...prev,
            [methodCode]: {
                ...prev[methodCode],
                [field]: value,
            },
        }));

        // Clear error for this field
        if (errors[`${methodCode}_${field}`]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[`${methodCode}_${field}`];
                return newErrors;
            });
        }
    };

    // Validate form
    const validateForm = (methodCode) => {
        const form = paymentForms[methodCode];
        const config = getFieldConfig(methodCode);
        const newErrors = {};

        // Check required fields
        config.required.forEach((field) => {
            if (!form[field] || form[field].toString().trim() === "") {
                newErrors[`${methodCode}_${field}`] =
                    VALIDATION_MESSAGES.required;
            }
        });

        // Validate amount
        const amount = parseFloat(form.amount);
        if (isNaN(amount) || amount <= 0) {
            newErrors[`${methodCode}_amount`] = VALIDATION_MESSAGES.amount;
        }

        // Validate phone number (if exists and is required)
        if (config.required.includes("phone") && form.phone) {
            const phoneRegex = /^[0-9]{10,15}$/;
            if (!phoneRegex.test(form.phone.replace(/\D/g, ""))) {
                newErrors[`${methodCode}_phone`] = VALIDATION_MESSAGES.phone;
            }
        }

        // Validate date
        if (form.date && !isValidDate(form.date)) {
            newErrors[`${methodCode}_date`] = VALIDATION_MESSAGES.date;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Helper function to validate date
    const isValidDate = (dateString) => {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    };

    // Add transaction
    const addTransaction = (methodCode) => {
        if (!validateForm(methodCode)) return;

        const form = paymentForms[methodCode];
        const method = paymentMethods.find((m) => m.code === methodCode);
        const amount = parseFloat(form.amount);

        // Check if adding this amount would exceed cart total
        if (totalPayments + amount > cartTotal) {
            setErrors((prev) => ({
                ...prev,
                [`${methodCode}_amount`]: `Amount exceeds remaining balance of ${formatCurrency(
                    cartTotal - totalPayments
                )}`,
            }));
            return;
        }

        const transaction = {
            id: Date.now() + Math.random(),
            ...form,
            amount: amount,
            payment_method_id: method?.id,
            payment_method_name: method?.name,
            payment_method_code: methodCode,
            timestamp: new Date().toISOString(),
        };

        // Add transaction to payment data
        setPaymentData((prev) => ({
            ...prev,
            [methodCode]: [...(prev[methodCode] || []), transaction],
        }));

        // Reset form for this method
        setPaymentForms((prev) => ({
            ...prev,
            [methodCode]: Object.keys(getFieldConfig(methodCode).fields).reduce(
                (acc, field) => {
                    acc[field] =
                        field === "date"
                            ? new Date().toISOString().split("T")[0]
                            : "";
                    return acc;
                },
                {}
            ),
        }));

        // Clear errors for this method
        setErrors((prev) => {
            const newErrors = { ...prev };
            Object.keys(prev).forEach((key) => {
                if (key.startsWith(`${methodCode}_`)) {
                    delete newErrors[key];
                }
            });
            return newErrors;
        });
    };

    // Remove transaction
    const removeTransaction = (methodCode, transactionId) => {
        setPaymentData((prev) => {
            const updatedTransactions = (prev[methodCode] || []).filter(
                (t) => t.id !== transactionId
            );

            return {
                ...prev,
                [methodCode]: updatedTransactions,
            };
        });
    };

    // Render form inputs for a payment method
    const renderFormInputs = (methodCode) => {
        const form = paymentForms[methodCode];
        if (!form) return null;

        const config = getFieldConfig(methodCode);
        const fields = config.fields;

        return Object.entries(fields).map(([field, config]) => (
            <td key={field} className="p-1 align-middle">
                <FormControl
                    type={config.type}
                    placeholder={config.placeholder}
                    value={form[field] || ""}
                    onChange={(e) =>
                        handleFormChange(methodCode, field, e.target.value)
                    }
                    className="rounded-0"
                    isInvalid={!!errors[`${methodCode}_${field}`]}
                    size="sm"
                />
                {errors[`${methodCode}_${field}`] && (
                    <div className="small text-danger mt-1">
                        <FaExclamationCircle className="me-1" />
                        {errors[`${methodCode}_${field}`]}
                    </div>
                )}
            </td>
        ));
    };

    // Render transaction rows for a payment method
    const renderTransactionRows = (methodCode) => {
        const transactions = paymentData[methodCode] || [];
        const config = getFieldConfig(methodCode);
        const fields = Object.keys(config.fields);

        if (transactions.length === 0) {
            return (
                <tr>
                    <td
                        colSpan={fields.length + 1}
                        className="text-center py-3 text-muted"
                    >
                        No transactions added yet
                    </td>
                </tr>
            );
        }

        return transactions.map((tx) => (
            <tr key={tx.id} className="align-middle">
                {fields.map((field) => (
                    <td key={field} className="py-2">
                        {field === "amount" ? (
                            <span className="fw-bold">
                                {formatCurrency(tx[field])}
                            </span>
                        ) : (
                            <span>{tx[field]}</span>
                        )}
                    </td>
                ))}
                <td className="py-2">
                    <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-0"
                        onClick={() => removeTransaction(methodCode, tx.id)}
                        title="Remove transaction"
                    >
                        <FaTrash />
                    </Button>
                </td>
            </tr>
        ));
    };

    if (isLoading) {
        return (
            <Card className="border-0 rounded-0 shadow-sm mt-2">
                <Card.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 mb-0">Loading payment methods...</p>
                </Card.Body>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-0 rounded-0 shadow-sm mt-2">
                <Card.Body>
                    <Alert variant="danger" className="mb-0">
                        Error loading payment methods: {error}
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    if (!paymentMethods || paymentMethods.length === 0) {
        return (
            <Card className="border-0 rounded-0 shadow-sm mt-2">
                <Card.Body className="text-center py-4">
                    <p className="mb-0 text-muted">
                        No payment methods available
                    </p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="border-0 rounded-0 shadow-sm mt-2">
            <Card.Body>
                {/* Payment Methods Tabs */}
                <Tabs
                    activeKey={activeTab}
                    onSelect={setActiveTab}
                    transition={false}
                    className="mb-3"
                >
                    {paymentMethods.map((method) => {
                        const methodCode = method.code;
                        const isActive = method.is_active !== false;

                        return (
                            <Tab
                                key={method.id}
                                eventKey={methodCode}
                                title={
                                    <div
                                        className={`d-flex align-items-center ${
                                            !isActive ? "text-muted" : ""
                                        }`}
                                    >
                                        {getMethodIcon(methodCode)}
                                        <span>{method.name}</span>
                                        {method.is_default && (
                                            <span className="badge bg-primary ms-2 small">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                }
                                disabled={!isActive}
                            >
                                {!isActive ? (
                                    <Alert variant="info" className="mt-3">
                                        This payment method is currently
                                        inactive
                                    </Alert>
                                ) : (
                                    <div className="mt-3">
                                        {method.description && (
                                            <p className="text-muted mb-3 small">
                                                {method.description}
                                            </p>
                                        )}

                                        <div className="table-responsive">
                                            <Table
                                                striped
                                                bordered
                                                hover
                                                size="sm"
                                                className="mb-0"
                                            >
                                                <thead className="table-light">
                                                    <tr>
                                                        {Object.values(
                                                            getFieldConfig(
                                                                methodCode
                                                            ).fields
                                                        ).map(
                                                            (field, index) => (
                                                                <th
                                                                    key={index}
                                                                    className="py-2 px-2"
                                                                >
                                                                    {
                                                                        field.label
                                                                    }
                                                                </th>
                                                            )
                                                        )}
                                                        <th
                                                            className="py-2 px-2"
                                                            style={{
                                                                width: "80px",
                                                            }}
                                                        >
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {renderTransactionRows(
                                                        methodCode
                                                    )}
                                                    <tr className="bg-light">
                                                        {renderFormInputs(
                                                            methodCode
                                                        )}
                                                        <td className="p-1 align-middle">
                                                            <Button
                                                                variant="success"
                                                                className="rounded-0 w-100"
                                                                onClick={() =>
                                                                    addTransaction(
                                                                        methodCode
                                                                    )
                                                                }
                                                                size="sm"
                                                                title="Add payment"
                                                            >
                                                                <FaPlus />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </div>

                                        {/* Method-specific info */}
                                        {method.account_number && (
                                            <div className="mt-3 small">
                                                <div className="text-muted">
                                                    Account Details:
                                                </div>
                                                <div>
                                                    <strong>Bank:</strong>{" "}
                                                    {method.bank_name || "N/A"}{" "}
                                                    | <strong>Account:</strong>{" "}
                                                    {method.account_number} |{" "}
                                                    <strong>Name:</strong>{" "}
                                                    {method.account_name ||
                                                        "N/A"}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Tab>
                        );
                    })}
                </Tabs>
            </Card.Body>
        </Card>
    );
};

export default PaymentsMethods;
