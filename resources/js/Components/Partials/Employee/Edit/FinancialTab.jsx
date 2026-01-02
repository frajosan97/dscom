import { Card, Col, Form, Row } from "react-bootstrap";
import { BiDollar, BiCreditCard } from "react-icons/bi";

const FinancialTab = ({ formik }) => {
    return (
        <Row className="g-4">
            <Col lg={8}>
                <Row className="g-4">
                    <Col md={6}>
                        <Card className="border-0 bg-light h-100">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            backgroundColor: "#dc2626",
                                            color: "white",
                                        }}
                                    >
                                        <BiDollar size={20} />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0">
                                            Opening Balance
                                        </h6>
                                        <small className="text-muted">
                                            Initial account balance
                                        </small>
                                    </div>
                                </div>
                                <Form.Group>
                                    <Form.Control
                                        type="number"
                                        name="opening_balance"
                                        value={formik.values.opening_balance}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="0.00"
                                        className="py-2 border-0 bg-white shadow-sm"
                                        step="0.01"
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="border-0 bg-light h-100">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            backgroundColor: "#059669",
                                            color: "white",
                                        }}
                                    >
                                        <BiDollar size={20} />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0">
                                            Salary Type
                                        </h6>
                                        <small className="text-muted">
                                            Payment frequency
                                        </small>
                                    </div>
                                </div>
                                <Form.Group>
                                    <Form.Select
                                        name="salary_type"
                                        value={formik.values.salary_type}
                                        onChange={formik.handleChange}
                                        className="py-2 border-0 bg-white shadow-sm"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="daily">Daily</option>
                                    </Form.Select>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Col>
            <Col lg={4}>
                <Card className="border-0 bg-warning bg-opacity-10 h-100">
                    <Card.Body className="p-4">
                        <h6 className="fw-bold text-warning mb-3">
                            <BiDollar className="me-2" />
                            Financial Information
                        </h6>
                        <p className="small text-muted mb-0">
                            Set the salary type and opening balance for this
                            employee. These values will be used for payroll and
                            accounting purposes.
                        </p>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={12}>
                <Card className="border-0 bg-light mt-4">
                    <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    backgroundColor: "#7c3aed",
                                    color: "white",
                                }}
                            >
                                <BiCreditCard size={20} />
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0">Monthly Salary</h6>
                                <small className="text-muted">
                                    Gross salary amount
                                </small>
                            </div>
                        </div>
                        <Form.Group>
                            <Form.Control
                                type="number"
                                name="salary"
                                value={formik.values.salary}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="0.00"
                                className="py-2 border-0 bg-white shadow-sm"
                                step="0.01"
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default FinancialTab;
