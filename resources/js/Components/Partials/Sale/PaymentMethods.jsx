import { formatCurrency } from "@/Utils/helpers";
import React, { useState } from "react";
import { Button, Card, FormControl, Tab, Table, Tabs } from "react-bootstrap";
import {
    FaMobileAlt,
    FaFileInvoiceDollar,
    FaPlus,
    FaTrash,
} from "react-icons/fa";

const PaymentsMethods = ({ paymentData, setPaymentData }) => {
    // Config for fields + validation messages
    const paymentConfig = {
        cash: {
            icon: <FaMobileAlt className="me-2" />,
            label: "Cash",
            fields: {
                date: { type: "date", placeholder: "Date" },
                name: { type: "text", placeholder: "Name" },
                phone: { type: "text", placeholder: "Phone Number" },
                amount: { type: "number", placeholder: "Amount" },
            },
            required: {
                name: "Name is required",
                phone: "Valid phone number is required",
                amount: "Valid amount is required",
            },
        },
        mpesa: {
            icon: <FaMobileAlt className="me-2" />,
            label: "M-Pesa",
            fields: {
                date: { type: "date", placeholder: "Date" },
                transId: { type: "text", placeholder: "Transaction ID" },
                name: { type: "text", placeholder: "Name" },
                phone: { type: "text", placeholder: "Phone Number" },
                amount: { type: "number", placeholder: "Amount" },
            },
            required: {
                transId: "Transaction ID is required",
                name: "Name is required",
                phone: "Valid phone number is required",
                amount: "Valid amount is required",
            },
        },
        cheque: {
            icon: <FaFileInvoiceDollar className="me-2" />,
            label: "Cheque",
            fields: {
                date: { type: "date", placeholder: "Date" },
                bankName: { type: "text", placeholder: "Bank Name" },
                branch: { type: "text", placeholder: "Branch" },
                chequeNo: { type: "text", placeholder: "Cheque No" },
                account: { type: "text", placeholder: "Account" },
                amount: { type: "number", placeholder: "Amount" },
            },
            required: {
                chequeNo: "Cheque number is required",
                bankName: "Bank name is required",
                account: "Account is required",
                branch: "Branch is required",
                amount: "Valid amount is required",
            },
        },
    };

    // Initialize empty form values
    const initialForms = Object.fromEntries(
        Object.entries(paymentConfig).map(([method, cfg]) => [
            method,
            Object.fromEntries(
                Object.keys(cfg.fields).map((f) => [
                    f,
                    f === "date" ? new Date().toISOString().split("T")[0] : "",
                ])
            ),
        ])
    );

    const [paymentForms, setPaymentForms] = useState(initialForms);
    const [errors, setErrors] = useState({});
    const firstMethod = Object.keys(paymentConfig)[0] || null;
    const [activeTab, setActiveTab] = useState(firstMethod);

    // Change handler
    const handleFormChange = (method, field, value) => {
        setPaymentForms((prev) => ({
            ...prev,
            [method]: { ...prev[method], [field]: value },
        }));

        if (errors[`${method}_${field}`]) {
            setErrors((prev) => ({ ...prev, [`${method}_${field}`]: "" }));
        }
    };

    // Validation
    const validateForm = (method) => {
        const form = paymentForms[method];
        const rules = paymentConfig[method].required;
        const newErrors = {};

        for (const [field, message] of Object.entries(rules)) {
            if (
                !form[field] ||
                (field === "amount" && parseFloat(form[field]) <= 0)
            ) {
                newErrors[`${method}_${field}`] = message;
            }
            if (field === "phone" && form.phone && form.phone.length < 10) {
                newErrors[`${method}_${field}`] = message;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Add transaction
    const addTransaction = (method) => {
        if (!validateForm(method)) return;
        const form = paymentForms[method];

        const transaction = {
            id: Date.now(),
            ...form,
            amount: parseFloat(form.amount),
        };

        setPaymentData((prev) => ({
            ...prev,
            [method]: [...(prev[method] || []), transaction],
            balanceAccount: prev.balanceAccount + transaction.amount,
        }));

        // Reset form
        setPaymentForms((prev) => ({
            ...prev,
            [method]: {
                ...initialForms[method],
                date: new Date().toISOString().split("T")[0],
            },
        }));
    };

    // Remove transaction
    const removeTransaction = (method, transactionId) => {
        setPaymentData((prev) => {
            const transaction = prev[method].find(
                (t) => t.id === transactionId
            );
            return {
                ...prev,
                [method]: prev[method].filter((t) => t.id !== transactionId),
                balanceAccount:
                    prev.balanceAccount - (transaction?.amount || 0),
            };
        });
    };

    // Render inputs dynamically
    const renderFormInputs = (method) => {
        const form = paymentForms[method];
        const fields = paymentConfig[method].fields;

        return Object.entries(fields).map(([field, cfg]) => (
            <td key={field} className="p-1">
                <FormControl
                    type={cfg.type}
                    placeholder={cfg.placeholder}
                    value={form[field]}
                    onChange={(e) =>
                        handleFormChange(method, field, e.target.value)
                    }
                    className="rounded-0"
                    isInvalid={!!errors[`${method}_${field}`]}
                />
                {errors[`${method}_${field}`] && (
                    <FormControl.Feedback type="invalid">
                        {errors[`${method}_${field}`]}
                    </FormControl.Feedback>
                )}
            </td>
        ));
    };

    // Render transaction rows
    const renderTransactionRows = (method) => {
        const transactions = paymentData[method] || [];
        const fields = Object.keys(paymentConfig[method].fields);

        return transactions.length > 0 ? (
            transactions.map((tx) => (
                <tr key={tx.id}>
                    {fields.map((field) => (
                        <td key={field}>
                            {field === "amount"
                                ? formatCurrency(tx[field])
                                : tx[field]}
                        </td>
                    ))}
                    <td>
                        <Button
                            variant="danger"
                            size="sm"
                            className="rounded-0"
                            onClick={() => removeTransaction(method, tx.id)}
                        >
                            <FaTrash />
                        </Button>
                    </td>
                </tr>
            ))
        ) : (
            <tr>
                <td colSpan={fields.length + 1} className="text-center">
                    No transactions found
                </td>
            </tr>
        );
    };

    return (
        <Card className="border-0 rounded-0 shadow-sm mt-2">
            <Card.Body>
                <Tabs
                    activeKey={activeTab}
                    onSelect={setActiveTab}
                    transition={false}
                >
                    {Object.entries(paymentConfig).map(([method, cfg]) => (
                        <Tab
                            key={method}
                            eventKey={method}
                            title={
                                <>
                                    {cfg.icon}
                                    {cfg.label}
                                </>
                            }
                        >
                            <Table
                                striped
                                responsive
                                bordered
                                hover
                                size="sm"
                                className="mt-3"
                            >
                                <thead>
                                    <tr>
                                        {Object.keys(cfg.fields).map((f) => (
                                            <th key={f}>
                                                {cfg.fields[f].placeholder}
                                            </th>
                                        ))}
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderTransactionRows(method)}
                                    <tr className="bg-light">
                                        {renderFormInputs(method)}
                                        <td
                                            className="p-1"
                                            style={{ width: "1px" }}
                                        >
                                            <Button
                                                variant="success"
                                                className="rounded-0"
                                                onClick={() =>
                                                    addTransaction(method)
                                                }
                                            >
                                                <FaPlus />
                                            </Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Tab>
                    ))}
                </Tabs>
            </Card.Body>
        </Card>
    );
};

export default PaymentsMethods;
