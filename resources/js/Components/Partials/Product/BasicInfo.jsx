import { useState, useCallback, useEffect } from "react";
import { Card, Col, Form, Row, Alert, Badge } from "react-bootstrap";
import Select from "react-select";
import RichTextEditor from "@/Components/Settings/RichTextEditor";
import { BiInfoCircle } from "react-icons/bi";

export default function BasicInfoTab({
    data,
    updateFormData,
    updateArrayField,
    errors,
    categories = [],
    brands = [],
}) {
    const [slugEditable, setSlugEditable] = useState(false);
    const [characterCount, setCharacterCount] = useState({
        name: 0,
        short_description: 0,
        description: 0,
    });

    // Update character counts
    useEffect(() => {
        setCharacterCount({
            name: data.name?.length || 0,
            short_description: data.short_description?.length || 0,
            description: data.description
                ? data.description.replace(/<[^>]*>/g, "").length
                : 0,
        });
    }, [data.name, data.short_description, data.description]);

    // Handle input changes
    const handleInputChange = useCallback(
        (field, value) => {
            updateFormData(field, value);
        },
        [updateFormData]
    );

    // Handle select changes
    const handleSelectChange = useCallback(
        (field, selectedOption) => {
            updateFormData(field, selectedOption?.value || "");
        },
        [updateFormData]
    );

    // Handle array field changes (for sizes, colors, materials)
    const handleArrayFieldChange = useCallback(
        (field, value) => {
            const values = value
                .split(",")
                .map((v) => v.trim())
                .filter((v) => v);
            updateArrayField(field, values);
        },
        [updateArrayField]
    );

    // Handle rich text changes
    const handleRichTextChange = useCallback(
        (field, value) => {
            updateFormData(field, value);
        },
        [updateFormData]
    );

    // Toggle slug editability
    const toggleSlugEdit = useCallback(() => {
        setSlugEditable(!slugEditable);
    }, [slugEditable]);

    // Format options for react-select
    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
        ...(cat.parent_id && { className: "text-muted ps-3" }),
    }));

    const brandOptions = brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
    }));

    const productTypeOptions = [
        { value: "physical", label: "Physical Product", icon: "bi-box" },
        { value: "digital", label: "Digital Product", icon: "bi-file-earmark" },
        { value: "service", label: "Service", icon: "bi-tools" },
    ];

    // Find selected options
    const selectedCategory = categoryOptions.find(
        (opt) => opt.value === data.category_id
    );
    const selectedBrand = brandOptions.find(
        (opt) => opt.value === data.brand_id
    );
    const selectedProductType = productTypeOptions.find(
        (opt) => opt.value === data.product_type
    );

    return (
        <div className="basic-info-tab">
            {/* Header with Summary */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">
                        <BiInfoCircle className="me-2" />
                        Basic Information
                    </h4>
                    <p className="text-muted mb-0">
                        Provide the fundamental details about your product
                    </p>
                </div>
                <div className="text-end">
                    <Badge bg="light" text="dark" className="fs-6">
                        {selectedProductType?.label || "Physical Product"}
                    </Badge>
                </div>
            </div>

            <Row className="g-4">
                {/* Left Column - Core Information */}
                <Col lg={8}>
                    {/* Product Name & Slug */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-light py-3">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-tag me-2"></i>
                                Product Identification
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Row className="g-3">
                                {/* Product Name */}
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Product Name *
                                            {characterCount.name > 0 && (
                                                <span
                                                    className={`ms-2 fs-7 ${
                                                        characterCount.name >
                                                        100
                                                            ? "text-warning"
                                                            : "text-muted"
                                                    }`}
                                                >
                                                    ({characterCount.name}/100)
                                                </span>
                                            )}
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={data.name || ""}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            isInvalid={!!errors.name}
                                            placeholder="Enter product name (e.g., 'Premium Wireless Headphones')"
                                            className="py-3 border-0 border-bottom rounded-0"
                                            maxLength={100}
                                            style={{
                                                fontSize: "1.1rem",
                                                fontWeight: "500",
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.name}
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            A clear, descriptive name helps
                                            customers find your product
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Product Description */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-light py-3">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-text-paragraph me-2"></i>
                                Product Description
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {/* Short Description */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">
                                    Short Description
                                    <span className="text-muted fw-normal">
                                        {" "}
                                        (Max 255 characters)
                                    </span>
                                    {characterCount.short_description > 0 && (
                                        <span
                                            className={`ms-2 fs-7 ${
                                                characterCount.short_description >
                                                200
                                                    ? "text-warning"
                                                    : "text-muted"
                                            }`}
                                        >
                                            ({characterCount.short_description}
                                            /255)
                                        </span>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={data.short_description || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "short_description",
                                            e.target.value
                                        )
                                    }
                                    isInvalid={!!errors.short_description}
                                    placeholder="Brief description that appears in product listings and search results..."
                                    maxLength={255}
                                    className="py-2"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.short_description}
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* Full Description */}
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    Full Description *
                                    {characterCount.description > 0 && (
                                        <span className="ms-2 fs-7 text-muted">
                                            ({characterCount.description}{" "}
                                            characters)
                                        </span>
                                    )}
                                </Form.Label>
                                <RichTextEditor
                                    value={data.description || ""}
                                    onChange={(value) =>
                                        handleRichTextChange(
                                            "description",
                                            value
                                        )
                                    }
                                    placeholder="Provide detailed information about your product, including features, specifications, and benefits..."
                                    height="300px"
                                    className={
                                        errors.description
                                            ? "border border-danger rounded"
                                            : ""
                                    }
                                />
                                {errors.description && (
                                    <div className="text-danger small mt-1">
                                        {errors.description}
                                    </div>
                                )}
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - Classification & Variations */}
                <Col lg={4}>
                    {/* Product Classification */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-light py-3">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-diagram-3 me-2"></i>
                                Classification
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                            {/* Product Type */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">
                                    Product Type *
                                </Form.Label>
                                <Select
                                    options={productTypeOptions}
                                    value={selectedProductType}
                                    onChange={(option) =>
                                        handleSelectChange(
                                            "product_type",
                                            option
                                        )
                                    }
                                    isInvalid={!!errors.product_type}
                                    placeholder="Select product type..."
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderColor: errors.product_type
                                                ? "#dc3545"
                                                : base.borderColor,
                                            minHeight: "44px",
                                        }),
                                    }}
                                />
                                {errors.product_type && (
                                    <div className="text-danger small mt-1">
                                        {errors.product_type}
                                    </div>
                                )}
                                <Form.Text className="text-muted">
                                    Determines shipping and inventory
                                    requirements
                                </Form.Text>
                            </Form.Group>

                            {/* Category */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">
                                    Category *
                                </Form.Label>
                                <Select
                                    options={categoryOptions}
                                    value={selectedCategory}
                                    onChange={(option) =>
                                        handleSelectChange(
                                            "category_id",
                                            option
                                        )
                                    }
                                    isInvalid={!!errors.category_id}
                                    placeholder="Select category..."
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderColor: errors.category_id
                                                ? "#dc3545"
                                                : base.borderColor,
                                            minHeight: "44px",
                                        }),
                                    }}
                                />
                                {errors.category_id && (
                                    <div className="text-danger small mt-1">
                                        {errors.category_id}
                                    </div>
                                )}
                            </Form.Group>

                            {/* Brand */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">
                                    Brand
                                </Form.Label>
                                <Select
                                    options={brandOptions}
                                    value={selectedBrand}
                                    onChange={(option) =>
                                        handleSelectChange("brand_id", option)
                                    }
                                    isInvalid={!!errors.brand_id}
                                    placeholder="Select brand..."
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderColor: errors.brand_id
                                                ? "#dc3545"
                                                : base.borderColor,
                                            minHeight: "44px",
                                        }),
                                    }}
                                />
                                {errors.brand_id && (
                                    <div className="text-danger small mt-1">
                                        {errors.brand_id}
                                    </div>
                                )}
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* Product Variations */}
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light py-3">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-list-check me-2"></i>
                                Variations
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                            <Alert variant="info" className="small py-2 mb-3">
                                <i className="bi bi-info-circle me-1"></i>
                                Define available options for this product
                            </Alert>

                            {/* Sizes */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small">
                                    Sizes
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={
                                        Array.isArray(data.sizes)
                                            ? data.sizes.join(", ")
                                            : ""
                                    }
                                    onChange={(e) =>
                                        handleArrayFieldChange(
                                            "sizes",
                                            e.target.value
                                        )
                                    }
                                    placeholder="S, M, L, XL"
                                    className="py-2 small"
                                />
                                <Form.Text className="text-muted">
                                    Separate sizes with commas
                                </Form.Text>
                            </Form.Group>

                            {/* Colors */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small">
                                    Colors
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={
                                        Array.isArray(data.colors)
                                            ? data.colors.join(", ")
                                            : ""
                                    }
                                    onChange={(e) =>
                                        handleArrayFieldChange(
                                            "colors",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Red, Blue, Green, Black"
                                    className="py-2 small"
                                />
                                <Form.Text className="text-muted">
                                    Separate colors with commas
                                </Form.Text>
                            </Form.Group>

                            {/* Materials */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small">
                                    Materials
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={
                                        Array.isArray(data.materials)
                                            ? data.materials.join(", ")
                                            : ""
                                    }
                                    onChange={(e) =>
                                        handleArrayFieldChange(
                                            "materials",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Cotton, Polyester, Wool"
                                    className="py-2 small"
                                />
                                <Form.Text className="text-muted">
                                    Separate materials with commas
                                </Form.Text>
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* Content Summary */}
                    <Card className="border-0 shadow-sm mt-4">
                        <Card.Header className="bg-light py-3">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-graph-up me-2"></i>
                                Content Summary
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                            <div className="space-y-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small text-muted">
                                        Name Length:
                                    </span>
                                    <Badge
                                        bg={
                                            characterCount.name === 0
                                                ? "secondary"
                                                : characterCount.name > 80
                                                ? "warning"
                                                : "success"
                                        }
                                        className="fs-7"
                                    >
                                        {characterCount.name}/100
                                    </Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small text-muted">
                                        Short Description:
                                    </span>
                                    <Badge
                                        bg={
                                            characterCount.short_description ===
                                            0
                                                ? "secondary"
                                                : characterCount.short_description >
                                                  200
                                                ? "warning"
                                                : "success"
                                        }
                                        className="fs-7"
                                    >
                                        {characterCount.short_description}/255
                                    </Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small text-muted">
                                        Description:
                                    </span>
                                    <Badge
                                        bg={
                                            characterCount.description === 0
                                                ? "danger"
                                                : characterCount.description <
                                                  50
                                                ? "warning"
                                                : "success"
                                        }
                                        className="fs-7"
                                    >
                                        {characterCount.description} chars
                                    </Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small text-muted">
                                        Category:
                                    </span>
                                    <Badge
                                        bg={
                                            data.category_id
                                                ? "success"
                                                : "danger"
                                        }
                                        className="fs-7"
                                    >
                                        {data.category_id
                                            ? "Selected"
                                            : "Required"}
                                    </Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small text-muted">
                                        Product Type:
                                    </span>
                                    <Badge bg="info" className="fs-7">
                                        {selectedProductType?.label ||
                                            "Physical"}
                                    </Badge>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Required Fields Note */}
            <Alert variant="light" className="mt-4 border">
                <div className="d-flex align-items-center">
                    <i className="bi bi-asterisk text-primary me-2"></i>
                    <small className="text-muted">
                        Fields marked with * are required. Ensure all required
                        information is provided before proceeding.
                    </small>
                </div>
            </Alert>
        </div>
    );
}

// Helper component for the edit button
const Button = ({ variant, size, className, onClick, children }) => (
    <button
        type="button"
        className={`btn btn-${variant} btn-${size} ${className}`}
        onClick={onClick}
    >
        {children}
    </button>
);
