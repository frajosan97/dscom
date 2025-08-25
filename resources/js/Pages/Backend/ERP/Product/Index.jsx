import { Head, Link, router } from "@inertiajs/react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    ButtonGroup,
    Table,
} from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import useFilterOptions from "@/Hooks/useData";

export default function ProductsListing() {
    const { categories, brands, branches } = useFilterOptions();
    const [filters, setFilters] = useState({
        branch_id: "",
        catalogue_id: "",
        brand_id: "",
        is_verified: "",
        is_low_stock: "",
        is_active: "",
    });

    const filterFields = [
        {
            name: "branch_id",
            type: "select",
            placeholder: "All Branches",
            options: branches.map((b) => ({
                value: b.id,
                label: b.name,
            })),
        },
        {
            name: "catalogue_id",
            type: "select",
            placeholder: "All Categories",
            options: categories.map((c) => ({ value: c.id, label: c.name })),
        },
        {
            name: "brand_id",
            type: "select",
            placeholder: "All Brands",
            options: brands.map((b) => ({ value: b.id, label: b.name })),
        },
        {
            name: "is_low_stock",
            type: "select",
            placeholder: "Stock Status",
            options: [
                { value: "false", label: "In Stock" },
                { value: "true", label: "Low Stock" },
                { value: "out", label: "Out Of Stock" },
            ],
        },
    ];

    const applyFilters = () => {
        reloadTable();
    };

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
                data: function (d) {
                    return {
                        ...d,
                        ...filters,
                    };
                },
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
                { data: "price_list", title: "Unit Purchase Cost" },
                { data: "price_list", title: "Unit Selling Price" },
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

                // Delete button handler
                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        if (
                            confirm(
                                "Are you sure you want to delete this product?"
                            )
                        ) {
                            axios
                                .delete(route("product.destroy", id))
                                .then((response) => {
                                    dataTable.ajax.reload();
                                    toast.success(response.data.message);
                                })
                                .catch((error) => {
                                    toast.error(
                                        error.response?.data?.message ||
                                            "Failed to delete product"
                                    );
                                });
                        }
                    });

                // Feature toggle handler
                $(".feature-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        axios
                            .post(route("product.toggle-featured", id))
                            .then((response) => {
                                dataTable.ajax.reload();
                                toast.success(response.data.message);
                            })
                            .catch((error) => {
                                toast.error(
                                    error.response?.data?.message ||
                                        "Failed to update featured status"
                                );
                            });
                    });
            },
        });

        return dataTable;
    }, [filters]);

    useEffect(() => {
        const dataTable = initializeDataTable();

        return () => {
            if ($.fn.DataTable.isDataTable("#itemsTable")) {
                dataTable.destroy();
            }
        };
    }, [initializeDataTable]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetFilters = () => {
        setFilters({
            category_id: "",
            brand_id: "",
            is_active: "",
            stock_status: "",
        });
    };

    return (
        <ErpLayout>
            <Head title="Store Items Register" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">Store Items Register</h6>
                    <ButtonGroup className="gap-1">
                        <Button variant="primary" className="rounded-0">
                            Import
                        </Button>
                        <Button variant="info" className="rounded-0">
                            Export Excel
                        </Button>
                        <Button
                            variant="success"
                            className="rounded-0"
                            as={Link}
                            href={route("product.create")}
                        >
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
                        className="w-100"
                    ></Table>
                </Card.Body>
            </Card>
        </ErpLayout>
    );
}
