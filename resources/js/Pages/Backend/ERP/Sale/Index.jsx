import { Head, Link } from "@inertiajs/react";
import { Card, Button, ButtonGroup, Table } from "react-bootstrap";
import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FaFileDownload, FaPlus } from "react-icons/fa";

import ErpLayout from "@/Layouts/ErpLayout";
import { formatCurrency } from "@/Utils/helpers";
import { printReceipt } from "@/Components/Print/PrintReceipt";

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
                        printReceipt(order);
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
