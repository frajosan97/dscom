import { Card, Col, Form, Row } from "react-bootstrap";
import Select from "react-select";
import {
    createFormHandlers,
    formatSelectOptions,
    findSelectedOption,
} from "@/Utils/helpers";

export default function PricingTab({ data, setData, errors, taxes }) {
    const formHandlers = createFormHandlers(setData, errors);

    // Format tax options for react-select
    const taxOptions = formatSelectOptions(taxes || [], "id", "name");
    const selectedTax = findSelectedOption(data.tax_id, taxOptions);

    // Format tax options with rate display
    const formattedTaxOptions =
        taxes?.map((tax) => ({
            value: tax.id,
            label: `${tax.name} (${tax.rate}%)`,
        })) || [];

    return (
        <Card className="border-0 rounded-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-semibold text-capitalize">
                    Pricing Information
                </h6>
            </Card.Header>
            <Card.Body>
                <Row className="g-3">
                    {/* Price */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Price *
                            </Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                name="price"
                                value={data.price || 0}
                                onChange={formHandlers.handleInput}
                                isInvalid={!!errors.price}
                                placeholder="Enter product price"
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.price}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    {/* Compare Price */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Compare Price
                            </Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                name="compare_price"
                                value={data.compare_price || 0}
                                onChange={formHandlers.handleInput}
                                isInvalid={!!errors.compare_price}
                                placeholder="Enter compare price"
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.compare_price}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    {/* Agent Price */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Agent Price
                            </Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                name="agent_price"
                                value={data.agent_price || 0}
                                onChange={formHandlers.handleInput}
                                isInvalid={!!errors.agent_price}
                                placeholder="Enter agent price"
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.agent_price}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    {/* Wholesaler Price */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Wholesaler Price
                            </Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                name="wholesaler_price"
                                value={data.wholesaler_price || 0}
                                onChange={formHandlers.handleInput}
                                isInvalid={!!errors.wholesaler_price}
                                placeholder="Enter wholesaler price"
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.wholesaler_price}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    {/* Cost Per Item */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Cost Per Item
                            </Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                name="cost_per_item"
                                value={data.cost_per_item || 0}
                                onChange={formHandlers.handleInput}
                                isInvalid={!!errors.cost_per_item}
                                placeholder="Enter cost per item"
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.cost_per_item}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    {/* Tax Select */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">Tax</Form.Label>
                            <Select
                                options={formattedTaxOptions}
                                value={selectedTax}
                                onChange={formHandlers.handleSelect("tax_id")}
                                isClearable
                                placeholder="Select tax..."
                                isInvalid={!!errors.tax_id}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: errors.tax_id
                                            ? "#dc3545"
                                            : base.borderColor,
                                        minHeight: "44px",
                                    }),
                                }}
                            />
                            {errors.tax_id && (
                                <div className="text-danger small mt-1">
                                    {errors.tax_id}
                                </div>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Tax Amount Display (Read-only) */}
                    {data.tax_id && (
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    Tax Amount
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    readOnly
                                    value={data.tax_amount || 0}
                                    className="py-2 bg-light"
                                    placeholder="Calculated tax amount"
                                />
                                <Form.Text className="text-muted">
                                    Calculated based on price and tax rate
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    )}
                </Row>

                {/* Summary Section */}
                <Row className="mt-4 pt-3 border-top">
                    <Col md={12}>
                        <div className="bg-light p-3 rounded">
                            <h6 className="fw-semibold mb-3">
                                Pricing Summary
                            </h6>
                            <Row>
                                <Col md={4}>
                                    <div className="d-flex justify-content-between">
                                        <span>Base Price:</span>
                                        <strong>${data.price || 0}</strong>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="d-flex justify-content-between">
                                        <span>Tax Amount:</span>
                                        <strong>${data.tax_amount || 0}</strong>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="d-flex justify-content-between">
                                        <span>Final Price:</span>
                                        <strong className="text-success">
                                            $
                                            {(
                                                parseFloat(data.price || 0) +
                                                parseFloat(data.tax_amount || 0)
                                            ).toFixed(2)}
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
