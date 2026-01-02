import { Head, Link } from "@inertiajs/react";
import { useState, useMemo } from "react";
import {
    Container,
    Row,
    Col,
    Tabs,
    Tab,
    ButtonGroup,
    Button,
} from "react-bootstrap";

import ErpLayout from "@/Layouts/ErpLayout";
import CallModal from "@/Components/Modals/CallModal";
import SendSmsModal from "@/Components/Modals/SmsModal";
import EmployeeSidebar from "@/Components/Partials/Employee/Show/EmployeeSidebar";
import TabTitle from "@/Components/ui/TabTitle";
import OverviewTab from "@/Components/Partials/Employee/Show/tabs/OverviewTab";
import SalesTab from "@/Components/Partials/Employee/Show/tabs/SalesTab";
import SalaryTab from "@/Components/Partials/Employee/Show/tabs/SalaryTab";
import AttendanceTab from "@/Components/Partials/Employee/Show/tabs/AttendanceTab";
import PerformanceTab from "@/Components/Partials/Employee/Show/tabs/PerformanceTab";
import DocumentsTab from "@/Components/Partials/Employee/Show/tabs/DocumentsTab";
import { getEmploymentStatus, getRoleBadge } from "@/Utils/helpers";
import EmployeeStatsCard from "@/Components/Cards/EmployeeStatsCard";
import {
    FaCrown,
    FaGraduationCap,
    FaIdBadge,
    FaPencilAlt,
    FaShieldAlt,
    FaTrashAlt,
} from "react-icons/fa";

