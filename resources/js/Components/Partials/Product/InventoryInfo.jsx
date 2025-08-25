import { Card, Col, FloatingLabel, Form, Row } from "react-bootstrap";

export default function InventoryTab({ data, setData, errors }) {
    return (
        <Card className="border-0 rounded-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-semibold text-capitalize">
                    Inventory Information
                </h6>
            </Card.Header>
            <Card.Body>
                <Row className="g-3">
                    <Col md={6}>
                        <FloatingLabel controlId="sku" label="SKU">
                            <Form.Control
                                type="text"
                                value={data.sku}
                                onChange={(e) => setData("sku", e.target.value)}
                                isInvalid={!!errors.sku}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.sku}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>

                    <Col md={6}>
                        <FloatingLabel controlId="barcode" label="Barcode">
                            <Form.Control
                                type="text"
                                value={data.barcode}
                                onChange={(e) =>
                                    setData("barcode", e.target.value)
                                }
                                isInvalid={!!errors.barcode}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.barcode}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>

                    <Col md={6}>
                        <FloatingLabel controlId="quantity" label="Quantity">
                            <Form.Control
                                type="number"
                                min="0"
                                value={data.quantity}
                                onChange={(e) =>
                                    setData(
                                        "quantity",
                                        parseInt(e.target.value)
                                    )
                                }
                                isInvalid={!!errors.quantity}
                                disabled={!data.track_inventory}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.quantity}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>

                    <Col md={6}>
                        <FloatingLabel
                            controlId="lowStockThreshold"
                            label="Low Stock Threshold"
                        >
                            <Form.Control
                                type="number"
                                min="0"
                                value={data.low_stock_threshold}
                                onChange={(e) =>
                                    setData(
                                        "low_stock_threshold",
                                        parseInt(e.target.value)
                                    )
                                }
                                isInvalid={!!errors.low_stock_threshold}
                                disabled={!data.track_inventory}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.low_stock_threshold}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                id="trackInventory"
                                label="Track Inventory"
                                checked={data.track_inventory}
                                onChange={(e) =>
                                    setData("track_inventory", e.target.checked)
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                id="allowBackorders"
                                label="Allow Backorders"
                                checked={data.allow_backorders}
                                onChange={(e) =>
                                    setData(
                                        "allow_backorders",
                                        e.target.checked
                                    )
                                }
                                disabled={!data.track_inventory}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <FloatingLabel
                            controlId="stockStatus"
                            label="Stock Status"
                        >
                            <Form.Select
                                value={data.stock_status}
                                onChange={(e) =>
                                    setData("stock_status", e.target.value)
                                }
                                isInvalid={!!errors.stock_status}
                            >
                                <option value="in_stock">In Stock</option>
                                <option value="out_of_stock">
                                    Out of Stock
                                </option>
                                <option value="low_stock">Low Stock</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.stock_status}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}
