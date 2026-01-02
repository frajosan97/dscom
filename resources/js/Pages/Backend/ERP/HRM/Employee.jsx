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
    Dropdown,
} from "react-bootstrap";
import {
    BiUser,
    BiUserPlus,
    BiSearch,
    BiFilter,
    BiDownload,
    BiRefresh,
    BiUpload,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import ImportEmployeeModal from "@/components/Modals/ImportEmployeeModal";

export default function Employee() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showImportModal, setShowImportModal] = useState(false);
    const [importTemplateUrl, setImportTemplateUrl] = useState("");

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

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
                    data: "profile_image",
                    title: "Photo",
                    className: "text-center",
                    width: "3%",
                    orderable: false,
                    searchable: false,
                },
                {
                    data: "name",
                    title: "Name",
                    className: "text-start",
                },
                {
                    data: "contact",
                    title: "Contact",
                    className: "text-start",
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
                emptyTable:
                    '<div class="text-center py-5"><i class="bi bi-inbox display-4 text-muted"></i><p class="mt-2">No employees records found</p></div>',
                zeroRecords:
                    '<div class="text-center py-5"><i class="bi bi-search display-4 text-muted"></i><p class="mt-2">No matching records found</p></div>',
            },
            responsive: true,
            order: [[0, "desc"]],
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

    const handleImportSuccess = () => {
        if (dataTable.current) {
            dataTable.current.ajax.reload();
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
                                variant="primary"
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
                                        onClick={() => exportEmployees("excel")}
                                    >
                                        <FaFileExcel className="me-2 text-success" />{" "}
                                        Excel
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => exportEmployees("pdf")}
                                    >
                                        <FaFilePdf className="me-2 text-danger" />{" "}
                                        PDF
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={printEmployees}>
                                        <FaPrint className="me-2 text-secondary" />{" "}
                                        Print
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
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
            <ImportEmployeeModal
                show={showImportModal}
                onHide={() => setShowImportModal(false)}
                onImportSuccess={handleImportSuccess}
                importTemplateUrl={importTemplateUrl}
            />
        </ErpLayout>
    );
}
