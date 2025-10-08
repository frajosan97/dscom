// resources/js/Pages/Finance/Reports.jsx
import React from "react";
import { Head } from "@inertiajs/react";
import { Row, Col, Card, Button } from "react-bootstrap";
import ErpLayout from "@/Layouts/ErpLayout";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Download } from "react-bootstrap-icons";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

export default function Reports() {
    // sample data
    const revenueData = {
        labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
        ],
        datasets: [
            {
                label: "Revenue",
                data: [
                    12000, 15000, 14000, 17000, 18000, 21000, 19000, 22000,
                    20000, 24000,
                ],
                fill: false,
                tension: 0.3,
            },
        ],
    };

    const expensesData = {
        labels: ["COGS", "Salaries", "Marketing", "Rent", "Utilities"],
        datasets: [{ data: [8000, 4000, 2500, 1200, 600], label: "Expenses" }],
    };

    const cashFlowData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Inflows",
                data: [15000, 12000, 17000, 14000, 20000, 18000],
            },
            { label: "Outflows", data: [8000, 9000, 11000, 7000, 10000, 9000] },
        ],
    };

    return (
        <ErpLayout>
            <Head title="Financial Reports" />
            <Row className="mb-3">
                <Col>
                    <h4 className="fw-semibold">
                        Financial Reports
                    </h4>
                    <p className="text-muted mb-0">
                        Profit & Loss, Balance Sheet snapshots, cash flow and
                        charts.
                    </p>
                </Col>
                <Col className="text-end">
                    <Button variant="outline-secondary">
                        <Download className="me-1" /> Export PDF
                    </Button>
                </Col>
            </Row>

            <Row className="g-3">
                <Col lg={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h6 className="mb-2">Balance Sheet (Snapshot)</h6>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-muted small">
                                        Total Assets
                                    </div>
                                    <div className="fw-bold fs-5">$120,500</div>
                                </div>
                                <div>
                                    <div className="text-muted small">
                                        Total Liabilities
                                    </div>
                                    <div className="fw-bold fs-5 text-danger">
                                        $40,700
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <h6 className="mb-3">Revenue Trend</h6>
                            <div style={{ height: 260 }}>
                                <Line
                                    data={revenueData}
                                    options={{ maintainAspectRatio: false }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <h6 className="mb-3">Expenses Breakdown</h6>
                            <div style={{ height: 260 }}>
                                <Pie
                                    data={expensesData}
                                    options={{ maintainAspectRatio: false }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <h6 className="mb-3">Cash Flow</h6>
                            <div style={{ height: 260 }}>
                                <Bar
                                    data={cashFlowData}
                                    options={{ maintainAspectRatio: false }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </ErpLayout>
    );
}
