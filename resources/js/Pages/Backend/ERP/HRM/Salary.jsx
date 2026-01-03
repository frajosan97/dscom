import React, { useCallback, useEffect, useRef, useState } from "react";
import { Head } from "@inertiajs/react";
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
    Dropdown,
} from "react-bootstrap";
import {
    BiDollar,
    BiDownload,
    BiRefresh,
    BiSearch,
    BiPlus,
    BiBarChartAlt2,
    BiCheckCircle,
    BiTime,
    BiXCircle,
    BiUser,
    BiUpload,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";
import useData from "@/Hooks/useData";
import SalaryModal from "@/Components/Modals/SalaryModal";
import ViewSalaryModal from "@/Components/Modals/ViewSalaryModal";
import { useErrorToast } from "@/Hooks/useErrorToast";
import SalaryStatsCard from "@/Components/Cards/SalaryStatsCard";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";

// Months array
const MONTHS = [
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

// Initial form state
const INITIAL_FORM_STATE = {
    employee_id: "",
    employee_code: "",
    month: new Date().toLocaleString("default", { month: "long" }),
    year: new Date().getFullYear(),
    basic_salary: 0,
    daily_rate: 0,
    daily_transport_rate: 8.27,
    total_days: 26,
    days_present: 26,
    days_absent: 0,
    allowances: [],
    bonus: 0,
    quality_bonus: 0,
    overtime_hours: 0,
    overtime_rate: 0,
    regularization: 0,
    other_allowances: [],
    deductions: [],
    transport_deduction: 0,
    advance_salary: 0,
    disciplinary_deductions: [],
    product_loss: 0,
    other_deductions: [],
    status: "pending",
    payment_date: "",
    notes: "",
    currency: "USD",
    exchange_rate: 1,
    real_salary: 0,
    gross_salary: 0,
    net_salary: 0,
    net_in_usd: 0,
    net_in_cdf: 0,
};

// Initial statistics state
const INITIAL_STATS = {
    total: 0,
    paid: 0,
    processing: 0,
    pending: 0,
    totalAmount: 0,
    avgSalary: 0,
};

export default function Salary() {
    const { showErrorToast } = useErrorToast();
    const { employees } = useData();

    // State management
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [monthFilter, setMonthFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState(
        new Date().getFullYear().toString()
    );

    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [viewSalaryData, setViewSalaryData] = useState(null);
    const [stats, setStats] = useState(INITIAL_STATS);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    // Generate years range (-5 to +5)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    // DataTable configuration
    const getDataTableConfig = useCallback(
        () => ({
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
                },
                {
                    data: "period",
                    title: "Period",
                    className: "text-start",
                },
                {
                    data: "real_salary",
                    title: "Real Salary",
                    className: "text-end",
                },
                {
                    data: "gross_salary",
                    title: "Gross Salary",
                    className: "text-end",
                },
                {
                    data: "net_salary",
                    title: "Net Salary",
                    className: "text-end",
                },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    width: "10%",
                },
                {
                    data: "action",
                    title: "Actions",
                    className: "text-center",
                    width: "15%",
                    orderable: false,
                    searchable: false,
                },
            ],
            drawCallback: function () {
                bindTableActions();
                updateStatistics();
            },
            initComplete: function () {
                dataTableInitialized.current = true;
                updateStatistics();
            },
            language: {
                emptyTable:
                    '<div class="text-center py-5"><i class="bi bi-inbox display-4 text-muted"></i><p class="mt-2">No salary records found</p></div>',
                zeroRecords:
                    '<div class="text-center py-5"><i class="bi bi-search display-4 text-muted"></i><p class="mt-2">No matching records found</p></div>',
            },
            responsive: true,
            order: [[0, "desc"]],
        }),
        [search, statusFilter, monthFilter, yearFilter]
    );

    // Bind table action handlers
    const bindTableActions = () => {
        $(".edit-btn")
            .off("click")
            .on("click", (e) => {
                const id = $(e.currentTarget).data("id");
                handleEditSalary(id);
            });

        $(".view-btn")
            .off("click")
            .on("click", (e) => {
                const id = $(e.currentTarget).data("id");
                handleViewSalary(id);
            });

        $(".pay-btn")
            .off("click")
            .on("click", (e) => {
                const id = $(e.currentTarget).data("id");
                handleMarkAsPaid(id);
            });

        $(".delete-btn")
            .off("click")
            .on("click", (e) => {
                const id = $(e.currentTarget).data("id");
                handleDeleteSalary(id);
            });
    };

    // Initialize DataTable
    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#salaryTable")) {
            $("#salaryTable").DataTable().destroy();
        }

        const dt = $("#salaryTable").DataTable(getDataTableConfig());
        dataTable.current = dt;
        return dt;
    }, [getDataTableConfig]);

    // Fetch statistics
    const updateStatistics = async () => {
        try {
            const response = await xios.get(route("salary.statistics"));
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch statistics:", error);
        }
    };

    // Refresh table when filters change
    useEffect(() => {
        if (dataTableInitialized.current && dataTable.current) {
            dataTable.current.ajax.reload();
        }
    }, [search, statusFilter, monthFilter, yearFilter]);

    // Initialize on mount
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
    const handleFormSubmit = async () => {
        try {
            const dataToSubmit = {
                ...formData,
                allowances: JSON.stringify(formData.allowances),
                other_allowances: JSON.stringify(formData.other_allowances),
                deductions: JSON.stringify(formData.deductions),
                disciplinary_deductions: JSON.stringify(
                    formData.disciplinary_deductions
                ),
                other_deductions: JSON.stringify(formData.other_deductions),
            };

            const url = selectedSalary
                ? route("salary.update", selectedSalary.id)
                : route("salary.store");

            const method = selectedSalary ? "put" : "post";

            const response = await xios[method](url, dataToSubmit);

            if (response.data.success) {
                toast.success(response.data.message);
                setShowAddEditModal(false);
                resetForm();
                if (dataTable.current) dataTable.current.ajax.reload();
            }
        } catch (error) {
            showErrorToast(error);
        }
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_STATE);
        setSelectedSalary(null);
    };

    // Salary operations
    const handleEditSalary = async (id) => {
        try {
            const response = await xios.get(route("salary.show", id));
            const salary = response.data.data;

            setSelectedSalary(salary);
            setFormData(mapSalaryToFormData(salary));
            setShowAddEditModal(true);
        } catch (error) {
            toast.error("Failed to load salary details");
            console.error(error);
        }
    };

    const handleViewSalary = async (id) => {
        try {
            const response = await xios.get(route("salary.show", id));
            setViewSalaryData(response.data.data);
            setShowViewModal(true);
        } catch (error) {
            toast.error("Failed to load salary details");
        }
    };

    const handleMarkAsPaid = (id) => {
        Swal.fire({
            title: "Mark as Paid?",
            text: "Are you sure you want to mark this salary as paid?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, mark as paid",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await xios.post(
                        route("salary.mark-paid", id)
                    );
                    if (response.data.success) {
                        toast.success(response.data.message);
                        if (dataTable.current) dataTable.current.ajax.reload();
                    }
                } catch (error) {
                    toast.error(
                        error.response?.data?.message ||
                            "Failed to mark as paid"
                    );
                }
            }
        });
    };

    const handleDeleteSalary = (id) => {
        Swal.fire({
            title: "Delete Salary Record?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc3545",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await xios.delete(
                        route("salary.destroy", id)
                    );
                    if (response.data.success) {
                        toast.success(response.data.message);
                        if (dataTable.current) dataTable.current.ajax.reload();
                    }
                } catch (error) {
                    toast.error(
                        error.response?.data?.message ||
                            "Failed to delete salary"
                    );
                }
            }
        });
    };

    // Utility functions
    const mapSalaryToFormData = (salary) => ({
        employee_id: salary.user_id,
        employee_code: salary.employee_code || `EMP-${salary.user_id}`,
        month: salary.month,
        year: salary.year,
        basic_salary: salary.basic_salary || 0,
        daily_rate: salary.daily_rate || 0,
        daily_transport_rate: salary.daily_transport_rate || 8.27,
        total_days: salary.total_days || 26,
        days_present: salary.days_present || 26,
        days_absent: salary.days_absent || 0,
        allowances: salary.allowances || [],
        bonus: salary.bonus || 0,
        quality_bonus: salary.quality_bonus || 0,
        overtime_hours: salary.overtime_hours || 0,
        overtime_rate: salary.overtime_rate || 0,
        regularization: salary.regularization || 0,
        other_allowances: salary.other_allowances || [],
        deductions: salary.deductions || [],
        transport_deduction: salary.transport_deduction || 0,
        advance_salary: salary.advance_salary || 0,
        disciplinary_deductions: salary.disciplinary_deductions || [],
        product_loss: salary.product_loss || 0,
        other_deductions: salary.other_deductions || [],
        status: salary.status,
        payment_date: salary.payment_date || "",
        notes: salary.notes || "",
        currency: salary.currency || "USD",
        exchange_rate: salary.exchange_rate || 1,
        real_salary: salary.real_salary || 0,
        gross_salary: salary.gross_salary || 0,
        net_salary: salary.net_salary || 0,
        net_in_usd: salary.net_in_usd || 0,
        net_in_cdf: salary.net_in_cdf || 0,
    });

    const refreshTable = () => {
        if (dataTable.current) {
            dataTable.current.ajax.reload();
            toast.success("Salary list refreshed!");
        }
    };

    const exportSalaries = () => {
        toast.info("Export feature coming soon!");
    };

    const printSalaries = () => {
        toast.info("Print feature coming soon!");
    };

    const handleModalClose = () => {
        setShowAddEditModal(false);
        resetForm();
    };

    // Statistics cards data
    const statCards = [
        {
            title: "Total Payroll",
            value: `$${stats?.totalAmount?.toLocaleString()}`,
            subtitle: `${stats.total} records`,
            icon: BiBarChartAlt2,
            color: "primary",
            trend: "up",
        },
        {
            title: "Paid Salaries",
            value: stats.paid,
            subtitle: "Completed",
            icon: BiCheckCircle,
            color: "success",
            trend: "success",
        },
        {
            title: "Processing",
            value: stats.processing,
            subtitle: "In Progress",
            icon: BiTime,
            color: "warning",
            trend: "warning",
        },
        {
            title: "Pending",
            value: stats.pending,
            subtitle: "Awaiting",
            icon: BiXCircle,
            color: "danger",
            trend: "danger",
        },
    ];

    return (
        <ErpLayout>
            <Head title="Payroll Management" />

            <Container fluid className="py-3">
                {/* Page Header */}
                <Row className="mb-4 align-items-center">
                    <Col md={6}>
                        <h3 className="fw-bold text-primary mb-2">
                            <BiUser className="me-2" />
                            Payroll Management
                        </h3>
                        <p className="text-muted mb-0">
                            Manage employee salaries, allowances, deductions,
                            and generate payroll reports
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <ButtonGroup className="mb-2 mb-md-0">
                            <Button
                                variant="outline-primary"
                                onClick={() => setShowAddEditModal(true)}
                                className="d-flex align-items-center"
                            >
                                <BiPlus className="me-1" />
                                New Payroll
                            </Button>
                            <Button
                                variant="primary"
                                className="d-flex align-items-center"
                            >
                                <BiUpload className="me-1" />
                                Import Excel
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Statistics Cards */}
                <Row className="mb-4">
                    {statCards.map((card, index) => (
                        <Col
                            xl={3}
                            lg={6}
                            md={6}
                            sm={12}
                            key={index}
                            className="mb-3"
                        >
                            <SalaryStatsCard {...card} />
                        </Col>
                    ))}
                </Row>

                {/* Salary Table */}
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Payroll Records</h5>
                            <small className="text-muted">
                                Showing {stats.total} records
                            </small>
                        </div>
                    </Card.Header>

                    <Card.Header>
                        <Row className="g-3 align-items-end">
                            {/* Search */}
                            <Col lg={3} md={6}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light">
                                        <BiSearch />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search employee..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="border-start-0"
                                    />
                                </InputGroup>
                            </Col>

                            {/* Status Filter */}
                            <Col lg={2} md={4}>
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
                            </Col>

                            {/* Month Filter */}
                            <Col lg={2} md={4}>
                                <Form.Select
                                    value={monthFilter}
                                    onChange={(e) =>
                                        setMonthFilter(e.target.value)
                                    }
                                >
                                    <option value="all">All Months</option>
                                    {MONTHS.map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>

                            {/* Year Filter */}
                            <Col lg={2} md={4}>
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
                            </Col>

                            {/* Action Buttons */}
                            <Col lg={3} md={6}>
                                <ButtonGroup className="d-flex gap-2">
                                    <Button
                                        variant="outline-info"
                                        onClick={refreshTable}
                                        className="d-flex align-items-center rounded"
                                    >
                                        <BiRefresh className="me-1" />
                                        Refresh
                                    </Button>
                                    <Dropdown>
                                        <Dropdown.Toggle
                                            variant="outline-secondary"
                                            className="d-flex align-items-center"
                                        >
                                            <BiDownload className="me-1" />
                                            Export
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item
                                                onClick={() =>
                                                    exportSalaries("excel")
                                                }
                                            >
                                                <FaFileExcel className="me-2 text-success" />{" "}
                                                Excel
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() =>
                                                    exportSalaries("pdf")
                                                }
                                            >
                                                <FaFilePdf className="me-2 text-danger" />{" "}
                                                PDF
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={printSalaries}
                                            >
                                                <FaPrint className="me-2 text-secondary" />{" "}
                                                Print
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </ButtonGroup>
                            </Col>
                        </Row>
                    </Card.Header>

                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table
                                hover
                                className="align-middle mb-0"
                                id="salaryTable"
                            />
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            {/* Modals */}
            <SalaryModal
                show={showAddEditModal}
                onHide={handleModalClose}
                onSubmit={handleFormSubmit}
                formData={formData}
                setFormData={setFormData}
                selectedSalary={selectedSalary}
                employees={employees}
                months={MONTHS}
                years={years}
            />

            <ViewSalaryModal
                show={showViewModal}
                onHide={() => setShowViewModal(false)}
                salaryData={viewSalaryData}
                employee={employees.find(
                    (e) => e.id === viewSalaryData?.user_id
                )}
            />
        </ErpLayout>
    );
}
