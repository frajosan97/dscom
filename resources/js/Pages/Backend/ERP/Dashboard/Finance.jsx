import DashboardStatsCard from "@/Components/Cards/DashboardStatsCard";
import ErpLayout from "@/Layouts/ErpLayout";
import { Head, usePage } from "@inertiajs/react";
import { Col, Row, Card, Table, Badge, ProgressBar } from "react-bootstrap";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";

const FinanceDashboard = ({ dashboardData }) => {
    const { auth } = usePage().props;

    const { statCards, topCustomers } = dashboardData;

    // Sample data
    const cashFlowData = [
        { month: "Jul", income: 45000, expenses: 30000 },
        { month: "Aug", income: 52000, expenses: 32000 },
        { month: "Sep", income: 48000, expenses: 29000 },
        { month: "Oct", income: 61000, expenses: 35000 },
        { month: "Nov", income: 57000, expenses: 33000 },
        { month: "Dec", income: 68000, expenses: 40000 },
    ];

    const expenseBreakdown = [
        { category: "Salaries", amount: 15000, percentage: 45 },
        { category: "Inventory", amount: 8000, percentage: 24 },
        { category: "Rent", amount: 5000, percentage: 15 },
        { category: "Utilities", amount: 2000, percentage: 6 },
        { category: "Marketing", amount: 3000, percentage: 9 },
        { category: "Other", amount: 1000, percentage: 3 },
    ];

    const overdueInvoices = [
        {
            invoice: "INV-2024-001",
            customer: "ABC Corp",
            amount: 5000,
            dueDate: "2024-01-05",
            daysOverdue: 8,
        },
        {
            invoice: "INV-2024-002",
            customer: "XYZ Ltd",
            amount: 3200,
            dueDate: "2024-01-10",
            daysOverdue: 3,
        },
        {
            invoice: "INV-2024-003",
            customer: "Tech Solutions",
            amount: 7500,
            dueDate: "2024-01-15",
            daysOverdue: -2,
        },
        {
            invoice: "INV-2023-125",
            customer: "Global Inc",
            amount: 12000,
            dueDate: "2023-12-20",
            daysOverdue: 22,
        },
    ];

    return (
        <ErpLayout>
            <Head title="Finance Dashboard" />

            {/* Statistics Cards */}
            <Row className="mb-4">
                {statCards?.map((card, index) => (
                    <Col key={index} lg={3} md={6} className="mb-3">
                        <DashboardStatsCard {...card} />
                    </Col>
                ))}
            </Row>

            <Row className="mb-4">
                {/* Cash Flow Chart */}
                <Col lg={8} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Cash Flow (Last 6 Months)
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div style={{ width: "100%", height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={cashFlowData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f0f0f0"
                                        />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [
                                                `$${Number(
                                                    value
                                                ).toLocaleString()}`,
                                                "Amount",
                                            ]}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="income"
                                            name="Income"
                                            stackId="1"
                                            stroke="#8884d8"
                                            fill="#8884d8"
                                            fillOpacity={0.6}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="expenses"
                                            name="Expenses"
                                            stackId="1"
                                            stroke="#82ca9d"
                                            fill="#82ca9d"
                                            fillOpacity={0.6}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Expense Breakdown */}
                <Col lg={4} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Expense Breakdown
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {expenseBreakdown.map((item, index) => (
                                <div key={index} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted">
                                            {item.category}
                                        </span>
                                        <span className="fw-semibold">
                                            ${item.amount.toLocaleString()} (
                                            {item.percentage}%)
                                        </span>
                                    </div>
                                    <ProgressBar
                                        now={item.percentage}
                                        variant={getExpenseVariant(index)}
                                        label={`${item.percentage}%`}
                                    />
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Top Customers */}
                <Col lg={6} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <Card.Title as="h5" className="mb-0">
                                Top Customers
                            </Card.Title>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead>
                                    <tr className="bg-light">
                                        <th>Customer</th>
                                        <th>Email</th>
                                        <th>Total Spent</th>
                                        <th>Orders</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topCustomers?.map((customer, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm bg-light rounded me-2">
                                                        <div className="avatar-title bg-primary-subtle text-primary rounded fs-16">
                                                            {customer.name.charAt(
                                                                0
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0">
                                                            {customer.name}
                                                        </h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{customer.email}</td>
                                            <td className="fw-semibold">
                                                {customer.total_spent}
                                            </td>
                                            <td>
                                                <Badge bg="info">
                                                    {customer.order_count}
                                                </Badge>
                                            </td>
                                        </tr>
                                    )) || (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="text-center text-muted py-3"
                                            >
                                                No customer data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Overdue Invoices */}
                <Col lg={6} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <Card.Title as="h5" className="mb-0">
                                Overdue Invoices
                            </Card.Title>
                            <Badge bg="danger" pill>
                                {
                                    overdueInvoices.filter(
                                        (i) => i.daysOverdue > 0
                                    ).length
                                }
                            </Badge>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead>
                                    <tr className="bg-light">
                                        <th>Invoice #</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overdueInvoices.map((invoice, index) => (
                                        <tr key={index}>
                                            <td>
                                                <a
                                                    href="#"
                                                    className="text-decoration-none"
                                                >
                                                    {invoice.invoice}
                                                </a>
                                            </td>
                                            <td>{invoice.customer}</td>
                                            <td className="fw-semibold">
                                                $
                                                {invoice.amount.toLocaleString()}
                                            </td>
                                            <td>
                                                {invoice.dueDate}
                                                <br />
                                                <small
                                                    className={`text-${
                                                        invoice.daysOverdue > 0
                                                            ? "danger"
                                                            : "success"
                                                    }`}
                                                >
                                                    {invoice.daysOverdue > 0
                                                        ? `${invoice.daysOverdue} days overdue`
                                                        : `${Math.abs(
                                                              invoice.daysOverdue
                                                          )} days remaining`}
                                                </small>
                                            </td>
                                            <td>
                                                <Badge
                                                    bg={getInvoiceStatusColor(
                                                        invoice.daysOverdue
                                                    )}
                                                >
                                                    {invoice.daysOverdue > 0
                                                        ? "Overdue"
                                                        : "Pending"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </ErpLayout>
    );
};

// Helper functions
const getExpenseVariant = (index) => {
    const variants = [
        "primary",
        "success",
        "info",
        "warning",
        "danger",
        "secondary",
    ];
    return variants[index % variants.length];
};

const getInvoiceStatusColor = (daysOverdue) => {
    if (daysOverdue > 30) return "danger";
    if (daysOverdue > 7) return "warning";
    if (daysOverdue > 0) return "info";
    return "success";
};

export default FinanceDashboard;
