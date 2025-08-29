import { Head, Link, usePage } from "@inertiajs/react";
import {
    Card,
    Button,
    ButtonGroup,
    Table,
    Badge,
    Dropdown,
} from "react-bootstrap";
import { useEffect, useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
    FaPlus,
    FaEdit,
    FaEye,
    FaFileInvoice,
    FaUserCog,
    FaTools,
    FaCalendarAlt,
    FaFilter,
} from "react-icons/fa";

import ErpLayout from "@/Layouts/ErpLayout";
import { formatCurrency, formatDate } from "@/Utils/helpers";

export default function RepairOrders() {
    const { statusOptions, priorityOptions } = usePage().props;
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#repairOrdersTable")) {
            $("#repairOrdersTable").DataTable().destroy();
        }

        const dataTable = $("#repairOrdersTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("repair-orders.index"),
                type: "GET",
                data: function (d) {
                    d.status = statusFilter !== "all" ? statusFilter : "";
                    d.priority = priorityFilter !== "all" ? priorityFilter : "";
                },
                error: (xhr) => {
                    toast.error(
                        xhr.responseJSON?.message ||
                            "Failed to load repair orders"
                    );
                },
            },
            columns: [
                {
                    data: "order_number",
                    title: "RO #",
                },
                {
                    data: "created_at",
                    title: "Date",
                    render: function (data) {
                        return formatDate(data);
                    },
                },
                {
                    data: "customer.name",
                    title: "Customer",
                },
                {
                    data: "device_type.name",
                    title: "Device Type",
                    render: function (data) {
                        return data || "N/A";
                    },
                },
                {
                    data: "device_brand",
                    title: "Brand",
                    render: function (data) {
                        return data || "N/A";
                    },
                },
                {
                    data: "device_model",
                    title: "Device",
                },
                {
                    data: "status",
                    title: "Status",
                },
                {
                    data: "technician.full_name",
                    title: "Technician",
                },
                {
                    data: "total_amount",
                    title: "Total",
                    className: "text-end fw-semibold",
                    render: function (data) {
                        return formatCurrency(data);
                    },
                },
                {
                    data: "expected_completion_date",
                    title: "ETA",
                    render: function (data) {
                        return data ? formatDate(data) : "N/A";
                    },
                },
                {
                    data: "action",
                    title: "Actions",
                    orderable: false,
                    searchable: false,
                },
            ],
            order: [[0, "desc"]],
            createdRow: function (row, data, dataIndex) {
                $(row).find("td:not(:last-child)").css("cursor", "pointer");
                $(row).on("click", function (e) {
                    if (!$(e.target).closest("button, a").length) {
                        window.location = route("repair-orders.show", data.id);
                    }
                });
            },
            drawCallback: function () {
                $(".print-btn")
                    .off("click")
                    .on("click", function () {
                        const order = $(this).data("data");
                        handlePrint(order);
                    });
            },
        });

        return dataTable;
    }, [statusFilter, priorityFilter]);

    useEffect(() => {
        const dataTable = initializeDataTable();

        return () => {
            if ($.fn.DataTable.isDataTable("#repairOrdersTable")) {
                dataTable.destroy();
            }
        };
    }, [initializeDataTable, statusFilter, priorityFilter]);

    const handlePrint = (order) => {
        const width = 900;
        const height = 700;

        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const printWindow = window.open(
            "",
            "Print Repair Invoice",
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        const logoUrl = `/storage/images/logos/logo.png`;
        const orderDate = new Date(order.created_at).toLocaleString();

        // Parts/Services rows
        const partsRows =
            order?.parts
                ?.map(
                    (p, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${p.part_name}</td>
                        <td>${p.part_number || "-"}</td>
                        <td style="text-align:right;">${formatCurrency(
                            p.selling_price
                        )}</td>
                        <td style="text-align:center;">${p.quantity}</td>
                        <td style="text-align:right;">${formatCurrency(
                            p.total
                        )}</td>
                    </tr>`
                )
                .join("") || "";

        // Payments rows
        const paymentsRows =
            order?.payments
                ?.map(
                    (p, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${p.payment_method}</td>
                    <td style="text-align:right;">${formatCurrency(
                        p.amount
                    )}</td>
                    <td>${new Date(p.payment_date).toLocaleDateString()}</td>
                </tr>`
                )
                .join("") || "";

        printWindow.document.write(`
            <html>
                <head>
                    <title>Repair Invoice ${
                        order.invoice_number || order.order_number
                    }</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 15px; font-size: 14px; }
                        .header { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                        .header img { max-width: 120px; }
                        .company { text-align: right; }
                        .company h2 { margin: 0; }
                        .title { text-align: center; border: 1px solid #000; padding: 5px; font-weight: bold; margin: 10px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #000; padding: 6px; text-align: left; }
                        th { background: #f2f2f2; }
                        .no-border td { border: none; }
                        .summary td { font-weight: bold; }
                        .footer { margin-top: 20px; text-align: center; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <!-- Header -->
                    <div class="header">
                        <div>
                            <img src="${logoUrl}" alt="Logo" />
                        </div>
                        <div class="company">
                            <h2>DSCOM Technologies Ltd</h2>
                            <p>Tell: +243 (894) 779-059</p>
                            <p>Email: info@dscomtechnologies.com</p>
                            <p>Avenue Du Tchad, No.7 IMMEUBLE RENAISSANCE, Local 6<br />Opposite EQUITY BCDC HEAD OFFICE</p>
                        </div>
                    </div>

                    <!-- Title -->
                    <div class="title">Repair Invoice</div>

                    <!-- Customer & Order Info -->
                    <table>
                        <tr>
                            <td>
                                <strong>Name:</strong> ${
                                    order.customer?.name || ""
                                }<br/>
                                <strong>Phone:</strong> ${
                                    order.customer?.phone || ""
                                }<br/>
                                <strong>Email:</strong> ${
                                    order.customer?.email || ""
                                }<br/>
                                <strong>Device:</strong> ${
                                    order.device_brand || ""
                                } ${order.device_model || ""}<br/>
                                <strong>Serial:</strong> ${
                                    order.device_serial || ""
                                }
                            </td>
                            <td>
                                <strong>Invoice No:</strong> ${
                                    order.invoice_number || "-"
                                }<br/>
                                <strong>Order No:</strong> ${
                                    order.order_number
                                }<br/>
                                <strong>Date:</strong> ${orderDate}<br/>
                                <strong>Status:</strong> ${order.status}<br/>
                                <strong>Technician:</strong> ${
                                    order.technician?.full_name || ""
                                }
                            </td>
                        </tr>
                    </table>

                    <!-- Services/Parts -->
                    <h3>Parts & Services</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Part Name</th>
                                <th>Part No</th>
                                <th>Unit Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                                partsRows ||
                                "<tr><td colspan='6' style='text-align:center;'>No parts added</td></tr>"
                            }
                        </tbody>
                    </table>

                    <!-- Totals -->
                    <table class="no-border" style="margin-top:10px;">
                        <tr><td>Diagnosis Fee</td><td style="text-align:right;">${formatCurrency(
                            order.diagnosis_fee || 0
                        )}</td></tr>
                        <tr><td>Estimated Cost</td><td style="text-align:right;">${formatCurrency(
                            order.estimated_cost || 0
                        )}</td></tr>
                        <tr><td>Final Cost</td><td style="text-align:right;">${formatCurrency(
                            order.final_cost || 0
                        )}</td></tr>
                        <tr><td>Tax</td><td style="text-align:right;">${formatCurrency(
                            order.tax_amount || 0
                        )}</td></tr>
                        <tr><td>Discount</td><td style="text-align:right;">${formatCurrency(
                            order.discount_amount || 0
                        )}</td></tr>
                        <tr class="summary"><td>Grand Total</td><td style="text-align:right;">${formatCurrency(
                            order.total_amount || 0
                        )}</td></tr>
                        <tr><td>Paid</td><td style="text-align:right;">${formatCurrency(
                            order.amount_paid || 0
                        )}</td></tr>
                        <tr><td>Balance</td><td style="text-align:right;">${formatCurrency(
                            order.balance_due || 0
                        )}</td></tr>
                    </table>

                    <!-- Payments -->
                    ${
                        paymentsRows
                            ? `<h3>Payments</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Method</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>${paymentsRows}</tbody>
                            </table>`
                            : ""
                    }

                    <div class="footer">
                        <p>Thank you for trusting us with your repair!</p>
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.onafterprint = () => {
                printWindow.close();
            };
            printWindow.print();
        };
    };

    return (
        <ErpLayout>
            <Head title="Repair Orders Management" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <div>
                        <h6 className="mb-0 fw-semibold">
                            Repair Orders Management
                        </h6>
                        <small className="text-muted">
                            Manage all repair orders and track their progress
                        </small>
                    </div>
                    <ButtonGroup className="gap-1">
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="outline-secondary"
                                size="sm"
                                className="rounded-0"
                            >
                                <FaFilter className="me-1" />
                                Status:{" "}
                                {statusFilter === "all"
                                    ? "All"
                                    : statusOptions?.[statusFilter] ||
                                      statusFilter}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() => setStatusFilter("all")}
                                >
                                    All Statuses
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                {Object.entries(statusOptions || {}).map(
                                    ([value, label]) => (
                                        <Dropdown.Item
                                            key={value}
                                            onClick={() =>
                                                setStatusFilter(value)
                                            }
                                            active={statusFilter === value}
                                        >
                                            {label}
                                        </Dropdown.Item>
                                    )
                                )}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown>
                            <Dropdown.Toggle
                                variant="outline-secondary"
                                size="sm"
                                className="rounded-0"
                            >
                                <FaFilter className="me-1" />
                                Priority:{" "}
                                {priorityFilter === "all"
                                    ? "All"
                                    : priorityOptions?.[priorityFilter] ||
                                      priorityFilter}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() => setPriorityFilter("all")}
                                >
                                    All Priorities
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                {Object.entries(priorityOptions || {}).map(
                                    ([value, label]) => (
                                        <Dropdown.Item
                                            key={value}
                                            onClick={() =>
                                                setPriorityFilter(value)
                                            }
                                            active={priorityFilter === value}
                                        >
                                            {label}
                                        </Dropdown.Item>
                                    )
                                )}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Button
                            variant="success"
                            size="sm"
                            className="rounded-0"
                            as={Link}
                            href={route("repair-orders.create")}
                        >
                            <FaPlus size={16} className="me-1" />
                            New Repair Order
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="px-0">
                    <Table
                        bordered
                        striped
                        hover
                        responsive
                        id="repairOrdersTable"
                        className="mb-0"
                    />
                </Card.Body>
            </Card>
        </ErpLayout>
    );
}
