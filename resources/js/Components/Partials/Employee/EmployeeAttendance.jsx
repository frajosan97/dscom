import { useCallback, useEffect, useRef, useState } from "react";
import { Table, Card, Button, ButtonGroup } from "react-bootstrap";
import { FaSync, FaCalendarAlt, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import xios from "@/Utils/axios";

export default function EmployeeAttendance() {
    const [processing, setProcessing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(
        () => new Date().toISOString().split("T")[0]
    );
    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    // Mark attendance (clock in/out)
    const markAttendance = useCallback(
        async (userId, action, userName) => {
            setProcessing(true);

            try {
                const currentTime = new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });

                // Prepare data for API
                const apiData = [
                    {
                        id: userId,
                        clockIn: action === "clockIn" ? currentTime : null,
                        clockOut: action === "clockOut" ? currentTime : null,
                        status: "present",
                    },
                ];

                const response = await xios.post(route("attendance.store"), {
                    date: selectedDate,
                    attendance: apiData,
                });

                if (response.data.success) {
                    toast.success(
                        `${userName} ${
                            action === "clockIn" ? "clocked in" : "clocked out"
                        } successfully`
                    );
                    // Refresh the DataTable
                    dataTable.current?.ajax.reload(null, false);
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
        [selectedDate]
    );

    // Reset attendance record
    const resetAttendance = useCallback(async (recordId) => {
        if (
            !confirm("Are you sure you want to reset this attendance record?")
        ) {
            return;
        }

        setProcessing(true);

        try {
            const response = await xios.delete(
                route("attendance.destroy", recordId)
            );

            if (response.data.success) {
                toast.success("Attendance record reset successfully");
                // Refresh the DataTable
                dataTable.current?.ajax.reload(null, false);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to reset attendance record"
            );
        } finally {
            setProcessing(false);
        }
    }, []);

    // Initialize DataTable for attendance records
    const initializeDataTable = useCallback(() => {
        // Prevent multiple initializations
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
                data: { date: selectedDate },
            },
            columns: [
                {
                    data: "name",
                    name: "name",
                    title: "Employee",
                    className: "text-start",
                },
                {
                    data: "department.name",
                    name: "department.name",
                    title: "Department",
                    className: "text-start",
                },
                {
                    data: "clockin",
                    name: "clockin",
                    title: "Clock In",
                    className: "text-start",
                },
                {
                    data: "clockout",
                    name: "clockout",
                    title: "Clock Out",
                    className: "text-start",
                },
                {
                    data: "status",
                    name: "status",
                    title: "Status",
                    className: "text-start",
                },
            ],
            language: {
                emptyTable: "No attendance records found for selected date",
                search: "Filter employees:",
                searchPlaceholder: "By name or department...",
            },
        });

        // Event delegation for better performance
        $(dt.table().body()).on("click", ".clock-in-btn", function () {
            const userId = $(this).data("id");
            const userName = $(this).data("name");
            markAttendance(userId, "clockIn", userName);
        });

        $(dt.table().body()).on("click", ".clock-out-btn", function () {
            const userId = $(this).data("id");
            const userName = $(this).data("name");
            markAttendance(userId, "clockOut", userName);
        });

        $(dt.table().body()).on("click", ".reset-btn", function () {
            const recordId = $(this).data("id");
            resetAttendance(recordId);
        });

        dataTableInitialized.current = true;
        dataTable.current = dt;
    }, [selectedDate, markAttendance, resetAttendance]);

    // Handle date change
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    // Initialize DataTable
    useEffect(() => {
        initializeDataTable();

        return () => {
            // Cleanup DataTable when component unmounts
            if ($.fn.DataTable.isDataTable("#attendanceRegisterTable")) {
                $("#attendanceRegisterTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    // Refresh DataTable when date changes
    useEffect(() => {
        if (dataTableInitialized.current && dataTable.current) {
            dataTable.current.ajax.reload();
        }
    }, [selectedDate]);

    const refreshData = () => {
        if (dataTable.current) {
            dataTable.current.ajax.reload();
        }
    };

    return (
        <Card className="border-0 rounded-0 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-transparent py-2">
                <h6 className="mb-0 fw-semibold">Attendance Register</h6>
                <div className="d-flex justify-content-end align-items-center gap-2">
                    <div
                        className="input-group input-group-sm me-2"
                        style={{ width: "200px" }}
                    >
                        <span className="input-group-text">
                            <FaCalendarAlt />
                        </span>
                        <input
                            type="date"
                            className="form-control"
                            value={selectedDate}
                            onChange={handleDateChange}
                            disabled={processing}
                        />
                    </div>
                    <ButtonGroup className="gap-2">
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-1"
                            onClick={refreshData}
                            disabled={processing}
                            title="Refresh data"
                        >
                            <FaSync className={processing ? "spinning" : ""} />
                        </Button>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-1"
                            title="Export to PDF"
                        >
                            <FaFilePdf />
                        </Button>
                        <Button
                            variant="outline-success"
                            size="sm"
                            className="rounded-1"
                            title="Export to Excel"
                        >
                            <FaFileExcel />
                        </Button>
                    </ButtonGroup>
                </div>
            </Card.Header>
            <Card.Body className="p-0">
                <Table
                    size="sm"
                    bordered
                    hover
                    striped
                    responsive
                    id="attendanceRegisterTable"
                    className="m-0 align-middle"
                />
            </Card.Body>
        </Card>
    );
}
