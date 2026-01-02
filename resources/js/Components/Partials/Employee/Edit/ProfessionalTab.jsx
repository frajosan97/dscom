import { Card, Col, Form, Row } from "react-bootstrap";

const ProfessionalTab = ({ formik, roles }) => {
    return (
        <Row className="g-4">
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold">Role *</Form.Label>
                    <Form.Select
                        name="role"
                        value={formik.values.role}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="py-2"
                    >
                        <option value="">Select Role</option>
                        {roles?.map((role) => (
                            <option key={role.name} value={role.name}>
                                {role.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold">Designation</Form.Label>
                    <Form.Control
                        name="designation"
                        value={formik.values.designation}
                        onChange={formik.handleChange}
                        placeholder="e.g., Software Engineer"
                        className="py-2"
                    />
                </Form.Group>
            </Col>

            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold">
                        Qualification
                    </Form.Label>
                    <Form.Control
                        name="qualification"
                        value={formik.values.qualification}
                        onChange={formik.handleChange}
                        placeholder="e.g., Bachelor's Degree"
                        className="py-2"
                    />
                </Form.Group>
            </Col>

            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold">
                        Contract End Date
                    </Form.Label>
                    <Form.Control
                        type="date"
                        name="ending_date"
                        value={
                            formik.values.ending_date
                                ? new Date(formik.values.ending_date)
                                      .toISOString()
                                      .slice(0, 10)
                                : ""
                        }
                        onChange={formik.handleChange}
                        className="py-2"
                    />
                </Form.Group>
            </Col>

            <Col md={12}>
                <Card className="border-0 bg-light mt-2">
                    <Card.Body className="p-4">
                        <h6 className="fw-bold mb-3">Address Information</h6>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Address
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="address"
                                value={formik.values.address}
                                onChange={formik.handleChange}
                                placeholder="Enter complete address"
                                className="py-2"
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ProfessionalTab;
