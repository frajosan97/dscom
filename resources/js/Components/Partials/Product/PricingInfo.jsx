import { useState, useCallback, useEffect, useMemo } from "react";
import {
    Card,
    Col,
    Form,
    Row,
    Badge,
    Alert,
    InputGroup,
} from "react-bootstrap";
import Select from "react-select";
import {
    Calculator,
    Tag,
    Percent,
    CashStack,
    GraphUp,
    InfoCircle,
} from "react-bootstrap-icons";

export default function PricingTab({
    data,
    updateFormData,
    errors,
    taxes = [],
}) {
    const [currency] = useState("USD");
    const [calculatedPrices, setCalculatedPrices] = useState({
        profitMargin: 0,
        profitAmount: 0,
        discountPercentage: 0,
        taxAmount: 0,
        finalPrice: 0,
    });

    // Calculate derived pricing information
    useEffect(() => {
        const basePrice = parseFloat(data.base_price) || 0;
        const comparePrice = parseFloat(data.compare_price) || 0;
        const costPerItem = parseFloat(data.cost_per_item) || 0;
        const taxRate = parseFloat(selectedTax?.rate) || 0;

        const calculations = {
            // Profit calculations
            profitAmount: basePrice - costPerItem,
            profitMargin:
                costPerItem > 0
                    ? ((basePrice - costPerItem) / costPerItem) * 100
                    : 0,

            // Discount calculations
            discountPercentage:
                comparePrice > basePrice
                    ? ((comparePrice - basePrice) / comparePrice) * 100
                    : 0,

            // Tax calculations
            taxAmount: basePrice * (taxRate / 100),

            // Final price
            finalPrice: basePrice + basePrice * (taxRate / 100),
        };

        setCalculatedPrices(calculations);
    }, [
        data.base_price,
        data.compare_price,
        data.cost_per_item,
        data.tax_id,
        taxes,
    ]);

    // Tax options with rates
    const taxOptions = useMemo(
        () =>
            taxes.map((tax) => ({
                value: tax.id,
                label: `${tax.name} (${tax.rate}%)`,
                rate: parseFloat(tax.rate),
                description: tax.description,
            })),
        [taxes]
    );

    const selectedTax = taxOptions.find((opt) => opt.value === data.tax_id);

    // Handle price changes with validation
    const handlePriceChange = useCallback(
        (field, value) => {
            // Ensure numeric value and prevent negative numbers
            const numericValue = Math.max(0, parseFloat(value) || 0);
            updateFormData(field, numericValue);
        },
        [updateFormData]
    );

    // Handle tax selection
    const handleTaxChange = useCallback(
        (option) => {
            updateFormData("tax_id", option?.value || "");
        },
        [updateFormData]
    );

    // Quick price suggestions based on cost
    const getSuggestedPrices = useCallback((cost) => {
        if (!cost || cost <= 0) return null;

        return {
            low: cost * 1.5, // 50% margin
            medium: cost * 2, // 100% margin
            high: cost * 3, // 200% margin
            premium: cost * 5, // 400% margin
        };
    }, []);

    const suggestedPrices = getSuggestedPrices(data.cost_per_item);

    // Pricing tiers for different customer types
    const pricingTiers = [
        {
            key: "base_price",
            label: "Regular Price",
            description: "Standard price for retail customers",
            icon: Tag,
            required: true,
            color: "primary",
        },
        {
            key: "agent_price",
            label: "Agent Price",
            description: "Special price for sales agents",
            icon: CashStack,
            color: "success",
        },
        {
            key: "wholesaler_price",
            label: "Wholesaler Price",
            description: "Bulk pricing for wholesalers",
            icon: GraphUp,
            color: "info",
        },
        {
            key: "compare_price",
            label: "Compare at Price",
            description: "Original price for discount display",
            icon: Percent,
            color: "secondary",
        },
    ];

    return (
        <div className="pricing-tab">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">
                        <Calculator className="me-2" />
                        Pricing Strategy
                    </h4>
                    <p className="text-muted mb-0">
                        Set competitive pricing for different customer segments
                    </p>
                </div>
                <div className="text-end">
                    <Badge bg="light" text="dark" className="fs-6">
                        {currency}
                    </Badge>
                </div>
            </div>

            <Row className="g-4">
                {/* Left Column - Cost & Base Pricing */}
                <Col xl={8}>
                    {/* Cost & Profit Analysis */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-light py-3">
                            <h6 className="mb-0 fw-semibold">
                                <CashStack className="me-2" />
                                Cost & Profit Analysis
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Row className="g-3">
                                {/* Cost per Item */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Cost per Item *
                                            <InfoCircle
                                                className="ms-1 text-muted"
                                                size={14}
                                                title="Your cost to acquire or produce this item"
                                            />
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-light border-end-0">
                                                {currency}
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.cost_per_item || 0}
                                                onChange={(e) =>
                                                    handlePriceChange(
                                                        "cost_per_item",
                                                        e.target.value
                                                    )
                                                }
                                                isInvalid={
                                                    !!errors.cost_per_item
                                                }
                                                placeholder="0.00"
                                                className="py-2 border-start-0"
                                            />
                                        </InputGroup>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.cost_per_item}
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Your actual cost for this product
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                {/* Profit Display */}
                                <Col md={6}>
                                    <div className="h-100 d-flex flex-column justify-content-center">
                                        <div className="bg-light rounded p-3 text-center">
                                            <small className="text-muted d-block">
                                                Profit Margin
                                            </small>
                                            <div
                                                className={`h4 mb-0 ${
                                                    calculatedPrices.profitMargin >
                                                    0
                                                        ? "text-success"
                                                        : "text-danger"
                                                }`}
                                            >
                                                {calculatedPrices.profitMargin.toFixed(
                                                    1
                                                )}
                                                %
                                            </div>
                                            <small className="text-muted">
                                                {currency}{" "}
                                                {calculatedPrices.profitAmount.toFixed(
                                                    2
                                                )}{" "}
                                                profit
                                            </small>
                                        </div>
                                    </div>
                                </Col>

                                {/* Price Suggestions */}
                                {suggestedPrices && (
                                    <Col md={12}>
                                        <Alert variant="info" className="py-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="fw-semibold">
                                                    Suggested Prices:
                                                </small>
                                                <div className="d-flex gap-2">
                                                    {Object.entries(
                                                        suggestedPrices
                                                    ).map(([key, price]) => (
                                                        <Badge
                                                            key={key}
                                                            bg="outline-info"
                                                            text="dark"
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                handlePriceChange(
                                                                    "base_price",
                                                                    price
                                                                )
                                                            }
                                                            style={{
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            {currency}{" "}
                                                            {price.toFixed(2)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </Alert>
                                    </Col>
                                )}
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Pricing Tiers */}
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light py-3">
                            <h6 className="mb-0 fw-semibold">
                                <Tag className="me-2" />
                                Pricing Tiers
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Row className="g-4">
                                {pricingTiers.map((tier) => {
                                    const IconComponent = tier.icon;
                                    const value = data[tier.key] || 0;
                                    const isDiscounted =
                                        tier.key === "compare_price" &&
                                        value > data.base_price;

                                    return (
                                        <Col md={6} key={tier.key}>
                                            <Card
                                                className={`h-100 border ${
                                                    tier.key === "base_price"
                                                        ? "border-primary"
                                                        : ""
                                                } ${
                                                    isDiscounted
                                                        ? "border-warning"
                                                        : ""
                                                }`}
                                            >
                                                <Card.Body className="p-3">
                                                    <div className="d-flex align-items-start mb-2">
                                                        <IconComponent
                                                            className={`text-${tier.color} me-2 mt-1`}
                                                        />
                                                        <div className="flex-grow-1">
                                                            <Form.Label className="fw-semibold mb-1">
                                                                {tier.label}
                                                                {tier.required && (
                                                                    <span className="text-danger ms-1">
                                                                        *
                                                                    </span>
                                                                )}
                                                            </Form.Label>
                                                            <p className="small text-muted mb-2">
                                                                {
                                                                    tier.description
                                                                }
                                                            </p>
                                                        </div>
                                                        {isDiscounted && (
                                                            <Badge
                                                                bg="warning"
                                                                text="dark"
                                                            >
                                                                Sale
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <InputGroup size="sm">
                                                        <InputGroup.Text className="bg-light">
                                                            {currency}
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={value}
                                                            onChange={(e) =>
                                                                handlePriceChange(
                                                                    tier.key,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            isInvalid={
                                                                !!errors[
                                                                    tier.key
                                                                ]
                                                            }
                                                            placeholder="0.00"
                                                            className={
                                                                tier.key ===
                                                                "base_price"
                                                                    ? "fw-semibold"
                                                                    : ""
                                                            }
                                                        />
                                                    </InputGroup>

                                                    {errors[tier.key] && (
                                                        <Form.Text className="text-danger">
                                                            {errors[tier.key]}
                                                        </Form.Text>
                                                    )}

                                                    {/* Tier-specific info */}
                                                    {tier.key ===
                                                        "compare_price" &&
                                                        isDiscounted && (
                                                            <div className="mt-2 text-center">
                                                                <Badge
                                                                    bg="danger"
                                                                    className="fs-7"
                                                                >
                                                                    {calculatedPrices.discountPercentage.toFixed(
                                                                        1
                                                                    )}
                                                                    % OFF
                                                                </Badge>
                                                            </div>
                                                        )}

                                                    {tier.key ===
                                                        "agent_price" &&
                                                        data.base_price > 0 &&
                                                        value > 0 && (
                                                            <div className="mt-2 text-center">
                                                                <Badge
                                                                    bg="success"
                                                                    className="fs-7"
                                                                >
                                                                    {(
                                                                        ((data.base_price -
                                                                            value) /
                                                                            data.base_price) *
                                                                        100
                                                                    ).toFixed(
                                                                        1
                                                                    )}
                                                                    % discount
                                                                </Badge>
                                                            </div>
                                                        )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - Tax & Summary */}
                <Col xl={4}>
                    {/* Tax Configuration */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-light py-3">
                            <h6 className="mb-0 fw-semibold">
                                <Percent className="me-2" />
                                Tax Configuration
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    Tax Rate
                                    <InfoCircle
                                        className="ms-1 text-muted"
                                        size={14}
                                        title="Tax rate applied to the base price"
                                    />
                                </Form.Label>
                                <Select
                                    options={taxOptions}
                                    value={selectedTax}
                                    onChange={handleTaxChange}
                                    isInvalid={!!errors.tax_id}
                                    placeholder="Select tax rate..."
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

                                {selectedTax && (
                                    <div className="mt-2 p-2 bg-light rounded">
                                        <small className="text-muted d-block">
                                            {selectedTax.description ||
                                                "Standard tax rate"}
                                        </small>
                                        <small className="text-muted">
                                            Applied to base price: {currency}{" "}
                                            {calculatedPrices.taxAmount.toFixed(
                                                2
                                            )}
                                        </small>
                                    </div>
                                )}
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* Pricing Summary */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-light py-3">
                            <h6 className="mb-0 fw-semibold">
                                <Calculator className="me-2" />
                                Pricing Summary
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                            <div className="space-y-2">
                                {/* Cost */}
                                <div className="d-flex justify-content-between align-items-center py-1">
                                    <span className="small text-muted">
                                        Cost:
                                    </span>
                                    <span className="small fw-semibold">
                                        {currency}{" "}
                                        {parseFloat(
                                            data.cost_per_item || 0
                                        ).toFixed(2)}
                                    </span>
                                </div>

                                {/* Base Price */}
                                <div className="d-flex justify-content-between align-items-center py-1 border-top">
                                    <span className="small">Base Price:</span>
                                    <span className="fw-semibold text-primary">
                                        {currency}{" "}
                                        {parseFloat(
                                            data.base_price || 0
                                        ).toFixed(2)}
                                    </span>
                                </div>

                                {/* Tax */}
                                {selectedTax && (
                                    <div className="d-flex justify-content-between align-items-center py-1 border-top">
                                        <span className="small text-muted">
                                            Tax ({selectedTax.rate}%):
                                        </span>
                                        <span className="small text-muted">
                                            +{currency}{" "}
                                            {calculatedPrices.taxAmount.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                )}

                                {/* Final Price */}
                                <div className="d-flex justify-content-between align-items-center py-1 border-top pt-2">
                                    <span className="fw-semibold">
                                        Final Price:
                                    </span>
                                    <span className="fw-bold text-success fs-6">
                                        {currency}{" "}
                                        {calculatedPrices.finalPrice.toFixed(2)}
                                    </span>
                                </div>

                                {/* Discount Display */}
                                {calculatedPrices.discountPercentage > 0 && (
                                    <div className="mt-2 p-2 bg-warning bg-opacity-10 rounded text-center">
                                        <small className="text-warning-dark fw-semibold">
                                            {calculatedPrices.discountPercentage.toFixed(
                                                1
                                            )}
                                            % DISCOUNT
                                        </small>
                                        <br />
                                        <small className="text-muted">
                                            Was {currency}{" "}
                                            {parseFloat(
                                                data.compare_price || 0
                                            ).toFixed(2)}
                                        </small>
                                    </div>
                                )}

                                {/* Profit Summary */}
                                <div className="mt-3 p-2 bg-light rounded">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            Profit:
                                        </small>
                                        <small
                                            className={`fw-semibold ${
                                                calculatedPrices.profitAmount >
                                                0
                                                    ? "text-success"
                                                    : "text-danger"
                                            }`}
                                        >
                                            {currency}{" "}
                                            {calculatedPrices.profitAmount.toFixed(
                                                2
                                            )}
                                        </small>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            Margin:
                                        </small>
                                        <small
                                            className={`fw-semibold ${
                                                calculatedPrices.profitMargin >
                                                0
                                                    ? "text-success"
                                                    : "text-danger"
                                            }`}
                                        >
                                            {calculatedPrices.profitMargin.toFixed(
                                                1
                                            )}
                                            %
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light py-3">
                            <h6 className="mb-0 fw-semibold">Quick Actions</h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                            <div className="d-grid gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => {
                                        if (data.cost_per_item > 0) {
                                            handlePriceChange(
                                                "base_price",
                                                data.cost_per_item * 2
                                            );
                                        }
                                    }}
                                    disabled={!data.cost_per_item}
                                >
                                    Set 2x Cost Price
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => {
                                        if (data.base_price > 0) {
                                            handlePriceChange(
                                                "compare_price",
                                                data.base_price * 1.3
                                            );
                                        }
                                    }}
                                    disabled={!data.base_price}
                                >
                                    Add 30% Compare Price
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-info btn-sm"
                                    onClick={() => {
                                        if (data.base_price > 0) {
                                            handlePriceChange(
                                                "agent_price",
                                                data.base_price * 0.8
                                            );
                                        }
                                    }}
                                    disabled={!data.base_price}
                                >
                                    Set 20% Agent Discount
                                </button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Validation Alert */}
            {data.cost_per_item > data.base_price && (
                <Alert variant="warning" className="mt-4">
                    <Alert.Heading className="h6">
                        <InfoCircle className="me-2" />
                        Pricing Warning
                    </Alert.Heading>
                    Your base price is lower than your cost. This will result in
                    a loss on each sale.
                </Alert>
            )}
        </div>
    );
}
