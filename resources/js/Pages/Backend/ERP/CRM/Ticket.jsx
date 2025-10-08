import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import ErpLayout from "@/Layouts/ErpLayout";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Table,
    Modal,
    Form,
    InputGroup,
    Badge,
} from "react-bootstrap";

const Ticket = () => {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");

    const [tickets, setTickets] = useState([
        {
            id: 1,
            subject: "Order not received",
            customer: "Jane Doe",
            email: "jane@example.com",
            priority: "High",
            status: "Open",
            date: "2025-10-02",
        },
        {
            id: 2,
            subject: "Payment issue",
            customer: "John Smith",
            email: "john@example.com",
            priority: "Medium",
            status: "In Progress",
            date: "2025-10-06",
        },
        {
            id: 3,
            subject: "Request for refund",
            customer: "Sarah Lee",
            email: "sarah@example.com",
            priority: "Low",
            status: "Closed",
            date: "2025-09-28",
        },
    ]);

    const [formData, setFormData] = useState({
        subject: "",
        customer: "",
        email: "",
        priority: "Medium",
        status: "Open",
        message: "",
    });

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTicket = {
            id: tickets.length + 1,
            ...formData,
            date: new Date().toISOString().split("T")[0],
        };
        setTickets([newTicket, ...tickets]);
        setFormData({
            subject: "",
            customer: "",
            email: "",
            priority: "Medium",
            status: "Open",
            message: "",
        });
        handleClose();
    };

    const filteredTickets = tickets.filter(
        (t) =>
            t.subject.toLowerCase().includes(search.toLowerCase()) ||
            t.customer.toLowerCase().includes(search.toLowerCase()) ||
            t.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ErpLayout>
            <Head title="Customer Ticket" />

            <Container fluid className="py-4">
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <h3 className="fw-bold text-primary">
                            Customer Tickets
                        </h3>
                        <p className="text-muted mb-0">
                            Manage customer support tickets and track their
                            progress.
                        </p>
                    </Col>
                    <Col className="text-end">
                        <Button variant="success" onClick={handleShow}>
                            + New Ticket
                        </Button>
                    </Col>
                </Row>

                {/* Table */}
                <Card>
                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={4}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by subject, customer, or email..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </InputGroup>
                            </Col>
                        </Row>

                        <Table hover responsive bordered>
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Subject</th>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.length > 0 ? (
                                    filteredTickets.map((ticket, index) => (
                                        <tr key={ticket.id}>
                                            <td>{index + 1}</td>
                                            <td>{ticket.subject}</td>
                                            <td>{ticket.customer}</td>
                                            <td>{ticket.email}</td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        ticket.priority ===
                                                        "High"
                                                            ? "danger"
                                                            : ticket.priority ===
                                                              "Medium"
                                                            ? "warning"
                                                            : "info"
                                                    }
                                                >
                                                    {ticket.priority}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        ticket.status === "Open"
                                                            ? "success"
                                                            : ticket.status ===
                                                              "In Progress"
                                                            ? "warning"
                                                            : "secondary"
                                                    }
                                                >
                                                    {ticket.status}
                                                </Badge>
                                            </td>
                                            <td>{ticket.date}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            No tickets found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Container>

            {/* Add Ticket Modal */}
            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Ticket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
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
                            <Form.Label>Priority</Form.Label>
                            <Form.Select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                            </Form.Select>
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

                        <div className="text-end">
                            <Button
                                variant="secondary"
                                onClick={handleClose}
                                className="me-2"
                            >
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Ticket
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </ErpLayout>
    );
};

export default Ticket;
