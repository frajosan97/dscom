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
    ProgressBar,
} from "react-bootstrap";
import {
    BiUser,
    BiUserPlus,
    BiSearch,
    BiFilter,
    BiDownload,
    BiPrinter,
    BiRefresh,
    BiUpload,
    BiFile,
    BiX,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";

export default function Employee() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importStatus, setImportStatus] = useState("");
    const [importErrors, setImportErrors] = useState([]);
    const [importTemplateUrl, setImportTemplateUrl] = useState("");

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);
    const fileInputRef = useRef(null);

    // Get import template URL on mount
    useEffect(() => {
        setImportTemplateUrl(route("employee.import.template"));
    }, []);

    // Initialize DataTable
    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#employeeTable")) {
            $("#employeeTable").DataTable().destroy();
        }

        const dt = $("#employeeTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("employee.index"),
                type: "GET",
                data: function (d) {
                    d.search = search;
                    d.status = statusFilter !== "all" ? statusFilter : "";
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
                    data: "profile_image",
                    title: "",
                    className: "text-center",
                    width: "3%",
                    render: (data, type, row) => {
                        if (data) {
                            return `<img src="/storage/${data}" alt="${row.name}" class="rounded-circle" width="40" height="40" style="object-fit: cover;" />`;
                        }
                        return `<div class="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto" style="width: 40px; height: 40px;">
                            <i class="bi bi-person text-muted"></i>
                        </div>`;
                    },
                    orderable: false,
                    searchable: false,
                },
                {
                    data: "name",
                    title: "Name",
                    className: "text-start",
                    render: (data, type, row) => {
                        return `<div>
                            <div class="fw-semibold">${data}</div>
                            <small class="text-muted">${
                                row.designation || "N/A"
                            }</small>
                        </div>`;
                    },
                },
                {
                    data: "contact",
                    title: "Contact",
                    className: "text-start",
                    render: (data, type, row) => {
                        return `<div>
                            <div>${row.email || "N/A"}</div>
                            <small class="text-muted">${row.phone}</small>
                        </div>`;
                    },
                },
                {
                    data: "role",
                    title: "Role",
                    className: "text-start",
                    width: "10%",
                },
                {
                    data: "salary",
                    title: "Salary",
                    className: "text-end",
                    render: (data) => {
                        if (!data || data === "0") return "N/A";
                        return `<span class="fw-semibold">$${parseFloat(
                            data
                        ).toLocaleString()}</span>`;
                    },
                },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    width: "10%",
                    render: (data) => {
                        const statusConfig = {
                            Enable: {
                                badge: "success",
                                text: "Active",
                                icon: "bi-check-circle",
                            },
                            Disable: {
                                badge: "secondary",
                                text: "Inactive",
                                icon: "bi-x-circle",
                            },
                        };

                        const config = statusConfig[data] || {
                            badge: "warning",
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
                },
            ],
            drawCallback: function () {
                // Bind custom button actions
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        editEmployee(id);
                    });

                $(".view-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        viewEmployee(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deleteEmployee(id);
                    });
            },
            initComplete: function () {
                dataTableInitialized.current = true;
            },
            language: {
                processing:
                    '<div class="spinner-border text-primary" role="status"></div>',
                emptyTable: "No employees found",
                zeroRecords: "No matching employees found",
            },
        });

        dataTable.current = dt;
        return dt;
    }, [search, statusFilter]);

    // Refresh DataTable when filters change
    useEffect(() => {
        if (dataTableInitialized.current && dataTable.current) {
            dataTable.current.ajax.reload();
        }
    }, [search, statusFilter]);

    // Initialize DataTable on mount
    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#employeeTable")) {
                $("#employeeTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    // Import Functions
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv",
        ];

        if (!validTypes.includes(file.type)) {
            toast.error("Please select a valid Excel or CSV file");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should not exceed 5MB");
            return;
        }

        setImportFile(file);
    };

    const handleImportSubmit = async () => {
        if (!importFile) {
            toast.error("Please select a file to import");
            return;
        }

        const formData = new FormData();
        formData.append("file", importFile);

        setIsImporting(true);
        setImportProgress(0);
        setImportStatus("Uploading...");
        setImportErrors([]);

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setImportProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);

            const response = await xios.post(
                route("employee.import"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setImportProgress(percentCompleted);
                    },
                }
            );

            clearInterval(progressInterval);
            setImportProgress(100);
            setImportStatus("Processing...");

            if (response.data.success) {
                setTimeout(() => {
                    toast.success(
                        response.data.message ||
                            "Employees imported successfully!"
                    );
                    setShowImportModal(false);
                    setImportFile(null);
                    setIsImporting(false);
                    setImportProgress(0);
                    setImportStatus("");

                    // Refresh table
                    if (dataTable.current) {
                        dataTable.current.ajax.reload();
                    }

                    // Reset file input
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }, 1000);
            } else {
                throw new Error(response.data.message || "Import failed");
            }
        } catch (error) {
            setIsImporting(false);
            setImportStatus("Import failed");

            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                setImportErrors(errors);
                toast.error(
                    "There were errors during import. Please check the error list."
                );
            } else {
                toast.error(
                    error.response?.data?.message || "Error importing file"
                );
            }
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await xios.get(route("employee.import.template"), {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "employee_import_template.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Template downloaded successfully!");
        } catch (error) {
            toast.error("Failed to download template");
        }
    };

    const resetImport = () => {
        setImportFile(null);
        setImportErrors([]);
        setImportProgress(0);
        setImportStatus("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const closeImportModal = () => {
        if (isImporting) {
            Swal.fire({
                title: "Cancel Import?",
                text: "Import is in progress. Are you sure you want to cancel?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Yes, cancel it!",
                cancelButtonText: "Continue import",
            }).then((result) => {
                if (result.isConfirmed) {
                    setShowImportModal(false);
                    resetImport();
                    setIsImporting(false);
                }
            });
        } else {
            setShowImportModal(false);
            resetImport();
        }
    };

    // Employee actions
    const editEmployee = (id) => {
        window.location.href = route("employee.edit", id);
    };

    const viewEmployee = (id) => {
        window.location.href = route("employee.show", id);
    };

    const deleteEmployee = async (id) => {
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

            const response = await xios.delete(route("employee.destroy", id));

            if (response.data.success) {
                toast.success(response.data.message);
                if (dataTable.current) {
                    dataTable.current.ajax.reload();
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while deleting the employee"
            );
        }
    };

    const exportEmployees = () => {
        toast.info("Export feature coming soon!");
    };

    const printEmployees = () => {
        toast.info("Print feature coming soon!");
    };

    const refreshTable = () => {
        if (dataTable.current) {
            dataTable.current.ajax.reload();
            toast.success("Employee list refreshed!");
        }
    };

    return (
        <ErpLayout>
            <Head title="Employee Management" />

            <Container fluid>
                {/* Page Header */}
                <Row className="mb-4 align-items-center">
                    <Col md={6}>
                        <h3 className="fw-bold text-primary mb-2">
                            <BiUser className="me-2" />
                            Employee Management
                        </h3>
                        <p className="text-muted mb-0">
                            View, manage, and maintain all employee accounts.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <ButtonGroup className="mb-2 mb-md-0">
                            <Button
                                variant="outline-primary"
                                as={Link}
                                href={route("employee.create")}
                                className="d-flex align-items-center"
                            >
                                <BiUserPlus className="me-1" />
                                Add Employee
                            </Button>
                            <Button
                                variant="outline-success"
                                onClick={() => setShowImportModal(true)}
                                className="d-flex align-items-center"
                            >
                                <BiUpload className="me-1" />
                                Import Excel
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Filters Row */}
                <Row className="mb-4">
                    <Col md={6} lg={4}>
                        <InputGroup>
                            <InputGroup.Text>
                                <BiSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search employees..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={6} lg={4}>
                        <InputGroup>
                            <InputGroup.Text>
                                <BiFilter />
                            </InputGroup.Text>
                            <Form.Select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                            >
                                <option value="all">All Status</option>
                                <option value="Enable">Active</option>
                                <option value="Disable">Inactive</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                    <Col md={12} lg={4} className="text-lg-end mt-2 mt-lg-0">
                        <ButtonGroup>
                            <Button
                                variant="outline-secondary"
                                onClick={refreshTable}
                                className="d-flex align-items-center"
                            >
                                <BiRefresh className="me-1" />
                                Refresh
                            </Button>
                            <Button
                                variant="outline-info"
                                onClick={exportEmployees}
                                className="d-flex align-items-center"
                            >
                                <BiDownload className="me-1" />
                                Export
                            </Button>
                            <Button
                                variant="outline-dark"
                                onClick={printEmployees}
                                className="d-flex align-items-center"
                            >
                                <BiPrinter className="me-1" />
                                Print
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Employee Table Card */}
                <Card>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table
                                bordered
                                hover
                                responsive
                                id="employeeTable"
                                className="align-middle mb-0"
                            />
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            {/* Import Modal */}
            <Modal
                show={showImportModal}
                onHide={closeImportModal}
                size="lg"
                backdrop={isImporting ? "static" : true}
                keyboard={!isImporting}
            >
                <Modal.Header closeButton={!isImporting}>
                    <Modal.Title className="d-flex align-items-center">
                        <BiUpload className="me-2" />
                        Import Employees from Excel
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* File Upload Section */}
                    <div className="mb-4">
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Select Excel/CSV File
                            </Form.Label>
                            <div className="border rounded p-4 text-center">
                                {importFile ? (
                                    <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded">
                                        <div className="d-flex align-items-center">
                                            <BiFile className="fs-4 text-primary me-2" />
                                            <div>
                                                <div className="fw-semibold">
                                                    {importFile.name}
                                                </div>
                                                <small className="text-muted">
                                                    {(
                                                        importFile.size / 1024
                                                    ).toFixed(2)}{" "}
                                                    KB
                                                </small>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={resetImport}
                                            disabled={isImporting}
                                        >
                                            <BiX />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <BiUpload className="fs-1 text-muted mb-3" />
                                        <p className="text-muted mb-3">
                                            Drag & drop your Excel file here or
                                            click to browse
                                        </p>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            Browse Files
                                        </Button>
                                        <Form.Control
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept=".xlsx,.xls,.csv"
                                            className="d-none"
                                            disabled={isImporting}
                                        />
                                    </>
                                )}
                            </div>
                            <Form.Text className="text-muted">
                                Supported formats: .xlsx, .xls, .csv (Max 5MB)
                            </Form.Text>
                        </Form.Group>
                    </div>

                    {/* Progress Bar */}
                    {isImporting && (
                        <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                                <small className="text-muted">
                                    Import Progress
                                </small>
                                <small className="text-muted">
                                    {importProgress}%
                                </small>
                            </div>
                            <ProgressBar
                                now={importProgress}
                                animated={importProgress < 100}
                                variant={
                                    importProgress === 100
                                        ? "success"
                                        : "primary"
                                }
                                className="mb-2"
                            />
                            {importStatus && (
                                <small className="text-muted d-block text-center">
                                    {importStatus}
                                </small>
                            )}
                        </div>
                    )}

                    {/* Error Display */}
                    {importErrors.length > 0 && (
                        <div className="mb-4">
                            <h6 className="text-danger mb-2">Import Errors:</h6>
                            <div className="border border-danger rounded p-3 bg-danger bg-opacity-10">
                                <ul className="mb-0 ps-3">
                                    {importErrors.map((error, index) => (
                                        <li
                                            key={index}
                                            className="text-danger small"
                                        >
                                            {error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Template Download */}
                    <div className="border-top pt-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-1">Need a template?</h6>
                                <p className="small text-muted mb-0">
                                    Download our Excel template with proper
                                    column formatting
                                </p>
                            </div>
                            <Button
                                variant="outline-success"
                                onClick={downloadTemplate}
                                disabled={isImporting}
                                size="sm"
                            >
                                <BiDownload className="me-1" />
                                Download Template
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={closeImportModal}
                        disabled={isImporting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleImportSubmit}
                        disabled={!importFile || isImporting}
                    >
                        {isImporting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Importing...
                            </>
                        ) : (
                            "Start Import"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </ErpLayout>
    );
}
