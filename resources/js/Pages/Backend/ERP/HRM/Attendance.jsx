import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
    Table,
    Card,
    Button,
    ButtonGroup,
    Row,
    Col,
    Badge,
    ProgressBar,
    Alert,
    Form,
    InputGroup,
    Dropdown,
    Modal,
    Tabs,
    Tab,
    ListGroup,
    Container,
} from "react-bootstrap";
import {
    FaSync,
    FaCalendarAlt,
    FaFilePdf,
    FaFileExcel,
    FaClock,
    FaUsers,
    FaUserCheck,
    FaUserTimes,
    FaChartLine,
    FaBell,
    FaPrint,
    FaFilter,
    FaCog,
    FaQrcode,
    FaMapMarkerAlt,
    FaMobileAlt,
} from "react-icons/fa";
import {
    Clock,
    PersonCheck,
    PersonDash,
    Calendar,
    Building,
    Activity,
    Bell,
    Download,
    Upload,
    Search,
    Plus,
    Trash,
    Eye,
    Map,
    Wifi,
} from "react-bootstrap-icons";
import { toast } from "react-toastify";
import xios from "@/Utils/axios";
import { formatDate, formatCurrency, formatTime } from "@/Utils/helpers";
import ErpLayout from "@/Layouts/ErpLayout";
import { Head } from "@inertiajs/react";

