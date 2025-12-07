import { Head, Link } from "@inertiajs/react";
import { useState, useMemo, useCallback } from "react";
import {
    Button,
    Card,
    Row,
    Col,
    Badge,
    Tab,
    Tabs,
    ListGroup,
    Form,
    InputGroup,
    Table,
    Container,
    Alert,
    ProgressBar,
} from "react-bootstrap";
import {
    Telephone,
    Envelope,
    GeoAlt,
    Calendar,
    Person,
    CashCoin,
    Star,
    Chat,
    Phone,
    Eye,
    Search,
    Pencil,
    Briefcase,
    Tools,
    CreditCard,
    Activity,
    ShieldCheck,
    Bell,
    GraphUp,
    Clock,
    Award,
    PersonCheck,
    FileEarmarkText,
    Building,
    People,
    Wallet,
    BarChart,
    FileEarmarkSpreadsheet,
    Receipt,
} from "react-bootstrap-icons";
import {
    FaCrown,
    FaFire,
    FaGraduationCap,
    FaIdBadge,
    FaSalesforce,
} from "react-icons/fa";
import { GiRank3 } from "react-icons/gi";
import { MdAttachMoney, MdPayments } from "react-icons/md";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import ErpLayout from "@/Layouts/ErpLayout";
import {
    formatCurrency,
    formatDate,
    calculateAge,
    formatPhoneNumber,
    calculateYearsOfService,
} from "@/Utils/helpers";
import CallModal from "@/Components/Modals/CallModal";
import SendSmsModal from "@/Components/Modals/SmsModal";
import EmployeeStatsCard from "@/Components/Cards/EmployeeStatsCard";
import xios from "@/Utils/axios";
import { useErrorToast } from "@/Hooks/useErrorToast";

// Constants for better maintainability
const EMPLOYMENT_STATUS = {
    active: { color: "success", label: "Active" },
    on_leave: { color: "warning", label: "On Leave" },
    terminated: { color: "danger", label: "Terminated" },
    probation: { color: "info", label: "Probation" },
    inactive: { color: "secondary", label: "Inactive" },
};

const DEPARTMENT_COLORS = {
    sales: "primary",
    marketing: "info",
    engineering: "warning",
    hr: "success",
    finance: "danger",
    operations: "secondary",
    it: "dark",
    management: "purple",
};

const ROLE_BADGES = {
    admin: { color: "danger", icon: <ShieldCheck /> },
    manager: { color: "warning", icon: <GiRank3 /> },
    supervisor: { color: "info", icon: <PersonCheck /> },
    employee: { color: "success", icon: <Person /> },
    intern: { color: "secondary", icon: <FaGraduationCap /> },
};

