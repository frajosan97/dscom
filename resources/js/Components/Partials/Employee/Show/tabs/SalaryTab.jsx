import { Row, Col, Card, Table, Badge, Button, Alert } from "react-bootstrap";
import {
    Wallet,
    CashCoin,
    Receipt,
    FileEarmarkSpreadsheet,
    Calendar,
} from "react-bootstrap-icons";
import { formatCurrency } from "@/Utils/helpers";
import InfoItem from "@/Components/ui/InfoItem";

export default function SalaryTab({ employee, employeeStats }) {
    const salaryHistory = employee.salary || [];
    const currentSalary = employee.current_salary || 0;

    return (
        <div>
            {/* Salary Summary */}
            <Row className="g-3 mb-4">
                <Col md={4}>
                    <Card className="border-0 bg-info bg-opacity-10">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">
                                        Current Salary
                                    </h6>
                                    <h4 className="fw-bold mb-0">
                                        {formatCurrency(currentSalary)}
                                    </h4>
                                </div>
                                <Wallet size={24} className="text-info" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 bg-success bg-opacity-10">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">
                                        Total Paid
                                    </h6>
                                    <h4 className="fw-bold mb-0">
                                        {formatCurrency(
                                            employeeStats.totalSalaryPaid || 0
                                        )}
                                    </h4>
                                </div>
                                <CashCoin size={24} className="text-success" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Salary Details */}
            <Row className="g-4">
                <Col md={6}>
                    <Card className="border-0 bg-light">
                        <Card.Body>
                            <h6 className="fw-semibold mb-3 text-primary">
                                <Wallet className="me-2" /> Salary Breakdown
                            </h6>
                            <div className="list-group list-group-flush">
                                <InfoItem
                                    label="Basic Salary"
                                    value={formatCurrency(
                                        employee.basic_salary || 0
                                    )}
                                />
                                <InfoItem
                                    label="Allowances"
                                    value={formatCurrency(
                                        employee.allowances || 0
                                    )}
                                />
                                <InfoItem
                                    label="Net Salary"
                                    value={formatCurrency(currentSalary)}
                                    isHighlight
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="border-0 bg-light h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-semibold mb-0 text-primary">
                                    <Receipt className="me-2" /> Recent Payments
                                </h6>
                                <Button variant="outline-primary" size="sm">
                                    <FileEarmarkSpreadsheet className="me-2" />
                                    Payslips
                                </Button>
                            </div>

                            {salaryHistory.length > 0 ? (
                                <div className="table-responsive">
                                    <Table hover className="mb-0">
                                        <thead>
                                            <tr>
                                                <th>Month</th>
                                                <th>Gross</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salaryHistory
                                                .slice(0, 5)
                                                .map((salary, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            {new Date(
                                                                salary.payment_date
                                                            ).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }
                                                            )}
                                                        </td>
                                                        <td>
                                                            {formatCurrency(
                                                                salary.gross_amount
                                                            )}
                                                        </td>
                                                        <td>
                                                            <Badge
                                                                bg={
                                                                    salary.status ===
                                                                    "paid"
                                                                        ? "success"
                                                                        : "warning"
                                                                }
                                                                pill
                                                            >
                                                                {salary.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    No salary history available
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
