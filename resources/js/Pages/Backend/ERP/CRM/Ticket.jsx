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
    BiSupport,
    BiPlus,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";

export default function Ticket() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        customer_name: "",
        customer_email: "",
        priority: "medium",
        status: "open",
        description: "",
        category: "",
        assigned_to: "",
    });

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    // Initialize DataTable
    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#ticketTable")) {
            $("#ticketTable").DataTable().destroy();
        }

        const dt = $("#ticketTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("ticket.index"),
                type: "GET",
                data: function (d) {
                    d.search = search;
                    d.status = statusFilter !== "all" ? statusFilter : "";
                    d.priority = priorityFilter !== "all" ? priorityFilter : "";
                },
            },
            columns: [
                {
                    data: "ticket_number",
                    title: "Ticket #",
                    className: "text-center",
                    width: "8%",
                },
                {
                    data: "subject",
                    title: "Subject",
                    className: "text-start fw-semibold",
                    render: function (data, type, row) {
                        return `
                            <div>
                                <div>${data}</div>
                                <small class="text-muted">${
                                    row.category || "General"
                                }</small>
                            </div>
                        `;
                    },
                },
                {
                    data: "customer_name",
                    title: "Customer",
                    className: "text-start",
                },
                {
                    data: "customer_email",
                    title: "Email",
                    className: "text-start",
                },
                {
                    data: "priority",
                    title: "Priority",
                    className: "text-center",
                    width: "8%",
                    render: function (data) {
                        let badgeClass = "bg-warning text-dark";
                        let priorityText = "Medium";

                        if (data === "high") {
                            badgeClass = "bg-danger";
                            priorityText = "High";
                        } else if (data === "low") {
                            badgeClass = "bg-info";
                            priorityText = "Low";
                        } else if (data === "critical") {
                            badgeClass = "bg-dark";
                            priorityText = "Critical";
                        }

                        return `<span class="badge ${badgeClass}">${priorityText}</span>`;
                    },
                },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    width: "8%",
                    render: function (data) {
                        let badgeClass = "bg-success";
                        let statusText = "Open";

                        if (data === "in_progress") {
                            badgeClass = "bg-primary";
                            statusText = "In Progress";
                        } else if (data === "on_hold") {
                            badgeClass = "bg-warning text-dark";
                            statusText = "On Hold";
                        } else if (data === "resolved") {
                            badgeClass = "bg-info";
                            statusText = "Resolved";
                        } else if (data === "closed") {
                            badgeClass = "bg-secondary";
                            statusText = "Closed";
                        }

                        return `<span class="badge ${badgeClass}">${statusText}</span>`;
                    },
                },
                {
                    data: "created_at",
                    title: "Created",
                    className: "text-center",
                    width: "10%",
                    render: function (data) {
                        return new Date(data).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        });
                    },
                },
                {
                    data: "last_updated",
                    title: "Updated",
                    className: "text-center",
                    width: "10%",
                    render: function (data) {
                        if (!data) return "-";
                        return new Date(data).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        });
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
                                <button type="button" class="btn btn-sm btn-outline-primary edit-btn" data-id="${data}">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-success assign-btn" data-id="${data}">
                                    <i class="bi bi-person-plus"></i>
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
                        viewTicket(id);
                    });

                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        editTicket(id);
                    });

                $(".assign-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        assignTicket(id);
                    });
            },
            initComplete: function () {
                dataTableInitialized.current = true;
            },
            language: {
                emptyTable:
                    '<div class="text-center py-5"><i class="bi bi-ticket-detailed display-4 text-muted"></i><p class="mt-2">No tickets found</p></div>',
                zeroRecords:
                    '<div class="text-center py-5"><i class="bi bi-search display-4 text-muted"></i><p class="mt-2">No matching tickets found</p></div>',
            },
            responsive: true,
            order: [[6, "desc"]],
            pageLength: 10,
            lengthMenu: [
                [10, 25, 50, -1],
                [10, 25, 50, "All"],
            ],
        });

        dataTable.current = dt;
        return dt;
    }, [search, statusFilter, priorityFilter]);

    // Refresh DataTable when filters change
    useEffect(() => {
        if (dataTableInitialized.current && dataTable.current) {
            dataTable.current.ajax.reload();
        }
    }, [search, statusFilter, priorityFilter]);

    // Initialize DataTable on mount
    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#ticketTable")) {
                $("#ticketTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    // Modal handlers
    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setFormData({
            subject: "",
            customer_name: "",
            customer_email: "",
            priority: "medium",
            status: "open",
            description: "",
            category: "",
            assigned_to: "",
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await xios.post(route("ticket.store"), formData);

            if (response.data.success) {
                toast.success("Ticket created successfully!");
                handleClose();
                if (dataTable.current) {
                    dataTable.current.ajax.reload();
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while creating ticket"
            );
        }
    };

    // Ticket actions
    const viewTicket = (id) => {
        window.location.href = route("ticket.show", id);
    };

    const editTicket = (id) => {
        window.location.href = route("ticket.edit", id);
    };

    const assignTicket = async (id) => {
        try {
            const { value: userId } = await Swal.fire({
                title: "Assign Ticket",
                input: "select",
                inputOptions: {}, // You would populate this with user data
                inputPlaceholder: "Select a staff member",
                showCancelButton: true,
            });

            if (userId) {
                const response = await xios.patch(route("ticket.assign", id), {
                    assigned_to: userId,
                });

                if (response.data.success) {
                    toast.success("Ticket assigned successfully!");
                    if (dataTable.current) {
                        dataTable.current.ajax.reload();
                    }
                }
            }
        } catch (error) {
            toast.error("Failed to assign ticket");
        }
    };

    const exportTickets = (type) => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("ticket.export"));

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

    const printTickets = () => {
        if (dataTable.current) {
            const params = dataTable.current.ajax.params();
            const url = new URL(route("ticket.print"));

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
            toast.success("Tickets list refreshed!");
        }
    };

    return (
        <ErpLayout>
            <Head title="Customer Tickets" />

            <Container fluid>
                {/* Page Header */}
                <Row className="mb-4 align-items-center">
                    <Col md={6}>
                        <h3 className="fw-bold text-primary mb-2">
                            <BiSupport className="me-2" />
                            Customer Support Tickets
                        </h3>
                        <p className="text-muted mb-0">
                            Manage customer support tickets and track their
                            progress.
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
                                New Ticket
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
                                placeholder="Search tickets..."
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
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="on_hold">On Hold</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                    <Col md={6} lg={2}>
                        <InputGroup>
                            <InputGroup.Text>
                                <BiFilter />
                            </InputGroup.Text>
                            <Form.Select
                                value={priorityFilter}
                                onChange={(e) =>
                                    setPriorityFilter(e.target.value)
                                }
                            >
                                <option value="all">All Priorities</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
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
                                        onClick={() => exportTickets("excel")}
                                    >
                                        <FaFileExcel className="me-2 text-success" />{" "}
                                        Excel
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => exportTickets("pdf")}
                                    >
                                        <FaFilePdf className="me-2 text-danger" />{" "}
                                        PDF
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={printTickets}>
                                        <FaPrint className="me-2 text-secondary" />{" "}
                                        Print
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Ticket Table Card */}
                <Card>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table
                                bordered
                                hover
                                responsive
                                id="ticketTable"
                                className="align-middle mb-0"
                            />
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            {/* Add Ticket Modal */}
            <Modal show={showModal} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <BiSupport className="me-2" />
                        Create New Ticket
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Category
                                        </option>
                                        <option value="billing">Billing</option>
                                        <option value="technical">
                                            Technical
                                        </option>
                                        <option value="sales">Sales</option>
                                        <option value="general">General</option>
                                        <option value="feature_request">
                                            Feature Request
                                        </option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Customer Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="customer_email"
                                        value={formData.customer_email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Priority</Form.Label>
                                    <Form.Select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">
                                            Critical
                                        </option>
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
                                        <option value="open">Open</option>
                                        <option value="in_progress">
                                            In Progress
                                        </option>
                                        <option value="on_hold">On Hold</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Assign To (Optional)</Form.Label>
                            <Form.Control
                                type="text"
                                name="assigned_to"
                                value={formData.assigned_to}
                                onChange={handleChange}
                                placeholder="Staff member username or ID"
                            />
                        </Form.Group>

                        <div className="text-end">
                            <Button
                                variant="secondary"
                                onClick={handleClose}
                                className="me-2"
                            >
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Create Ticket
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </ErpLayout>
    );
}