export default function EmployeeShow({ employee }) {
    const { showErrorToast } = useErrorToast();
    const [activeTab, setActiveTab] = useState("overview");
    const [showCallModal, setShowCallModal] = useState(false);
    const [showSendSmsModal, setShowSendSmsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Calculate employee stats
    const employeeStats = useMemo(() => {
        const totalSales =
            employee.sales?.reduce(
                (sum, sale) => sum + (sale.amount || 0),
                0
            ) || 0;
        const totalProjects = employee.projects?.length || 0;
        const completedProjects =
            employee.projects?.filter((p) => p.status === "completed").length ||
            0;
        const attendanceRate = employee.attendance?.length
            ? (employee.attendance.filter((a) => a.status === "present")
                  .length /
                  employee.attendance.length) *
              100
            : 0;

        const totalSalaryPaid =
            employee.salary_history?.reduce(
                (sum, salary) => sum + (salary.net_amount || 0),
                0
            ) || 0;

        const currentSalary = employee.current_salary || 0;
        const commissionEarned =
            employee.sales?.reduce(
                (sum, sale) => sum + (sale.commission || 0),
                0
            ) || 0;

        return {
            totalSales,
            totalProjects,
            completedProjects,
            attendanceRate,
            performanceScore: employee.performance_score || 0,
            yearsOfService: calculateYearsOfService(employee.hire_date),
            totalSalaryPaid,
            currentSalary,
            commissionEarned,
            avgSalesPerMonth: employee.sales?.length
                ? totalSales /
                  Math.max(1, calculateMonthsOfService(employee.hire_date))
                : 0,
        };
    }, [employee]);

    const callDetails = useMemo(
        () => ({
            phoneNumber: employee.phone || "",
            callType: "outgoing",
            notes: "",
            duration: "",
            status: "completed",
        }),
        [employee.phone]
    );

    const smsDetails = useMemo(
        () => ({
            employeeId: employee.id,
            phoneNumber: employee.phone || "",
            message: "",
        }),
        [employee.id, employee.phone]
    );

    /** Calculate months of service */
    const calculateMonthsOfService = (hireDate) => {
        if (!hireDate) return 0;
        const hire = new Date(hireDate);
        const now = new Date();
        return (
            (now.getFullYear() - hire.getFullYear()) * 12 +
            (now.getMonth() - hire.getMonth())
        );
    };

    /** Get employment status badge */
    const getEmploymentStatus = useCallback((status) => {
        return EMPLOYMENT_STATUS[status] || EMPLOYMENT_STATUS.inactive;
    }, []);

    /** Get department color */
    const getDepartmentColor = useCallback((dept) => {
        return DEPARTMENT_COLORS[dept?.toLowerCase()] || "secondary";
    }, []);

    /** Get role badge */
    const getRoleBadge = useCallback((role) => {
        return ROLE_BADGES[role?.toLowerCase()] || ROLE_BADGES.employee;
    }, []);

    /** Handle SMS sending */
    const handleSmsSubmit = async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
            title: "📱 Send SMS to Employee?",
            text: "This message will be sent immediately.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, send it!",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        Swal.fire({
            title: "Sending SMS...",
            text: "Please wait while we send your message",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            await xios.post(route("employees.send-sms"), smsDetails);
            toast.success("📨 SMS sent successfully!");
            setSmsDetails((prev) => ({ ...prev, message: "" }));
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
            setShowSendSmsModal(false);
        }
    };

    /** Handle phone call */
    const handleCallNow = async () => {
        const result = await Swal.fire({
            title: "📞 Call Employee?",
            text: "You will be redirected to your phone dialer",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, call now!",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        if (employee.phone) {
            window.location.href = `tel:${employee.phone}`;
            toast.info("📞 Redirecting to phone dialer...");
        } else {
            toast.error("No phone number available for this employee.");
        }
    };

    /** Export employee data */
    const handleExportData = async () => {
        Swal.fire({
            title: "Exporting Employee Data...",
            text: "Preparing employee data for download",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const response = await xios.get(
                route("employees.export", employee.id),
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `employee-${employee.employee_id}-${new Date()
                    .toISOString()
                    .slice(0, 10)}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("📥 Employee data exported successfully!");
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
        }
    };

    /** Request time off */
    const handleRequestTimeOff = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Request Time Off",
            html: `
                <input id="start-date" class="swal2-input" placeholder="Start Date" type="date">
                <input id="end-date" class="swal2-input" placeholder="End Date" type="date">
                <select id="reason" class="swal2-input">
                    <option value="">Select Reason</option>
                    <option value="vacation">Vacation</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal</option>
                    <option value="other">Other</option>
                </select>
                <textarea id="notes" class="swal2-textarea" placeholder="Additional notes"></textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                return {
                    startDate: document.getElementById("start-date").value,
                    endDate: document.getElementById("end-date").value,
                    reason: document.getElementById("reason").value,
                    notes: document.getElementById("notes").value,
                };
            },
        });

        if (formValues) {
            // Handle time off request submission
            toast.success("⏰ Time off request submitted!");
        }
    };

    const employmentStatus = getEmploymentStatus(employee.employment_status);
    const roleBadge = getRoleBadge(employee.role);

    return (
        <ErpLayout>
            <Head
                title={`${employee.first_name} ${employee.last_name} - Employee Profile`}
            />

            <Container fluid>
                {/* Header Section */}
                <Row className="mb-4">
                    <Col lg={12}>
                        <div className="d-flex align-items-center gap-3 mb-4">
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
                                <Badge
                                    bg={employmentStatus.color}
                                    className="position-absolute bottom-0 end-0 border border-2 border-white"
                                    pill
                                >
                                    {employmentStatus.label.charAt(0)}
                                </Badge>
                            </div>
                            <div className="flex-grow-1">
                                <h2 className="fw-bold mb-1 text-gradient-primary text-capitalize">
                                    {employee.name}
                                </h2>
                                <div className="d-flex flex-wrap gap-2 align-items-center text-muted">
                                    <Badge
                                        bg={getDepartmentColor(
                                            employee.department
                                        )}
                                        className="text-capitalize"
                                    >
                                        <Building size={12} className="me-1" />
                                        {employee.department}
                                    </Badge>
                                    <span className="text-muted">•</span>
                                    <Badge
                                        bg={roleBadge.color}
                                        className="d-flex align-items-center gap-1"
                                    >
                                        {roleBadge.icon}
                                        {employee.role}
                                    </Badge>
                                    <span className="text-muted">•</span>
                                    <span className="d-flex align-items-center">
                                        <FaIdBadge size={14} className="me-1" />
                                        ID: {employee.employee_id}
                                    </span>
                                    <span className="text-muted">•</span>
                                    <Button
                                        variant="link"
                                        as={Link}
                                        href={route(
                                            "employee.edit",
                                            employee.id
                                        )}
                                        className="p-0 text-decoration-none"
                                    >
                                        <Pencil size={14} className="me-1" />
                                        Edit Profile
                                    </Button>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => setShowCallModal(true)}
                                    className="d-flex align-items-center"
                                >
                                    <Phone className="me-2" /> Call
                                </Button>
                                <Button
                                    variant="outline-success"
                                    onClick={handleExportData}
                                    className="d-flex align-items-center"
                                >
                                    <FileEarmarkText className="me-2" /> Export
                                </Button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <Row className="g-3">
                            <Col xs={6} md={3}>
                                <EmployeeStatsCard
                                    title="Performance Score"
                                    value={`${employeeStats.performanceScore}%`}
                                    icon={<Star />}
                                    color="primary"
                                    progress={employeeStats.performanceScore}
                                    subtitle="Quarterly Review"
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <EmployeeStatsCard
                                    title="Total Sales"
                                    value={formatCurrency(
                                        employeeStats.totalSales
                                    )}
                                    icon={<CashCoin />}
                                    color="success"
                                    trend="+15.2%"
                                    subtitle={`${formatCurrency(
                                        employeeStats.avgSalesPerMonth
                                    )}/month`}
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <EmployeeStatsCard
                                    title="Current Salary"
                                    value={formatCurrency(
                                        employeeStats.currentSalary
                                    )}
                                    icon={<Wallet />}
                                    color="info"
                                    subtitle={`${
                                        employee.salary_frequency || "Monthly"
                                    }`}
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <EmployeeStatsCard
                                    title="Attendance Rate"
                                    value={`${employeeStats.attendanceRate.toFixed(
                                        1
                                    )}%`}
                                    icon={<Clock />}
                                    color="warning"
                                    progress={employeeStats.attendanceRate}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Main Content */}
                <Row>
                    {/* Sidebar */}
                    <Col xl={3} lg={4} className="mb-4">
                        <EmployeeSidebar
                            employee={employee}
                            employeeStats={employeeStats}
                            onCall={() => setShowCallModal(true)}
                            onSms={() => setShowSendSmsModal(true)}
                            onRequestTimeOff={handleRequestTimeOff}
                            employmentStatus={employmentStatus}
                        />
                    </Col>

                    {/* Main Content */}
                    <Col xl={9} lg={8}>
                        <Card className="border-0 shadow-lg h-100">
                            <Card.Body className="p-0">
                                <Tabs
                                    activeKey={activeTab}
                                    onSelect={setActiveTab}
                                    className="px-4 pt-4 border-bottom"
                                    fill
                                >
                                    <Tab
                                        eventKey="overview"
                                        title={
                                            <TabTitle
                                                icon={<Person />}
                                                label="Overview"
                                            />
                                        }
                                    />
                                    <Tab
                                        eventKey="sales"
                                        title={
                                            <TabTitle
                                                icon={<FaSalesforce />}
                                                label="Sales"
                                                count={
                                                    employee.sales?.length || 0
                                                }
                                                badgeColor="success"
                                            />
                                        }
                                    />
                                    <Tab
                                        eventKey="salary"
                                        title={
                                            <TabTitle
                                                icon={<MdAttachMoney />}
                                                label="Salary"
                                                badgeColor="warning"
                                            />
                                        }
                                    />
                                    <Tab
                                        eventKey="attendance"
                                        title={
                                            <TabTitle
                                                icon={<Clock />}
                                                label="Attendance"
                                                badgeColor="info"
                                            />
                                        }
                                    />
                                    <Tab
                                        eventKey="performance"
                                        title={
                                            <TabTitle
                                                icon={<GraphUp />}
                                                label="Performance"
                                            />
                                        }
                                    />
                                    <Tab
                                        eventKey="documents"
                                        title={
                                            <TabTitle
                                                icon={<FileEarmarkText />}
                                                label="Documents"
                                                count={
                                                    employee.documents
                                                        ?.length || 0
                                                }
                                                badgeColor="secondary"
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
                                        <SalesTab
                                            employee={employee}
                                            searchTerm={searchTerm}
                                        />
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
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modals */}
            <CallModal
                show={showCallModal}
                onHide={() => setShowCallModal(false)}
                contact={employee}
                callDetails={callDetails}
                onCallNow={handleCallNow}
                title="Call Employee"
            />
            <SendSmsModal
                show={showSendSmsModal}
                onHide={() => setShowSendSmsModal(false)}
                contact={employee}
                smsDetails={smsDetails}
                onSubmit={handleSmsSubmit}
                title="Message Employee"
            />
        </ErpLayout>
    );
}

