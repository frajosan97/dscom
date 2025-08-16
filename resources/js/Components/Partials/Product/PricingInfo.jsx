import { Col, FloatingLabel, Form, Row } from "react-bootstrap";

export default function PricingTab({ data, setData, errors, taxes }) {
    return (
        <Row className="g-3">
            <Col md={6}>
                <FloatingLabel controlId="price" label="Price">
                    <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.price}
                        onChange={(e) => setData('price', parseFloat(e.target.value))}
                        isInvalid={!!errors.price}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.price}
                    </Form.Control.Feedback>
                </FloatingLabel>
            </Col>

            <Col md={6}>
                <FloatingLabel controlId="comparePrice" label="Compare Price">
                    <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.compare_price}
                        onChange={(e) => setData('compare_price', parseFloat(e.target.value))}
                        isInvalid={!!errors.compare_price}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.compare_price}
                    </Form.Control.Feedback>
                </FloatingLabel>
            </Col>

            <Col md={6}>
                <FloatingLabel controlId="agentPrice" label="Agent Price">
                    <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.agent_price}
                        onChange={(e) => setData('agent_price', parseFloat(e.target.value))}
                        isInvalid={!!errors.agent_price}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.agent_price}
                    </Form.Control.Feedback>
                </FloatingLabel>
            </Col>

            <Col md={6}>
                <FloatingLabel controlId="wholesalerPrice" label="Wholesaler Price">
                    <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.wholesaler_price}
                        onChange={(e) => setData('wholesaler_price', parseFloat(e.target.value))}
                        isInvalid={!!errors.wholesaler_price}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.wholesaler_price}
                    </Form.Control.Feedback>
                </FloatingLabel>
            </Col>

            <Col md={6}>
                <FloatingLabel controlId="costPerItem" label="Cost Per Item">
                    <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.cost_per_item}
                        onChange={(e) => setData('cost_per_item', parseFloat(e.target.value))}
                        isInvalid={!!errors.cost_per_item}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.cost_per_item}
                    </Form.Control.Feedback>
                </FloatingLabel>
            </Col>

            <Col md={6}>
                <FloatingLabel controlId="tax" label="Tax">
                    <Form.Select
                        value={data.tax_id}
                        onChange={(e) => setData('tax_id', e.target.value)}
                        isInvalid={!!errors.tax_id}
                    >
                        <option value="">No Tax</option>
                        {taxes?.map(tax => (
                            <option key={tax.id} value={tax.id}>
                                {tax.name} ({tax.rate}%)
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {errors.tax_id}
                    </Form.Control.Feedback>
                </FloatingLabel>
            </Col>
        </Row>
    );
}