import React from "react";
import { Card, Row, Col, Form } from "react-bootstrap";

const OtherInfo = ({ otherInfoData, setOtherInfoData }) => {
    const handleChange = (field, value) => {
        setOtherInfoData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-white fw-bold">
                Other Information
            </Card.Header>
            <Card.Body>
                <Row className="g-3 mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Completion Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={otherInfoData?.completion_date || ""}
                                onChange={(e) =>
                                    handleChange(
                                        "completion_date",
                                        e.target.value
                                    )
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>
                                Attachments (Photos,Documents etc)
                            </Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    className="d-none"
                                    id="attachments"
                                    onChange={(e) =>
                                        handleChange(
                                            "attachments",
                                            e.target.files[0] || null
                                        )
                                    }
                                />
                                <Form.Label
                                    htmlFor="attachments"
                                    className="btn btn-outline-secondary me-2 mb-0"
                                >
                                    Choose File
                                </Form.Label>
                                <span className="text-muted">
                                    {otherInfoData?.attachments ||
                                        "No file chosen"}
                                </span>
                            </div>
                        </Form.Group>
                    </Col>
                </Row>

                {/* Entry Via & Signature */}
                <Row className="g-3 mb-3">
                    <Col md={12}>
                        <Form.Group>
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
                                {otherInfoData?.signature || "Signature Area"}
                            </div>
                        </Form.Group>
                    </Col>
                </Row>

                {/* Notification Preferences */}
                <Row className="mb-3">
                    <Col>
                        <div className="d-flex flex-wrap gap-3">
                            <Form.Check
                                type="checkbox"
                                id="sendSms"
                                label="Send SMS"
                                checked={!!otherInfoData?.sendSms}
                                onChange={(e) =>
                                    handleChange("sendSms", e.target.checked)
                                }
                            />
                            <Form.Check
                                type="checkbox"
                                id="sendWhatsApp"
                                label="Send WhatsApp"
                                checked={!!otherInfoData?.sendWhatsApp}
                                onChange={(e) =>
                                    handleChange(
                                        "sendWhatsApp",
                                        e.target.checked
                                    )
                                }
                            />
                            <Form.Check
                                type="checkbox"
                                id="sendEmail"
                                label="Send Email"
                                checked={!!otherInfoData?.sendEmail}
                                onChange={(e) =>
                                    handleChange("sendEmail", e.target.checked)
                                }
                            />
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default OtherInfo;
