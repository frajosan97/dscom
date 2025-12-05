import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useCallback, useRef } from "react";
import { Card, Button, ButtonGroup, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { formatCurrency } from "@/Utils/helpers";
import { FaFileDownload, FaPlus, FaEdit } from "react-icons/fa";
import ErpLayout from "@/Layouts/ErpLayout";

export default function ProductsListing() {
    const dataTableRef = useRef(null);

    const initializeDataTable = useCallback(() => {
        // Clean up existing instance
        if (
            dataTableRef.current &&
            $.fn.DataTable.isDataTable("#productsTable")
        ) {
            dataTableRef.current.destroy();
            dataTableRef.current = null;
        }

        const table = $("#productsTable").DataTable({
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
                {
                    data: "product_image",
                    name: "product_image",
                    title: "Image",
                    orderable: false,
                    searchable: false,
                    width: "80px",
                },
                {
                    data: "product_name",
                    name: "product_name",
                    title: "Product",
                    className: "align-middle",
                },
                {
                    data: "category.name",
                    name: "category.name",
                    title: "Category",
                    className: "align-middle",
                },
                {
                    data: "total_quantity",
                    name: "total_quantity",
                    title: "Stock",
                    className: "text-center align-middle",
                    render: function (data, type, row) {
                        if (!row.track_quantity) {
                            return '<span class="badge bg-info">N/A</span>';
                        }

                        const quantity = parseInt(data) || 0;
                        const lowStock = row.low_stock_alert || 0;

                        let badgeClass = "bg-success";
                        if (quantity === 0) {
                            badgeClass = "bg-danger";
                        } else if (quantity <= lowStock) {
                            badgeClass = "bg-warning";
                        }

                        return `
                            <span class="badge ${badgeClass}">
                                ${quantity} ${
                            row.allow_backorders && quantity === 0
                                ? "(Backorder)"
                                : ""
                        }
                            </span>
                        `;
                    },
                },
                {
                    data: "cost_per_item",
                    name: "cost_per_item",
                    title: "Cost",
                    className: "text-end align-middle",
                    render: function (data) {
                        return formatCurrency(data || 0);
                    },
                },
                {
                    data: "base_price",
                    name: "base_price",
                    title: "Price",
                    className: "text-end align-middle",
                    render: function (data, type, row) {
                        const basePrice = formatCurrency(data || 0);

                        if (row.compare_price && row.compare_price > data) {
                            return `
                                <div>
                                    <div class="text-decoration-line-through text-muted small">
                                        ${formatCurrency(row.compare_price)}
                                    </div>
                                    <div class="fw-semibold text-danger">
                                        ${basePrice}
                                    </div>
                                </div>
                            `;
                        }

                        return basePrice;
                    },
                },
                {
                    data: "status_badge",
                    name: "is_active",
                    title: "Status",
                    className: "text-center align-middle",
                    orderable: false,
                    searchable: false,
                },
                {
                    data: "action",
                    name: "action",
                    title: "Actions",
                    className: "text-center align-middle",
                    orderable: false,
                    searchable: false,
                    width: "100px",
                },
            ],
            order: [[1, "asc"]],
            pageLength: 25,
            lengthMenu: [
                [10, 25, 50, 100, -1],
                [10, 25, 50, 100, "All"],
            ],
            responsive: true,
            drawCallback: function (settings) {
                // Attach event handlers after each table draw
                attachEventHandlers();
            },
            initComplete: function () {
                // Add custom search input for category
                this.api()
                    .columns(2)
                    .every(function () {
                        const column = this;
                        const select = $(
                            '<select class="form-control form-control-sm"><option value="">All Categories</option></select>'
                        )
                            .appendTo($(column.header()).empty())
                            .on("change", function () {
                                const val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );
                                column
                                    .search(
                                        val ? "^" + val + "$" : "",
                                        true,
                                        false
                                    )
                                    .draw();
                            });

                        // Get unique categories from data
                        const categories = new Set();
                        column.data().each(function (d) {
                            if (d) categories.add(d);
                        });

                        Array.from(categories)
                            .sort()
                            .forEach(function (category) {
                                select.append(
                                    '<option value="' +
                                        category +
                                        '">' +
                                        category +
                                        "</option>"
                                );
                            });
                    });
            },
        });

        dataTableRef.current = table;
        return table;
    }, []);

    const attachEventHandlers = useCallback(() => {
        // Edit button handler
        $(".edit-btn")
            .off("click")
            .on("click", function (e) {
                e.preventDefault();
                const id = $(this).data("id");
                if (id) {
                    router.get(route("product.edit", id));
                }
            });

        // Toggle status handler
        $(".toggle-status-btn")
            .off("click")
            .on("click", function (e) {
                e.preventDefault();
                const id = $(this).data("id");
                const currentStatus = $(this).data("status");
                const confirmed = confirm(
                    `Are you sure you want to ${
                        currentStatus ? "deactivate" : "activate"
                    } this product?`
                );

                if (confirmed) {
                    router.patch(route("product.toggle-status", id), {
                        onSuccess: () => {
                            toast.success(
                                "Product status updated successfully"
                            );
                            dataTableRef.current?.ajax.reload();
                        },
                        onError: (errors) => {
                            toast.error(
                                errors.message || "Failed to update status"
                            );
                        },
                    });
                }
            });

        // Delete handler
        $(".delete-btn")
            .off("click")
            .on("click", function (e) {
                e.preventDefault();
                const id = $(this).data("id");
                const confirmed = confirm(
                    "Are you sure you want to delete this product? This action cannot be undone."
                );

                if (confirmed) {
                    router.delete(route("product.destroy", id), {
                        onSuccess: () => {
                            toast.success("Product deleted successfully");
                            dataTableRef.current?.ajax.reload();
                        },
                        onError: (errors) => {
                            toast.error(
                                errors.message || "Failed to delete product"
                            );
                        },
                    });
                }
            });
    }, []);

    const handleExportExcel = useCallback(() => {
        if (dataTableRef.current) {
            const params = dataTableRef.current.ajax.params();
            const url = new URL(route("product.index"));

            // Add all DataTable parameters to export URL
            Object.keys(params).forEach((key) => {
                if (key !== "draw" && key !== "_") {
                    url.searchParams.append(key, params[key]);
                }
            });

            // Add export flag
            url.searchParams.append("export", "excel");

            // Trigger download
            window.open(url.toString(), "_blank");
        }
    }, []);

    useEffect(() => {
        // Initialize DataTable
        initializeDataTable();

        // Cleanup on unmount
        return () => {
            if (
                dataTableRef.current &&
                $.fn.DataTable.isDataTable("#productsTable")
            ) {
                dataTableRef.current.destroy();
            }
        };
    }, [initializeDataTable]);

    return (
        <ErpLayout>
            <Head title="Products" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent py-3">
                    <div>
                        <h5 className="mb-0 fw-semibold">
                            Products Management
                        </h5>
                        <small className="text-muted">
                            Manage your product inventory and listings
                        </small>
                    </div>
                    <ButtonGroup className="gap-2">
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-0 d-flex align-items-center"
                            onClick={handleExportExcel}
                        >
                            <FaFileDownload className="me-2" />
                            Export Excel
                        </Button>
                        <Button
                            variant="success"
                            size="sm"
                            className="rounded-0 d-flex align-items-center"
                            as={Link}
                            href={route("product.create")}
                        >
                            <FaPlus className="me-2" />
                            Add New Product
                        </Button>
                    </ButtonGroup>
                </Card.Header>

                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table
                            id="productsTable"
                            className="table-striped table-hover mb-0"
                            style={{ width: "100%" }}
                        >
                            <thead className="table-light">
                                <tr>
                                    <th>Image</th>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Stock</th>
                                    <th className="text-end">Cost</th>
                                    <th className="text-end">Price</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>{/* DataTable will populate this */}</tbody>
                        </Table>
                    </div>
                </Card.Body>

                <Card.Footer className="bg-transparent py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Showing page{" "}
                            <strong className="text-primary">1</strong> of
                            records
                        </small>
                        <div className="d-flex align-items-center gap-2">
                            <small className="text-muted me-2">
                                Quick Actions:
                            </small>
                            <Link
                                // href={route("product.import")}
                                className="btn btn-outline-secondary btn-sm rounded-0"
                            >
                                Bulk Import
                            </Link>
                            <Link
                                // href={route("product.reorder")}
                                className="btn btn-outline-secondary btn-sm rounded-0"
                            >
                                Reorder Products
                            </Link>
                        </div>
                    </div>
                </Card.Footer>
            </Card>
        </ErpLayout>
    );
}
