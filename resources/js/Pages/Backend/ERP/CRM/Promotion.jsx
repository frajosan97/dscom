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
    Modal,
} from "react-bootstrap";
import {
    BiSearch,
    BiFilter,
    BiDownload,
    BiRefresh,
    BiTag,
    BiPlus,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";

export default function Promotion() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        code: "",
        discount_type: "percentage",
        discount_value: "",
        start_date: "",
        end_date: "",
        status: "active",
        usage_limit: "",
        minimum_purchase: "",
    });

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    // Initialize DataTable
    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#promotionTable")) {
            $("#promotionTable").DataTable().destroy();
        }

        const dt = $("#promotionTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("promotion.index"),
                type: "GET",
                data: function (d) {
                    d.search = search;
                    d.status = statusFilter !== "all" ? statusFilter : "";
                    d.type = typeFilter !== "all" ? typeFilter : "";
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
                    data: "title",
                    title: "Title",
                    className: "text-start fw-semibold",
                },
                {
                    data: "code",
                    title: "Code",
                    className: "text-center",
                    width: "10%",
                    render: function (data) {
                        return `<code class="bg-light p-1 rounded">${data}</code>`;
                    },
                },
                {
                    data: "discount_display",
                    title: "Discount",
                    className: "text-center",
                    width: "10%",
                    render: function (data, type, row) {
                        let badgeClass = "bg-success";
                        if (row.discount_type === "fixed") {
                            badgeClass = "bg-info";
                        }
                        return `<span class="badge ${badgeClass}">${data}</span>`;
                    },
                },
                {
                    data: "start_date",
                    title: "Start Date",
                    className: "text-center",
                    width: "10%",
                    render: function (data) {
                        return new Date(data).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        });
                    },
                },
                {
                    data: "end_date",
                    title: "End Date",
                    className: "text-center",
                    width: "10%",
                    render: function (data) {
                        return new Date(data).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        });
                    },
                },
                {
                    data: "usage_count",
                    title: "Usage",
                    className: "text-center",
                    width: "8%",
                    render: function (data, type, row) {
                        const usage = data || 0;
                        const limit = row.usage_limit || "∞";
                        return `
                            <div class="d-flex flex-column align-items-center">
                                <span class="fw-semibold">${usage}</span>
                                <small class="text-muted">/ ${limit}</small>
                            </div>
                        `;
                    },
                },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    width: "8%",
                    render: function (data) {
                        let badgeClass = "bg-success";
                        let statusText = "Active";

                        if (data === "upcoming") {
                            badgeClass = "bg-warning text-dark";
                            statusText = "Upcoming";
                        } else if (data === "expired") {
                            badgeClass = "bg-secondary";
                            statusText = "Expired";
                        } else if (data === "inactive") {
                            badgeClass = "bg-danger";
                            statusText = "Inactive";
                        }

                        return `<span class="badge ${badgeClass}">${statusText}</span>`;
                    },
                },
                {
                    data: "id",
                    title: "Actions",
                    className: "text-center",
                    width: "15%",
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
                                <button type="button" class="btn btn-sm btn-outline-success copy-btn" data-code="${row.code}">
                                    <i class="bi bi-clipboard"></i>
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
                $(".view-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        viewPromotion(id);
                    });

                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        editPromotion(id);
                    });

                $(".copy-btn")
                    .off("click")
                    .on("click", function () {
                        const code = $(this).data("code");
                        navigator.clipboard.writeText(code);
                        toast.success(`Copied: ${code}`);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deletePromotion(id);
                    });
            },
            initComplete: function () {
                dataTableInitialized.current = true;
            },
            language: {
                emptyTable:
                    '<div class="text-center py-5"><i class="bi bi-percent display-4 text-muted"></i><p class="mt-2">No promotions found</p></div>',
                zeroRecords:
                    '<div class="text-center py-5"><i class="bi bi-search display-4 text-muted"></i><p class="mt-2">No matching promotions found</p></div>',
            },
            responsive: true,
            order: [[4, "desc"]],
            pageLength: 10,
            lengthMenu: [
                [10, 25, 50, -1],
                [10, 25, 50, "All"],
            ],
        });

        dataTable.current = dt;
        return dt;
    }, [search, statusFilter, typeFilter]);

    // Refresh DataTable when filters change
    useEffect(() => {
        if (dataTableInitialized.current && dataTable.current) {
            dataTable.current.ajax.reload();
        }
    }, [search, statusFilter, typeFilter]);

    // Initialize DataTable on mount
    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#promotionTable")) {
                $("#promotionTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    // Modal handlers
    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            title: "",
            code: "",
            discount_type: "percentage",
            discount_value: "",
            start_date: "",
            end_date: "",
            status: "active",
            usage_limit: "",
            minimum_purchase: "",
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "discount_value" ||
                name === "usage_limit" ||
                name === "minimum_purchase"
                    ? value === ""
                        ? ""
                        : Number(value)
                    : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await xios.post(
                route("promotion.store"),
                formData
            );

            if (response.data.success) {
                toast.success("Promotion created successfully!");
                handleCloseModal();
                if (dataTable.current) {
                    dataTable.current.ajax.reload();
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while creating promotion"
            );
        }
    };

    // Promotion actions
    const viewPromotion = (id) => {
        window.location.href = route("promotion.show", id);
    };

    const editPromotion = (id) => {
        window.location.href = route("promotion.edit", id);
    };

    const deletePromotion = async (id) => {
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

            const response = await xios.delete(route("promotion.destroy", id));

            if (response.data.success) {
                toast.success(response.data.message);
                if (dataTable.current) {
                    dataTable.current.ajax.reload();
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while deleting the promotion"
            );
        }
    };

    const exportPromotions = (type) => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("promotion.export"));

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

    const printPromotions = () => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("promotion.print"));

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
            toast.success("Promotions list refreshed!");
        }
    };

    return (
        <ErpLayout>
            <Head title="Customer Promotions" />

            <Container fluid>
                {/* Page Header */}
                <Row className="mb-4 align-items-center">
                    <Col md={6}>
                        <h3 className="fw-bold text-primary mb-2">
                            <BiTag className="me-2" />
                            Customer Promotions
                        </h3>
                        <p className="text-muted mb-0">
                            Manage customer promotions, discounts, and offers.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <ButtonGroup className="mb-2 mb-md-0">
                            <Button
                                variant="outline-primary"
                                onClick={handleShowModal}
                                className="d-flex align-items-center"
                            >
                                <BiPlus className="me-1" />
                                New Promotion
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
                                placeholder="Search promotions..."
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
                                <option value="upcoming">Upcoming</option>
                                <option value="expired">Expired</option>
                                <option value="inactive">Inactive</option>
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
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                    <Col md={12} lg={5} className="text-lg-end mt-2 mt-lg-0">
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
                                        onClick={() =>
                                            exportPromotions("excel")
                                        }
                                    >
                                        <FaFileExcel className="me-2 text-success" />{" "}
                                        Excel
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => exportPromotions("pdf")}
                                    >
                                        <FaFilePdf className="me-2 text-danger" />{" "}
                                        PDF
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={printPromotions}>
                                        <FaPrint className="me-2 text-secondary" />{" "}
                                        Print
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Promotion Table Card */}
                <Card>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table
                                bordered
                                hover
                                responsive
                                id="promotionTable"
                                className="align-middle mb-0"
                            />
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            {/* Create Promotion Modal */}
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <BiTag className="me-2" />
                        Create Promotion
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Promo Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Discount Type</Form.Label>
                                    <Form.Select
                                        name="discount_type"
                                        value={formData.discount_type}
                                        onChange={handleChange}
                                    >
                                        <option value="percentage">
                                            Percentage (%)
                                        </option>
                                        <option value="fixed">
                                            Fixed Amount ($)
                                        </option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        {formData.discount_type === "percentage"
                                            ? "Percentage (%)"
                                            : "Amount ($)"}
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="discount_value"
                                        value={formData.discount_value}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step={
                                            formData.discount_type ===
                                            "percentage"
                                                ? "1"
                                                : "0.01"
                                        }
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="active">Active</option>
                                        <option value="upcoming">
                                            Upcoming
                                        </option>
                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Usage Limit</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="usage_limit"
                                        value={formData.usage_limit}
                                        onChange={handleChange}
                                        placeholder="Unlimited if empty"
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Minimum Purchase ($)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="minimum_purchase"
                                        value={formData.minimum_purchase}
                                        onChange={handleChange}
                                        placeholder="No minimum"
                                        min="0"
                                        step="0.01"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="text-end">
                            <Button
                                variant="secondary"
                                onClick={handleCloseModal}
                                className="me-2"
                            >
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Promotion
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </ErpLayout>
    );
}
