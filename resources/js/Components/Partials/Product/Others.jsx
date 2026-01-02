import { useState, useCallback, useEffect, useMemo } from "react";
import {
    Card,
    Col,
    Form,
    Row,
    Badge,
    Alert,
    Button,
    InputGroup,
    Accordion,
} from "react-bootstrap";
import {
    Gear,
    GraphUp,
    Search,
    Tag,
    Globe,
    Truck,
    Box,
    Calendar,
    InfoCircle,
    ShieldCheck,
    Lightning,
    Star,
    Eye,
    Link45deg,
} from "react-bootstrap-icons";
import Select from "react-select";

export default function OthersTab({ formik }) {
    const [activeAccordion, setActiveAccordion] = useState("0");
    const [metadata, setMetadata] = useState(formik.values.metadata || {});

    // Initialize metadata
    useEffect(() => {
        if (formik.values.metadata) {
            setMetadata(formik.values.metadata);
        }
    }, [formik.values.metadata]);

    // Update formik when metadata changes
    useEffect(() => {
        formik.setFieldValue("metadata", metadata);
    }, [metadata]);

    // Handle input changes
    const handleInputChange = useCallback(
        (field, value) => {
            formik.setFieldValue(field, value);
        },
        [formik]
    );

    // Handle switch toggles
    const handleSwitchChange = useCallback(
        (field, value) => {
            formik.setFieldValue(field, value);
        },
        [formik]
    );

    // Handle date changes
    const handleDateChange = useCallback(
        (field, value) => {
            formik.setFieldValue(field, value || "");
        },
        [formik]
    );

    // Handle metadata changes
    const handleMetadataChange = useCallback((key, value) => {
        setMetadata((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    // Add new metadata field
    const addMetadataField = useCallback(() => {
        const newKey = `custom_field_${Object.keys(metadata).length + 1}`;
        handleMetadataChange(newKey, "");
    }, [metadata, handleMetadataChange]);

    // Remove metadata field
    const removeMetadataField = useCallback((key) => {
        setMetadata((prev) => {
            const newMetadata = { ...prev };
            delete newMetadata[key];
            return newMetadata;
        });
    }, []);

    // Calculate product age for "New" status
    const isProductNew = useMemo(() => {
        if (!formik.values.is_new) return false;
        if (!formik.values.new_until) return true;

        const newUntil = new Date(formik.values.new_until);
        const today = new Date();
        return newUntil >= today;
    }, [formik.values.is_new, formik.values.new_until]);

    // Product status summary
    const statusSummary = useMemo(() => {
        const statuses = [];

        if (formik.values.is_active)
            statuses.push({
                label: "Active",
                color: "success",
                icon: ShieldCheck,
            });
        if (formik.values.is_featured)
            statuses.push({ label: "Featured", color: "primary", icon: Star });
        if (formik.values.is_bestseller)
            statuses.push({
                label: "Bestseller",
                color: "warning",
                icon: GraphUp,
            });
        if (isProductNew)
            statuses.push({ label: "New", color: "info", icon: Lightning });
        if (formik.values.stock_status === "out_of_stock")
            statuses.push({
                label: "Out of Stock",
                color: "danger",
                icon: Box,
            });

        return statuses.length > 0
            ? statuses
            : [{ label: "Inactive", color: "secondary", icon: Eye }];
    }, [
        formik.values.is_active,
        formik.values.is_featured,
        formik.values.is_bestseller,
        isProductNew,
        formik.values.stock_status,
    ]);

    // Shipping requirements based on product type
    const shippingConfig = useMemo(() => {
        if (formik.values.is_digital) {
            return {
                requiresShipping: false,
                message: "Digital products do not require shipping",
                variant: "info",
            };
        }

        if (!formik.values.requires_shipping) {
            return {
                requiresShipping: false,
                message: "Shipping is disabled for this product",
                variant: "warning",
            };
        }

        return {
            requiresShipping: true,
            message: "Shipping is required for this product",
            variant: "success",
        };
    }, [formik.values.is_digital, formik.values.requires_shipping]);

    return (
        <div className="others-tab">
            {/* Header with Status Summary */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">
                        <Gear className="me-2" />
                        Additional Information & Settings
                    </h4>
                    <p className="text-muted mb-0">
                        Configure product status, SEO, shipping, and custom
                        metadata
                    </p>
                </div>
                <div className="d-flex gap-2">
                    {statusSummary.map((status, index) => {
                        const StatusIcon = status.icon;
                        return (
                            <Badge
                                key={index}
                                bg={status.color}
                                className="d-flex align-items-center gap-1 fs-6"
                            >
                                <StatusIcon size={14} />
                                {status.label}
                            </Badge>
                        );
                    })}
                </div>
            </div>

            <Accordion
                activeKey={activeAccordion}
                onSelect={setActiveAccordion}
            >
                {/* Product Status & Flags */}
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        <div className="d-flex align-items-center">
                            <ShieldCheck className="me-2 text-primary" />
                            <span className="fw-semibold">
                                Product Status & Flags
                            </span>
                        </div>
                    </Accordion.Header>
                    <Accordion.Body>
                        <Row className="g-4">
                            {/* Status Switches */}
                            <Col md={6}>
                                <Card className="border-0 bg-light">
                                    <Card.Header className="bg-transparent py-3">
                                        <h6 className="mb-0 fw-semibold">
                                            Product Flags
                                        </h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="space-y-3">
                                            {/* Active Status */}
                                            <Form.Check
                                                type="switch"
                                                id="is_active"
                                                label={
                                                    <div className="d-flex justify-content-between align-items-center w-100">
                                                        <span className="fw-semibold">
                                                            Active Product
                                                        </span>
                                                        <Badge
                                                            bg={
                                                                formik.values
                                                                    .is_active
                                                                    ? "success"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            {formik.values
                                                                .is_active
                                                                ? "Live"
                                                                : "Hidden"}
                                                        </Badge>
                                                    </div>
                                                }
                                                checked={
                                                    formik.values.is_active
                                                }
                                                onChange={(e) =>
                                                    handleSwitchChange(
                                                        "is_active",
                                                        e.target.checked
                                                    )
                                                }
                                                className="fs-6"
                                            />
                                            <Form.Text className="text-muted">
                                                When active, product is visible
                                                to customers
                                            </Form.Text>

                                            {/* Featured Status */}
                                            <Form.Check
                                                type="switch"
                                                id="is_featured"
                                                label={
                                                    <div className="d-flex justify-content-between align-items-center w-100">
                                                        <span className="fw-semibold">
                                                            Featured Product
                                                        </span>
                                                        <Badge
                                                            bg={
                                                                formik.values
                                                                    .is_featured
                                                                    ? "primary"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            {formik.values
                                                                .is_featured
                                                                ? "Featured"
                                                                : "Standard"}
                                                        </Badge>
                                                    </div>
                                                }
                                                checked={
                                                    formik.values.is_featured
                                                }
                                                onChange={(e) =>
                                                    handleSwitchChange(
                                                        "is_featured",
                                                        e.target.checked
                                                    )
                                                }
                                                className="fs-6"
                                            />
                                            <Form.Text className="text-muted">
                                                Highlight this product in
                                                featured sections
                                            </Form.Text>

                                            {/* Bestseller Status */}
                                            <Form.Check
                                                type="switch"
                                                id="is_bestseller"
                                                label={
                                                    <div className="d-flex justify-content-between align-items-center w-100">
                                                        <span className="fw-semibold">
                                                            Bestseller
                                                        </span>
                                                        <Badge
                                                            bg={
                                                                formik.values
                                                                    .is_bestseller
                                                                    ? "warning"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            {formik.values
                                                                .is_bestseller
                                                                ? "Bestseller"
                                                                : "Regular"}
                                                        </Badge>
                                                    </div>
                                                }
                                                checked={
                                                    formik.values.is_bestseller
                                                }
                                                onChange={(e) =>
                                                    handleSwitchChange(
                                                        "is_bestseller",
                                                        e.target.checked
                                                    )
                                                }
                                                className="fs-6"
                                            />
                                            <Form.Text className="text-muted">
                                                Mark as bestseller for
                                                promotional displays
                                            </Form.Text>

                                            {/* New Product Status */}
                                            <Form.Check
                                                type="switch"
                                                id="is_new"
                                                label={
                                                    <div className="d-flex justify-content-between align-items-center w-100">
                                                        <span className="fw-semibold">
                                                            New Product
                                                        </span>
                                                        <Badge
                                                            bg={
                                                                isProductNew
                                                                    ? "info"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            {isProductNew
                                                                ? "New"
                                                                : "Regular"}
                                                        </Badge>
                                                    </div>
                                                }
                                                checked={formik.values.is_new}
                                                onChange={(e) =>
                                                    handleSwitchChange(
                                                        "is_new",
                                                        e.target.checked
                                                    )
                                                }
                                                className="fs-6"
                                            />
                                            <Form.Text className="text-muted">
                                                Show as new product with special
                                                labeling
                                            </Form.Text>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* New Until Date & Digital Product */}
                            <Col md={6}>
                                <Card className="border-0 bg-light">
                                    <Card.Header className="bg-transparent py-3">
                                        <h6 className="mb-0 fw-semibold">
                                            Product Configuration
                                        </h6>
                                    </Card.Header>
                                    <Card.Body>
                                        {/* New Until Date */}
                                        {formik.values.is_new && (
                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-semibold">
                                                    <Calendar className="me-2" />
                                                    Mark as New Until
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={
                                                        formik.values
                                                            .new_until || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleDateChange(
                                                            "new_until",
                                                            e.target.value
                                                        )
                                                    }
                                                    min={
                                                        new Date()
                                                            .toISOString()
                                                            .split("T")[0]
                                                    }
                                                />
                                                <Form.Text className="text-muted">
                                                    Product will show as "New"
                                                    until this date
                                                    {formik.values
                                                        .new_until && (
                                                        <span className="ms-1">
                                                            (
                                                            {Math.ceil(
                                                                (new Date(
                                                                    formik.values.new_until
                                                                ) -
                                                                    new Date()) /
                                                                    (1000 *
                                                                        60 *
                                                                        60 *
                                                                        24)
                                                            )}{" "}
                                                            days remaining)
                                                        </span>
                                                    )}
                                                </Form.Text>
                                            </Form.Group>
                                        )}

                                        {/* Digital Product */}
                                        <Form.Check
                                            type="switch"
                                            id="is_digital"
                                            label={
                                                <div className="d-flex justify-content-between align-items-center w-100">
                                                    <span className="fw-semibold">
                                                        Digital Product
                                                    </span>
                                                    <Badge
                                                        bg={
                                                            formik.values
                                                                .is_digital
                                                                ? "info"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {formik.values
                                                            .is_digital
                                                            ? "Digital"
                                                            : "Physical"}
                                                    </Badge>
                                                </div>
                                            }
                                            checked={formik.values.is_digital}
                                            onChange={(e) =>
                                                handleSwitchChange(
                                                    "is_digital",
                                                    e.target.checked
                                                )
                                            }
                                            className="fs-6 mb-3"
                                        />
                                        <Form.Text className="text-muted">
                                            Digital products don't require
                                            shipping or physical inventory
                                        </Form.Text>

                                        {/* Shipping Requirement */}
                                        {!formik.values.is_digital && (
                                            <Form.Check
                                                type="switch"
                                                id="requires_shipping"
                                                label={
                                                    <div className="d-flex justify-content-between align-items-center w-100">
                                                        <span className="fw-semibold">
                                                            Requires Shipping
                                                        </span>
                                                        <Badge
                                                            bg={
                                                                formik.values
                                                                    .requires_shipping
                                                                    ? "success"
                                                                    : "warning"
                                                            }
                                                        >
                                                            {formik.values
                                                                .requires_shipping
                                                                ? "Yes"
                                                                : "No"}
                                                        </Badge>
                                                    </div>
                                                }
                                                checked={
                                                    formik.values
                                                        .requires_shipping
                                                }
                                                onChange={(e) =>
                                                    handleSwitchChange(
                                                        "requires_shipping",
                                                        e.target.checked
                                                    )
                                                }
                                                className="fs-6 mt-3"
                                            />
                                        )}

                                        {/* Shipping Alert */}
                                        <Alert
                                            variant={shippingConfig.variant}
                                            className="mt-3 small py-2"
                                        >
                                            <Truck className="me-2" />
                                            {shippingConfig.message}
                                        </Alert>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Accordion.Body>
                </Accordion.Item>

                {/* SEO Configuration */}
                <Accordion.Item eventKey="1">
                    <Accordion.Header>
                        <div className="d-flex align-items-center">
                            <Globe className="me-2 text-success" />
                            <span className="fw-semibold">
                                SEO Configuration
                            </span>
                        </div>
                    </Accordion.Header>
                    <Accordion.Body>
                        <Row className="g-3">
                            <Col md={12}>
                                <Alert variant="info" className="small">
                                    <InfoCircle className="me-2" />
                                    Optimize your product for search engines.
                                    These fields help improve visibility in
                                    search results.
                                </Alert>
                            </Col>

                            {/* Meta Title */}
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">
                                        Meta Title
                                        <span className="text-muted fw-normal">
                                            {" "}
                                            (Recommended: 50-60 characters)
                                        </span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="meta_title"
                                        value={formik.values.meta_title || ""}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.meta_title &&
                                            !!formik.errors.meta_title
                                        }
                                        placeholder="Optimized title for search engines..."
                                        maxLength={60}
                                        className="py-2"
                                    />
                                    <div className="d-flex justify-content-between mt-1">
                                        <Form.Text className="text-muted">
                                            {formik.values.meta_title?.length ||
                                                0}
                                            /60 characters
                                        </Form.Text>
                                        {formik.touched.meta_title &&
                                            formik.errors.meta_title && (
                                                <Form.Control.Feedback
                                                    type="invalid"
                                                    className="d-block"
                                                >
                                                    {formik.errors.meta_title}
                                                </Form.Control.Feedback>
                                            )}
                                    </div>
                                </Form.Group>
                            </Col>

                            {/* Meta Description */}
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">
                                        Meta Description
                                        <span className="text-muted fw-normal">
                                            {" "}
                                            (Recommended: 150-160 characters)
                                        </span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="meta_description"
                                        value={
                                            formik.values.meta_description || ""
                                        }
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.meta_description &&
                                            !!formik.errors.meta_description
                                        }
                                        placeholder="Compelling description that appears in search results..."
                                        maxLength={160}
                                        className="py-2"
                                    />
                                    <div className="d-flex justify-content-between mt-1">
                                        <Form.Text className="text-muted">
                                            {formik.values.meta_description
                                                ?.length || 0}
                                            /160 characters
                                        </Form.Text>
                                        {formik.touched.meta_description &&
                                            formik.errors.meta_description && (
                                                <Form.Control.Feedback
                                                    type="invalid"
                                                    className="d-block"
                                                >
                                                    {
                                                        formik.errors
                                                            .meta_description
                                                    }
                                                </Form.Control.Feedback>
                                            )}
                                    </div>
                                </Form.Group>
                            </Col>

                            {/* SEO Preview */}
                            <Col md={12}>
                                <Card className="border-0 bg-light">
                                    <Card.Header className="bg-transparent py-2">
                                        <h6 className="mb-0 fw-semibold">
                                            Search Result Preview
                                        </h6>
                                    </Card.Header>
                                    <Card.Body className="p-3">
                                        <div className="bg-white border rounded p-3">
                                            <div
                                                className="text-primary mb-1"
                                                style={{ fontSize: "18px" }}
                                            >
                                                {formik.values.meta_title ||
                                                    formik.values.name ||
                                                    "Product Title"}
                                            </div>
                                            <div
                                                className="text-success mb-1"
                                                style={{ fontSize: "14px" }}
                                            >
                                                https://yourstore.com/products/
                                                {formik.values.slug ||
                                                    "product-slug"}
                                            </div>
                                            <div
                                                className="text-muted"
                                                style={{ fontSize: "14px" }}
                                            >
                                                {formik.values
                                                    .meta_description ||
                                                    formik.values
                                                        .short_description ||
                                                    "Product description will appear here in search results..."}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Accordion.Body>
                </Accordion.Item>

                {/* Shipping & Physical Properties */}
                <Accordion.Item eventKey="2">
                    <Accordion.Header>
                        <div className="d-flex align-items-center">
                            <Truck className="me-2 text-warning" />
                            <span className="fw-semibold">
                                Shipping & Physical Properties
                            </span>
                        </div>
                    </Accordion.Header>
                    <Accordion.Body>
                        {formik.values.is_digital ? (
                            <Alert variant="info" className="text-center py-4">
                                <Box size={32} className="mb-2" />
                                <h5>Digital Product</h5>
                                <p className="mb-0">
                                    Shipping information is not required for
                                    digital products.
                                </p>
                            </Alert>
                        ) : (
                            <Row className="g-3">
                                <Col md={12}>
                                    <Alert variant="info" className="small">
                                        <InfoCircle className="me-2" />
                                        These dimensions and weight are used for
                                        shipping calculations and warehouse
                                        planning.
                                    </Alert>
                                </Col>

                                {/* Weight */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Weight (kg)
                                        </Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="number"
                                                name="weight"
                                                step="0.01"
                                                min="0"
                                                value={
                                                    formik.values.weight || 0
                                                }
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                isInvalid={
                                                    formik.touched.weight &&
                                                    !!formik.errors.weight
                                                }
                                                placeholder="0.00"
                                                className="py-2"
                                            />
                                            <InputGroup.Text>
                                                kg
                                            </InputGroup.Text>
                                        </InputGroup>
                                        {formik.touched.weight &&
                                            formik.errors.weight && (
                                                <Form.Control.Feedback type="invalid">
                                                    {formik.errors.weight}
                                                </Form.Control.Feedback>
                                            )}
                                    </Form.Group>
                                </Col>

                                {/* Dimensions */}
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Length (cm)
                                        </Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="number"
                                                name="length"
                                                step="0.01"
                                                min="0"
                                                value={
                                                    formik.values.length || 0
                                                }
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="0.00"
                                                className="py-2"
                                            />
                                            <InputGroup.Text>
                                                cm
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Width (cm)
                                        </Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="number"
                                                name="width"
                                                step="0.01"
                                                min="0"
                                                value={formik.values.width || 0}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="0.00"
                                                className="py-2"
                                            />
                                            <InputGroup.Text>
                                                cm
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Height (cm)
                                        </Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="number"
                                                name="height"
                                                step="0.01"
                                                min="0"
                                                value={
                                                    formik.values.height || 0
                                                }
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="0.00"
                                                className="py-2"
                                            />
                                            <InputGroup.Text>
                                                cm
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                {/* Volume Calculation */}
                                <Col md={12}>
                                    <Card className="border-0 bg-light">
                                        <Card.Body className="py-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    Calculated Volume:
                                                </small>
                                                <Badge
                                                    bg="outline-dark"
                                                    text="dark"
                                                >
                                                    {(
                                                        (formik.values.length *
                                                            formik.values
                                                                .width *
                                                            formik.values
                                                                .height) /
                                                        1000000
                                                    ).toFixed(4)}{" "}
                                                    m³
                                                </Badge>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                    </Accordion.Body>
                </Accordion.Item>

                {/* Custom Metadata */}
                <Accordion.Item eventKey="3">
                    <Accordion.Header>
                        <div className="d-flex align-items-center">
                            <Tag className="me-2 text-info" />
                            <span className="fw-semibold">
                                Custom Metadata & Fields
                            </span>
                        </div>
                    </Accordion.Header>
                    <Accordion.Body>
                        <Row className="g-3">
                            <Col md={12}>
                                <Alert variant="info" className="small">
                                    <InfoCircle className="me-2" />
                                    Add custom fields for additional product
                                    information, specifications, or integration
                                    data.
                                </Alert>
                            </Col>

                            {/* Metadata Fields */}
                            <Col md={12}>
                                <div className="space-y-3">
                                    {Object.entries(metadata).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="d-flex gap-2 align-items-start"
                                            >
                                                <Form.Group className="flex-grow-1">
                                                    <InputGroup>
                                                        <Form.Control
                                                            placeholder="Field name"
                                                            value={key}
                                                            onChange={(e) => {
                                                                const newKey =
                                                                    e.target
                                                                        .value;
                                                                if (
                                                                    newKey !==
                                                                    key
                                                                ) {
                                                                    const newMetadata =
                                                                        {
                                                                            ...metadata,
                                                                        };
                                                                    newMetadata[
                                                                        newKey
                                                                    ] = value;
                                                                    delete newMetadata[
                                                                        key
                                                                    ];
                                                                    setMetadata(
                                                                        newMetadata
                                                                    );
                                                                }
                                                            }}
                                                            className="py-2"
                                                        />
                                                        <Form.Control
                                                            placeholder="Field value"
                                                            value={value}
                                                            onChange={(e) =>
                                                                handleMetadataChange(
                                                                    key,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="py-2"
                                                        />
                                                        <Button
                                                            variant="outline-danger"
                                                            onClick={() =>
                                                                removeMetadataField(
                                                                    key
                                                                )
                                                            }
                                                        >
                                                            <Trash size={14} />
                                                        </Button>
                                                    </InputGroup>
                                                </Form.Group>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Add Metadata Field Button */}
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={addMetadataField}
                                    className="mt-3"
                                >
                                    <Plus className="me-1" />
                                    Add Custom Field
                                </Button>

                                {/* Metadata Summary */}
                                {Object.keys(metadata).length > 0 && (
                                    <Card className="border-0 bg-light mt-3">
                                        <Card.Body className="py-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    {
                                                        Object.keys(metadata)
                                                            .length
                                                    }{" "}
                                                    custom field(s) defined
                                                </small>
                                                <Badge
                                                    bg="outline-info"
                                                    text="dark"
                                                >
                                                    {
                                                        JSON.stringify(metadata)
                                                            .length
                                                    }{" "}
                                                    bytes
                                                </Badge>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                )}
                            </Col>
                        </Row>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            {/* Summary Card */}
            <Card className="border-0 shadow-sm mt-4">
                <Card.Header className="bg-light py-3">
                    <h6 className="mb-0 fw-semibold">
                        Product Configuration Summary
                    </h6>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={3}>
                            <div className="text-center">
                                <div className="h5 mb-1 text-dark">
                                    {statusSummary.length}
                                </div>
                                <small className="text-muted">
                                    Active Statuses
                                </small>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="text-center">
                                <div className="h5 mb-1 text-dark">
                                    {formik.values.is_digital
                                        ? "Digital"
                                        : "Physical"}
                                </div>
                                <small className="text-muted">
                                    Product Type
                                </small>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="text-center">
                                <div className="h5 mb-1 text-dark">
                                    {formik.values.meta_title
                                        ? "Optimized"
                                        : "Basic"}
                                </div>
                                <small className="text-muted">SEO Status</small>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="text-center">
                                <div className="h5 mb-1 text-dark">
                                    {Object.keys(metadata).length}
                                </div>
                                <small className="text-muted">
                                    Custom Fields
                                </small>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}

// Helper component for the plus icon
const Plus = ({ className, size = 14 }) => (
    <svg
        width={size}
        height={size}
        fill="currentColor"
        viewBox="0 0 16 16"
        className={className}
    >
        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
    </svg>
);

// Helper component for the trash icon
const Trash = ({ className, size = 14 }) => (
    <svg
        width={size}
        height={size}
        fill="currentColor"
        viewBox="0 0 16 16"
        className={className}
    >
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
        <path
            fillRule="evenodd"
            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
        />
    </svg>
);
