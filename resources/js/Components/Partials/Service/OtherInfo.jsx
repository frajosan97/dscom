import React from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";

const OtherInfo = () => {
    return (
        <>
            {/* Other Information */}
            <Card className="border-0 rounded-0 shadow-sm mb-3">
                <Card.Header className="bg-white fw-bold">
                    Other Information
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Entering Staff</Form.Label>
                                <Form.Select>
                                    <option>Technician</option>
                                    <option>Admin</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Search Technicians</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search..."
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Due Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    defaultValue="2025-08-24"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Device Photo</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Form.Control
                                        type="file"
                                        className="d-none"
                                        id="devicePhoto"
                                    />
                                    <Form.Label
                                        htmlFor="devicePhoto"
                                        className="btn btn-outline-secondary me-2 mb-0"
                                    >
                                        Choose Files
                                    </Form.Label>
                                    <span className="text-muted">
                                        No file chosen
                                    </span>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Entry Via</Form.Label>
                                <Form.Control type="text" />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Customer Signature</Form.Label>
                                <div
                                    style={{
                                        height: "100px",
                                        border: "1px dashed #ccc",
                                        borderRadius: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#6c757d",
                                    }}
                                >
                                    Signature Area
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <div className="d-flex gap-3 mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="sendSms"
                                    label="Send SMS"
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="sendWhatsApp"
                                    label="Send WhatsApp"
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="sendEmail"
                                    label="Send Email"
                                />
                            </div>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="outline-secondary">Clear</Button>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
};

export default OtherInfo;
