import { Modal, Form, Row, Col, Button } from "react-bootstrap";
import {
    Person,
    ArrowLeft,
    TelephoneFill,
    Journal,
} from "react-bootstrap-icons";

const CallModal = ({
    showCallModal,
    setShowCallModal,
    customer,
    callDetails,
    setCallDetails,
    handleCallSubmit,
    handleCallNow,
}) => {
    // Keypad configuration
    const keypad = [
        [
            { label: "1", sub: "♾️" },
            { label: "2", sub: "ABC" },
            { label: "3", sub: "DEF" },
        ],
        [
            { label: "4", sub: "GHI" },
            { label: "5", sub: "JKL" },
            { label: "6", sub: "MNO" },
        ],
        [
            { label: "7", sub: "PQRS" },
            { label: "8", sub: "TUV" },
            { label: "9", sub: "WXYZ" },
        ],
        [
            { label: "*", sub: "" },
            { label: "0", sub: "+" },
            { label: "#", sub: "" },
        ],
    ];

    // Handle keypad click
    const handleKeyPress = (key) => {
        setCallDetails({
            ...callDetails,
            phoneNumber: callDetails.phoneNumber + key,
        });
    };

    return (
        <Modal
            show={showCallModal}
            centered
            onHide={() => setShowCallModal(false)}
        >
            <Modal.Header className="border-0 py-1" closeButton>
                <Modal.Title>Call Customer</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleCallSubmit}>
                <Modal.Body className="border-0">
                    {/* Profile display */}
                    <div className="text-center">
                        <div
                            className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                            style={{ width: "80px", height: "80px" }}
                        >
                            <Person size={40} className="text-white" />
                        </div>
                    </div>

                    {/* Phone number input */}
                    <div className="mb-3">
                        <Form.Label className="visually-hidden">
                            Phone Number
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={callDetails.phoneNumber}
                            onChange={(e) =>
                                setCallDetails({
                                    ...callDetails,
                                    phoneNumber: e.target.value.replace(
                                        /\D/g,
                                        ""
                                    ),
                                })
                            }
                            className="text-center py-3 fs-5"
                            placeholder="Enter phone number"
                        />
                    </div>

                    {/* Keypad */}
                    <div className="keypad">
                        {keypad.map((row, rowIndex) => (
                            <Row className="g-1 mb-1" key={rowIndex}>
                                {row.map((key) => (
                                    <Col xs={4} key={key.label}>
                                        <Button
                                            variant="outline-light"
                                            className="w-100 d-flex flex-column border text-dark"
                                            onClick={() =>
                                                handleKeyPress(key.label)
                                            }
                                        >
                                            <span className="fs-5 mb-0">
                                                {key.label}
                                            </span>
                                            {key.sub && (
                                                <small className="text-muted">
                                                    {key.sub}
                                                </small>
                                            )}
                                        </Button>
                                    </Col>
                                ))}
                            </Row>
                        ))}

                        {/* Actions row */}
                        <Row className="g-2">
                            <Col xs={4}>
                                <Button
                                    variant="outline-secondary"
                                    className="w-100 py-2"
                                    onClick={() =>
                                        setCallDetails({
                                            ...callDetails,
                                            phoneNumber:
                                                callDetails.phoneNumber.slice(
                                                    0,
                                                    -1
                                                ),
                                        })
                                    }
                                >
                                    <ArrowLeft size={24} />
                                </Button>
                            </Col>
                            <Col xs={4}>
                                <Button
                                    variant="success"
                                    className="w-100 py-2"
                                    onClick={handleCallNow}
                                    disabled={!callDetails.phoneNumber}
                                >
                                    <TelephoneFill size={24} />
                                    <span className="ms-1">Call</span>
                                </Button>
                            </Col>
                            <Col xs={4}>
                                <Button
                                    variant="outline-primary"
                                    className="w-100 py-2"
                                    type="submit"
                                >
                                    <Journal size={24} />
                                    <span className="ms-1">Log</span>
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
            </Form>
        </Modal>
    );
};

export default CallModal;
