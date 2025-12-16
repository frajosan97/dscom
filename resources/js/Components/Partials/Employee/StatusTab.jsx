import { Card, Col, Form, Row, Button, Badge } from "react-bootstrap";
import { BiCheckCircle } from "react-icons/bi";

const StatusTab = ({ formik, isEdit, employee }) => {
    const renderStatusBadge = () =>
        formik.values.status === "active" ? (
            <Badge bg="success" className="fs-6 px-3 py-2">
                <BiCheckCircle className="me-1" />
                Active
            </Badge>
        ) : (
            <Badge bg="secondary" className="fs-6 px-3 py-2">
                Inactive
            </Badge>
        );

    return (
        <Row className="g-4">
            <Col lg={8}>
                <Card className="border-0 bg-light">
                    <Card.Body className="p-4">
                        <h6 className="fw-bold mb-3">Employee Status</h6>
                        <div className="d-flex align-items-center justify-content-between p-3 bg-white rounded-3">
                            <div>
                                <div className="fw-semibold">
                                    Account Status
                                </div>
                                <small className="text-muted">
                                    {formik.values.status === "active"
                                        ? "This employee is active and can access the system"
                                        : "This employee is inactive and cannot access the system"}
                                </small>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant={
                                        formik.values.status === "active"
                                            ? "success"
                                            : "outline-success"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        formik.setFieldValue("status", "active")
                                    }
                                    className="px-3"
                                >
                                    Active
                                </Button>
                                <Button
                                    variant={
                                        formik.values.status === "inactive"
                                            ? "secondary"
                                            : "outline-secondary"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        formik.setFieldValue(
                                            "status",
                                            "inactive"
                                        )
                                    }
                                    className="px-3"
                                >
                                    Inactive
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="border-0 bg-light mt-4">
                    <Card.Body className="p-4">
                        <h6 className="fw-bold mb-3">Additional Notes</h6>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Description / Notes
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                placeholder="Enter any additional notes or description about this employee..."
                                className="py-2"
                            />
                            <Form.Text className="text-muted">
                                Add any important information that might be
                                useful for HR or management.
                            </Form.Text>
                        </Form.Group>
                    </Card.Body>
                </Card>
            </Col>
            <Col lg={4}>
                <Card className="border-0 bg-primary bg-opacity-10">
                    <Card.Body className="p-4">
                        <h6 className="fw-bold text-primary mb-3">
                            <BiCheckCircle className="me-2" />
                            Status Overview
                        </h6>
                        <div className="mb-3">
                            <div className="small text-muted mb-1">
                                Current Status
                            </div>
                            {renderStatusBadge()}
                        </div>
                        <p className="small text-muted mb-0">
                            Active employees can access the system and perform
                            their duties. Inactive employees will be blocked
                            from system access but their data is preserved for
                            record keeping.
                        </p>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default StatusTab;
