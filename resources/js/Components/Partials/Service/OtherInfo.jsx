import React, { useState, useRef } from "react";
import { Card, Row, Col, Form, Button, Alert, Image } from "react-bootstrap";

const OtherInfo = ({ otherInfoData, setOtherInfoData }) => {
    const fileInputRef = useRef(null);
    const [error, setError] = useState("");

    // Supported file types
    const supportedFileTypes = [
        // Images
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        // Documents
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
    ];

    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const handleChange = (field, value) => {
        setOtherInfoData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setError("");

        // Validate files
        const validFiles = [];
        const invalidFiles = [];

        files.forEach((file) => {
            if (!supportedFileTypes.includes(file.type)) {
                invalidFiles.push(file.name);
            } else if (file.size > maxFileSize) {
                invalidFiles.push(`${file.name} (too large)`);
            } else {
                validFiles.push(file);
            }
        });

        if (invalidFiles.length > 0) {
            setError(`The following files were not accepted: ${invalidFiles.join(
                ", "
            )}. 
                Please upload only images or documents under 10MB.`);
        }

        if (validFiles.length > 0) {
            // Add new files to existing ones
            setOtherInfoData((prev) => ({
                ...prev,
                attachments: [...prev.attachments, ...validFiles],
            }));
        }

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeFile = (index) => {
        setOtherInfoData((prev) => {
            const newAttachments = [...prev.attachments];
            newAttachments.splice(index, 1);
            return {
                ...prev,
                attachments: newAttachments,
            };
        });
    };

    const isImage = (file) => {
        return file.type.startsWith("image/");
    };

    return (
        <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-white fw-bold">
                Other Information
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

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
                                Attachments (Photos, Documents, etc.)
                            </Form.Label>
                            <div className="d-flex align-items-center mb-2">
                                <Form.Control
                                    ref={fileInputRef}
                                    type="file"
                                    className="d-none"
                                    id="attachments"
                                    multiple
                                    accept={supportedFileTypes.join(",")}
                                    onChange={handleFileChange}
                                />
                                <Form.Label
                                    htmlFor="attachments"
                                    className="btn btn-outline-secondary me-2 mb-0"
                                >
                                    Choose Files
                                </Form.Label>
                                <span className="text-muted">
                                    {otherInfoData.attachments.length === 0
                                        ? "No files chosen"
                                        : `${otherInfoData.attachments.length} file(s) selected`}
                                </span>
                            </div>

                            {/* File previews */}
                            {otherInfoData.attachments.length > 0 && (
                                <div className="mt-3">
                                    <h6>Selected Files:</h6>
                                    <div className="d-flex flex-wrap gap-3">
                                        {otherInfoData.attachments.map(
                                            (file, index) => (
                                                <div
                                                    key={index}
                                                    className="border rounded p-2 position-relative"
                                                    style={{ width: "120px" }}
                                                >
                                                    {isImage(file) ? (
                                                        <Image
                                                            src={URL.createObjectURL(
                                                                file
                                                            )}
                                                            alt={file.name}
                                                            thumbnail
                                                            style={{
                                                                width: "100px",
                                                                height: "100px",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="d-flex align-items-center justify-content-center bg-light"
                                                            style={{
                                                                width: "100px",
                                                                height: "100px",
                                                            }}
                                                        >
                                                            <i className="fas fa-file text-secondary fs-1"></i>
                                                        </div>
                                                    )}
                                                    <div
                                                        className="mt-1 text-truncate small"
                                                        title={file.name}
                                                    >
                                                        {file.name}
                                                    </div>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="position-absolute top-0 end-0 p-0"
                                                        style={{
                                                            width: "20px",
                                                            height: "20px",
                                                            fontSize: "10px",
                                                        }}
                                                        onClick={() =>
                                                            removeFile(index)
                                                        }
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
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
                                checked={
                                    otherInfoData?.notification_channel?.includes(
                                        "sms"
                                    ) || false
                                }
                                onChange={(e) => {
                                    const channels =
                                        otherInfoData.notification_channel ||
                                        [];
                                    if (e.target.checked) {
                                        handleChange("notification_channel", [
                                            ...channels,
                                            "sms",
                                        ]);
                                    } else {
                                        handleChange(
                                            "notification_channel",
                                            channels.filter(
                                                (ch) => ch !== "sms"
                                            )
                                        );
                                    }
                                }}
                            />
                            <Form.Check
                                type="checkbox"
                                id="sendWhatsApp"
                                label="Send WhatsApp"
                                checked={
                                    otherInfoData?.notification_channel?.includes(
                                        "whatsapp"
                                    ) || false
                                }
                                onChange={(e) => {
                                    const channels =
                                        otherInfoData.notification_channel ||
                                        [];
                                    if (e.target.checked) {
                                        handleChange("notification_channel", [
                                            ...channels,
                                            "whatsapp",
                                        ]);
                                    } else {
                                        handleChange(
                                            "notification_channel",
                                            channels.filter(
                                                (ch) => ch !== "whatsapp"
                                            )
                                        );
                                    }
                                }}
                            />
                            <Form.Check
                                type="checkbox"
                                id="sendEmail"
                                label="Send Email"
                                checked={
                                    otherInfoData?.notification_channel?.includes(
                                        "email"
                                    ) || false
                                }
                                onChange={(e) => {
                                    const channels =
                                        otherInfoData.notification_channel ||
                                        [];
                                    if (e.target.checked) {
                                        handleChange("notification_channel", [
                                            ...channels,
                                            "email",
                                        ]);
                                    } else {
                                        handleChange(
                                            "notification_channel",
                                            channels.filter(
                                                (ch) => ch !== "email"
                                            )
                                        );
                                    }
                                }}
                            />
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default OtherInfo;
