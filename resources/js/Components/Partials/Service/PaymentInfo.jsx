import { Card, Row, Col, Form, InputGroup, FormControl } from "react-bootstrap";
import PaymentsMethods from "../Sale/PaymentMethods";
import { useMemo, useState } from "react";
import {
    FaDollarSign,
    FaExchangeAlt,
    FaReceipt,
    FaWallet,
} from "react-icons/fa";
import { formatCurrency } from "@/Utils/helpers";

const PaymentInfo = ({
    paymentData,
    setPaymentData,
    totalPaid: totalPaidProp,
}) => {
    const calculateServiceTotal = () => {
        const diagnosisFee = Number(paymentData?.diagnosis_fee) || 0;
        const estimateFee = Number(paymentData?.estimated_cost) || 0;
        const finalCost = Number(paymentData?.final_cost) || 0;
        return diagnosisFee + estimateFee + finalCost;
    };

    const serviceTotal = useMemo(
        () => calculateServiceTotal(),
        [
            paymentData?.diagnosis_fee,
            paymentData?.estimated_cost,
            paymentData?.final_cost,
        ]
    );

    const toTransactions = (val) => {
        if (Array.isArray(val)) return val;
        if (val && Array.isArray(val.transactions)) return val.transactions;
        return [];
    };

    // Build per-method breakdown (ignore non-transaction fields like numbers)
    const paymentBreakdown = useMemo(() => {
        return Object.entries(paymentData)
            .filter(
                ([, v]) => Array.isArray(v) || Array.isArray(v?.transactions)
            )
            .map(([method, v]) => {
                const txs = toTransactions(v);
                const total = txs.reduce(
                    (sum, tx) => sum + (Number(tx.amount) || 0),
                    0
                );
                return { method, total };
            });
    }, [paymentData]);

    // If a totalPaid prop is provided, use it; otherwise compute from breakdown
    const computedTotalPaid = useMemo(
        () => paymentBreakdown.reduce((s, m) => s + m.total, 0),
        [paymentBreakdown]
    );
    const totalPaid =
        typeof totalPaidProp === "number" ? totalPaidProp : computedTotalPaid;

    const balanceDue = Math.max(serviceTotal - totalPaid, 0);
    const change = totalPaid > serviceTotal ? totalPaid - serviceTotal : 0;

    const handleChange = (field, value) => {
        setPaymentData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <>
            {/* Payment Info */}
            <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-white fw-bold">
                    Payment Info
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Diagnosis Fees</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <Form.Control
                                        type="number"
                                        placeholder="Diagnosis Fees"
                                        value={paymentData?.diagnosis_fee || ""}
                                        onChange={(e) => {
                                            handleChange(
                                                "diagnosis_fee",
                                                e.target.value
                                            );
                                        }}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Estimate Fees</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <Form.Control
                                        type="number"
                                        placeholder="Estimate Fees"
                                        value={
                                            paymentData?.estimated_cost || ""
                                        }
                                        onChange={(e) => {
                                            handleChange(
                                                "estimated_cost",
                                                e.target.value
                                            );
                                        }}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Final Cost</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <Form.Control
                                        type="number"
                                        placeholder="Final Cost"
                                        value={paymentData?.final_cost || ""}
                                        onChange={(e) => {
                                            handleChange(
                                                "final_cost",
                                                e.target.value
                                            );
                                        }}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Payment Methods + Summary */}
            <Row className="g-3">
                {/* Payment Methods */}
                <Col md={8}>
                    <PaymentsMethods
                        paymentData={paymentData}
                        setPaymentData={setPaymentData}
                    />
                </Col>

                {/* Payment Summary */}
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white fw-bold">
                            Summary
                        </Card.Header>
                        <Card.Body>
                            {/* Total Billed */}
                            <div className="mb-3">
                                <InputGroup>
                                    <InputGroup.Text
                                        className="fw-bold bg-light"
                                        style={{ width: "160px" }}
                                    >
                                        <FaDollarSign className="me-1" />
                                        Total Billed
                                    </InputGroup.Text>
                                    <FormControl
                                        value={formatCurrency(serviceTotal)}
                                        className="text-end fw-bold bg-light"
                                        disabled
                                    />
                                </InputGroup>
                            </div>

                            {/* Payments Breakdown */}
                            <Row className="g-2 mb-3">
                                {paymentBreakdown.map(({ method, total }) => (
                                    <Col md={12} key={method}>
                                        <InputGroup>
                                            <InputGroup.Text
                                                className="fw-bold bg-light text-capitalize"
                                                style={{ width: "160px" }}
                                            >
                                                <FaWallet className="me-1" />
                                                {method}
                                            </InputGroup.Text>
                                            <FormControl
                                                value={formatCurrency(total)}
                                                className="text-end fw-bold bg-light"
                                                disabled
                                            />
                                        </InputGroup>
                                    </Col>
                                ))}
                            </Row>

                            <hr />

                            {/* Totals */}
                            <div className="mb-2">
                                <InputGroup>
                                    <InputGroup.Text
                                        className="fw-bold bg-light"
                                        style={{ width: "160px" }}
                                    >
                                        <FaReceipt className="me-1" />
                                        Total Paid
                                    </InputGroup.Text>
                                    <FormControl
                                        value={formatCurrency(totalPaid)}
                                        className="text-end fw-bold bg-light"
                                        disabled
                                    />
                                </InputGroup>
                            </div>

                            <div className="mb-2">
                                <InputGroup>
                                    <InputGroup.Text
                                        className={`fw-bold ${
                                            balanceDue > 0
                                                ? "text-warning"
                                                : "text-success"
                                        } bg-light`}
                                        style={{ width: "160px" }}
                                    >
                                        <FaExchangeAlt className="me-1" />
                                        Balance Due
                                    </InputGroup.Text>
                                    <FormControl
                                        value={formatCurrency(balanceDue)}
                                        className={`text-end fw-bold ${
                                            balanceDue > 0
                                                ? "text-warning"
                                                : "text-success"
                                        }`}
                                        disabled
                                    />
                                </InputGroup>
                            </div>

                            {change > 0 && (
                                <div className="mb-2">
                                    <InputGroup>
                                        <InputGroup.Text
                                            className="fw-bold text-info bg-light"
                                            style={{ width: "160px" }}
                                        >
                                            <FaExchangeAlt className="me-1" />
                                            Change
                                        </InputGroup.Text>
                                        <FormControl
                                            value={formatCurrency(change)}
                                            className="text-end fw-bold text-info"
                                            disabled
                                        />
                                    </InputGroup>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default PaymentInfo;
