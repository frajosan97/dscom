import React, { useState } from "react";
import { Modal, Button, Tabs, Tab, Form, Row, Col } from "react-bootstrap";

const AttendanceSettingsModal = ({ show, onHide, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleSave = () => {
        onSave(localSettings);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Attendance Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey="general" className="mb-3">
                    <Tab eventKey="general" title="General">
                        <Form>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Work Start Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={localSettings.workStartTime}
                                            onChange={(e) =>
                                                setLocalSettings({
                                                    ...localSettings,
                                                    workStartTime:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Work End Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={localSettings.workEndTime}
                                            onChange={(e) =>
                                                setLocalSettings({
                                                    ...localSettings,
                                                    workEndTime: e.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Late Threshold (minutes)
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={localSettings.lateThreshold}
                                            onChange={(e) =>
                                                setLocalSettings({
                                                    ...localSettings,
                                                    lateThreshold: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Early Leave Threshold (minutes)
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={
                                                localSettings.earlyLeaveThreshold
                                            }
                                            onChange={(e) =>
                                                setLocalSettings({
                                                    ...localSettings,
                                                    earlyLeaveThreshold:
                                                        parseInt(
                                                            e.target.value
                                                        ),
                                                })
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Tab>
                    <Tab eventKey="advanced" title="Advanced">
                        <Form>
                            <Form.Check
                                type="switch"
                                id="enable-geo"
                                label="Enable Geolocation Tracking"
                                checked={localSettings.enableGeoLocation}
                                onChange={(e) =>
                                    setLocalSettings({
                                        ...localSettings,
                                        enableGeoLocation: e.target.checked,
                                    })
                                }
                                className="mb-3"
                            />
                            <Form.Check
                                type="switch"
                                id="require-reason"
                                label="Require Reason for Absence"
                                checked={localSettings.requireReasonForAbsence}
                                onChange={(e) =>
                                    setLocalSettings({
                                        ...localSettings,
                                        requireReasonForAbsence:
                                            e.target.checked,
                                    })
                                }
                                className="mb-3"
                            />
                            <Form.Check
                                type="switch"
                                id="auto-calculate"
                                label="Auto-calculate Work Hours"
                                checked={localSettings.autoCalculateHours}
                                onChange={(e) =>
                                    setLocalSettings({
                                        ...localSettings,
                                        autoCalculateHours: e.target.checked,
                                    })
                                }
                                className="mb-3"
                            />
                        </Form>
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AttendanceSettingsModal;
