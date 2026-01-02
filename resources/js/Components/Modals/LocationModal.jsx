import React from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const LocationModal = ({ show, onHide }) => {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Location-Based Attendance</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center mb-4">
                    <FaMapMarkerAlt size={48} className="text-primary mb-3" />
                    <h5>Enable Location Services</h5>
                    <p className="text-muted">
                        Allow location access for accurate attendance tracking.
                        Employees must be within company premises to check-in.
                    </p>
                </div>

                <Alert variant="info">
                    <FaMapMarkerAlt className="me-2" />
                    <strong>Current Location:</strong>
                    <div className="mt-2">
                        <small>Latitude: 40.7128° N</small>
                        <br />
                        <small>Longitude: 74.0060° W</small>
                        <br />
                        <small>Accuracy: ±10 meters</small>
                    </div>
                </Alert>

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Allowed Radius (meters)</Form.Label>
                        <Form.Range min="10" max="500" defaultValue="100" />
                        <small className="text-muted">
                            100m radius from office center
                        </small>
                    </Form.Group>

                    <Form.Check
                        type="switch"
                        id="enable-wifi"
                        label="Require Company WiFi"
                        className="mb-3"
                    />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={() => {
                        toast.success("Location settings updated!");
                        onHide();
                    }}
                >
                    Save Settings
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LocationModal;
