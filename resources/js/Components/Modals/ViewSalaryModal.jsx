import React, { useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import { BiPrinter, BiReceipt } from "react-icons/bi";

const ViewSalaryModal = ({ show, onHide, salaryData, employee }) => {
    const printRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Payslip_${employee?.name || "Employee"}_${
            salaryData?.month || ""
        }_${salaryData?.year || ""}`,
    });

    /* ===================== CALCULATIONS ===================== */

    const calculateEarningsTotal = () => {
        let total = 0;

        if (salaryData?.basic_salary) {
            total += parseFloat(salaryData.basic_salary);
        }

        if (salaryData?.allowances) {
            salaryData.allowances.forEach((allowance) => {
                total += parseFloat(allowance.amount || 0);
            });
        }

        return total;
    };

    const calculateDeductionsTotal = () => {
        let total = 0;

        if (salaryData?.deductions) {
            salaryData.deductions.forEach((deduction) => {
                total += parseFloat(deduction.amount || 0);
            });
        }

        return total;
    };

    const calculateNetPay = () => {
        const earnings = salaryData?.gross_salary || calculateEarningsTotal();
        const deductions =
            salaryData?.total_deductions || calculateDeductionsTotal();

        return earnings - deductions;
    };

    /* ===================== DATA MAPPING ===================== */

    const getEarningsItems = () => {
        const items = [];

        if (salaryData?.basic_salary) {
            items.push({
                description: "Basic Salary",
                amount: parseFloat(salaryData.basic_salary),
            });
        }

        if (salaryData?.real_salary) {
            items.push({
                description: "Worked Days Salary",
                amount: parseFloat(salaryData.real_salary),
                details: salaryData.days_present
                    ? `${salaryData.days_present} days × $${parseFloat(
                          salaryData.real_salary / salaryData.days_present || 0
                      ).toFixed(2)}`
                    : null,
            });
        }

        if (salaryData?.allowances?.length) {
            salaryData.allowances.forEach((allowance, index) => {
                items.push({
                    description:
                        allowance.description || `Allowance ${index + 1}`,
                    amount: parseFloat(allowance.amount || 0),
                });
            });
        }

        return items;
    };

    const getDeductionsItems = () => {
        const items = [];

        if (salaryData?.deductions?.length) {
            salaryData.deductions.forEach((deduction, index) => {
                items.push({
                    description:
                        deduction.description || `Deduction ${index + 1}`,
                    amount: parseFloat(deduction.amount || 0),
                });
            });
        }

        return items;
    };

    if (!salaryData) return null;

    const earningsItems = getEarningsItems();
    const deductionsItems = getDeductionsItems();
    const totalEarnings = calculateEarningsTotal();
    const totalDeductions = calculateDeductionsTotal();
    const netPay = calculateNetPay();

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <BiReceipt className="me-2" />
                    {employee?.name} Payslip ({salaryData.month}{" "}
                    {salaryData.year})
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <div id="printable-content" ref={printRef}>
                    <style>
                        {`
                        @media print {
                            body * { visibility: hidden; }
                            #printable-content, #printable-content * {
                                visibility: visible;
                            }
                            #printable-content {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 60%;
                                padding: 2px;
                                margin: 20px;
                                background: #fff;
                                border: 1px dashed #000;
                            }
                            .main-payslip{ 
                                width: 100%;
                                padding: 10px;
                                background: #fff;
                                border: 1px solid #000;
                            }
                            .no-print { display: none !important; }
                        }

                        .table { width: 100%; border-collapse: collapse; }
                        .table td, .table th { border: none; padding: 5px 0; }
                        .logo-td { width: 30%; }
                        .company-logo { max-width: 150px; }
                        .company-name { font-weight: bold; font-size: 1.5rem; }
                        .payslip-period { font-style: italic; }
                        .employee-name-td { width: 70%; }
                        .border-3 { padding-bottom: 1px; }
                        `}
                    </style>

                    <div className="main-payslip">
                        {/* Header */}
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="logo-td">
                                        <img
                                            src="/storage/images/logos/logo.png"
                                            className="company-logo"
                                            alt="Company Logo"
                                        />
                                    </td>
                                    <td>
                                        <h5 className="company-name m-0">
                                            DSCOM Technologies
                                        </h5>
                                        <small className="payslip-period">
                                            Pay Slip Copy ({salaryData.month}-
                                            {salaryData.year})
                                        </small>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="my-3">
                            <div className="border-top border-3 border-dark" />
                            <div className="border-top border-1 border-dark" />
                        </div>

                        {/* Employee Details */}
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td>Name:</td>
                                    <td className="employee-name-td">
                                        {employee?.name || "Employee Name"}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Employee ID:</td>
                                    <td>
                                        {salaryData.employee_code ||
                                            employee?.employee_code ||
                                            "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Designation:</td>
                                    <td>
                                        {employee?.designation ||
                                            salaryData.designation ||
                                            "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Department:</td>
                                    <td>
                                        {employee?.department ||
                                            salaryData.department ||
                                            "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Tax PIN:</td>
                                    <td>{employee?.tax_pin || "N/A"}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="text-center fw-bold mb-2">
                            Cash Transfer | No Bank Account
                        </div>

                        {/* Earnings & Deductions */}
                        <table className="table mb-0">
                            <tbody>
                                {earningsItems.map((item, index) => (
                                    <tr key={`earnings-${index}`}>
                                        <td>
                                            {item.description}
                                            {item.details && (
                                                <div className="text-muted small">
                                                    {item.details}
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-end">
                                            {salaryData.currency === "CDF"
                                                ? "CDF "
                                                : "$"}
                                            {item.amount.toLocaleString(
                                                "en-US",
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="fw-bold">
                                    <td>TOTAL EARNINGS</td>
                                    <td className="text-end">
                                        {salaryData.currency === "CDF"
                                            ? "CDF "
                                            : "$"}
                                        {totalEarnings.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </td>
                                </tr>

                                {deductionsItems.map((item, index) => (
                                    <tr key={`deductions-${index}`}>
                                        <td>{item.description}</td>
                                        <td className="text-end">
                                            {salaryData.currency === "CDF"
                                                ? "CDF "
                                                : "$"}
                                            {item.amount.toLocaleString(
                                                "en-US",
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="fw-bold">
                                    <td>TOTAL DEDUCTIONS</td>
                                    <td className="text-end">
                                        {salaryData.currency === "CDF"
                                            ? "CDF "
                                            : "$"}
                                        {totalDeductions.toLocaleString(
                                            "en-US",
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </td>
                                </tr>

                                <tr className="fw-bold">
                                    <td>
                                        NET PAY: {salaryData.month}{" "}
                                        {salaryData.year}
                                    </td>
                                    <td className="text-end">
                                        {salaryData.currency === "CDF"
                                            ? "CDF "
                                            : "$"}
                                        {netPay.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="border-top border-dark mt-3 pt-2 text-center text-muted">
                            <small>Status: {salaryData.status}</small>
                            <span className="mx-2">|</span>
                            <small>
                                Date Printed: {new Date().toLocaleDateString()}
                            </small>
                        </div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="no-print bg-light">
                <div className="d-flex justify-content-between w-100">
                    <Button variant="outline-primary" onClick={handlePrint}>
                        <BiPrinter className="me-1" /> Print Payslip
                    </Button>

                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ViewSalaryModal;