/** =============== SUB-COMPONENTS =============== */

/** Employee Sidebar Component */
const EmployeeSidebar = ({
    employee,
    employeeStats,
    onCall,
    onSms,
    onRequestTimeOff,
    employmentStatus,
}) => (
    <Card className="border-0 shadow-lg h-100">
        <Card.Body className="p-4">
            {/* Employee Information */}
            <SectionTitle icon={<Person />} title="Employee Information" />
            <ListGroup variant="flush" className="mb-4">
                <ContactItem
                    icon={<Envelope />}
                    label="Work Email"
                    value={employee.email}
                    fallback="Not provided"
                    action={`mailto:${employee.email}`}
                />
                <ContactItem
                    icon={<Telephone />}
                    label="Work Phone"
                    value={formatPhoneNumber(employee.phone)}
                    fallback="Not provided"
                />
                <ContactItem
                    icon={<Building />}
                    label="Department"
                    value={employee.department}
                    badgeColor={
                        DEPARTMENT_COLORS[employee.department?.toLowerCase()]
                    }
                />
                <ContactItem
                    icon={<GiRank3 />}
                    label="Position"
                    value={employee.position}
                />
                <ContactItem
                    icon={<People />}
                    label="Manager"
                    value={employee.manager?.name}
                    fallback="Not assigned"
                    action={
                        employee.manager?.id
                            ? route("employees.show", employee.manager.id)
                            : null
                    }
                />
            </ListGroup>

            {/* Salary & Finance Summary */}
            <SectionTitle icon={<Wallet />} title="Salary & Finance" />
            <div className="mb-4">
                <InfoRow
                    label="Current Salary"
                    value={formatCurrency(employee.current_salary || 0)}
                    isCurrency
                />
                <InfoRow
                    label="Salary Frequency"
                    value={employee.salary_frequency || "Monthly"}
                />
                <InfoRow
                    label="Bank Account"
                    value={
                        employee.bank_account_number
                            ? `****${employee.bank_account_number.slice(-4)}`
                            : "Not set"
                    }
                />
                <InfoRow
                    label="Total Commission"
                    value={formatCurrency(employeeStats.commissionEarned)}
                    isCurrency
                    isPositive={employeeStats.commissionEarned > 0}
                />
                {employee.commission_rate && (
                    <InfoRow
                        label="Commission Rate"
                        value={`${employee.commission_rate}%`}
                    />
                )}
            </div>

            {/* Quick Actions */}
            <SectionTitle icon={<Activity />} title="Quick Actions" />
            <div className="d-grid gap-2">
                <ActionButton
                    icon={<Phone />}
                    label="Make a Call"
                    variant="outline-primary"
                    onClick={onCall}
                    badge="📞"
                />
                <ActionButton
                    icon={<Chat />}
                    label="Send Message"
                    variant="outline-success"
                    onClick={onSms}
                    badge="💬"
                />
                <ActionButton
                    icon={<Clock />}
                    label="Request Time Off"
                    variant="outline-warning"
                    onClick={onRequestTimeOff}
                    badge="⏰"
                />
                <ActionButton
                    icon={<FileEarmarkText />}
                    label="View Payslip"
                    variant="outline-info"
                    onClick={() => toast.info("Feature coming soon!")}
                    badge="💰"
                />
                <ActionButton
                    icon={<MdPayments />}
                    label="Process Payment"
                    variant="outline-danger"
                    onClick={() => toast.info("Feature coming soon!")}
                    badge="💳"
                />
            </div>
        </Card.Body>
    </Card>
);

