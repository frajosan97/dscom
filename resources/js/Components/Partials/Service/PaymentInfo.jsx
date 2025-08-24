import { Card, Row, Col, Form, Tabs, Tab } from "react-bootstrap";

const PaymentInfo = () => {
    return (
        <>
            {/* Payment Info */}
            <Card className="border-0 rounded-0 shadow-sm mb-3">
                <Card.Header className="bg-white fw-bold">
                    Payment Info
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Estimate</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <Form.Control placeholder="Estimate" />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Advance</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <Form.Control placeholder="0" />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tabs with Payment & Summary */}
            <Row className="g-3">
                <Col md={8}>
                    <Tabs defaultActiveKey="cash" className="mb-3">
                        <Tab eventKey="cash" title="Cash">
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Amount</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        $
                                                    </span>
                                                    <Form.Control placeholder="Amount" />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Remarks</Form.Label>
                                                <Form.Control
                                                    placeholder="Remarks"
                                                    as="textarea"
                                                    rows={1}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Tab>

                        <Tab eventKey="cheque" title="Cheque">
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    Cheque Amount
                                                </Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        $
                                                    </span>
                                                    <Form.Control placeholder="Amount" />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Remarks</Form.Label>
                                                <Form.Control
                                                    placeholder="Remarks"
                                                    as="textarea"
                                                    rows={1}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Tab>

                        <Tab
                            eventKey="digital"
                            title="Digital Payment / Other Accounts"
                        >
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    Digital Amount
                                                </Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        $
                                                    </span>
                                                    <Form.Control placeholder="Amount" />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Remarks</Form.Label>
                                                <Form.Control
                                                    placeholder="Remarks"
                                                    as="textarea"
                                                    rows={1}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Tab>

                        <Tab eventKey="balance" title="Balance Amount">
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    Balance Amount
                                                </Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        $
                                                    </span>
                                                    <Form.Control placeholder="Balance Amount" disabled />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    Amount
                                                </Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        $
                                                    </span>
                                                    <Form.Control placeholder="Amount" />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Tab>
                    </Tabs>
                </Col>

                {/* Summary Section */}
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <Row className="g-2">
                                {[
                                    "Total Amount||0",
                                    "Balance Due||0",
                                    "Cash||0",
                                    "Cheque||0",
                                    "Digital Payment||0",
                                    "From Balance Amount||0",
                                    "Total Paid Sum||0",
                                    "Transaction Unbalance||0",
                                ].map((item, i) => {
                                    const [label, val] = item.split("||");
                                    return (
                                        <Col xs={6} key={i}>
                                            <Form.Group>
                                                <Form.Label className="text-truncate">
                                                    {label}
                                                </Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        $
                                                    </span>
                                                    <Form.Control
                                                        value={val}
                                                        disabled
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default PaymentInfo;
