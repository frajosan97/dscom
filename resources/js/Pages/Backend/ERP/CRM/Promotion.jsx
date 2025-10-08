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
    Form,
    Modal,
    InputGroup,
} from "react-bootstrap";

const Promotion = () => {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [promotions, setPromotions] = useState([
        {
            id: 1,
            title: "Black Friday Sale",
            code: "BF2025",
            discount: "30%",
            startDate: "2025-11-01",
            endDate: "2025-11-30",
            status: "Active",
        },
        {
            id: 2,
            title: "Christmas Deal",
            code: "XMAS25",
            discount: "25%",
            startDate: "2025-12-01",
            endDate: "2025-12-31",
            status: "Upcoming",
        },
    ]);

    const [formData, setFormData] = useState({
        title: "",
        code: "",
        discount: "",
        startDate: "",
        endDate: "",
        status: "Active",
    });

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newPromotion = { ...formData, id: promotions.length + 1 };
        setPromotions([...promotions, newPromotion]);
        setFormData({
            title: "",
            code: "",
            discount: "",
            startDate: "",
            endDate: "",
            status: "Active",
        });
        handleCloseModal();
    };

    const filteredPromotions = promotions.filter((promo) =>
        promo.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ErpLayout>
            <Head title="Customer Promotion" />

            <Container fluid className="py-4">
                <Row className="mb-4">
                    <Col>
                        <h3 className="fw-bold text-primary">
                            Customer Promotions
                        </h3>
                        <p className="text-muted mb-0">
                            Manage customer promotions, discounts, and offers.
                        </p>
                    </Col>
                    <Col className="text-end">
                        <Button variant="success" onClick={handleShowModal}>
                            + New Promotion
                        </Button>
                    </Col>
                </Row>

                <Card>
                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={4}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search promotion..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                        </Row>

                        <Table hover responsive bordered>
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Code</th>
                                    <th>Discount</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPromotions.length > 0 ? (
                                    filteredPromotions.map((promo, index) => (
                                        <tr key={promo.id}>
                                            <td>{index + 1}</td>
                                            <td>{promo.title}</td>
                                            <td>{promo.code}</td>
                                            <td>{promo.discount}</td>
                                            <td>{promo.startDate}</td>
                                            <td>{promo.endDate}</td>
                                            <td>
                                                <span
                                                    className={`badge ${
                                                        promo.status === "Active"
                                                            ? "bg-success"
                                                            : promo.status === "Upcoming"
                                                            ? "bg-warning text-dark"
                                                            : "bg-secondary"
                                                    }`}
                                                >
                                                    {promo.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            No promotions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Container>

            {/* Promotion Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create Promotion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
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

                        <Form.Group className="mb-3">
                            <Form.Label>Code</Form.Label>
                            <Form.Control
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Discount (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        required
                                    />
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
                                        <option value="Active">Active</option>
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Expired">Expired</option>
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
                                        name="startDate"
                                        value={formData.startDate}
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
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="text-end">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">
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
};

export default Promotion;
