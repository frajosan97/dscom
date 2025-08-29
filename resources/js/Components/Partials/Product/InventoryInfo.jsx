import { Card, Col, Form, Row } from "react-bootstrap";
import { createFormHandlers } from "@/Utils/helpers";

export default function InventoryTab({ data, setData, errors, setErrors }) {
    // Create pre-bound handlers using your factory function
    const { handleInput } = createFormHandlers(setData, errors, setErrors);

    return (
        <Card className="border-0 rounded-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-semibold text-capitalize">
                    Inventory Information
                </h6>
            </Card.Header>

            <Card.Body>
                <Row className="g-3">
                    {/* SKU Field */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">SKU</Form.Label>
                            <Form.Control
                                type="text"
                                name="sku"
                                value={data.sku || ""}
                                onChange={handleInput}
                                isInvalid={!!errors.sku}
                                placeholder="Enter product SKU"
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.sku}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                                Stock Keeping Unit identifier
                            </Form.Text>
                        </Form.Group>
                    </Col>

                    {/* Barcode Field */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Barcode
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="barcode"
                                value={data.barcode || ""}
                                onChange={handleInput}
                                isInvalid={!!errors.barcode}
                                placeholder="Enter barcode (UPC, EAN, etc.)"
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.barcode}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                                Barcode number for scanning
                            </Form.Text>
                        </Form.Group>
                    </Col>

                    {/* Track Inventory Switch */}
                    <Col md={12}>
                        <Form.Group className="mb-4 p-3 bg-light rounded">
                            <Form.Check
                                type="switch"
                                id="track_inventory"
                                name="track_inventory"
                                label={
                                    <span className="fw-semibold">
                                        Track Inventory
                                    </span>
                                }
                                checked={data.track_inventory || false}
                                onChange={handleInput}
                                className="fs-6"
                            />
                            <Form.Text className="text-muted ms-4">
                                Enable inventory tracking for this product
                            </Form.Text>
                        </Form.Group>
                    </Col>

                    {/* Quantity Field */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Quantity
                                {data.track_inventory && (
                                    <span className="text-danger"> *</span>
                                )}
                            </Form.Label>
                            <Form.Control
                                type="number"
                                name="quantity"
                                min="0"
                                value={data.quantity || 0}
                                onChange={handleInput}
                                isInvalid={!!errors.quantity}
                                disabled={!data.track_inventory}
                                placeholder="Enter quantity"
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.quantity}
                            </Form.Control.Feedback>
                            {data.track_inventory && (
                                <Form.Text className="text-muted">
                                    Current stock quantity
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Low Stock Threshold Field */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Low Stock Threshold
                            </Form.Label>
                            <Form.Control
                                type="number"
                                name="low_stock_threshold"
                                min="0"
                                value={data.low_stock_threshold || 0}
                                onChange={handleInput}
                                isInvalid={!!errors.low_stock_threshold}
                                disabled={!data.track_inventory}
                                placeholder="Set threshold"
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.low_stock_threshold}
                            </Form.Control.Feedback>
                            {data.track_inventory && (
                                <Form.Text className="text-muted">
                                    Alert when stock reaches this level
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Allow Backorders Switch */}
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                id="allow_backorders"
                                name="allow_backorders"
                                label={
                                    <span className="fw-semibold">
                                        Allow Backorders
                                    </span>
                                }
                                checked={data.allow_backorders || false}
                                onChange={handleInput}
                                disabled={!data.track_inventory}
                                className="fs-6"
                            />
                            <Form.Text className="text-muted">
                                Allow sales when out of stock
                            </Form.Text>
                        </Form.Group>
                    </Col>

                    {/* Stock Status Field */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Stock Status
                                {!data.track_inventory && (
                                    <span className="text-danger"> *</span>
                                )}
                            </Form.Label>
                            <Form.Select
                                name="stock_status"
                                value={data.stock_status || "in_stock"}
                                onChange={handleInput}
                                isInvalid={!!errors.stock_status}
                                disabled={data.track_inventory}
                                className="py-2"
                            >
                                <option value="in_stock">In Stock</option>
                                <option value="out_of_stock">
                                    Out of Stock
                                </option>
                                <option value="low_stock">Low Stock</option>
                                <option value="pre_order">Pre-order</option>
                                <option value="discontinued">
                                    Discontinued
                                </option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.stock_status}
                            </Form.Control.Feedback>
                            {!data.track_inventory && (
                                <Form.Text className="text-muted">
                                    Manual stock status
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Inventory Summary */}
                    <Col md={12}>
                        <div className="bg-light p-3 rounded mt-3">
                            <h6 className="fw-semibold mb-3">
                                Inventory Summary
                            </h6>
                            <Row>
                                <Col md={4}>
                                    <div className="d-flex justify-content-between">
                                        <span>Current Status:</span>
                                        <strong
                                            className={
                                                data.stock_status ===
                                                "out_of_stock"
                                                    ? "text-danger"
                                                    : data.stock_status ===
                                                      "low_stock"
                                                    ? "text-warning"
                                                    : "text-success"
                                            }
                                        >
                                            {data.stock_status === "in_stock" &&
                                                "In Stock"}
                                            {data.stock_status ===
                                                "out_of_stock" &&
                                                "Out of Stock"}
                                            {data.stock_status ===
                                                "low_stock" && "Low Stock"}
                                            {data.stock_status ===
                                                "pre_order" && "Pre-order"}
                                            {data.stock_status ===
                                                "discontinued" &&
                                                "Discontinued"}
                                        </strong>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="d-flex justify-content-between">
                                        <span>Available Quantity:</span>
                                        <strong
                                            className={
                                                data.quantity === 0
                                                    ? "text-danger"
                                                    : data.quantity <=
                                                      data.low_stock_threshold
                                                    ? "text-warning"
                                                    : "text-success"
                                            }
                                        >
                                            {data.track_inventory
                                                ? data.quantity
                                                : "N/A"}
                                        </strong>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="d-flex justify-content-between">
                                        <span>Backorders:</span>
                                        <strong
                                            className={
                                                data.allow_backorders
                                                    ? "text-success"
                                                    : "text-secondary"
                                            }
                                        >
                                            {data.allow_backorders
                                                ? "Allowed"
                                                : "Not Allowed"}
                                        </strong>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}
