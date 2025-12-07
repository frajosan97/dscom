import React, { useCallback, useEffect, useRef, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    ButtonGroup,
    Table,
    InputGroup,
    Form,
    Badge,
    Modal,
    Dropdown,
} from "react-bootstrap";
import {
    BiDollar,
    BiCalculator,
    BiFile,
    BiDownload,
    BiPrinter,
    BiRefresh,
    BiSearch,
    BiFilter,
    BiPlus,
    BiEdit,
    BiTrash,
    BiShow,
    BiCalendar,
    BiUser,
    BiChevronDown,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";
import useData from "@/Hooks/useData";

export default function Salary() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [monthFilter, setMonthFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState(
        new Date().getFullYear().toString()
    );
    const [showModal, setShowModal] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const { employees } = useData();
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        employee_id: "",
        month: new Date().toLocaleString("default", { month: "long" }),
        year: new Date().getFullYear(),
        basic_salary: 0,
        allowances: 0,
        deductions: 0,
        overtime_hours: 0,
        overtime_rate: 0,
        bonus: 0,
        tax: 0,
        insurance: 0,
        other_allowances: 0,
        other_deductions: 0,
        status: "pending",
        payment_date: "",
        notes: "",
    });
    const [netSalary, setNetSalary] = useState(0);

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    // Calculate net salary
    const calculateNetSalary = useCallback(() => {
        const basic = parseFloat(formData.basic_salary) || 0;
        const allowances = parseFloat(formData.allowances) || 0;
        const overtime =
            (parseFloat(formData.overtime_hours) || 0) *
            (parseFloat(formData.overtime_rate) || 0);
        const bonus = parseFloat(formData.bonus) || 0;
        const otherAllowances = parseFloat(formData.other_allowances) || 0;

        const deductions = parseFloat(formData.deductions) || 0;
        const tax = parseFloat(formData.tax) || 0;
        const insurance = parseFloat(formData.insurance) || 0;
        const otherDeductions = parseFloat(formData.other_deductions) || 0;

        const totalEarnings =
            basic + allowances + overtime + bonus + otherAllowances;
        const totalDeductions = deductions + tax + insurance + otherDeductions;

        return Math.max(0, totalEarnings - totalDeductions);
    }, [formData]);

    // Update net salary when form data changes
    useEffect(() => {
        setNetSalary(calculateNetSalary());
    }, [formData, calculateNetSalary]);

    // Handle employee selection
    const handleEmployeeSelect = (employeeId) => {
        const employee = employees.find((e) => e.id === parseInt(employeeId));
        setSelectedEmployee(employee);
        setFormData((prev) => ({
            ...prev,
            employee_id: employeeId,
            basic_salary: employee?.salary || 0,
        }));
    };

    // Months array
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    // Years array (current year ± 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    // Initialize DataTable
    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#salaryTable")) {
            $("#salaryTable").DataTable().destroy();
        }

        const dt = $("#salaryTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("salary.index"),
                type: "GET",
                data: function (d) {
                    d.search = search;
                    d.status = statusFilter !== "all" ? statusFilter : "";
                    d.month = monthFilter !== "all" ? monthFilter : "";
                    d.year = yearFilter;
                },
            },
            columns: [
                {
                    data: "DT_RowIndex",
                    title: "#",
                    className: "text-center",
                    width: "1%",
                    orderable: false,
                    searchable: false,
                },
                {
                    data: "employee",
                    title: "Employee",
                    className: "text-start",
                    render: (data, type, row) => {
                        return `<div>
                            <div class="fw-semibold">${
                                data?.name || "N/A"
                            }</div>
                            <small class="text-muted">${
                                data?.designation || "N/A"
                            } | ${data?.department || "N/A"}</small>
                        </div>`;
                    },
                },
                {
                    data: "period",
                    title: "Period",
                    className: "text-start",
                    render: (data, type, row) => {
                        return `<div>
                            <div class="fw-semibold">${row.month} ${
                            row.year
                        }</div>
                            ${
                                row.payment_date
                                    ? `<small class="text-muted">Paid: ${new Date(
                                          row.payment_date
                                      ).toLocaleDateString()}</small>`
                                    : ""
                            }
                        </div>`;
                    },
                },
                {
                    data: "basic_salary",
                    title: "Basic",
                    className: "text-end",
                    render: (data) => {
                        return `<span class="fw-semibold">$${parseFloat(
                            data
                        ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}</span>`;
                    },
                },
                {
                    data: "allowances",
                    title: "Allowances",
                    className: "text-end",
                    render: (data, type, row) => {
                        const totalAllowances =
                            parseFloat(row.allowances || 0) +
                            parseFloat(row.overtime_amount || 0) +
                            parseFloat(row.bonus || 0);
                        return `<span class="text-success">+$${totalAllowances.toLocaleString(
                            undefined,
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}</span>`;
                    },
                },
                {
                    data: "deductions",
                    title: "Deductions",
                    className: "text-end",
                    render: (data, type, row) => {
                        const totalDeductions =
                            parseFloat(row.deductions || 0) +
                            parseFloat(row.tax || 0) +
                            parseFloat(row.insurance || 0);
                        return `<span class="text-danger">-$${totalDeductions.toLocaleString(
                            undefined,
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}</span>`;
                    },
                },
                {
                    data: "net_salary",
                    title: "Net Salary",
                    className: "text-end",
                    render: (data) => {
                        return `<span class="fw-bold text-primary">$${parseFloat(
                            data
                        ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}</span>`;
                    },
                },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    width: "10%",
                    render: (data) => {
                        const statusConfig = {
                            paid: {
                                badge: "success",
                                text: "Paid",
                                icon: "bi-check-circle",
                            },
                            processing: {
                                badge: "warning",
                                text: "Processing",
                                icon: "bi-clock-history",
                            },
                            pending: {
                                badge: "danger",
                                text: "Pending",
                                icon: "bi-exclamation-circle",
                            },
                        };

                        const config = statusConfig[data] || {
                            badge: "secondary",
                            text: data,
                            icon: "bi-question-circle",
                        };

                        return `<span class="badge bg-${config.badge} px-3 py-2">
                            <i class="bi ${config.icon} me-1"></i>
                            ${config.text}
                        </span>`;
                    },
                },
                {
                    data: "action",
                    title: "Actions",
                    className: "text-center",
                    width: "15%",
                    orderable: false,
                    searchable: false,
                    render: (data, type, row) => {
                        return `<div class="d-flex justify-content-center gap-2">
                            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${
                                row.id
                            }" title="Edit Salary">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-info view-btn" data-id="${
                                row.id
                            }" title="View Details">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-success pay-btn" data-id="${
                                row.id
                            }" title="Mark as Paid" ${
                            row.status === "paid" ? "disabled" : ""
                        }>
                                <i class="bi bi-cash"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${
                                row.id
                            }" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>`;
                    },
                },
            ],
            drawCallback: function () {
                // Bind custom button actions
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        editSalary(id);
                    });

                $(".view-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        viewSalary(id);
                    });

                $(".pay-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        markAsPaid(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deleteSalary(id);
                    });
            },
            initComplete: function () {
                dataTableInitialized.current = true;
            },
            language: {
                processing:
                    '<div class="spinner-border text-primary" role="status"></div>',
                emptyTable: "No salary records found",
                zeroRecords: "No matching salary records found",
            },
        });

        dataTable.current = dt;
        return dt;
    }, [search, statusFilter, monthFilter, yearFilter]);

    // Refresh DataTable when filters change
    useEffect(() => {
        if (dataTableInitialized.current && dataTable.current) {
            dataTable.current.ajax.reload();
        }
    }, [search, statusFilter, monthFilter, yearFilter]);

    // Initialize DataTable on mount
    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#salaryTable")) {
                $("#salaryTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    // Form handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name.includes("salary") ||
                name.includes("allowances") ||
                name.includes("deductions") ||
                name.includes("overtime") ||
                name.includes("bonus") ||
                name.includes("tax") ||
                name.includes("insurance")
                    ? parseFloat(value) || 0
                    : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                net_salary: netSalary,
                overtime_amount:
                    formData.overtime_hours * formData.overtime_rate,
            };

            if (selectedSalary) {
                // Update existing salary
                const response = await xios.put(
                    route("salary.update", selectedSalary.id),
                    dataToSubmit
                );
                if (response.data.success) {
                    toast.success(response.data.message);
                    setShowModal(false);
                    resetForm();
                    if (dataTable.current) {
                        dataTable.current.ajax.reload();
                    }
                }
            } else {
                // Create new salary
                const response = await xios.post(
                    route("salary.store"),
                    dataToSubmit
                );
                if (response.data.success) {
                    toast.success(response.data.message);
                    setShowModal(false);
                    resetForm();
                    if (dataTable.current) {
                        dataTable.current.ajax.reload();
                    }
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while saving salary"
            );
        }
    };

    const resetForm = () => {
        setFormData({
            employee_id: "",
            month: new Date().toLocaleString("default", { month: "long" }),
            year: new Date().getFullYear(),
            basic_salary: 0,
            allowances: 0,
            deductions: 0,
            overtime_hours: 0,
            overtime_rate: 0,
            bonus: 0,
            tax: 0,
            insurance: 0,
            other_allowances: 0,
            other_deductions: 0,
            status: "pending",
            payment_date: "",
            notes: "",
        });
        setSelectedSalary(null);
        setSelectedEmployee(null);
        setNetSalary(0);
    };

    // Salary actions
    const editSalary = async (id) => {
        try {
            const response = await xios.get(route("salary.show", id));
            const salary = response.data;
            setSelectedSalary(salary);
            setSelectedEmployee(salary.employee);
            setFormData({
                employee_id: salary.employee_id,
                month: salary.month,
                year: salary.year,
                basic_salary: salary.basic_salary,
                allowances: salary.allowances,
                deductions: salary.deductions,
                overtime_hours: salary.overtime_hours || 0,
                overtime_rate: salary.overtime_rate || 0,
                bonus: salary.bonus || 0,
                tax: salary.tax || 0,
                insurance: salary.insurance || 0,
                other_allowances: salary.other_allowances || 0,
                other_deductions: salary.other_deductions || 0,
                status: salary.status,
                payment_date: salary.payment_date || "",
                notes: salary.notes || "",
            });
            setShowModal(true);
        } catch (error) {
            toast.error("Failed to load salary details");
        }
    };

    const viewSalary = async (id) => {
        try {
            const response = await xios.get(route("salary.show", id));
            const salary = response.data;

            Swal.fire({
                title: "Salary Details",
                html: `
                    <div class="text-start">
                        <div class="row mb-3">
                            <div class="col-6">
                                <strong>Employee:</strong>
                                <p class="mb-0">${salary.employee?.name}</p>
                                <small class="text-muted">${
                                    salary.employee?.designation
                                }</small>
                            </div>
                            <div class="col-6">
                                <strong>Period:</strong>
                                <p>${salary.month} ${salary.year}</p>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <strong>Basic Salary:</strong>
                                <p>$${parseFloat(
                                    salary.basic_salary
                                ).toLocaleString()}</p>
                            </div>
                            <div class="col-6">
                                <strong>Net Salary:</strong>
                                <p class="text-primary fw-bold">$${parseFloat(
                                    salary.net_salary
                                ).toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <strong>Total Allowances:</strong>
                                <p class="text-success">$${parseFloat(
                                    salary.allowances +
                                        (salary.overtime_amount || 0) +
                                        (salary.bonus || 0)
                                ).toLocaleString()}</p>
                            </div>
                            <div class="col-6">
                                <strong>Total Deductions:</strong>
                                <p class="text-danger">$${parseFloat(
                                    salary.deductions +
                                        (salary.tax || 0) +
                                        (salary.insurance || 0)
                                ).toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-6">
                                <strong>Status:</strong>
                                <p><span class="badge bg-${
                                    salary.status === "paid"
                                        ? "success"
                                        : salary.status === "processing"
                                        ? "warning"
                                        : "danger"
                                }">${salary.status}</span></p>
                            </div>
                            ${
                                salary.payment_date
                                    ? `
                            <div class="col-6">
                                <strong>Payment Date:</strong>
                                <p>${new Date(
                                    salary.payment_date
                                ).toLocaleDateString()}</p>
                            </div>
                            `
                                    : ""
                            }
                        </div>
                    </div>
                `,
                showCloseButton: true,
                showConfirmButton: false,
                width: "600px",
            });
        } catch (error) {
            toast.error("Failed to load salary details");
        }
    };

    const markAsPaid = async (id) => {
        try {
            const result = await Swal.fire({
                title: "Mark as Paid?",
                text: "This will mark the salary as paid and record the payment date.",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#10b981",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Yes, mark as paid",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!result.isConfirmed) return;

            const response = await xios.put(route("salary.mark-paid", id), {
                payment_date: new Date().toISOString().split("T")[0],
            });

            if (response.data.success) {
                toast.success(response.data.message);
                if (dataTable.current) {
                    dataTable.current.ajax.reload();
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while updating salary"
            );
        }
    };

    const deleteSalary = async (id) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!result.isConfirmed) return;

            const response = await xios.delete(route("salary.destroy", id));

            if (response.data.success) {
                toast.success(response.data.message);
                if (dataTable.current) {
                    dataTable.current.ajax.reload();
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while deleting the salary record"
            );
        }
    };

    const exportSalaries = () => {
        toast.info("Export feature coming soon!");
    };

    const printSalaries = () => {
        toast.info("Print feature coming soon!");
    };

    const refreshTable = () => {
        if (dataTable.current) {
            dataTable.current.ajax.reload();
            toast.success("Salary list refreshed!");
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        resetForm();
    };

    return (
        <ErpLayout>
            <Head title="Salary Management" />

            <Container fluid>
                {/* Page Header */}
                <Row className="mb-4">
                    <Col>
                        <h3 className="fw-bold text-primary">
                            <BiDollar className="me-2" />
                            Salary Management
                        </h3>
                        <p className="text-muted mb-0">
                            Manage employee salaries, allowances, and
                            deductions.
                        </p>
                    </Col>
                    <Col className="text-end">
                        <ButtonGroup>
                            <Button
                                variant="outline-primary"
                                onClick={() => setShowModal(true)}
                                className="d-flex align-items-center"
                            >
                                <BiPlus className="me-1" />
                                Add Salary
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Filters Card */}
                <Card className="mb-4">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Search Employee</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <BiSearch />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by name or ID..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">All Status</option>
                                        <option value="paid">Paid</option>
                                        <option value="processing">
                                            Processing
                                        </option>
                                        <option value="pending">Pending</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Month</Form.Label>
                                    <Form.Select
                                        value={monthFilter}
                                        onChange={(e) =>
                                            setMonthFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">All Months</option>
                                        {months.map((month) => (
                                            <option key={month} value={month}>
                                                {month}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Year</Form.Label>
                                    <Form.Select
                                        value={yearFilter}
                                        onChange={(e) =>
                                            setYearFilter(e.target.value)
                                        }
                                    >
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3} className="d-flex align-items-end">
                                <ButtonGroup className="w-100">
                                    <Button
                                        variant="outline-primary"
                                        onClick={refreshTable}
                                        title="Refresh"
                                    >
                                        <BiRefresh />
                                    </Button>
                                    <Button
                                        variant="outline-success"
                                        onClick={exportSalaries}
                                        title="Export"
                                    >
                                        <BiDownload />
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={printSalaries}
                                        title="Print"
                                    >
                                        <BiPrinter />
                                    </Button>
                                </ButtonGroup>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Salary Table Card */}
                <Card>
                    <Card.Body>
                        <div className="table-responsive">
                            <Table
                                bordered
                                hover
                                responsive
                                id="salaryTable"
                                className="align-middle mb-0"
                            />
                        </div>
                    </Card.Body>
                </Card>

                {/* Add/Edit Salary Modal */}
                <Modal
                    show={showModal}
                    onHide={handleModalClose}
                    size="xl"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {selectedSalary
                                ? "Edit Salary Record"
                                : "Add New Salary Record"}
                        </Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Row className="g-3">
                                {/* Employee Selection */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Select Employee *
                                        </Form.Label>
                                        <Form.Select
                                            name="employee_id"
                                            value={formData.employee_id}
                                            onChange={(e) =>
                                                handleEmployeeSelect(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        >
                                            <option value="">
                                                Choose employee...
                                            </option>
                                            {employees.map((employee) => (
                                                <option
                                                    key={employee.id}
                                                    value={employee.id}
                                                >
                                                    {employee.name} -{" "}
                                                    {employee.designation} ($
                                                    {employee.salary?.toLocaleString()}
                                                    )
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {/* Period */}
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Month *</Form.Label>
                                        <Form.Select
                                            name="month"
                                            value={formData.month}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            {months.map((month) => (
                                                <option
                                                    key={month}
                                                    value={month}
                                                >
                                                    {month}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Year *</Form.Label>
                                        <Form.Select
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            {years.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {/* Salary Breakdown */}
                                <Col md={12}>
                                    <h5 className="mb-3">Salary Breakdown</h5>
                                </Col>

                                {/* Earnings */}
                                <Col md={6}>
                                    <Card className="border-success">
                                        <Card.Header className="bg-success text-white">
                                            <h6 className="mb-0">Earnings</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row className="g-2">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Basic Salary
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="basic_salary"
                                                            value={
                                                                formData.basic_salary
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.01"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Allowances
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="allowances"
                                                            value={
                                                                formData.allowances
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.01"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Overtime Hours
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="overtime_hours"
                                                            value={
                                                                formData.overtime_hours
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.5"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Overtime Rate
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="overtime_rate"
                                                            value={
                                                                formData.overtime_rate
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.01"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Bonus
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="bonus"
                                                            value={
                                                                formData.bonus
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.01"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Other Allowances
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="other_allowances"
                                                            value={
                                                                formData.other_allowances
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.01"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Deductions */}
                                <Col md={6}>
                                    <Card className="border-danger">
                                        <Card.Header className="bg-danger text-white">
                                            <h6 className="mb-0">Deductions</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row className="g-2">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Deductions
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="deductions"
                                                            value={
                                                                formData.deductions
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.01"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Tax
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="tax"
                                                            value={formData.tax}
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.01"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Insurance
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="insurance"
                                                            value={
                                                                formData.insurance
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.01"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Other Deductions
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="other_deductions"
                                                            value={
                                                                formData.other_deductions
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.01"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Summary */}
                                <Col md={12}>
                                    <Card className="border-primary">
                                        <Card.Header className="bg-primary text-white">
                                            <h6 className="mb-0">Summary</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row>
                                                <Col md={4}>
                                                    <div className="text-center p-3 bg-light rounded">
                                                        <small className="text-muted d-block">
                                                            Total Earnings
                                                        </small>
                                                        <h4 className="text-success mb-0">
                                                            $
                                                            {(
                                                                (parseFloat(
                                                                    formData.basic_salary
                                                                ) || 0) +
                                                                (parseFloat(
                                                                    formData.allowances
                                                                ) || 0) +
                                                                parseFloat(
                                                                    formData.overtime_hours
                                                                ) *
                                                                    parseFloat(
                                                                        formData.overtime_rate
                                                                    ) +
                                                                (parseFloat(
                                                                    formData.bonus
                                                                ) || 0) +
                                                                (parseFloat(
                                                                    formData.other_allowances
                                                                ) || 0)
                                                            ).toLocaleString(
                                                                undefined,
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </h4>
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div className="text-center p-3 bg-light rounded">
                                                        <small className="text-muted d-block">
                                                            Total Deductions
                                                        </small>
                                                        <h4 className="text-danger mb-0">
                                                            $
                                                            {(
                                                                (parseFloat(
                                                                    formData.deductions
                                                                ) || 0) +
                                                                (parseFloat(
                                                                    formData.tax
                                                                ) || 0) +
                                                                (parseFloat(
                                                                    formData.insurance
                                                                ) || 0) +
                                                                (parseFloat(
                                                                    formData.other_deductions
                                                                ) || 0)
                                                            ).toLocaleString(
                                                                undefined,
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </h4>
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div className="text-center p-3 bg-light rounded">
                                                        <small className="text-muted d-block">
                                                            Net Salary
                                                        </small>
                                                        <h3 className="text-primary mb-0">
                                                            $
                                                            {netSalary.toLocaleString(
                                                                undefined,
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </h3>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Additional Information */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="pending">
                                                Pending
                                            </option>
                                            <option value="processing">
                                                Processing
                                            </option>
                                            <option value="paid">Paid</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {formData.status === "paid" && (
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>
                                                Payment Date
                                            </Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="payment_date"
                                                value={formData.payment_date}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                )}

                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Notes</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="Additional notes or comments..."
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                onClick={handleModalClose}
                            >
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                {selectedSalary
                                    ? "Update Salary"
                                    : "Save Salary"}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </Container>
        </ErpLayout>
    );
}
