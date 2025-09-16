import { Modal, Form, Button } from "react-bootstrap";
import { Chat } from "react-bootstrap-icons";

const SendSmsModal = ({
    showSendSmsModal,
    setShowSendSmsModal,
    customer,
    smsDetails,
    setSmsDetails,
    handleSmsSubmit,
}) => {
    return (
        <Modal
            show={showSendSmsModal}
            onHide={() => setShowSendSmsModal(false)}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Send Message</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSmsSubmit}>
                <Modal.Body className="border-0">
                    {/* Phone number */}
                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                            type="text"
                            value={smsDetails.phoneNumber}
                            onChange={(e) =>
                                setSmsDetails({
                                    ...smsDetails,
                                    phoneNumber: e.target.value.replace(
                                        /\D/g,
                                        ""
                                    ),
                                })
                            }
                            placeholder="Enter phone number"
                        />
                    </Form.Group>

                    {/* Message body */}
                    <Form.Group className="mb-3">
                        <Form.Label>Message</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={smsDetails.message}
                            onChange={(e) =>
                                setSmsDetails({
                                    ...smsDetails,
                                    message: e.target.value,
                                })
                            }
                            placeholder="Type your message here..."
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={
                            !smsDetails.phoneNumber || !smsDetails.message
                        }
                    >
                        Send Message
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setShowSendSmsModal(false)}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default SendSmsModal;
