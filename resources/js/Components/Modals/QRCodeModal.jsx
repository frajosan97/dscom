import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import { formatDate } from "@/Utils/helpers";

const QRCodeModal = ({ show, onHide, date }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Attendance QR Code</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <div className="bg-light p-4 rounded mb-3">
                    <div className="qr-placeholder bg-white p-4 d-inline-block">
                        <div
                            style={{
                                width: "200px",
                                height: "200px",
                                background:
                                    "linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%, #f3f3f3), linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%, #f3f3f3)",
                                backgroundSize: "40px 40px",
                                backgroundPosition: "0 0, 20px 20px",
                            }}
                        />
                    </div>
                </div>
                <p className="text-muted mb-2">Scan this QR code to check-in</p>
                <small className="text-muted d-block mb-2">
                    Valid for: {formatDate(date, "DD MMM, YYYY")}
                </small>
                <small className="text-muted">Expires in: 1 hour</small>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
                <Button
                    variant="primary"
                    onClick={() => toast.info("QR code downloaded")}
                >
                    <FaDownload className="me-2" /> Download QR
                </Button>
                <Button
                    variant="outline-primary"
                    onClick={() => toast.info("QR code shared")}
                >
                    Share
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default QRCodeModal;
