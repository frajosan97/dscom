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
    BiReceipt,
} from "react-icons/bi";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";
import { formatCurrency } from "@/Utils/helpers";
import { printReceipt } from "@/Components/Print/PrintReceipt";
import { FaFileExcel, FaFilePdf, FaPrint, FaPlus } from "react-icons/fa";

export default function SalesListing() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("today");
    const [customerFilter, setCustomerFilter] = useState("all");

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    // Initialize DataTable
    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#salesTable")) {
            $("#salesTable").DataTable().destroy();
        }

        const dt = $("#salesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("sales.index"),
                type: "GET",
                data: function (d) {
                    d.search = search;
                    d.status = statusFilter !== "all" ? statusFilter : "";
                    d.date_filter = dateFilter;
                    d.customer = customerFilter !== "all" ? customerFilter : "";
                },
            },
            columns: [
                {
                    data: "id",
                    title: "No",
                    className: "text-center",
                    width: "5%",
                    render: function (data, type, row, meta) {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    },
                },
                {
                    data: "created_at",
                    title: "Date",
                    className: "text-start",
                    width: "10%",
                    render: function (data) {
                        return new Date(data).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        });
                    },
                },
                {
                    data: "invoice_number",
                    title: "Invoice No",
                    className: "text-start",
                    width: "12%",
                },
                {
                    data: "order_number",
                    title: "Order No",
                    className: "text-start",
                    width: "12%",
                },
                {
                    data: "customer",
                    title: "Customer",
                    className: "text-start text-capitalize",
                    render: function (data) {
                        return (
                            data ||
                            '<span class="text-muted">Walk-in Customer</span>'
                        );
                    },
                },
                {
                    data: "items_count",
                    title: "Items",
                    className: "text-center",
                    width: "8%",
                    render: function (data, type, row) {
                        return `<span class="badge bg-primary">${
                            data || 0
                        }</span>`;
                    },
                },
                {
                    data: "total",
                    title: "Total Amount",
                    className: "text-end fw-semibold",
                    width: "12%",
                    render: function (data) {
                        return `<span class="text-success fw-bold">${formatCurrency(
                            data || 0
                        )}</span>`;
                    },
                },
                {
                    data: "user.full_name",
                    title: "Cashier",
                    className: "text-start",
                    width: "10%",
                    render: function (data) {
                        return data || '<span class="text-muted">N/A</span>';
                    },
                },
                {
                    data: "payment_status",
                    title: "Status",
                    className: "text-center",
                    width: "10%",
                    render: function (data) {
                        let badgeClass = "bg-secondary";
                        let statusText = "Pending";

                        if (data === "paid") {
                            badgeClass = "bg-success";
                            statusText = "Paid";
                        } else if (data === "partial") {
                            badgeClass = "bg-warning";
                            statusText = "Partial";
                        } else if (data === "refunded") {
                            badgeClass = "bg-danger";
                            statusText = "Refunded";
                        }

                        return `<span class="badge ${badgeClass}">${statusText}</span>`;
                    },
                },
                {
                    data: "id",
                    title: "Actions",
                    className: "text-center",
                    width: "13%",
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return `
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-sm btn-outline-info view-btn" data-id="${data}">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-primary print-btn" data-id="${data}" data-order='${JSON.stringify(
                            row
                        )}'>
                                    <i class="bi bi-printer"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-success invoice-btn" data-id="${data}">
                                    <i class="bi bi-receipt"></i>
                                </button>
                            </div>
                        `;
                    },
                },
            ],
            drawCallback: function () {
                // Bind custom button actions
                $(".view-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        viewSale(id);
                    });

                $(".print-btn")
                    .off("click")
                    .on("click", function () {
                        const orderData = $(this).data("order");
                        printReceipt(orderData);
                    });

                $(".invoice-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        downloadInvoice(id);
                    });

                // Make rows clickable (except actions column)
                $(this.api().table().body())
                    .find("td:not(:last-child)")
                    .css("cursor", "pointer")
                    .off("click")
                    .on("click", function () {
                        const row = dataTable.current
                            .api()
                            .row($(this).parent());
                        const data = row.data();
                        if (data && data.id) {
                            viewSale(data.id);
                        }
                    });
            },
            initComplete: function () {
                dataTableInitialized.current = true;
            },
            language: {
                emptyTable:
                    '<div class="text-center py-5"><i class="bi bi-cart display-4 text-muted"></i><p class="mt-2">No sales records found</p></div>',
                zeroRecords:
                    '<div class="text-center py-5"><i class="bi bi-search display-4 text-muted"></i><p class="mt-2">No matching sales found</p></div>',
            },
            responsive: true,
            order: [[1, "desc"]],
            pageLength: 10,
            lengthMenu: [
                [10, 25, 50, -1],
                [10, 25, 50, "All"],
            ],
        });

        dataTable.current = dt;
        return dt;
    }, [search, statusFilter, dateFilter, customerFilter]);

    // Refresh DataTable when filters change
    useEffect(() => {
        if (dataTableInitialized.current && dataTable.current) {
            dataTable.current.ajax.reload();
        }
    }, [search, statusFilter, dateFilter, customerFilter]);

    // Initialize DataTable on mount
    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#salesTable")) {
                $("#salesTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    // Sales actions
    const viewSale = (id) => {
        window.location.href = route("sales.show", id);
    };

    const downloadInvoice = async (id) => {
        try {
            const response = await xios.get(
                route("sales.invoice.download", id),
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Invoice downloaded successfully!");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to download invoice"
            );
        }
    };

    const exportSales = (type) => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("sales.export"));

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

    const printSales = () => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("sales.print"));

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
            toast.success("Sales list refreshed!");
        }
    };

    return (
        <ErpLayout>
            <Head title="Sales Management" />

            <Container fluid>
                {/* Page Header */}
                <Row className="mb-4 align-items-center">
                    <Col md={6}>
                        <h3 className="fw-bold text-primary mb-2">
                            <BiReceipt className="me-2" />
                            Sales Management
                        </h3>
                        <p className="text-muted mb-0">
                            View, manage, and track all sales transactions.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <ButtonGroup className="mb-2 mb-md-0">
                            <Button
                                variant="outline-primary"
                                as={Link}
                                href={route("sales.create")}
                                className="d-flex align-items-center"
                            >
                                <FaPlus className="me-1" />
                                New Sale
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
                                placeholder="Search sales..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={6} lg={3}>
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
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="partial">Partial</option>
                                <option value="refunded">Refunded</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                    <Col md={6} lg={3}>
                        <InputGroup>
                            <InputGroup.Text>
                                <BiFilter />
                            </InputGroup.Text>
                            <Form.Select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                                <option value="last_month">Last Month</option>
                                <option value="custom">Custom Range</option>
                                <option value="all">All Time</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                    <Col md={6} lg={3} className="text-lg-end mt-2 mt-lg-0">
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
                                        onClick={() => exportSales("excel")}
                                    >
                                        <FaFileExcel className="me-2 text-success" />{" "}
                                        Excel
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => exportSales("pdf")}
                                    >
                                        <FaFilePdf className="me-2 text-danger" />{" "}
                                        PDF
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={printSales}>
                                        <FaPrint className="me-2 text-secondary" />{" "}
                                        Print
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Sales Table Card */}
                <Card>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table
                                bordered
                                hover
                                responsive
                                id="salesTable"
                                className="align-middle mb-0"
                            />
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </ErpLayout>
    );
}