export default function EmployeeShow({ employee }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [showCallModal, setShowCallModal] = useState(false);
    const [showSendSmsModal, setShowSendSmsModal] = useState(false);

    // Calculate employee stats
    const employeeStats = useMemo(() => {
        const totalSales =
            employee.sales?.reduce(
                (sum, sale) => sum + (sale.amount || 0),
                0
            ) || 0;
        const attendanceRate = employee.attendance?.length
            ? (employee.attendance.filter((a) => a.status === "present")
                  .length /
                  employee.attendance.length) *
              100
            : 0;

        return {
            totalSales,
            attendanceRate,
            performanceScore: employee.performance_score || 0,
            currentSalary: employee.current_salary || 0,
            totalSalaryPaid:
                employee.salary?.reduce(
                    (sum, salary) => sum + (salary.net_amount || 0),
                    0
                ) || 0,
        };
    }, [employee]);

    const employmentStatus = getEmploymentStatus(employee.employment_status);
    const roleBadge = getRoleBadge(employee.role);

    // Modal handlers
    const handleCallClick = () => {
        setShowCallModal(true);
    };

    const handleSmsClick = () => {
        setShowSendSmsModal(true);
    };

    return (
        <ErpLayout>
            <Head
                title={`${employee.first_name} ${employee.last_name} - Employee Profile`}
            />

            <Container fluid>
                {/* Header Section */}
                <Row className="mb-4">
                    <Col lg={12}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="position-relative">
                                <img
                                    src={employee.profile_image_url}
                                    alt={`${employee.first_name} ${employee.last_name}'s profile`}
                                    className="rounded-circle border border-3 border-light shadow"
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        objectFit: "cover",
                                    }}
                                />
                            </div>
                            <div className="flex-grow-1">
                                <h2 className="fw-bold mb-1 text-gradient-primary text-capitalize">
                                    {employee.name}
                                </h2>
                                <div className="d-flex flex-wrap gap-2 align-items-center text-muted">
                                    <span className="d-flex align-items-center">
                                        <FaShieldAlt
                                            size={14}
                                            className="me-1"
                                        />
                                        {employee.roles
                                            .map((r) => r.name)
                                            .join(", ") || "N/A"}
                                    </span>
                                    <span className="text-muted">•</span>
                                    <span className="d-flex align-items-center">
                                        <FaCrown size={14} className="me-1" />
                                        {employee.designation}
                                    </span>
                                    <span className="text-muted">•</span>
                                    <span className="d-flex align-items-center">
                                        <FaIdBadge size={14} className="me-1" />
                                        EMP-{employee.id}
                                    </span>
                                </div>
                                <div className="text-muted">
                                    <FaGraduationCap
                                        size={14}
                                        className="me-1"
                                    />
                                    {employee.qualification ?? "N/A"}
                                </div>
                            </div>
                            <ButtonGroup className="d-none d-md-flex gap-2">
                                <Button
                                    variant="outline-primary rounded"
                                    as={Link}
                                    href={route("employee.edit", employee.id)}
                                    className="d-flex align-items-center"
                                >
                                    <FaPencilAlt className="me-1" /> Edit
                                </Button>
                                <Button
                                    variant="outline-danger rounded"
                                    className="d-flex align-items-center"
                                >
                                    <FaTrashAlt className="me-1" /> Delete
                                </Button>
                            </ButtonGroup>
                        </div>

                        <div className="border-top border-3 border-dark mb-1"></div>
                        <div className="border-top border-1 border-dark mb-3"></div>

                        {/* Stats Cards */}
                        <Row className="g-3">
                            <Col xs={6} md={3}>
                                <EmployeeStatsCard
                                    title="Performance Score"
                                    value={`${employeeStats.performanceScore}%`}
                                    color="primary"
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <EmployeeStatsCard
                                    title="Total Sales"
                                    value={`$${employeeStats.totalSales.toLocaleString()}`}
                                    color="success"
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <EmployeeStatsCard
                                    title="Salaries Paid"
                                    value={`$${employeeStats.currentSalary.toLocaleString()}`}
                                    color="info"
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <EmployeeStatsCard
                                    title="Attendance Rate"
                                    value={`${employeeStats.attendanceRate.toFixed(
                                        1
                                    )}%`}
                                    color="warning"
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Main Content */}
                <Row>
                    {/* Sidebar */}
                    <Col xl={3} lg={4} className="mb-3 mb-md-0">
                        <EmployeeSidebar
                            employee={employee}
                            employeeStats={employeeStats}
                            onCall={handleCallClick}
                            onSms={handleSmsClick}
                            employmentStatus={employmentStatus}
                        />
                    </Col>

                    {/* Main Content */}
                    <Col xl={9} lg={8}>
                        <div className="border-0 shadow-lg rounded h-100">
                            <div className="p-0">
                                <Tabs
                                    activeKey={activeTab}
                                    onSelect={(k) => setActiveTab(k)}
                                    className="px-4 pt-4 border-bottom"
                                    fill
                                >
                                    <Tab
                                        eventKey="overview"
                                        title={
                                            <TabTitle
                                                icon="👤"
                                                label="Overview"
                                            />
                                        }
                                    />
                                    <Tab
                                        eventKey="sales"
                                        title={
                                            <TabTitle
                                                icon="💰"
                                                label="Sales"
                                                count={
                                                    employee.sales?.length || 0
                                                }
                                            />
                                        }
                                    />
                                    <Tab
                                        eventKey="salary"
                                        title={
                                            <TabTitle
                                                icon="💳"
                                                label="Salary"
                                            />
                                        }
                                    />
                                    <Tab
                                        eventKey="attendance"
                                        title={
                                            <TabTitle
                                                icon="⏰"
                                                label="Attendance"
                                            />
                                        }
                                    />
                                    <Tab
                                        eventKey="performance"
                                        title={
                                            <TabTitle
                                                icon="📊"
                                                label="Performance"
                                            />
                                        }
                                    />
                                    <Tab
                                        eventKey="documents"
                                        title={
                                            <TabTitle
                                                icon="📄"
                                                label="Documents"
                                                count={
                                                    employee.documents
                                                        ?.length || 8
                                                }
                                            />
                                        }
                                    />
                                </Tabs>

                                <div className="p-4">
                                    {activeTab === "overview" && (
                                        <OverviewTab
                                            employee={employee}
                                            employeeStats={employeeStats}
                                        />
                                    )}
                                    {activeTab === "sales" && (
                                        <SalesTab employee={employee} />
                                    )}
                                    {activeTab === "salary" && (
                                        <SalaryTab
                                            employee={employee}
                                            employeeStats={employeeStats}
                                        />
                                    )}
                                    {activeTab === "attendance" && (
                                        <AttendanceTab employee={employee} />
                                    )}
                                    {activeTab === "performance" && (
                                        <PerformanceTab employee={employee} />
                                    )}
                                    {activeTab === "documents" && (
                                        <DocumentsTab employee={employee} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Modals */}
            <CallModal
                show={showCallModal}
                onHide={() => setShowCallModal(false)}
                callDetails={{
                    phoneNumber: employee?.phone,
                }}
                title="Call Employee"
            />
            <SendSmsModal
                show={showSendSmsModal}
                onHide={() => setShowSendSmsModal(false)}
                smsDetails={{
                    phoneNumber: employee?.phone,
                }}
                title="Message Employee"
            />
        </ErpLayout>
    );
}
