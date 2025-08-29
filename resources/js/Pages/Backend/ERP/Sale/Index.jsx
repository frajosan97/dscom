import { Head, Link } from "@inertiajs/react";
import { Card, Button, ButtonGroup, Table } from "react-bootstrap";
import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FaFileDownload, FaPlus } from "react-icons/fa";

import ErpLayout from "@/Layouts/ErpLayout";
import { formatCurrency } from "@/Utils/helpers";

export default function SalesListing() {
    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#salesTable")) {
            $("#salesTable").DataTable().destroy();
        }

        const dataTable = $("#salesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("sales.index"),
                type: "GET",
                error: (xhr) => {
                    toast.error(
                        xhr.responseJSON?.message || "Failed to load sales"
                    );
                },
            },
            columns: [
                {
                    data: "id",
                    title: "No",
                    render: function (data, type, row, meta) {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    },
                },
                {
                    data: "created_at",
                    title: "Date",
                    render: function (data) {
                        return new Date(data).toLocaleDateString();
                    },
                },
                {
                    data: "invoice_number",
                    title: "Invoice No",
                },
                {
                    data: "order_number",
                    title: "Order No",
                },
                {
                    data: "customer",
                    title: "Customer",
                    className: "text-capitalize",
                },
                {
                    data: "items_count",
                    title: "No of Items",
                    render: function (data, type, row) {
                        return data || 0;
                    },
                },
                {
                    data: "total",
                    title: "Total",
                    className: "text-end fw-semibold",
                    render: function (data) {
                        return formatCurrency(data);
                    },
                },
                {
                    data: "user.full_name",
                    title: "Cashier",
                    defaultContent: "N/A",
                },
                {
                    data: "action",
                    title: "Actions",
                    orderable: false,
                    searchable: false,
                },
            ],
            order: [[3, "desc"]],
            drawCallback: function () {
                $(".print-btn")
                    .off("click")
                    .on("click", function () {
                        const order = $(this).data("data");
                        handlePrint(order);
                    });
            },
            createdRow: function (row, data, dataIndex) {
                $(row).find("td:not(:last-child)").css("cursor", "pointer");
            },
        });

        return dataTable;
    }, []);

    useEffect(() => {
        const dataTable = initializeDataTable();

        return () => {
            if ($.fn.DataTable.isDataTable("#salesTable")) {
                dataTable.destroy();
            }
        };
    }, [initializeDataTable]);

    const handlePrint = (order) => {
        const width = 900;
        const height = 700;

        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const printWindow = window.open(
            "",
            "Print Receipt",
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        const logoUrl = `/storage/images/logos/logo.png`;
        const orderDate = new Date(order.created_at).toLocaleString();

        // Build item rows
        const itemsRows = order.items
            .map(
                (item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.id || ""}</td>
                <td>${item.hsn_code || "none"}</td>
                <td>${item.product_name}</td>
                <td style="text-align:right;">${formatCurrency(item.price)}</td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right;">${formatCurrency(
                    item.price * item.quantity
                )}</td>
                <td style="text-align:center;">${item.gst || "0%"}</td>
                <td style="text-align:right;">${formatCurrency(
                    item.price * item.quantity
                )}</td>
            </tr>`
            )
            .join("");

        // Build payments rows (if needed)
        const paymentsRows =
            order?.payments
                ?.map(
                    (p, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${p.payment_method_name}</td>
                <td style="text-align:right;">${formatCurrency(p.amount)}</td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
            </tr>`
                )
                .join("") || "";

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice ${order.invoice_number}</title>
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
                            <p>Avenue Du Tchad, No.7 IMMEUBLE RENAISSANCE, Local 6<br />Ref. Opposite EQUITY BCDC HEAD OFFICE</p>
                        </div>
                    </div>

                    <!-- Title -->
                    <div class="title">Sales Receipt</div>

                    <!-- Customer & Invoice Info -->
                    <table>
                        <tr>
                            <td>
                                <strong>Name:</strong> ${
                                    order.customer?.name || ""
                                }<br/>
                                <strong>Phone:</strong> ${
                                    order.customer?.phone || ""
                                }<br/>
                                <strong>Address:</strong> ${
                                    order.customer?.address || ""
                                }<br/>
                                <strong>Other Information:</strong> ${
                                    order.customer?.info || ""
                                }
                            </td>
                            <td>
                                <strong>Invoice No:</strong> ${
                                    order.invoice_number
                                }<br/>
                                <strong>Date:</strong> ${orderDate}<br/>
                                <strong>Remarks:</strong> ${
                                    order.remarks || ""
                                }<br/>
                                <strong>GST IN:</strong> ${
                                    order.gst_in || ""
                                }<br/>
                                <strong>Salesman:</strong> ${
                                    order.user?.name || ""
                                }
                            </td>
                        </tr>
                    </table>

                    <!-- Items -->
                    <table>
                        <thead>
                            <tr>
                                <th>Sl No</th>
                                <th>Item Code</th>
                                <th>HSN Code</th>
                                <th>Store Items Name</th>
                                <th>Unit Price</th>
                                <th>Qty</th>
                                <th>Amount</th>
                                <th>GST</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                        </tbody>
                    </table>

                    <!-- Totals -->
                    <table class="no-border" style="margin-top:10px;">
                        <tr><td>Total Before TAX</td><td style="text-align:right;">${formatCurrency(
                            order.subtotal
                        )}</td></tr>
                        <tr><td>CGST</td><td style="text-align:right;">${
                            order.cgst || "0.00"
                        }</td></tr>
                        <tr><td>SGST</td><td style="text-align:right;">${
                            order.sgst || "0.00"
                        }</td></tr>
                        <tr class="summary"><td>Bill Total</td><td style="text-align:right;">${formatCurrency(
                            order.total
                        )}</td></tr>
                        <tr class="summary"><td>Net Total</td><td style="text-align:right;">${formatCurrency(
                            order.total
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
                        <p>Thank you for shopping with us!</p>
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
            <Head title="Sales Management" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">Sales Management</h6>
                    <ButtonGroup className="gap-1">
                        <Button
                            variant="primary"
                            size="sm"
                            className="rounded-0"
                        >
                            <FaFileDownload size={16} className="me-1" />
                            Export Excel
                        </Button>
                        <Button
                            variant="success"
                            size="sm"
                            className="rounded-0"
                            as={Link}
                            href={route("sales.create")}
                        >
                            <FaPlus size={16} className="me-1" />
                            New Sale
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="px-0">
                    <Table
                        bordered
                        striped
                        hover
                        responsive
                        id="salesTable"
                    ></Table>
                </Card.Body>
            </Card>
        </ErpLayout>
    );
}
