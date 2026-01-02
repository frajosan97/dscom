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
    BiUpload,
    BiPackage,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";
import { formatCurrency } from "@/Utils/helpers";
import { FaFileExcel, FaFilePdf, FaPrint, FaPlus } from "react-icons/fa";
import ImportProductModal from "@/components/Modals/ImportProductModal";
import useData from "@/Hooks/useData";

export default function ProductsListing() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showImportModal, setShowImportModal] = useState(false);
    const [importTemplateUrl, setImportTemplateUrl] = useState("");
    const { categories } = useData();

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    // Initialize DataTable
    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#productsTable")) {
            $("#productsTable").DataTable().destroy();
        }

        const dt = $("#productsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("product.index"),
                type: "GET",
                data: function (d) {
                    d.search = search;
                    d.status = statusFilter !== "all" ? statusFilter : "";
                    d.category = categoryFilter !== "all" ? categoryFilter : "";
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
            drawCallback: function () {
                // Bind custom button actions
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        editProduct(id);
                    });

                $(".view-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        viewProduct(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deleteProduct(id);
                    });
            },
            initComplete: function () {
                dataTableInitialized.current = true;
            },
            language: {
                emptyTable:
                    '<div class="text-center py-5"><i class="bi bi-inbox display-4 text-muted"></i><p class="mt-2">No products found</p></div>',
                zeroRecords:
                    '<div class="text-center py-5"><i class="bi bi-search display-4 text-muted"></i><p class="mt-2">No matching products found</p></div>',
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
    }, [search, statusFilter, categoryFilter]);

    // Refresh DataTable when filters change
    useEffect(() => {
        if (dataTableInitialized.current && dataTable.current) {
            dataTable.current.ajax.reload();
        }
    }, [search, statusFilter, categoryFilter]);

    // Initialize DataTable on mount
    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#productsTable")) {
                $("#productsTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    const handleImportSuccess = () => {
        if (dataTable.current) {
            dataTable.current.ajax.reload();
            toast.success("Products imported successfully!");
        }
    };

    // Product actions
    const editProduct = (id) => {
        window.location.href = route("product.edit", id);
    };

    const viewProduct = (id) => {
        window.location.href = route("product.show", id);
    };

    const deleteProduct = async (id) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this! This will permanently delete the product.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!result.isConfirmed) return;

            const response = await xios.delete(route("product.destroy", id));

            if (response.data.success) {
                toast.success(response.data.message);
                if (dataTable.current) {
                    dataTable.current.ajax.reload();
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while deleting the product"
            );
        }
    };

    const exportProducts = (type) => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("product.export"));

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

    const printProducts = () => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("product.print"));

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
            toast.success("Product list refreshed!");
        }
    };

    return (
        <ErpLayout>
            <Head title="Product Management" />

            <Container fluid>
                {/* Page Header */}
                <Row className="mb-4 align-items-center">
                    <Col md={6}>
                        <h3 className="fw-bold text-primary mb-2">
                            <BiPackage className="me-2" />
                            Product Management
                        </h3>
                        <p className="text-muted mb-0">
                            View, manage, and maintain your product inventory.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <ButtonGroup className="mb-2 mb-md-0">
                            <Button
                                variant="outline-primary"
                                as={Link}
                                href={route("product.create")}
                                className="d-flex align-items-center"
                            >
                                <FaPlus className="me-1" />
                                Add Product
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
                    <Col md={6} lg={3}>
                        <InputGroup>
                            <InputGroup.Text>
                                <BiSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search products..."
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
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                    <Col md={6} lg={3}>
                        <InputGroup>
                            <InputGroup.Text>
                                <BiFilter />
                            </InputGroup.Text>
                            <Form.Select
                                value={categoryFilter}
                                onChange={(e) =>
                                    setCategoryFilter(e.target.value)
                                }
                            >
                                <option value="all">All Categories</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
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
                                        onClick={() => exportProducts("excel")}
                                    >
                                        <FaFileExcel className="me-2 text-success" />{" "}
                                        Excel
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => exportProducts("pdf")}
                                    >
                                        <FaFilePdf className="me-2 text-danger" />{" "}
                                        PDF
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={printProducts}>
                                        <FaPrint className="me-2 text-secondary" />{" "}
                                        Print
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Product Table Card */}
                <Card>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table
                                bordered
                                hover
                                responsive
                                id="productsTable"
                                className="align-middle mb-0"
                            />
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            {/* Import Modal */}
            <ImportProductModal
                show={showImportModal}
                onHide={() => setShowImportModal(false)}
                onImportSuccess={handleImportSuccess}
                importTemplateUrl={importTemplateUrl}
            />
        </ErpLayout>
    );
}
