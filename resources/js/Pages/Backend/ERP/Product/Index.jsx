import { Head, Link, router } from "@inertiajs/react";
import { Card, Button, ButtonGroup, Table } from "react-bootstrap";
import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { formatCurrency } from "@/Utils/helpers";
import { FaFileDownload, FaPlus } from "react-icons/fa";

import ErpLayout from "@/Layouts/ErpLayout";

export default function ProductsListing() {
    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#itemsTable")) {
            $("#itemsTable").DataTable().destroy();
        }

        const dataTable = $("#itemsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("product.index"),
                type: "GET",
                error: (xhr) => {
                    toast.error(
                        xhr.responseJSON?.message || "Failed to load products"
                    );
                },
            },
            columns: [
                { data: "product_image", title: "Image" },
                { data: "product_name", title: "Item Name" },
                { data: "category.name", title: "Category" },
                { data: "quantity", title: "Quantity" },
                {
                    data: "cost_per_item",
                    title: "Unit Purchase Cost",
                    render: function (data, type, row) {
                        return formatCurrency(data);
                    },
                },
                {
                    data: "price",
                    title: "Unit Selling Price",
                    render: function (data, type, row) {
                        return formatCurrency(data);
                    },
                },
                { data: "action", title: "Actions" },
            ],
            order: [[1, "asc"]],
            drawCallback: function () {
                // Edit button handler
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        router.get(route("product.edit", id));
                    });
            },
        });

        return dataTable;
    }, []);

    useEffect(() => {
        const dataTable = initializeDataTable();

        return () => {
            if ($.fn.DataTable.isDataTable("#itemsTable")) {
                dataTable.destroy();
            }
        };
    }, [initializeDataTable]);

    return (
        <ErpLayout>
            <Head title="Store Items Register" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">Store Items Register</h6>
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
                            href={route("product.create")}
                        >
                            <FaPlus size={16} className="me-1" />
                            New Item
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="px-0">
                    <Table
                        bordered
                        striped
                        hover
                        responsive
                        id="itemsTable"
                    ></Table>
                </Card.Body>
            </Card>
        </ErpLayout>
    );
}
