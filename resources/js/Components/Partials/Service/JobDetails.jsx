import { Card, Row, Col, Form } from "react-bootstrap";
import Select from "react-select";

const JobDetails = () => {
    return (
        <>
            {/* Job Information */}
            <Card className="border-0 rounded-0 shadow-sm mb-3">
                <Card.Header className="bg-white fw-bold">
                    Job Information
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Job Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="D5N413"
                                    disabled
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Entry Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    defaultValue="2025-08-23"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Reference Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Number"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Warranty Status</Form.Label>
                                <div>
                                    <Form.Check
                                        inline
                                        label="Out Warranty"
                                        name="warranty"
                                        type="radio"
                                        defaultChecked
                                    />
                                    <Form.Check
                                        inline
                                        label="On Warranty"
                                        name="warranty"
                                        type="radio"
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Customer + Device Information */}
            <Row>
                <Col md={6}>
                    <Card className="border-0 rounded-0 shadow-sm mb-3">
                        <Card.Header className="bg-white fw-bold">
                            Device Information
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Company
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Control
                                            placeholder="Search Company"
                                            isInvalid
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Required.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Model
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Control
                                            placeholder="Select Model"
                                            isInvalid
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Required.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Color</Form.Label>
                                        <Form.Control placeholder="Search Color" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            IMEI/Serial
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Control
                                            placeholder="IMEI/Serial"
                                            isInvalid
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Required.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Device Password
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Control
                                            placeholder="Device Password"
                                            isInvalid
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Required.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Provider Information
                                        </Form.Label>
                                        <Form.Control
                                            placeholder="Provider Information"
                                            as="textarea"
                                            rows={1}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    {/* Complaint Details */}
                    <Card className="border-0 rounded-0 shadow-sm mb-3">
                        <Card.Header className="bg-white fw-bold">
                            Complaint Details
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Service Complaint
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <Select placeholder="Service complaint" />
                                        <Form.Control.Feedback type="invalid">
                                            Required.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Other Remarks</Form.Label>
                                        <Form.Control placeholder="Other Remarks" />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default JobDetails;
