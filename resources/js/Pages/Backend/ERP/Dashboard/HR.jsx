import DashboardStatsCard from "@/Components/Cards/DashboardStatsCard";
import ErpLayout from "@/Layouts/ErpLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    Col,
    Row,
    Card,
    Table,
    Badge,
    Button,
    ProgressBar,
} from "react-bootstrap";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

const HRDashboard = ({ dashboardData }) => {
    const { auth } = usePage().props;

    const { statCards } = dashboardData;

    // Sample data for charts
    const departmentData = [
        { name: "Sales", value: 12, color: "#0088FE" },
        { name: "Technical", value: 8, color: "#00C49F" },
        { name: "Admin", value: 5, color: "#FFBB28" },
        { name: "Support", value: 7, color: "#FF8042" },
    ];

    const attendanceData = [
        { day: "Mon", present: 28, absent: 4 },
        { day: "Tue", present: 30, absent: 2 },
        { day: "Wed", present: 29, absent: 3 },
        { day: "Thu", present: 31, absent: 1 },
        { day: "Fri", present: 27, absent: 5 },
    ];

    const recentLeaveRequests = [
        {
            id: 1,
            employee: "John Doe",
            type: "Annual",
            start: "2024-01-15",
            end: "2024-01-22",
            status: "approved",
        },
        {
            id: 2,
            employee: "Jane Smith",
            type: "Sick",
            start: "2024-01-10",
            end: "2024-01-12",
            status: "pending",
        },
        {
            id: 3,
            employee: "Mike Johnson",
            type: "Maternity",
            start: "2024-02-01",
            end: "2024-08-01",
            status: "approved",
        },
        {
            id: 4,
            employee: "Sarah Williams",
            type: "Emergency",
            start: "2024-01-08",
            end: "2024-01-09",
            status: "rejected",
        },
    ];

    return (
        <ErpLayout>
            <Head title="HR Dashboard" />

            {/* Statistics Cards */}
            <Row className="mb-4">
                {statCards?.map((card, index) => (
                    <Col key={index} lg={3} md={6} className="mb-3">
                        <DashboardStatsCard {...card} />
                    </Col>
                ))}
            </Row>

            <Row className="mb-4">
                {/* Department Distribution */}
                <Col lg={4} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Department Distribution
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div style={{ width: "100%", height: 250 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={departmentData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) =>
                                                `${name}: ${(
                                                    percent * 100
                                                ).toFixed(0)}%`
                                            }
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {departmentData.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                    />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Attendance This Week */}
                <Col lg={4} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Weekly Attendance
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {attendanceData.map((day, index) => (
                                <div key={index} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted">
                                            {day.day}
                                        </span>
                                        <span className="fw-semibold">
                                            {day.present}/
                                            {day.present + day.absent}
                                        </span>
                                    </div>
                                    <ProgressBar
                                        now={
                                            (day.present /
                                                (day.present + day.absent)) *
                                            100
                                        }
                                        variant="success"
                                        label={`${(
                                            (day.present /
                                                (day.present + day.absent)) *
                                            100
                                        ).toFixed(0)}%`}
                                    />
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Upcoming Birthdays */}
                <Col lg={4} md={12} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <Card.Title as="h5" className="mb-0">
                                Upcoming Birthdays
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="list-group list-group-flush">
                                {[
                                    {
                                        name: "John Doe",
                                        date: "Jan 15",
                                        department: "Sales",
                                    },
                                    {
                                        name: "Sarah Johnson",
                                        date: "Jan 18",
                                        department: "Technical",
                                    },
                                    {
                                        name: "Mike Brown",
                                        date: "Jan 20",
                                        department: "Admin",
                                    },
                                    {
                                        name: "Emma Wilson",
                                        date: "Jan 22",
                                        department: "Support",
                                    },
                                    {
                                        name: "David Lee",
                                        date: "Jan 25",
                                        department: "Sales",
                                    },
                                ].map((employee, index) => (
                                    <div
                                        key={index}
                                        className="list-group-item border-0 px-0 py-2"
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-0">
                                                    {employee.name}
                                                </h6>
                                                <small className="text-muted">
                                                    {employee.department}
                                                </small>
                                            </div>
                                            <Badge bg="info">
                                                {employee.date}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Leave Requests */}
            <Row>
                <Col lg={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <Card.Title as="h5" className="mb-0">
                                Recent Leave Requests
                            </Card.Title>
                            <Button variant="outline-primary" size="sm">
                                View All
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead>
                                    <tr className="bg-light">
                                        <th>Employee</th>
                                        <th>Leave Type</th>
                                        <th>Duration</th>
                                        <th>Days</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLeaveRequests.map(
                                        (request, index) => (
                                            <tr key={index}>
                                                <td>{request.employee}</td>
                                                <td>
                                                    <Badge
                                                        bg="info"
                                                        className="text-capitalize"
                                                    >
                                                        {request.type}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {request.start} to{" "}
                                                    {request.end}
                                                </td>
                                                <td>
                                                    {calculateDays(
                                                        request.start,
                                                        request.end
                                                    )}{" "}
                                                    days
                                                </td>
                                                <td>
                                                    <Badge
                                                        bg={getLeaveStatusColor(
                                                            request.status
                                                        )}
                                                        className="text-capitalize"
                                                    >
                                                        {request.status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-success"
                                                        className="me-1"
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                    >
                                                        Reject
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    )}
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
const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const getLeaveStatusColor = (status) => {
    const colors = {
        pending: "warning",
        approved: "success",
        rejected: "danger",
        cancelled: "secondary",
    };
    return colors[status] || "secondary";
};

export default HRDashboard;