/** Tab Title Component */
const TabTitle = ({ icon, label, count, badgeColor = "primary" }) => (
    <span className="d-flex align-items-center">
        {icon} <span className="ms-2">{label}</span>
        {count > 0 && (
            <Badge bg={badgeColor} pill className="ms-2">
                {count}
            </Badge>
        )}
    </span>
);

/** Overview Tab */
const OverviewTab = ({ employee, employeeStats }) => {
    const age = employee.date_of_birth
        ? calculateAge(employee.date_of_birth)
        : null;

    return (
        <Row className="g-4">
            <Col md={6}>
                <InfoCard
                    title="Personal Details"
                    icon={<Person />}
                    items={[
                        {
                            label: "Full Name",
                            value: `${employee.first_name} ${employee.last_name}`,
                        },
                        {
                            label: "Date of Birth",
                            value: employee.date_of_birth && (
                                <div className="d-flex align-items-center justify-content-between">
                                    <span>
                                        {formatDate(employee.date_of_birth)}
                                    </span>
                                    {age && (
                                        <Badge bg="secondary">
                                            {age} years
                                        </Badge>
                                    )}
                                </div>
                            ),
                            fallback: "Not provided",
                        },
                        { label: "Gender", value: employee.gender },
                        { label: "Nationality", value: employee.nationality },
                        {
                            label: "Marital Status",
                            value: employee.marital_status,
                        },
                    ]}
                />
            </Col>

            <Col md={6}>
                <InfoCard
                    title="Contact & Address"
                    icon={<GeoAlt />}
                    items={[
                        {
                            label: "Personal Email",
                            value: employee.personal_email,
                        },
                        {
                            label: "Personal Phone",
                            value: formatPhoneNumber(employee.personal_phone),
                        },
                        {
                            label: "Emergency Contact",
                            value: employee.emergency_contact,
                        },
                        {
                            label: "Emergency Phone",
                            value: formatPhoneNumber(employee.emergency_phone),
                        },
                        {
                            label: "Address",
                            value: employee.address,
                            fallback: "Not provided",
                        },
                    ]}
                />
            </Col>

            <Col md={12}>
                <Card className="border-0 bg-light">
                    <Card.Body>
                        <SectionTitle
                            icon={<Activity />}
                            title="Work & Financial Summary"
                        />
                        <Row className="g-3">
                            <Col md={3}>
                                <div className="text-center p-3 bg-white rounded">
                                    <div className="text-primary mb-2">
                                        <Building size={24} />
                                    </div>
                                    <h4 className="fw-bold">
                                        {employee.department}
                                    </h4>
                                    <p className="text-muted mb-0">
                                        Department
                                    </p>
                                    <small className="text-success">
                                        {employee.team || "No team assigned"}
                                    </small>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="text-center p-3 bg-white rounded">
                                    <div className="text-warning mb-2">
                                        <GiRank3 size={24} />
                                    </div>
                                    <h4 className="fw-bold">
                                        {employee.position}
                                    </h4>
                                    <p className="text-muted mb-0">Position</p>
                                    <small className="text-success">
                                        Level {employee.job_level || "N/A"}
                                    </small>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="text-center p-3 bg-white rounded">
                                    <div className="text-success mb-2">
                                        <CashCoin size={24} />
                                    </div>
                                    <h4 className="fw-bold">
                                        {formatCurrency(
                                            employeeStats.totalSales
                                        )}
                                    </h4>
                                    <p className="text-muted mb-0">
                                        Total Sales
                                    </p>
                                    <small className="text-success">
                                        {employee.sales?.length || 0}{" "}
                                        transactions
                                    </small>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="text-center p-3 bg-white rounded">
                                    <div className="text-info mb-2">
                                        <Wallet size={24} />
                                    </div>
                                    <h4 className="fw-bold">
                                        {formatCurrency(
                                            employeeStats.currentSalary
                                        )}
                                    </h4>
                                    <p className="text-muted mb-0">
                                        Monthly Salary
                                    </p>
                                    <small className="text-success">
                                        {employee.salary_frequency || "Monthly"}
                                    </small>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>

            {/* Skills Section */}
            {employee.skills?.length > 0 && (
                <Col md={12}>
                    <Card className="border-0 bg-light">
                        <Card.Body>
                            <SectionTitle
                                icon={<Award />}
                                title="Skills & Certifications"
                            />
                            <div className="d-flex flex-wrap gap-2">
                                {employee.skills.map((skill, index) => (
                                    <Badge
                                        key={index}
                                        bg="light"
                                        text="dark"
                                        className="py-2 px-3 border"
                                    >
                                        {skill.name}
                                        {skill.level && (
                                            <small className="text-muted ms-1">
                                                ({skill.level})
                                            </small>
                                        )}
                                    </Badge>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            )}
        </Row>
    );
};

/** Sales Tab */
const SalesTab = ({ employee, searchTerm }) => {
    const filteredSales = useMemo(
        () =>
            employee.sales?.filter(
                (sale) =>
                    !searchTerm ||
                    sale.invoice_number
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    sale.customer_name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    sale.status
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
            ) || [],
        [employee.sales, searchTerm]
    );

    const columns = [
        {
            key: "invoice_number",
            label: "Invoice #",
            render: (val) => val || "—",
        },
        {
            key: "date",
            label: "Date",
            render: (val) => formatDate(val),
        },
        {
            key: "customer_name",
            label: "Customer",
            render: (val) => val || "—",
        },
        {
            key: "amount",
            label: "Amount",
            render: (val) => formatCurrency(val),
        },
        {
            key: "commission",
            label: "Commission",
            render: (val) => formatCurrency(val || 0),
        },
        {
            key: "status",
            label: "Status",
            render: (val) => <StatusBadge status={val} />,
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, sale) => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    as={Link}
                    href={route("sales.show", sale.id)}
                >
                    <Eye size={14} />
                </Button>
            ),
        },
    ];

    // Calculate sales summary
    const salesSummary = useMemo(() => {
        const totalSales = filteredSales.reduce(
            (sum, sale) => sum + (sale.amount || 0),
            0
        );
        const totalCommission = filteredSales.reduce(
            (sum, sale) => sum + (sale.commission || 0),
            0
        );
        const completedSales = filteredSales.filter(
            (s) => s.status === "completed"
        ).length;

        return {
            totalSales,
            totalCommission,
            completedSales,
            averageSale:
                filteredSales.length > 0
                    ? totalSales / filteredSales.length
                    : 0,
        };
    }, [filteredSales]);

    return (
        <div>
            {/* Sales Summary Cards */}
            <Row className="g-3 mb-4">
                <Col md={3}>
                    <Card className="border-0 bg-success bg-opacity-10">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">
                                        Total Sales
                                    </h6>
                                    <h4 className="fw-bold mb-0">
                                        {formatCurrency(
                                            salesSummary.totalSales
                                        )}
                                    </h4>
                                </div>
                                <CashCoin size={24} className="text-success" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-warning bg-opacity-10">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">
                                        Total Commission
                                    </h6>
                                    <h4 className="fw-bold mb-0">
                                        {formatCurrency(
                                            salesSummary.totalCommission
                                        )}
                                    </h4>
                                </div>
                                <Wallet size={24} className="text-warning" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-info bg-opacity-10">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">
                                        Completed Sales
                                    </h6>
                                    <h4 className="fw-bold mb-0">
                                        {salesSummary.completedSales}
                                    </h4>
                                </div>
                                <PersonCheck size={24} className="text-info" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-primary bg-opacity-10">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">
                                        Average Sale
                                    </h6>
                                    <h4 className="fw-bold mb-0">
                                        {formatCurrency(
                                            salesSummary.averageSale
                                        )}
                                    </h4>
                                </div>
                                <BarChart size={24} className="text-primary" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <TabTable
                title="Sales History"
                data={filteredSales}
                columns={columns}
                emptyMessage="No sales records found for this employee."
            />
        </div>
    );
};

/** Salary Tab */
const SalaryTab = ({ employee, employeeStats }) => {
    const salaryHistory = employee.salary_history || [];
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
                                    <small className="text-muted">
                                        {employee.salary_frequency || "Monthly"}
                                    </small>
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
                                            employeeStats.totalSalaryPaid
                                        )}
                                    </h4>
                                    <small className="text-muted">
                                        Lifetime
                                    </small>
                                </div>
                                <CashCoin size={24} className="text-success" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 bg-warning bg-opacity-10">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">
                                        Total Commission
                                    </h6>
                                    <h4 className="fw-bold mb-0">
                                        {formatCurrency(
                                            employeeStats.commissionEarned
                                        )}
                                    </h4>
                                    <small className="text-muted">Earned</small>
                                </div>
                                <MdAttachMoney
                                    size={24}
                                    className="text-warning"
                                />
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
                            <ListGroup variant="flush">
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
                                    label="Deductions"
                                    value={formatCurrency(
                                        employee.deductions || 0
                                    )}
                                />
                                <InfoItem
                                    label="Net Salary"
                                    value={formatCurrency(currentSalary)}
                                    isHighlight
                                />
                                <InfoItem
                                    label="Tax Bracket"
                                    value={employee.tax_bracket || "N/A"}
                                />
                                <InfoItem
                                    label="Payment Method"
                                    value={
                                        employee.payment_method ||
                                        "Bank Transfer"
                                    }
                                />
                            </ListGroup>
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
                                                <th>Net</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salaryHistory
                                                .slice(0, 5)
                                                .map((salary, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            {formatDate(
                                                                salary.payment_date,
                                                                "MMM YYYY"
                                                            )}
                                                        </td>
                                                        <td>
                                                            {formatCurrency(
                                                                salary.gross_amount
                                                            )}
                                                        </td>
                                                        <td>
                                                            {formatCurrency(
                                                                salary.net_amount
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
                                <EmptyState
                                    message="No salary history available"
                                    icon={<Wallet size={48} />}
                                />
                            )}

                            {salaryHistory.length > 5 && (
                                <div className="text-center mt-3">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                    >
                                        View All Payments
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Next Payment Info */}
            {employee.next_payment_date && (
                <Alert variant="info" className="mt-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Calendar className="me-2" />
                            <strong>Next Payment:</strong>{" "}
                            {formatDate(
                                employee.next_payment_date,
                                "MMMM DD, YYYY"
                            )}
                            <span className="ms-3">
                                <strong>Amount:</strong>{" "}
                                {formatCurrency(currentSalary)}
                            </span>
                        </div>
                        <Button variant="outline-info" size="sm">
                            Process Payment
                        </Button>
                    </div>
                </Alert>
            )}
        </div>
    );
};

/** Attendance Tab */
const AttendanceTab = ({ employee }) => {
    const recentAttendance = employee.attendance?.slice(-10) || [];
    const todayAttendance = employee.attendance?.find(
        (a) =>
            formatDate(a.date, "YYYY-MM-DD") ===
            formatDate(new Date(), "YYYY-MM-DD")
    );

    return (
        <div>
            {/* Today's Attendance */}
            {todayAttendance && (
                <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="fw-semibold mb-1">
                                    Today's Attendance
                                </h6>
                                <div className="d-flex align-items-center gap-3">
                                    <div>
                                        <small className="text-muted">
                                            Check-in
                                        </small>
                                        <div className="fw-bold">
                                            {todayAttendance.check_in || "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <small className="text-muted">
                                            Check-out
                                        </small>
                                        <div className="fw-bold">
                                            {todayAttendance.check_out || "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <small className="text-muted">
                                            Hours
                                        </small>
                                        <div className="fw-bold">
                                            {todayAttendance.hours_worked ||
                                                "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <Badge
                                            bg={
                                                todayAttendance.status ===
                                                "present"
                                                    ? "success"
                                                    : "warning"
                                            }
                                            pill
                                        >
                                            {todayAttendance.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline-primary" size="sm">
                                <Clock className="me-2" /> Log Time
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-semibold mb-0">Attendance Record</h6>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                        <Calendar className="me-2" /> View Calendar
                    </Button>
                    <Button variant="outline-success" size="sm">
                        <FileEarmarkText className="me-2" /> Export
                    </Button>
                </div>
            </div>

            {recentAttendance.length > 0 ? (
                <>
                    <div className="table-responsive rounded border mb-4">
                        <Table hover className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Date</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Hours Worked</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAttendance.map((record) => (
                                    <tr key={record.id}>
                                        <td>
                                            {formatDate(
                                                record.date,
                                                "MMM DD, YYYY"
                                            )}
                                        </td>
                                        <td>{record.check_in || "—"}</td>
                                        <td>{record.check_out || "—"}</td>
                                        <td>{record.hours_worked || "—"}</td>
                                        <td>
                                            <StatusBadge
                                                status={record.status}
                                            />
                                        </td>
                                        <td
                                            className="text-truncate"
                                            style={{ maxWidth: "150px" }}
                                        >
                                            {record.notes || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Showing last {recentAttendance.length} records
                        </small>
                        <Button variant="outline-secondary" size="sm">
                            View Full History
                        </Button>
                    </div>
                </>
            ) : (
                <EmptyState
                    message="No attendance records available."
                    icon={<Clock size={48} />}
                />
            )}
        </div>
    );
};

/** Performance Tab */
const PerformanceTab = ({ employee }) => {
    const metrics = [
        { label: "Quality of Work", value: 85, target: 90 },
        { label: "Productivity", value: 92, target: 85 },
        { label: "Team Collaboration", value: 78, target: 80 },
        { label: "Initiative", value: 88, target: 85 },
        { label: "Punctuality", value: 95, target: 95 },
        { label: "Sales Performance", value: 89, target: 85 },
        { label: "Customer Satisfaction", value: 91, target: 90 },
        { label: "Goal Achievement", value: 87, target: 85 },
    ];

    return (
        <div>
            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 bg-light h-100">
                        <Card.Body>
                            <h6 className="fw-semibold mb-3">
                                Performance Metrics
                            </h6>
                            {metrics.map((metric, index) => (
                                <div key={index} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>{metric.label}</span>
                                        <span className="fw-bold">
                                            {metric.value}%{" "}
                                            <small className="text-muted">
                                                ({metric.target}% target)
                                            </small>
                                        </span>
                                    </div>
                                    <ProgressBar
                                        now={metric.value}
                                        max={100}
                                        variant={
                                            metric.value >= metric.target
                                                ? "success"
                                                : "warning"
                                        }
                                        style={{ height: "8px" }}
                                    />
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 bg-light h-100">
                        <Card.Body>
                            <h6 className="fw-semibold mb-3">Recent Reviews</h6>
                            {employee.reviews?.length > 0 ? (
                                employee.reviews
                                    .slice(0, 3)
                                    .map((review, index) => (
                                        <div
                                            key={index}
                                            className="mb-3 pb-3 border-bottom"
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <Badge bg="info">
                                                    {review.rating}/5
                                                </Badge>
                                                <small className="text-muted">
                                                    {formatDate(
                                                        review.date,
                                                        "MMM DD"
                                                    )}
                                                </small>
                                            </div>
                                            <p className="mb-1 small">
                                                {review.comments}
                                            </p>
                                            <small className="text-muted">
                                                — {review.reviewer}
                                            </small>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-muted text-center py-3">
                                    No reviews available
                                </p>
                            )}
                            <Button
                                variant="outline-primary"
                                className="w-100 mt-2"
                            >
                                View All Reviews
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

/** Documents Tab */
const DocumentsTab = ({ employee }) => (
    <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-semibold mb-0">Employee Documents</h6>
            <Button variant="outline-success" size="sm">
                <FileEarmarkText className="me-2" /> Upload Document
            </Button>
        </div>

        <Row className="g-3">
            {[
                {
                    name: "Employment Contract",
                    date: employee.hire_date,
                    type: "contract",
                    category: "Employment",
                },
                {
                    name: "ID Verification",
                    date: employee.created_at,
                    type: "id",
                    category: "Identity",
                },
                {
                    name: "Tax Forms",
                    date: employee.created_at,
                    type: "tax",
                    category: "Financial",
                },
                {
                    name: "Performance Reviews",
                    date: employee.updated_at,
                    type: "review",
                    category: "Performance",
                },
                {
                    name: "Certifications",
                    date: employee.updated_at,
                    type: "certificate",
                    category: "Qualifications",
                },
                {
                    name: "Training Records",
                    date: employee.updated_at,
                    type: "training",
                    category: "Development",
                },
                {
                    name: "Salary Slips",
                    date: employee.updated_at,
                    type: "payslip",
                    category: "Financial",
                },
                {
                    name: "Bank Details",
                    date: employee.updated_at,
                    type: "bank",
                    category: "Financial",
                },
            ].map((doc, index) => (
                <Col md={6} lg={4} key={index}>
                    <Card className="h-100 border">
                        <Card.Body className="d-flex align-items-center">
                            <div className="bg-light rounded p-3 me-3">
                                <FileEarmarkText
                                    size={24}
                                    className="text-primary"
                                />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="mb-1">{doc.name}</h6>
                                <small className="text-muted d-block">
                                    {doc.category}
                                </small>
                                <small className="text-muted">
                                    Updated:{" "}
                                    {formatDate(doc.date, "MMM DD, YYYY")}
                                </small>
                            </div>
                            <Button variant="outline-primary" size="sm">
                                <Eye size={14} />
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    </div>
);

/** =============== REUSABLE COMPONENTS =============== */

const SectionTitle = ({ icon, title }) => (
    <h6 className="fw-semibold mb-3 text-primary d-flex align-items-center">
        {icon} <span className="ms-2">{title}</span>
    </h6>
);

const ContactItem = ({ icon, label, value, fallback, action, badgeColor }) => (
    <ListGroup.Item className="d-flex align-items-center px-0 py-2 border-bottom">
        <span className="text-primary me-3 flex-shrink-0">{icon}</span>
        <div className="flex-grow-1">
            <small className="text-muted d-block">{label}</small>
            {action ? (
                <a href={action} className="text-decoration-none">
                    {value || fallback}
                </a>
            ) : badgeColor ? (
                <Badge bg={badgeColor} className="text-capitalize">
                    {value || fallback}
                </Badge>
            ) : (
                <span className={!value ? "text-muted" : ""}>
                    {value || fallback}
                </span>
            )}
        </div>
    </ListGroup.Item>
);

const InfoRow = ({
    label,
    value,
    badgeColor,
    isCurrency = false,
    isPositive = true,
    isCode = false,
    icon,
}) => (
    <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-muted d-flex align-items-center">
            {icon && <span className="me-2">{icon}</span>}
            {label}
        </span>
        {badgeColor ? (
            <Badge bg={badgeColor} className="fs-6">
                {value}
            </Badge>
        ) : isCode ? (
            <code className="text-primary">{value}</code>
        ) : isCurrency ? (
            <span
                className={`fw-bold ${
                    isPositive ? "text-success" : "text-danger"
                }`}
            >
                {value}
            </span>
        ) : (
            <span className="fw-bold">{value}</span>
        )}
    </div>
);

const InfoItem = ({ label, value, fallback = "—", isHighlight = false }) => (
    <ListGroup.Item className="px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
        <span className="text-muted">{label}</span>
        <span
            className={`fw-semibold text-end ${
                isHighlight ? "text-primary" : ""
            }`}
        >
            {value || fallback}
        </span>
    </ListGroup.Item>
);

const ActionButton = ({
    icon,
    label,
    variant,
    onClick,
    badge,
    disabled = false,
}) => (
    <Button
        variant={variant}
        className="rounded-pill text-start d-flex align-items-center justify-content-between"
        onClick={onClick}
        disabled={disabled}
    >
        <span>
            {icon} <span className="ms-2">{label}</span>
        </span>
        {badge && (
            <Badge bg="light" text="dark" pill>
                {badge}
            </Badge>
        )}
    </Button>
);

const InfoCard = ({ title, icon, items }) => (
    <Card className="border-0 bg-light h-100">
        <Card.Body>
            <SectionTitle icon={icon} title={title} />
            <ListGroup variant="flush">
                {items.map((item, index) => (
                    <InfoItem
                        key={index}
                        label={item.label}
                        value={item.value}
                        fallback={item.fallback}
                    />
                ))}
            </ListGroup>
        </Card.Body>
    </Card>
);

const TabTable = ({ title, data, columns, emptyMessage, onSearch }) => (
    <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-semibold mb-0">{title}</h6>
            <InputGroup style={{ width: "300px" }}>
                <InputGroup.Text>
                    <Search />
                </InputGroup.Text>
                <Form.Control
                    placeholder={`Search ${title.toLowerCase()}...`}
                    onChange={(e) => onSearch && onSearch(e.target.value)}
                />
            </InputGroup>
        </div>

        {data.length > 0 ? (
            <div className="table-responsive rounded border">
                <Table hover className="mb-0">
                    <thead className="table-light">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="border-0">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.id}>
                                {columns.map((col) => (
                                    <td key={`${item.id}-${col.key}`}>
                                        {col.render
                                            ? col.render(item[col.key], item)
                                            : item[col.key] || "—"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        ) : (
            <EmptyState message={emptyMessage} icon={<Search size={48} />} />
        )}
    </div>
);

const StatusBadge = ({ status }) => {
    const statusColors = {
        active: "success",
        completed: "success",
        present: "success",
        pending: "warning",
        in_progress: "info",
        late: "warning",
        absent: "danger",
        cancelled: "danger",
        on_time: "success",
        paid: "success",
        unpaid: "danger",
        processing: "info",
    };

    return (
        <Badge bg={statusColors[status] || "secondary"} pill>
            {status?.replace("_", " ") || "Unknown"}
        </Badge>
    );
};

const EmptyState = ({ message, icon = <Search size={48} /> }) => (
    <div className="text-center py-5 bg-light rounded">
        {icon && <div className="text-muted mb-3">{icon}</div>}
        <h5 className="text-muted">{message}</h5>
    </div>
);
