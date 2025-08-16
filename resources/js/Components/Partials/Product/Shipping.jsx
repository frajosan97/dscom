import { Card, Col, FloatingLabel, Form, Row } from "react-bootstrap";

export default function ShippingCard({ data, setData, errors }) {
    return (
        <Card className="mb-4">
            <Card.Header className="bg-white">
                <h5 className="mb-0">Shipping</h5>
            </Card.Header>
            <Card.Body>
                {!data.is_digital && (
                    <>
                        <Row className="g-2">
                            <Col md={6}>
                                <FloatingLabel controlId="weight" label="Weight">
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', parseFloat(e.target.value))}
                                        isInvalid={!!errors.weight}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.weight}
                                    </Form.Control.Feedback>
                                </FloatingLabel>
                            </Col>
                            <Col md={6}>
                                <FloatingLabel controlId="weightUnit" label="Unit">
                                    <Form.Select
                                        value={data.weight_unit}
                                        onChange={(e) => setData('weight_unit', e.target.value)}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="lb">lb</option>
                                        <option value="oz">oz</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                        </Row>

                        <h6 className="mt-3 mb-2">Dimensions</h6>
                        <Row className="g-2">
                            <Col md={4}>
                                <FloatingLabel controlId="length" label="Length">
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.length}
                                        onChange={(e) => setData('length', parseFloat(e.target.value))}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={4}>
                                <FloatingLabel controlId="width" label="Width">
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.width}
                                        onChange={(e) => setData('width', parseFloat(e.target.value))}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={4}>
                                <FloatingLabel controlId="height" label="Height">
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.height}
                                        onChange={(e) => setData('height', parseFloat(e.target.value))}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={12}>
                                <FloatingLabel controlId="dimensionUnit" label="Unit">
                                    <Form.Select
                                        value={data.dimension_unit}
                                        onChange={(e) => setData('dimension_unit', e.target.value)}
                                    >
                                        <option value="cm">cm</option>
                                        <option value="m">m</option>
                                        <option value="in">in</option>
                                        <option value="ft">ft</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                        </Row>
                    </>
                )}
            </Card.Body>
        </Card>
    )
}