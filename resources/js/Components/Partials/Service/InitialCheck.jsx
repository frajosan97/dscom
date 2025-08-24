import { Card, Row, Col, Form } from "react-bootstrap";

const InitiaCheck = () => {
    return (
        <>
            {/* Status Cards */}
            <Row className="mb-3 g-3">
                {["Display", "Back Panel", "Devices Status", "Hello"].map(
                    (label, idx) => (
                        <Col md={3} key={idx}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <Card.Title className="text-capitalize fs-6">
                                        {label}
                                    </Card.Title>
                                    <Form.Check
                                        type="radio"
                                        label="Working"
                                        name={`status-${idx}`}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Not Working"
                                        name={`status-${idx}`}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Not Checked"
                                        name={`status-${idx}`}
                                        defaultChecked
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    )
                )}
            </Row>

            {/* Dropdowns */}
            <Row className="mb-3 g-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Physical Condition</Form.Label>
                        <Form.Select>
                            <option value="">Search Physical Conditions</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Risk Agreed By Customer</Form.Label>
                        <Form.Select>
                            <option value="">Search Risk Agreements</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            {/* Accessories & Remarks */}
            <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-white fw-bold">
                    Accessories <div className="fw-normal small">Subtitle</div>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={8}>
                            <Form.Group>
                                {[
                                    "sim tray",
                                    "back panel",
                                    "Battery",
                                    "sim",
                                    "HEADSET",
                                    "cover",
                                    "tes",
                                ].map((acc, i) => (
                                    <Form.Check
                                        key={i}
                                        inline
                                        label={acc}
                                        type="checkbox"
                                    />
                                ))}
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Other Remarks</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={1}
                                    placeholder="Other Remarks"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
};

export default InitiaCheck;