export default function Attendance() {
    const [processing, setProcessing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(
        () => new Date().toISOString().split("T")[0]
    );
    const [attendanceStats, setAttendanceStats] = useState({
        totalEmployees: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        onLeaveCount: 0,
        attendanceRate: 0,
    });
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [attendanceSettings, setAttendanceSettings] = useState({
        workStartTime: "09:00",
        workEndTime: "17:00",
        lateThreshold: 15,
        earlyLeaveThreshold: 30,
        enableGeoLocation: true,
        requireReasonForAbsence: true,
        autoCalculateHours: true,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [departments, setDepartments] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [activeTab, setActiveTab] = useState("daily");
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toISOString().slice(0, 7)
    );

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    // Fetch attendance statistics
    const fetchAttendanceStats = useCallback(async () => {
        try {
            const response = await xios.get(route("attendance.stats"), {
                params: { date: selectedDate },
            });
            setAttendanceStats(response.data);
        } catch (error) {
            console.error("Failed to fetch attendance stats:", error);
        }
    }, [selectedDate]);

    // Fetch departments
    const fetchDepartments = useCallback(async () => {
        try {
            const response = await xios.get(route("departments.index"));
            setDepartments(response.data);
        } catch (error) {
            console.error("Failed to fetch departments:", error);
        }
    }, []);

    // Fetch recent activities
    const fetchRecentActivities = useCallback(async () => {
        try {
            const response = await xios.get(route("attendance.activities"));
            setRecentActivities(response.data);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        }
    }, []);

    // Calculate attendance rate
    const attendanceRate = useMemo(() => {
        if (attendanceStats.totalEmployees === 0) return 0;
        return (
            (attendanceStats.presentCount / attendanceStats.totalEmployees) *
            100
        );
    }, [attendanceStats]);

    // Mark attendance (clock in/out)
    const markAttendance = useCallback(
        async (userId, action, userName, options = {}) => {
            setProcessing(true);

            try {
                const currentTime = new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });

                // Prepare data for API
                const apiData = {
                    id: userId,
                    clockIn: action === "clockIn" ? currentTime : null,
                    clockOut: action === "clockOut" ? currentTime : null,
                    status: "present",
                    reason: options.reason,
                    notes: options.notes,
                    location: options.location,
                    device: options.device,
                };

                const response = await xios.post(route("attendance.store"), {
                    date: selectedDate,
                    attendance: [apiData],
                });

                if (response.data.success) {
                    toast.success(
                        <div>
                            <strong>{userName}</strong>{" "}
                            {action === "clockIn"
                                ? "clocked in"
                                : "clocked out"}{" "}
                            successfully
                            <br />
                            <small className="text-muted">{currentTime}</small>
                        </div>
                    );

                    // Add to recent activities
                    setRecentActivities((prev) => [
                        {
                            id: Date.now(),
                            employee_name: userName,
                            action:
                                action === "clockIn" ? "clock_in" : "clock_out",
                            time: currentTime,
                            status: "completed",
                            icon:
                                action === "clockIn" ? <Clock /> : <Activity />,
                        },
                        ...prev.slice(0, 9),
                    ]);

                    // Refresh data
                    dataTable.current?.ajax.reload(null, false);
                    fetchAttendanceStats();
                }
            } catch (error) {
                console.error("Mark attendance error:", error);
                const actionText =
                    action === "clockIn" ? "clock in" : "clock out";
                toast.error(
                    error.response?.data?.message || `Failed to ${actionText}`
                );
            } finally {
                setProcessing(false);
            }
        },
        [selectedDate, fetchAttendanceStats]
    );

    // Mark attendance with location
    const markAttendanceWithLocation = useCallback(
        async (userId, action, userName) => {
            if (!navigator.geolocation) {
                toast.warning("Geolocation is not supported by your browser");
                return markAttendance(userId, action, userName);
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    };

                    markAttendance(userId, action, userName, {
                        location: JSON.stringify(location),
                        device: navigator.userAgent,
                    });
                },
                (error) => {
                    toast.error(
                        "Unable to retrieve location. Please enable location services."
                    );
                    markAttendance(userId, action, userName);
                }
            );
        },
        [markAttendance]
    );

    // Bulk mark attendance
    const bulkMarkAttendance = useCallback(
        async (action, status = "present") => {
            if (selectedEmployees.length === 0) {
                toast.warning("Please select employees first");
                return;
            }

            setProcessing(true);

            try {
                const apiData = selectedEmployees.map((emp) => ({
                    id: emp.id,
                    clockIn: action === "clockIn" ? "09:00" : null,
                    clockOut: action === "clockOut" ? "17:00" : null,
                    status: status,
                    reason: "Bulk update",
                }));

                const response = await xios.post(route("attendance.bulk"), {
                    date: selectedDate,
                    attendance: apiData,
                });

                if (response.data.success) {
                    toast.success(
                        `${selectedEmployees.length} employees marked as ${status}`
                    );
                    setSelectedEmployees([]);
                    dataTable.current?.ajax.reload(null, false);
                    fetchAttendanceStats();
                }
            } catch (error) {
                toast.error(
                    error.response?.data?.message ||
                        "Failed to update attendance"
                );
            } finally {
                setProcessing(false);
            }
        },
        [selectedDate, selectedEmployees, fetchAttendanceStats]
    );

    // Reset attendance record
    const resetAttendance = useCallback(
        async (recordId, employeeName) => {
            const { value: reason } = await Swal.fire({
                title: `Reset ${employeeName}'s Attendance?`,
                input: "textarea",
                inputLabel: "Reason for reset",
                inputPlaceholder: "Enter reason...",
                showCancelButton: true,
                confirmButtonText: "Yes, reset it",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
            });

            if (!reason) return;

            setProcessing(true);

            try {
                const response = await xios.delete(
                    route("attendance.destroy", recordId),
                    { data: { reason } }
                );

                if (response.data.success) {
                    toast.success(
                        <div>
                            Attendance record reset successfully
                            <br />
                            <small className="text-muted">
                                Reason: {reason}
                            </small>
                        </div>
                    );
                    dataTable.current?.ajax.reload(null, false);
                    fetchAttendanceStats();
                }
            } catch (error) {
                toast.error(
                    error.response?.data?.message ||
                        "Failed to reset attendance record"
                );
            } finally {
                setProcessing(false);
            }
        },
        [fetchAttendanceStats]
    );

    // Generate QR code for attendance
    const generateQRCode = useCallback(async () => {
        setProcessing(true);
        try {
            const response = await xios.post(route("attendance.qr-generate"), {
                date: selectedDate,
                expires_in: 3600, // 1 hour
            });

            setShowQRModal(true);
            // In real implementation, you would display the QR code
            toast.success("QR Code generated successfully!");
        } catch (error) {
            toast.error("Failed to generate QR code");
        } finally {
            setProcessing(false);
        }
    }, [selectedDate]);

    // Export attendance data
    const exportAttendance = useCallback(
        async (format) => {
            setProcessing(true);
            try {
                const response = await xios.get(route("attendance.export"), {
                    params: {
                        date: selectedDate,
                        format: format,
                        department:
                            departmentFilter !== "all"
                                ? departmentFilter
                                : null,
                    },
                    responseType: "blob",
                });

                const url = window.URL.createObjectURL(
                    new Blob([response.data])
                );
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute(
                    "download",
                    `attendance-${selectedDate}-${format}.${
                        format === "pdf" ? "pdf" : "xlsx"
                    }`
                );
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                toast.success(
                    `Attendance exported as ${format.toUpperCase()} successfully!`
                );
            } catch (error) {
                toast.error(`Failed to export as ${format.toUpperCase()}`);
            } finally {
                setProcessing(false);
            }
        },
        [selectedDate, departmentFilter]
    );

    // Initialize DataTable for attendance records
    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#attendanceRegisterTable")) {
            $("#attendanceRegisterTable").DataTable().destroy();
        }

        const dt = $("#attendanceRegisterTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("attendance.index"),
                type: "GET",
                data: {
                    date: selectedDate,
                    search: searchTerm,
                    department:
                        departmentFilter !== "all" ? departmentFilter : null,
                },
            },
            columns: [
                {
                    data: null,
                    orderable: false,
                    className: "text-center",
                    render: function (data) {
                        return `
                            <div class="form-check">
                                <input class="form-check-input employee-checkbox" type="checkbox" 
                                       data-id="${data.id}" data-name="${data.name}">
                            </div>
                        `;
                    },
                },
                {
                    data: "name",
                    name: "name",
                    title: "Employee",
                    className: "text-start",
                    render: function (data, type, row) {
                        return `
                            <div class="d-flex align-items-center">
                                <div class="avatar-sm me-2">
                                    <div class="avatar-title bg-primary bg-opacity-10 rounded-circle">
                                        <i class="bi bi-person fs-5 text-primary"></i>
                                    </div>
                                </div>
                                <div>
                                    <h6 class="mb-0">${data}</h6>
                                    <small class="text-muted">${
                                        row.employee_id || ""
                                    }</small>
                                </div>
                            </div>
                        `;
                    },
                },
                {
                    data: "department.name",
                    name: "department.name",
                    title: "Department",
                    className: "text-start",
                    render: function (data) {
                        if (!data) return "-";
                        const colors = {
                            Sales: "primary",
                            Marketing: "info",
                            Engineering: "warning",
                            HR: "success",
                            Finance: "danger",
                            Operations: "secondary",
                        };
                        const color = colors[data] || "secondary";
                        return `<span class="badge bg-${color}">${data}</span>`;
                    },
                },
                {
                    data: "clockin",
                    name: "clockin",
                    title: "Clock In",
                    className: "text-center",
                    render: function (data) {
                        if (!data)
                            return `
                            <button class="btn btn-sm btn-outline-success clock-in-btn"
                                    data-id="${this.id}" data-name="${this.name}">
                                <i class="bi bi-clock"></i> Clock In
                            </button>
                        `;
                        return `
                            <div>
                                <span class="badge bg-success">${data}</span>
                                ${
                                    this.late
                                        ? '<small class="text-danger ms-1"><i class="bi bi-exclamation-circle"></i> Late</small>'
                                        : ""
                                }
                            </div>
                        `;
                    },
                },
                {
                    data: "clockout",
                    name: "clockout",
                    title: "Clock Out",
                    className: "text-center",
                    render: function (data) {
                        if (!data && this.clockin)
                            return `
                            <button class="btn btn-sm btn-outline-danger clock-out-btn" 
                                    data-id="${this.id}" data-name="${this.name}">
                                <i class="bi bi-clock"></i> Clock Out
                            </button>
                        `;
                        return data
                            ? `<span class="badge bg-danger">${data}</span>`
                            : "-";
                    },
                },
                {
                    data: "status",
                    name: "status",
                    title: "Status",
                    className: "text-center",
                    render: function (data) {
                        const statusConfig = {
                            present: {
                                color: "success",
                                icon: "check-circle",
                                label: "Present",
                            },
                            absent: {
                                color: "danger",
                                icon: "x-circle",
                                label: "Absent",
                            },
                            late: {
                                color: "warning",
                                icon: "clock-history",
                                label: "Late",
                            },
                            on_leave: {
                                color: "info",
                                icon: "calendar3",
                                label: "On Leave",
                            },
                            half_day: {
                                color: "secondary",
                                icon: "clock-half",
                                label: "Half Day",
                            },
                        };
                        const config = statusConfig[data] || {
                            color: "secondary",
                            icon: "question-circle",
                            label: "Unknown",
                        };
                        return `
                            <span class="badge bg-${config.color}">
                                <i class="bi bi-${config.icon} me-1"></i>${config.label}
                            </span>
                        `;
                    },
                },
                {
                    data: "hours_worked",
                    name: "hours_worked",
                    title: "Hours",
                    className: "text-center",
                    render: function (data) {
                        if (!data) return "-";
                        return `
                            <div class="progress" style="height: 6px; width: 80px;">
                                <div class="progress-bar bg-success" role="progressbar" 
                                     style="width: ${Math.min(
                                         100,
                                         (parseFloat(data) / 8) * 100
                                     )}%">
                                </div>
                            </div>
                            <small>${data}h</small>
                        `;
                    },
                },
                {
                    data: "id",
                    name: "actions",
                    title: "Actions",
                    orderable: false,
                    className: "text-center",
                    render: function (data, type, row) {
                        return `
                            <div class="btn-group btn-group-sm" role="group">
                                <button type="button" class="btn btn-outline-primary view-btn" 
                                        data-id="${data}" title="View Details">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button type="button" class="btn btn-outline-warning edit-btn" 
                                        data-id="${data}" title="Edit">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="btn btn-outline-danger reset-btn" 
                                        data-id="${data}" data-name="${row.name}" title="Reset">
                                    <i class="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                        `;
                    },
                },
            ],
            language: {
                emptyTable: "No attendance records found for selected date",
                search: "Filter employees:",
                searchPlaceholder: "By name, department, or status...",
            },
            select: {
                style: "multi",
                selector: "td:first-child",
            },
            createdRow: function (row, data, dataIndex) {
                if (data.late) {
                    $(row).addClass("table-warning");
                }
                if (data.status === "absent") {
                    $(row).addClass("table-danger");
                }
            },
        });

        // Event delegation
        $(dt.table().body())
            .on("change", ".employee-checkbox", function () {
                const id = $(this).data("id");
                const name = $(this).data("name");
                const isChecked = $(this).is(":checked");

                setSelectedEmployees((prev) => {
                    if (isChecked) {
                        return [...prev, { id, name }];
                    } else {
                        return prev.filter((emp) => emp.id !== id);
                    }
                });
            })
            .on("click", ".clock-in-btn", function () {
                const userId = $(this).data("id");
                const userName = $(this).data("name");
                Swal.fire({
                    title: `Clock In ${userName}?`,
                    text: "Add notes (optional):",
                    input: "textarea",
                    inputPlaceholder: "Enter notes...",
                    showCancelButton: true,
                    confirmButtonText: "Clock In",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#3085d6",
                }).then((result) => {
                    if (result.isConfirmed) {
                        markAttendanceWithLocation(
                            userId,
                            "clockIn",
                            userName,
                            {
                                notes: result.value,
                            }
                        );
                    }
                });
            })
            .on("click", ".clock-out-btn", function () {
                const userId = $(this).data("id");
                const userName = $(this).data("name");
                markAttendanceWithLocation(userId, "clockOut", userName);
            })
            .on("click", ".reset-btn", function () {
                const recordId = $(this).data("id");
                const employeeName = $(this).data("name");
                resetAttendance(recordId, employeeName);
            })
            .on("click", ".view-btn", function () {
                const recordId = $(this).data("id");
                // Implement view details modal
                toast.info(`Viewing attendance record ${recordId}`);
            })
            .on("click", ".edit-btn", function () {
                const recordId = $(this).data("id");
                // Implement edit modal
                toast.info(`Editing attendance record ${recordId}`);
            });

        // Select all checkbox
        $("#selectAllEmployees").on("change", function () {
            const isChecked = $(this).is(":checked");
            $(".employee-checkbox")
                .prop("checked", isChecked)
                .trigger("change");
        });

        dataTableInitialized.current = true;
        dataTable.current = dt;
    }, [
        selectedDate,
        searchTerm,
        departmentFilter,
        markAttendanceWithLocation,
        resetAttendance,
    ]);

    // Handle date change
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    // Handle month change
    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
        setActiveTab("monthly");
    };

    // Initialize DataTable
    useEffect(() => {
        initializeDataTable();
        fetchAttendanceStats();
        fetchDepartments();
        fetchRecentActivities();

        return () => {
            if ($.fn.DataTable.isDataTable("#attendanceRegisterTable")) {
                $("#attendanceRegisterTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [
        initializeDataTable,
        fetchAttendanceStats,
        fetchDepartments,
        fetchRecentActivities,
    ]);

    // Refresh DataTable when filters change
    useEffect(() => {
        if (dataTableInitialized.current && dataTable.current) {
            dataTable.current.ajax.reload();
        }
    }, [selectedDate, searchTerm, departmentFilter]);

    const refreshData = () => {
        if (dataTable.current) {
            dataTable.current.ajax.reload();
        }
        fetchAttendanceStats();
        fetchRecentActivities();
    };

    // Quick actions
    const quickActions = [
        {
            icon: <FaClock />,
            label: "Mark All Present",
            variant: "success",
            onClick: () => bulkMarkAttendance("clockIn", "present"),
        },
        {
            icon: <FaUserTimes />,
            label: "Mark All Absent",
            variant: "danger",
            onClick: () => bulkMarkAttendance("clockIn", "absent"),
        },
        {
            icon: <FaQrcode />,
            label: "Generate QR",
            variant: "info",
            onClick: generateQRCode,
        },
        {
            icon: <FaMapMarkerAlt />,
            label: "Location Check",
            variant: "warning",
            onClick: () => setShowLocationModal(true),
        },
        {
            icon: <FaBell />,
            label: "Send Reminder",
            variant: "primary",
            onClick: () => toast.info("Reminder sent to absent employees"),
        },
    ];

    return (
        <ErpLayout>
            <Head title="Attendance Management" />

            <Container fluid>
                {/* Header with Stats */}
                <Row className="mb-4">
                    <Col xl={12}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h3 className="fw-bold text-primary">
                                    Attendance Management
                                </h3>
                                <p className="text-muted mb-0">
                                    Track and manage employee attendance in
                                    real-time
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => setShowSettingsModal(true)}
                                >
                                    <FaCog className="me-2" /> Settings
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() =>
                                        toast.info("Adding new attendance rule")
                                    }
                                >
                                    <Plus className="me-2" /> Add Rule
                                </Button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <Row className="g-3">
                            <Col xs={6} md={4} lg={2}>
                                <Card className="border-0 bg-primary bg-opacity-10">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-1">
                                                    Total
                                                </h6>
                                                <h4 className="fw-bold mb-0">
                                                    {
                                                        attendanceStats.totalEmployees
                                                    }
                                                </h4>
                                            </div>
                                            <FaUsers
                                                size={24}
                                                className="text-primary"
                                            />
                                        </div>
                                        <small className="text-muted">
                                            Employees
                                        </small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={6} md={4} lg={2}>
                                <Card className="border-0 bg-success bg-opacity-10">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-1">
                                                    Present
                                                </h6>
                                                <h4 className="fw-bold mb-0">
                                                    {
                                                        attendanceStats.presentCount
                                                    }
                                                </h4>
                                            </div>
                                            <FaUserCheck
                                                size={24}
                                                className="text-success"
                                            />
                                        </div>
                                        <small className="text-muted">
                                            {attendanceStats.presentCount > 0
                                                ? `${(
                                                      (attendanceStats.presentCount /
                                                          attendanceStats.totalEmployees) *
                                                      100
                                                  ).toFixed(1)}%`
                                                : "0%"}
                                        </small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={6} md={4} lg={2}>
                                <Card className="border-0 bg-danger bg-opacity-10">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-1">
                                                    Absent
                                                </h6>
                                                <h4 className="fw-bold mb-0">
                                                    {
                                                        attendanceStats.absentCount
                                                    }
                                                </h4>
                                            </div>
                                            <FaUserTimes
                                                size={24}
                                                className="text-danger"
                                            />
                                        </div>
                                        <small className="text-muted">
                                            {attendanceStats.absentCount > 0
                                                ? `${(
                                                      (attendanceStats.absentCount /
                                                          attendanceStats.totalEmployees) *
                                                      100
                                                  ).toFixed(1)}%`
                                                : "0%"}
                                        </small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={6} md={4} lg={2}>
                                <Card className="border-0 bg-warning bg-opacity-10">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-1">
                                                    Late
                                                </h6>
                                                <h4 className="fw-bold mb-0">
                                                    {attendanceStats.lateCount}
                                                </h4>
                                            </div>
                                            <FaClock
                                                size={24}
                                                className="text-warning"
                                            />
                                        </div>
                                        <small className="text-muted">
                                            Arrivals
                                        </small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={6} md={4} lg={2}>
                                <Card className="border-0 bg-info bg-opacity-10">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-1">
                                                    On Leave
                                                </h6>
                                                <h4 className="fw-bold mb-0">
                                                    {
                                                        attendanceStats.onLeaveCount
                                                    }
                                                </h4>
                                            </div>
                                            <Calendar
                                                size={24}
                                                className="text-info"
                                            />
                                        </div>
                                        <small className="text-muted">
                                            Approved
                                        </small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={6} md={4} lg={2}>
                                <Card className="border-0 bg-purple bg-opacity-10">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-1">
                                                    Attendance Rate
                                                </h6>
                                                <h4 className="fw-bold mb-0">
                                                    {attendanceRate.toFixed(1)}%
                                                </h4>
                                            </div>
                                            <FaChartLine
                                                size={24}
                                                className="text-purple"
                                            />
                                        </div>
                                        <ProgressBar
                                            now={attendanceRate}
                                            variant={
                                                attendanceRate >= 90
                                                    ? "success"
                                                    : attendanceRate >= 70
                                                    ? "warning"
                                                    : "danger"
                                            }
                                            style={{ height: "4px" }}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Main Content */}
                <Row>
                    {/* Left Column - Main Table */}
                    <Col xl={9} lg={8}>
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="d-flex justify-content-between align-items-center bg-transparent py-3">
                                <div className="d-flex align-items-center gap-3">
                                    <h6 className="mb-0 fw-semibold">
                                        Daily Attendance Register
                                    </h6>
                                    <Badge
                                        bg="light"
                                        text="dark"
                                        className="border"
                                    >
                                        {formatDate(
                                            selectedDate,
                                            "DD MMM, YYYY"
                                        )}
                                    </Badge>
                                    {selectedEmployees.length > 0 && (
                                        <Badge bg="primary" pill>
                                            {selectedEmployees.length} selected
                                        </Badge>
                                    )}
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    {/* Date Selection */}
                                    <InputGroup style={{ width: "200px" }}>
                                        <InputGroup.Text>
                                            <FaCalendarAlt />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            disabled={processing}
                                        />
                                    </InputGroup>

                                    {/* Action Buttons */}
                                    <ButtonGroup>
                                        <Dropdown>
                                            <Dropdown.Toggle
                                                variant="outline-success"
                                                id="export-dropdown"
                                            >
                                                <Download /> Export
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        exportAttendance("pdf")
                                                    }
                                                >
                                                    <FaFilePdf className="me-2 text-danger" />{" "}
                                                    PDF Report
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        exportAttendance(
                                                            "excel"
                                                        )
                                                    }
                                                >
                                                    <FaFileExcel className="me-2 text-success" />{" "}
                                                    Excel Sheet
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        toast.info(
                                                            "Printing..."
                                                        )
                                                    }
                                                >
                                                    <FaPrint className="me-2 text-secondary" />{" "}
                                                    Print
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </ButtonGroup>
                                </div>
                            </Card.Header>

                            <Card.Body className="p-0">
                                {/* Filters */}
                                <div className="p-3 border-bottom bg-light">
                                    <Row className="g-2">
                                        <Col md={6}>
                                            <InputGroup>
                                                <InputGroup.Text>
                                                    <Search />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    placeholder="Search employees..."
                                                    value={searchTerm}
                                                    onChange={(e) =>
                                                        setSearchTerm(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <Button variant="outline-secondary">
                                                    <FaFilter />
                                                </Button>
                                            </InputGroup>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Select
                                                value={departmentFilter}
                                                onChange={(e) =>
                                                    setDepartmentFilter(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="all">
                                                    All Departments
                                                </option>
                                                {departments.map((dept) => (
                                                    <option
                                                        key={dept.id}
                                                        value={dept.id}
                                                    >
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Check
                                                type="switch"
                                                id="selectAllEmployees"
                                                label="Select All"
                                                className="pt-2"
                                            />
                                        </Col>
                                    </Row>
                                </div>

                                {/* Quick Actions Bar */}
                                {selectedEmployees.length > 0 && (
                                    <Alert variant="info" className="m-3 py-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>
                                                <strong>
                                                    {selectedEmployees.length}
                                                </strong>{" "}
                                                employees selected
                                            </span>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() =>
                                                        bulkMarkAttendance(
                                                            "clockIn",
                                                            "present"
                                                        )
                                                    }
                                                >
                                                    <PersonCheck className="me-1" />{" "}
                                                    Mark Present
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        bulkMarkAttendance(
                                                            "clockIn",
                                                            "absent"
                                                        )
                                                    }
                                                >
                                                    <PersonDash className="me-1" />{" "}
                                                    Mark Absent
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() =>
                                                        setSelectedEmployees([])
                                                    }
                                                >
                                                    <Trash className="me-1" />{" "}
                                                    Clear
                                                </Button>
                                            </div>
                                        </div>
                                    </Alert>
                                )}

                                {/* Quick Actions */}
                                <div className="p-3 border-bottom">
                                    <div className="d-flex flex-wrap gap-2">
                                        {quickActions.map((action, index) => (
                                            <Button
                                                key={index}
                                                variant={action.variant}
                                                size="sm"
                                                className="d-flex align-items-center"
                                                onClick={action.onClick}
                                                disabled={processing}
                                            >
                                                {action.icon}
                                                <span className="ms-2">
                                                    {action.label}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Attendance Table */}
                                <div className="table-responsive">
                                    <Table
                                        bordered
                                        hover
                                        responsive
                                        id="attendanceRegisterTable"
                                        className="m-0 align-middle"
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column - Quick Actions & Recent Activity */}
                    <Col xl={3} lg={4}>
                        {/* Quick Stats */}
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Body>
                                <h6 className="fw-semibold mb-3">
                                    <Activity className="me-2" /> Today's
                                    Summary
                                </h6>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
                                        <span className="text-muted">
                                            Expected
                                        </span>
                                        <Badge bg="light" text="dark">
                                            {attendanceStats.totalEmployees}
                                        </Badge>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
                                        <span className="text-muted">
                                            Checked In
                                        </span>
                                        <Badge bg="success">
                                            {attendanceStats.presentCount}
                                        </Badge>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
                                        <span className="text-muted">
                                            Pending
                                        </span>
                                        <Badge bg="warning">
                                            {attendanceStats.totalEmployees -
                                                attendanceStats.presentCount}
                                        </Badge>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
                                        <span className="text-muted">
                                            Late Arrivals
                                        </span>
                                        <Badge bg="danger">
                                            {attendanceStats.lateCount}
                                        </Badge>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card.Body>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Body>
                                <h6 className="fw-semibold mb-3">
                                    <Bell className="me-2" /> Recent Activity
                                </h6>
                                <div
                                    style={{
                                        maxHeight: "300px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {recentActivities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="d-flex align-items-start mb-3"
                                        >
                                            <div className="avatar-sm me-3">
                                                <div
                                                    className={`avatar-title rounded-circle bg-${
                                                        activity.status ===
                                                        "completed"
                                                            ? "success"
                                                            : "warning"
                                                    }-subtle`}
                                                >
                                                    {activity.icon}
                                                </div>
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="mb-0 fs-14">
                                                    {activity.employee_name}
                                                </h6>
                                                <p className="text-muted mb-0 fs-12">
                                                    {activity.action ===
                                                    "clock_in"
                                                        ? "Clocked in at"
                                                        : "Clocked out at"}{" "}
                                                    {activity.time}
                                                </p>
                                                <small className="text-muted">
                                                    {formatDate(
                                                        activity.created_at,
                                                        "hh:mm A"
                                                    )}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                    {recentActivities.length === 0 && (
                                        <p className="text-muted text-center py-3">
                                            No recent activity
                                        </p>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Mobile Check-in */}
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <h6 className="fw-semibold mb-3">
                                    <FaMobileAlt className="me-2" /> Mobile
                                    Check-in
                                </h6>
                                <div className="text-center">
                                    <div className="bg-light rounded p-4 mb-3">
                                        <FaQrcode
                                            size={48}
                                            className="text-primary mb-2"
                                        />
                                        <p className="text-muted mb-2">
                                            Scan QR code to check-in
                                        </p>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={generateQRCode}
                                        >
                                            Generate QR Code
                                        </Button>
                                    </div>
                                    <small className="text-muted">
                                        Employees can scan QR code or use mobile
                                        app to check-in
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Modals */}
                <SettingsModal
                    show={showSettingsModal}
                    onHide={() => setShowSettingsModal(false)}
                    settings={attendanceSettings}
                    onSave={(newSettings) => {
                        setAttendanceSettings(newSettings);
                        toast.success("Attendance settings updated!");
                    }}
                />

                <QRCodeModal
                    show={showQRModal}
                    onHide={() => setShowQRModal(false)}
                    date={selectedDate}
                />

                <LocationModal
                    show={showLocationModal}
                    onHide={() => setShowLocationModal(false)}
                />
            </Container>
        </ErpLayout>
    );
}

/** Settings Modal */
const SettingsModal = ({ show, onHide, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleSave = () => {
        onSave(localSettings);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Attendance Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey="general" className="mb-3">
                    <Tab eventKey="general" title="General">
                        <Form>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Work Start Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={localSettings.workStartTime}
                                            onChange={(e) =>
                                                setLocalSettings({
                                                    ...localSettings,
                                                    workStartTime:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Work End Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={localSettings.workEndTime}
                                            onChange={(e) =>
                                                setLocalSettings({
                                                    ...localSettings,
                                                    workEndTime: e.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Late Threshold (minutes)
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={localSettings.lateThreshold}
                                            onChange={(e) =>
                                                setLocalSettings({
                                                    ...localSettings,
                                                    lateThreshold: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Early Leave Threshold (minutes)
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={
                                                localSettings.earlyLeaveThreshold
                                            }
                                            onChange={(e) =>
                                                setLocalSettings({
                                                    ...localSettings,
                                                    earlyLeaveThreshold:
                                                        parseInt(
                                                            e.target.value
                                                        ),
                                                })
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Tab>
                    <Tab eventKey="advanced" title="Advanced">
                        <Form>
                            <Form.Check
                                type="switch"
                                id="enable-geo"
                                label="Enable Geolocation Tracking"
                                checked={localSettings.enableGeoLocation}
                                onChange={(e) =>
                                    setLocalSettings({
                                        ...localSettings,
                                        enableGeoLocation: e.target.checked,
                                    })
                                }
                                className="mb-3"
                            />
                            <Form.Check
                                type="switch"
                                id="require-reason"
                                label="Require Reason for Absence"
                                checked={localSettings.requireReasonForAbsence}
                                onChange={(e) =>
                                    setLocalSettings({
                                        ...localSettings,
                                        requireReasonForAbsence:
                                            e.target.checked,
                                    })
                                }
                                className="mb-3"
                            />
                            <Form.Check
                                type="switch"
                                id="auto-calculate"
                                label="Auto-calculate Work Hours"
                                checked={localSettings.autoCalculateHours}
                                onChange={(e) =>
                                    setLocalSettings({
                                        ...localSettings,
                                        autoCalculateHours: e.target.checked,
                                    })
                                }
                                className="mb-3"
                            />
                        </Form>
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

/** QR Code Modal */
const QRCodeModal = ({ show, onHide, date }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
            <Modal.Title>Attendance QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
            <div className="bg-light p-4 rounded mb-3">
                {/* QR Code would be rendered here */}
                <div className="qr-placeholder bg-white p-4 d-inline-block">
                    <div
                        style={{
                            width: "200px",
                            height: "200px",
                            background:
                                "linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%, #f3f3f3), linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%, #f3f3f3)",
                            backgroundSize: "40px 40px",
                            backgroundPosition: "0 0, 20px 20px",
                        }}
                    />
                </div>
            </div>
            <p className="text-muted mb-2">Scan this QR code to check-in</p>
            <small className="text-muted d-block mb-2">
                Valid for: {formatDate(date, "DD MMM, YYYY")}
            </small>
            <small className="text-muted">Expires in: 1 hour</small>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
            <Button
                variant="primary"
                onClick={() => toast.info("QR code downloaded")}
            >
                <Download className="me-2" /> Download QR
            </Button>
            <Button
                variant="outline-primary"
                onClick={() => toast.info("QR code shared")}
            >
                Share
            </Button>
        </Modal.Footer>
    </Modal>
);

/** Location Modal */
const LocationModal = ({ show, onHide }) => (
    <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
            <Modal.Title>Location-Based Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="text-center mb-4">
                <Map size={48} className="text-primary mb-3" />
                <h5>Enable Location Services</h5>
                <p className="text-muted">
                    Allow location access for accurate attendance tracking.
                    Employees must be within company premises to check-in.
                </p>
            </div>

            <Alert variant="info">
                <FaMapMarkerAlt className="me-2" />
                <strong>Current Location:</strong>
                <div className="mt-2">
                    <small>Latitude: 40.7128° N</small>
                    <br />
                    <small>Longitude: 74.0060° W</small>
                    <br />
                    <small>Accuracy: ±10 meters</small>
                </div>
            </Alert>

            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Allowed Radius (meters)</Form.Label>
                    <Form.Range min="10" max="500" defaultValue="100" />
                    <small className="text-muted">
                        100m radius from office center
                    </small>
                </Form.Group>

                <Form.Check
                    type="switch"
                    id="enable-wifi"
                    label="Require Company WiFi"
                    className="mb-3"
                />
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={() => {
                    toast.success("Location settings updated!");
                    onHide();
                }}
            >
                Save Settings
            </Button>
        </Modal.Footer>
    </Modal>
);
