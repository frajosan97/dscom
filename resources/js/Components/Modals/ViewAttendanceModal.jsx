import React from "react";
import { Modal, Button, Row, Col, Badge, ListGroup } from "react-bootstrap";
import {
    FaClock,
    FaCalendar,
    FaUser,
    FaBuilding,
    FaMapMarkerAlt,
} from "react-icons/fa";

const ViewAttendanceModal = ({ show, onHide, attendanceData }) => {
    if (!attendanceData) {
        return (
            <Modal show={show} onHide={onHide} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Attendance Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            present: { color: "success", label: "Present" },
            absent: { color: "danger", label: "Absent" },
            late: { color: "warning", label: "Late" },
            on_leave: { color: "info", label: "On Leave" },
            half_day: { color: "secondary", label: "Half Day" },
        };
        const config = statusConfig[status] || {
            color: "secondary",
            label: "Unknown",
        };
        return <Badge bg={config.color}>{config.label}</Badge>;
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Attendance Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-4">
                    <Col md={8}>
                        <div className="d-flex align-items-center mb-3">
                            <div className="avatar-lg me-3">
                                <div className="avatar-title bg-primary bg-opacity-10 rounded-circle">
                                    <FaUser className="fs-3 text-primary" />
                                </div>
                            </div>
                            <div>
                                <h4 className="mb-1">
                                    {attendanceData.employee_name}
                                </h4>
                                <p className="text-muted mb-0">
                                    {attendanceData.employee_code}
                                </p>
                                <p className="text-muted mb-0">
                                    {attendanceData.department}
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col md={4} className="text-end">
                        <div className="mb-2">
                            {getStatusBadge(attendanceData.status)}
                        </div>
                        <p className="text-muted mb-0">
                            <FaCalendar className="me-2" />
                            {attendanceData.date}
                        </p>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <h6 className="mb-3">Time Details</h6>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
                                <span className="text-muted">
                                    <FaClock className="me-2" /> Clock In
                                </span>
                                <Badge bg="success">
                                    {attendanceData.clock_in || "Not Recorded"}
                                </Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
                                <span className="text-muted">
                                    <FaClock className="me-2" /> Clock Out
                                </span>
                                <Badge bg="danger">
                                    {attendanceData.clock_out || "Not Recorded"}
                                </Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
                                <span className="text-muted">Hours Worked</span>
                                <Badge bg="info">
                                    {attendanceData.hours_worked || "0"}h
                                </Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
                                <span className="text-muted">Overtime</span>
                                <Badge bg="warning">
                                    {attendanceData.overtime_hours || "0"}h
                                </Badge>
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>

                    <Col md={6}>
                        <h6 className="mb-3">Additional Information</h6>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
                                <span className="text-muted">Late Arrival</span>
                                <Badge
                                    bg={
                                        attendanceData.is_late
                                            ? "danger"
                                            : "success"
                                    }
                                >
                                    {attendanceData.is_late ? "Yes" : "No"}
                                </Badge>
                            </ListGroup.Item>
                            {attendanceData.location && (
                                <ListGroup.Item className="d-flex align-items-center px-0 py-2">
                                    <FaMapMarkerAlt className="me-2 text-muted" />
                                    <small className="text-muted">
                                        {attendanceData.location}
                                    </small>
                                </ListGroup.Item>
                            )}
                            {attendanceData.device && (
                                <ListGroup.Item className="px-0 py-2">
                                    <small className="text-muted">
                                        Device: {attendanceData.device}
                                    </small>
                                </ListGroup.Item>
                            )}
                            {attendanceData.notes && (
                                <ListGroup.Item className="px-0 py-2">
                                    <h6 className="mb-2">Notes</h6>
                                    <p className="text-muted mb-0">
                                        {attendanceData.notes}
                                    </p>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={() => toast.info("Printing attendance details...")}
                >
                    Print Details
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ViewAttendanceModal;
