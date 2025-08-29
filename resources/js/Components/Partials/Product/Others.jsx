import React from "react";
import { Card, Row, Col, Form } from "react-bootstrap";
import Select from "react-select";
import { createFormHandlers } from "@/Utils/helpers";

const OthersTab = ({
    data,
    setData,
    errors,
    setErrors,
    selectedTags,
    handleTagChange,
    renderStatusBadge,
}) => {
    const { handleInput, handleSelect } = createFormHandlers(
        setData,
        errors,
        setErrors
    );

    // Status options
    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
    ];

    // Weight unit options
    const weightUnitOptions = [
        { value: "kg", label: "kg" },
        { value: "g", label: "g" },
        { value: "lb", label: "lb" },
        { value: "oz", label: "oz" },
    ];

    // Dimension unit options
    const dimensionUnitOptions = [
        { value: "cm", label: "cm" },
        { value: "m", label: "m" },
        { value: "in", label: "in" },
        { value: "ft", label: "ft" },
    ];

    // Get current selected values
    const selectedStatus = statusOptions.find(
        (opt) => opt.value === (data.is_active ? "active" : "inactive")
    );
    const selectedWeightUnit =
        weightUnitOptions.find((opt) => opt.value === data.weight_unit) ||
        weightUnitOptions[0];
    const selectedDimensionUnit =
        dimensionUnitOptions.find((opt) => opt.value === data.dimension_unit) ||
        dimensionUnitOptions[0];

    return (
        <Card className="border-0 rounded-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center py-3">
                <h6 className="mb-0 fw-semibold text-capitalize">
                    Additional Information
                </h6>
            </Card.Header>

            <Card.Body className="p-4">
                <Row className="g-3">
                    {/* Publish Section */}
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                                <h6 className="mb-0 fw-semibold">
                                    Publish Settings
                                </h6>
                                <div>{renderStatusBadge()}</div>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Status
                                    </Form.Label>
                                    <Select
                                        options={statusOptions}
                                        value={selectedStatus}
                                        onChange={(selected) =>
                                            setData(
                                                "is_active",
                                                selected.value === "active"
                                            )
                                        }
                                        isInvalid={!!errors.is_active}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: errors.is_active
                                                    ? "#dc3545"
                                                    : base.borderColor,
                                                minHeight: "44px",
                                            }),
                                        }}
                                    />
                                    {errors.is_active && (
                                        <div className="text-danger small mt-1">
                                            {errors.is_active}
                                        </div>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id="isFeatured"
                                        name="is_featured"
                                        label={
                                            <span className="fw-medium">
                                                Featured Product
                                            </span>
                                        }
                                        checked={data.is_featured || false}
                                        onChange={handleInput}
                                        className="fs-6"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id="isBestseller"
                                        name="is_bestseller"
                                        label={
                                            <span className="fw-medium">
                                                Bestseller
                                            </span>
                                        }
                                        checked={data.is_bestseller || false}
                                        onChange={handleInput}
                                        className="fs-6"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id="isNew"
                                        name="is_new"
                                        label={
                                            <span className="fw-medium">
                                                Mark as New
                                            </span>
                                        }
                                        checked={data.is_new || false}
                                        onChange={handleInput}
                                        className="fs-6"
                                    />
                                </Form.Group>

                                {data.is_new && (
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">
                                            New Until Date
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="new_until"
                                            value={data.new_until || ""}
                                            onChange={handleInput}
                                            isInvalid={!!errors.new_until}
                                            className="py-2"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.new_until}
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Date until which the product will be
                                            marked as new
                                        </Form.Text>
                                    </Form.Group>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Product Type Section */}
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Header className="bg-white py-3">
                                <h6 className="mb-0 fw-semibold">
                                    Product Type
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id="isDigital"
                                        name="is_digital"
                                        label={
                                            <span className="fw-medium">
                                                Digital Product
                                            </span>
                                        }
                                        checked={data.is_digital || false}
                                        onChange={handleInput}
                                        className="fs-6"
                                    />
                                    <Form.Text className="text-muted">
                                        Digital products are delivered
                                        electronically
                                    </Form.Text>
                                </Form.Group>

                                {!data.is_digital && (
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="switch"
                                            id="requiresShipping"
                                            name="requires_shipping"
                                            label={
                                                <span className="fw-medium">
                                                    Requires Shipping
                                                </span>
                                            }
                                            checked={
                                                data.requires_shipping || false
                                            }
                                            onChange={handleInput}
                                            className="fs-6"
                                        />
                                        <Form.Text className="text-muted">
                                            Physical products that need to be
                                            shipped
                                        </Form.Text>
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id="hasVariants"
                                        name="has_variants"
                                        label={
                                            <span className="fw-medium">
                                                Product Has Variants
                                            </span>
                                        }
                                        checked={data.has_variants || false}
                                        onChange={handleInput}
                                        className="fs-6"
                                    />
                                    <Form.Text className="text-muted">
                                        Enable if product has different sizes,
                                        colors, etc.
                                    </Form.Text>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Shipping Section */}
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Header className="bg-white py-3">
                                <h6 className="mb-0 fw-semibold">
                                    Shipping Information
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                {!data.is_digital ? (
                                    <>
                                        <div className="mb-3">
                                            <Form.Label className="fw-semibold">
                                                Weight
                                            </Form.Label>
                                            <Row className="g-2 align-items-end">
                                                <Col md={8}>
                                                    <Form.Control
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        name="weight"
                                                        value={data.weight || 0}
                                                        onChange={handleInput}
                                                        isInvalid={
                                                            !!errors.weight
                                                        }
                                                        placeholder="0.00"
                                                        className="py-2"
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.weight}
                                                    </Form.Control.Feedback>
                                                </Col>
                                                <Col md={4}>
                                                    <Select
                                                        options={
                                                            weightUnitOptions
                                                        }
                                                        value={
                                                            selectedWeightUnit
                                                        }
                                                        onChange={(selected) =>
                                                            setData(
                                                                "weight_unit",
                                                                selected.value
                                                            )
                                                        }
                                                        styles={{
                                                            control: (
                                                                base
                                                            ) => ({
                                                                ...base,
                                                                minHeight:
                                                                    "44px",
                                                            }),
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="mb-3">
                                            <Form.Label className="fw-semibold">
                                                Dimensions (L × W × H)
                                            </Form.Label>
                                            <Row className="g-2 mb-2">
                                                <Col md={4}>
                                                    <Form.Control
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        name="length"
                                                        value={data.length || 0}
                                                        onChange={handleInput}
                                                        placeholder="Length"
                                                        className="py-2"
                                                    />
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Control
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        name="width"
                                                        value={data.width || 0}
                                                        onChange={handleInput}
                                                        placeholder="Width"
                                                        className="py-2"
                                                    />
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Control
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        name="height"
                                                        value={data.height || 0}
                                                        onChange={handleInput}
                                                        placeholder="Height"
                                                        className="py-2"
                                                    />
                                                </Col>
                                            </Row>
                                            <Select
                                                options={dimensionUnitOptions}
                                                value={selectedDimensionUnit}
                                                onChange={(selected) =>
                                                    setData(
                                                        "dimension_unit",
                                                        selected.value
                                                    )
                                                }
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minHeight: "44px",
                                                    }),
                                                }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        <i className="bi bi-cloud-download fs-1 d-block mb-2"></i>
                                        <p className="mb-0">
                                            Digital products don't require
                                            shipping information
                                        </p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* SEO Section */}
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Header className="bg-white py-3">
                                <h6 className="mb-0 fw-semibold">
                                    SEO Settings
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Meta Title
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="meta_title"
                                        value={data.meta_title || ""}
                                        onChange={handleInput}
                                        isInvalid={!!errors.meta_title}
                                        placeholder="Enter meta title for SEO"
                                        className="py-2"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.meta_title}
                                    </Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        Recommended: 50-60 characters • Current:{" "}
                                        {data.meta_title?.length || 0}
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Meta Description
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="meta_description"
                                        value={data.meta_description || ""}
                                        onChange={handleInput}
                                        isInvalid={!!errors.meta_description}
                                        placeholder="Enter meta description for SEO"
                                        className="py-2"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.meta_description}
                                    </Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        Recommended: 150-160 characters •
                                        Current:{" "}
                                        {data.meta_description?.length || 0}
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Product Tags
                                    </Form.Label>
                                    <Select
                                        isMulti
                                        value={selectedTags}
                                        onChange={handleTagChange}
                                        options={[]}
                                        placeholder="Type and press enter to add tags..."
                                        noOptionsMessage={() =>
                                            "Type to create new tags"
                                        }
                                        isClearable
                                        isSearchable
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: "44px",
                                                borderColor: errors.tags
                                                    ? "#dc3545"
                                                    : base.borderColor,
                                            }),
                                        }}
                                    />
                                    {errors.tags && (
                                        <div className="text-danger small mt-1">
                                            {errors.tags}
                                        </div>
                                    )}
                                    <Form.Text className="text-muted">
                                        Add tags to help customers find your
                                        product
                                    </Form.Text>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default OthersTab;
