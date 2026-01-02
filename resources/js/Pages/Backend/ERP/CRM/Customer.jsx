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
    BiSearch,
    BiFilter,
    BiDownload,
    BiRefresh,
    BiUser,
    BiUserPlus,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";

export default function Customer() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [balanceFilter, setBalanceFilter] = useState("all");

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    // Initialize DataTable
    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#customerTable")) {
            $("#customerTable").DataTable().destroy();
        }

        const dt = $("#customerTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("customers.index"),
                type: "GET",
                data: function (d) {
                    d.search = search;
                    d.status = statusFilter !== "all" ? statusFilter : "";
                    d.type = typeFilter !== "all" ? typeFilter : "";
                    d.balance = balanceFilter !== "all" ? balanceFilter : "";
                },
            },
            columns: [
                {
                    data: "DT_RowIndex",
                    title: "#",
                    className: "text-center",
                    width: "3%",
                    orderable: false,
                    searchable: false,
                },
                {
                    data: "name",
                    title: "Name",
                    className: "text-start fw-semibold",
                },
                {
                    data: "email",
                    title: "Email",
                    className: "text-start",
                },
                {
                    data: "phone",
                    title: "Phone",
                    className: "text-start",
                },
                {
                    data: "role",
                    title: "Type",
                    className: "text-center",
                    width: "10%",
                    render: function (data) {
                        let badgeClass = "bg-primary";
                        let typeText = "Regular";

                        if (data === "wholesale") {
                            badgeClass = "bg-info";
                            typeText = "Wholesale";
                        } else if (data === "corporate") {
                            badgeClass = "bg-success";
                            typeText = "Corporate";
                        } else if (data === "vip") {
                            badgeClass = "bg-warning text-dark";
                            typeText = "VIP";
                        }

                        return `<span class="badge ${badgeClass}">${typeText}</span>`;
                    },
                },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    width: "8%",
                    render: (data) => {
                        let badgeClass = "bg-success";
                        let statusText = "Active";

                        if (data === "inactive") {
                            badgeClass = "bg-secondary";
                            statusText = "Inactive";
                        } else if (data === "pending") {
                            badgeClass = "bg-warning text-dark";
                            statusText = "Pending";
                        } else if (data === "blocked") {
                            badgeClass = "bg-danger";
                            statusText = "Blocked";
                        }

                        return `<span class="badge ${badgeClass}">${statusText}</span>`;
                    },
                },
                {
                    data: "balance",
                    title: "Balance",
                    className: "text-end",
                    width: "10%",
                    render: function (data) {
                        const balance = parseFloat(data) || 0;
                        const formattedBalance = new Intl.NumberFormat(
                            "en-US",
                            {
                                style: "currency",
                                currency: "USD",
                            }
                        ).format(Math.abs(balance));

                        if (balance < 0) {
                            return `<span class="text-danger fw-bold">-${formattedBalance}</span>`;
                        } else if (balance > 0) {
                            return `<span class="text-success fw-bold">${formattedBalance}</span>`;
                        }
                        return `<span class="text-muted">${formattedBalance}</span>`;
                    },
                },
                {
                    data: "id",
                    title: "Actions",
                    className: "text-center",
                    width: "12%",
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return `
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-sm btn-outline-info view-btn" data-id="${data}">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-primary edit-btn" data-id="${data}">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-danger delete-btn" data-id="${data}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        `;
                    },
                },
            ],
            drawCallback: function () {
                // Bind custom button actions
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        editCustomer(id);
                    });

                $(".view-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        viewCustomer(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deleteCustomer(id);
                    });
            },
            initComplete: function () {
                dataTableInitialized.current = true;
            },
            language: {
                emptyTable:
                    '<div class="text-center py-5"><i class="bi bi-people display-4 text-muted"></i><p class="mt-2">No customers found</p></div>',
                zeroRecords:
                    '<div class="text-center py-5"><i class="bi bi-search display-4 text-muted"></i><p class="mt-2">No matching customers found</p></div>',
            },
            responsive: true,
            order: [[1, "asc"]],
            pageLength: 10,
            lengthMenu: [
                [10, 25, 50, -1],
                [10, 25, 50, "All"],
            ],
        });

        dataTable.current = dt;
        return dt;
    }, [search, statusFilter, typeFilter, balanceFilter]);

    // Refresh DataTable when filters change
    useEffect(() => {
        if (dataTableInitialized.current && dataTable.current) {
            dataTable.current.ajax.reload();
        }
    }, [search, statusFilter, typeFilter, balanceFilter]);

    // Initialize DataTable on mount
    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#customerTable")) {
                $("#customerTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    // Customer actions
    const editCustomer = (id) => {
        window.location.href = route("customers.edit", id);
    };

    const viewCustomer = (id) => {
        window.location.href = route("customers.show", id);
    };

    const deleteCustomer = async (id) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this! This will permanently delete the customer and their associated data.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!result.isConfirmed) return;

            const response = await xios.delete(route("customers.destroy", id));

            if (response.data.success) {
                toast.success(response.data.message);
                if (dataTable.current) {
                    dataTable.current.ajax.reload();
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while deleting the customer"
            );
        }
    };

    const exportCustomers = (type) => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("customers.export"));

            // Add all current filters to export URL
            Object.keys(params).forEach((key) => {
                if (
                    key !== "draw" &&
                    key !== "_" &&
                    key !== "start" &&
                    key !== "length"
                ) {
                    url.searchParams.append(key, params[key]);
                }
            });

            url.searchParams.append("type", type);
            window.open(url.toString(), "_blank");
        }
    };

    const printCustomers = () => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("customers.print"));

            // Add all current filters to print URL
            Object.keys(params).forEach((key) => {
                if (
                    key !== "draw" &&
                    key !== "_" &&
                    key !== "start" &&
                    key !== "length"
                ) {
                    url.searchParams.append(key, params[key]);
                }
            });

            window.open(url.toString(), "_blank");
        }
    };

    const refreshTable = () => {
        if (dataTable.current) {
            dataTable.current.ajax.reload();
            toast.success("Customer list refreshed!");
        }
    };

    return (
        <ErpLayout>
            <Head title="Customer Management" />

            <Container fluid>
                {/* Page Header */}
                <Row className="mb-4 align-items-center">
                    <Col md={6}>
                        <h3 className="fw-bold text-primary mb-2">
                            <BiUser className="me-2" />
                            Customer Management
                        </h3>
                        <p className="text-muted mb-0">
                            View, manage, and maintain all customer accounts.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <ButtonGroup className="mb-2 mb-md-0">
                            <Button
                                variant="outline-primary"
                                as={Link}
                                href={route("customers.create")}
                                className="d-flex align-items-center"
                            >
                                <BiUserPlus className="me-1" />
                                Add Customer
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Filters Row */}
                <Row className="mb-4">
                    <Col md={6} lg={3}>
                        <InputGroup>
                            <InputGroup.Text>
                                <BiSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search customers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={6} lg={2}>
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
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                                <option value="blocked">Blocked</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                    <Col md={6} lg={2}>
                        <InputGroup>
                            <InputGroup.Text>
                                <BiFilter />
                            </InputGroup.Text>
                            <Form.Select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="regular">Regular</option>
                                <option value="wholesale">Wholesale</option>
                                <option value="corporate">Corporate</option>
                                <option value="vip">VIP</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                    <Col md={6} lg={2}>
                        <InputGroup>
                            <InputGroup.Text>
                                <BiFilter />
                            </InputGroup.Text>
                            <Form.Select
                                value={balanceFilter}
                                onChange={(e) =>
                                    setBalanceFilter(e.target.value)
                                }
                            >
                                <option value="all">All Balances</option>
                                <option value="positive">Credit (+)</option>
                                <option value="negative">Debit (-)</option>
                                <option value="zero">Zero Balance</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                    <Col md={12} lg={3} className="text-lg-end mt-2 mt-lg-0">
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
                                        onClick={() => exportCustomers("excel")}
                                    >
                                        <FaFileExcel className="me-2 text-success" />{" "}
                                        Excel
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => exportCustomers("pdf")}
                                    >
                                        <FaFilePdf className="me-2 text-danger" />{" "}
                                        PDF
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={printCustomers}>
                                        <FaPrint className="me-2 text-secondary" />{" "}
                                        Print
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Customer Table Card */}
                <Card>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table
                                bordered
                                hover
                                responsive
                                id="customerTable"
                                className="align-middle mb-0"
                            />
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </ErpLayout>
    );
}
