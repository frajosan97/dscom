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
} from "react-bootstrap";
import {
    BiUser,
    BiUserPlus,
    BiSearch,
    BiFilter,
    BiDownload,
    BiPrinter,
    BiRefresh,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";

export default function Employee() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

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
                    orderable: false,
                    searchable: false,
                    render: (data, type, row) => {
                        return `<div class="d-flex justify-content-center gap-2">
                            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${row.id}" title="Edit">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-info view-btn" data-id="${row.id}" title="View Details">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${row.id}" title="Delete">
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
                <Row className="mb-4">
                    <Col>
                        <h3 className="fw-bold text-primary">
                            <BiUser className="me-2" />
                            Employee Management
                        </h3>
                        <p className="text-muted mb-0">
                            View, manage, and maintain all employee accounts.
                        </p>
                    </Col>
                    <Col className="text-end">
                        <ButtonGroup>
                            <Button
                                variant="outline-primary"
                                as={Link}
                                href={route("employee.create")}
                                className="d-flex align-items-center"
                            >
                                <BiUserPlus className="me-1" />
                                Add Employee
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Employee Table Card */}
                <Card>
                    <Card.Body>
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
        </ErpLayout>
    );
}
