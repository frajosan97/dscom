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
    BiMessageDetail,
    BiStar,
    BiPlus,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";

export default function Feedback() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [ratingFilter, setRatingFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        customer: "",
        email: "",
        message: "",
        rating: 5,
        status: "Pending",
    });

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    // Initialize DataTable
    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#feedbackTable")) {
            $("#feedbackTable").DataTable().destroy();
        }

        const dt = $("#feedbackTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("feedback.index"),
                type: "GET",
                data: function (d) {
                    d.search = search;
                    d.status = statusFilter !== "all" ? statusFilter : "";
                    d.rating = ratingFilter !== "all" ? ratingFilter : "";
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
                    data: "customer",
                    title: "Customer",
                    className: "text-start fw-semibold",
                },
                {
                    data: "email",
                    title: "Email",
                    className: "text-start",
                },
                {
                    data: "message",
                    title: "Message",
                    className: "text-start",
                    render: function (data) {
                        return data.length > 50
                            ? data.substring(0, 50) + "..."
                            : data;
                    },
                },
                {
                    data: "rating",
                    title: "Rating",
                    className: "text-center",
                    width: "10%",
                    render: function (data) {
                        const stars = "⭐".repeat(data);
                        return `
                            <div class="d-flex flex-column align-items-center">
                                <div class="text-warning">${stars}</div>
                                <small class="text-muted">(${data}/5)</small>
                            </div>
                        `;
                    },
                },
                {
                    data: "created_at",
                    title: "Date",
                    className: "text-center",
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
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    width: "10%",
                    render: function (data) {
                        let badgeClass = "bg-warning text-dark";
                        let statusText = "Pending";

                        if (data === "reviewed") {
                            badgeClass = "bg-success";
                            statusText = "Reviewed";
                        } else if (data === "archived") {
                            badgeClass = "bg-secondary";
                            statusText = "Archived";
                        }

                        return `<span class="badge ${badgeClass}">${statusText}</span>`;
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
                                <button type="button" class="btn btn-sm btn-outline-success respond-btn" data-id="${data}">
                                    <i class="bi bi-reply"></i>
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
                        viewFeedback(id);
                    });

                $(".respond-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        respondToFeedback(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deleteFeedback(id);
                    });
            },
            initComplete: function () {
                dataTableInitialized.current = true;
            },
            language: {
                emptyTable:
                    '<div class="text-center py-5"><i class="bi bi-chat-heart display-4 text-muted"></i><p class="mt-2">No feedback found</p></div>',
                zeroRecords:
                    '<div class="text-center py-5"><i class="bi bi-search display-4 text-muted"></i><p class="mt-2">No matching feedback found</p></div>',
            },
            responsive: true,
            order: [[5, "desc"]],
            pageLength: 10,
            lengthMenu: [
                [10, 25, 50, -1],
                [10, 25, 50, "All"],
            ],
        });

        dataTable.current = dt;
        return dt;
    }, [search, statusFilter, ratingFilter]);

    // Refresh DataTable when filters change
    useEffect(() => {
        if (dataTableInitialized.current && dataTable.current) {
            dataTable.current.ajax.reload();
        }
    }, [search, statusFilter, ratingFilter]);

    // Initialize DataTable on mount
    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#feedbackTable")) {
                $("#feedbackTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    // Modal handlers
    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setFormData({
            customer: "",
            email: "",
            message: "",
            rating: 5,
            status: "Pending",
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await xios.post(route("feedback.store"), formData);

            if (response.data.success) {
                toast.success("Feedback added successfully!");
                handleClose();
                if (dataTable.current) {
                    dataTable.current.ajax.reload();
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while saving feedback"
            );
        }
    };

    // Feedback actions
    const viewFeedback = (id) => {
        window.location.href = route("feedback.show", id);
    };

    const respondToFeedback = (id) => {
        window.location.href = route("feedback.respond", id);
    };

    const deleteFeedback = async (id) => {
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

            const response = await xios.delete(route("feedback.destroy", id));

            if (response.data.success) {
                toast.success(response.data.message);
                if (dataTable.current) {
                    dataTable.current.ajax.reload();
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while deleting the feedback"
            );
        }
    };

    const exportFeedback = (type) => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("feedback.export"));

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

    const printFeedback = () => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("feedback.print"));

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
            toast.success("Feedback list refreshed!");
        }
    };

    return (
        <ErpLayout>
            <Head title="Customer Feedback" />

            <Container fluid>
                {/* Page Header */}
                <Row className="mb-4 align-items-center">
                    <Col md={6}>
                        <h3 className="fw-bold text-primary mb-2">
                            <BiMessageDetail className="me-2" />
                            Customer Feedback
                        </h3>
                        <p className="text-muted mb-0">
                            View, manage, and respond to customer feedback.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <ButtonGroup className="mb-2 mb-md-0">
                            <Button
                                variant="outline-primary"
                                onClick={handleShow}
                                className="d-flex align-items-center"
                            >
                                <BiPlus className="me-1" />
                                Add Feedback
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
                                placeholder="Search feedback..."
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
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="archived">Archived</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                    <Col md={6} lg={2}>
                        <InputGroup>
                            <InputGroup.Text>
                                <BiStar />
                            </InputGroup.Text>
                            <Form.Select
                                value={ratingFilter}
                                onChange={(e) =>
                                    setRatingFilter(e.target.value)
                                }
                            >
                                <option value="all">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
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
                                        onClick={() => exportFeedback("excel")}
                                    >
                                        <FaFileExcel className="me-2 text-success" />{" "}
                                        Excel
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => exportFeedback("pdf")}
                                    >
                                        <FaFilePdf className="me-2 text-danger" />{" "}
                                        PDF
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={printFeedback}>
                                        <FaPrint className="me-2 text-secondary" />{" "}
                                        Print
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Feedback Table Card */}
                <Card>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table
                                bordered
                                hover
                                responsive
                                id="feedbackTable"
                                className="align-middle mb-0"
                            />
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            {/* Add Feedback Modal */}
            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <BiMessageDetail className="me-2" />
                        Add Customer Feedback
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Customer Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="customer"
                                value={formData.customer}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Message</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Rating</Form.Label>
                                    <Form.Select
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleChange}
                                    >
                                        {[5, 4, 3, 2, 1].map((r) => (
                                            <option key={r} value={r}>
                                                {r} Star{r > 1 ? "s" : ""}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">
                                            Reviewed
                                        </option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="text-end">
                            <Button
                                variant="secondary"
                                onClick={handleClose}
                                className="me-2"
                            >
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Feedback
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </ErpLayout>
    );
}
