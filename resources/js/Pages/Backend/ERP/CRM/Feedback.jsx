import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import ErpLayout from "@/Layouts/ErpLayout";
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Button,
    Form,
    Modal,
    InputGroup,
} from "react-bootstrap";

const Feedback = () => {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [feedbacks, setFeedbacks] = useState([
        {
            id: 1,
            customer: "Jane Doe",
            email: "jane@example.com",
            message: "Loved the product! Great quality.",
            rating: 5,
            date: "2025-10-02",
            status: "Reviewed",
        },
        {
            id: 2,
            customer: "John Smith",
            email: "john@example.com",
            message: "Delivery took a bit longer than expected.",
            rating: 3,
            date: "2025-10-05",
            status: "Pending",
        },
    ]);

    const [formData, setFormData] = useState({
        customer: "",
        email: "",
        message: "",
        rating: 5,
        status: "Pending",
    });

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newFeedback = {
            id: feedbacks.length + 1,
            ...formData,
            date: new Date().toISOString().split("T")[0],
        };
        setFeedbacks([newFeedback, ...feedbacks]);
        setFormData({
            customer: "",
            email: "",
            message: "",
            rating: 5,
            status: "Pending",
        });
        handleClose();
    };

    const filteredFeedback = feedbacks.filter(
        (f) =>
            f.customer.toLowerCase().includes(search.toLowerCase()) ||
            f.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ErpLayout>
            <Head title="Customer Feedback" />

            <Container fluid className="py-4">
                {/* Header Section */}
                <Row className="mb-4">
                    <Col>
                        <h3 className="fw-bold text-primary">
                            Customer Feedback
                        </h3>
                        <p className="text-muted mb-0">
                            View, manage, and respond to customer feedback.
                        </p>
                    </Col>
                    <Col className="text-end">
                        <Button variant="success" onClick={handleShow}>
                            + Add Feedback
                        </Button>
                    </Col>
                </Row>

                {/* Feedback List */}
                <Card>
                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={4}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </InputGroup>
                            </Col>
                        </Row>

                        <Table bordered hover responsive>
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Message</th>
                                    <th>Rating</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFeedback.length > 0 ? (
                                    filteredFeedback.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.customer}</td>
                                            <td>{item.email}</td>
                                            <td>{item.message}</td>
                                            <td>
                                                {"⭐".repeat(item.rating)}{" "}
                                                <small className="text-muted">
                                                    ({item.rating})
                                                </small>
                                            </td>
                                            <td>{item.date}</td>
                                            <td>
                                                <span
                                                    className={`badge ${
                                                        item.status ===
                                                        "Reviewed"
                                                            ? "bg-success"
                                                            : "bg-warning text-dark"
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            No feedback found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Container>

            {/* Add Feedback Modal */}
            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Customer Feedback</Modal.Title>
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
                                        <option value="Pending">Pending</option>
                                        <option value="Reviewed">
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
};

export default Feedback;
