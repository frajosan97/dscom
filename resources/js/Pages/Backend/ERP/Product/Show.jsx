import ErpLayout from "@/Layouts/ErpLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Container,
    Row,
    Col,
    Card,
    Tab,
    Nav,
    Badge,
    Table,
    ProgressBar,
    Button,
    ButtonGroup,
    Image,
    Alert,
    ListGroup,
    Accordion,
} from "react-bootstrap";
import { useState } from "react";
import {
    PencilSquare,
    Trash,
    Image as ImageIcon,
    BoxSeam,
    Truck,
    Tag,
    InfoCircle,
    CashCoin,
    BarChart,
    Gear,
    ListCheck,
    Grid3x3Gap,
    ClipboardData,
} from "react-bootstrap-icons";

export default function ProductShow({ product }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [activeAccordion, setActiveAccordion] = useState("basic-info");

    const renderStatusBadge = () => {
        if (!product.is_active) {
            return <Badge bg="secondary">Inactive</Badge>;
        }

        const badges = [];
        if (product.is_featured)
            badges.push(
                <Badge key="featured" bg="info" className="me-1">
                    Featured
                </Badge>
            );
        if (product.is_bestseller)
            badges.push(
                <Badge key="bestseller" bg="warning" className="me-1">
                    Bestseller
                </Badge>
            );
        if (product.is_new)
            badges.push(
                <Badge key="new" bg="success" className="me-1">
                    New
                </Badge>
            );
        if (product.is_on_sale)
            badges.push(
                <Badge key="sale" bg="danger" className="me-1">
                    Sale
                </Badge>
            );

        return badges.length ? badges : <Badge bg="primary">Active</Badge>;
    };

    const renderStockStatus = () => {
        if (product.stock_status === "out_of_stock") {
            return <Badge bg="danger">Out of Stock</Badge>;
        }
        if (product.stock_status === "low_stock") {
            return <Badge bg="warning">Low Stock</Badge>;
        }
        return <Badge bg="success">In Stock</Badge>;
    };

    const renderPriceInfo = () => {
        return (
            <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Price</span>
                    <strong>${product.price}</strong>
                </ListGroup.Item>
                {product.compare_price > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Compare Price</span>
                        <strong className="text-decoration-line-through text-muted">
                            ${product.compare_price}
                        </strong>
                    </ListGroup.Item>
                )}
                {product.is_on_sale && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Discount</span>
                        <strong className="text-danger">
                            {product.discount_percentage}% OFF
                        </strong>
                    </ListGroup.Item>
                )}
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Agent Price</span>
                    <strong>${product.agent_price}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Wholesaler Price</span>
                    <strong>${product.wholesaler_price}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Cost per Item</span>
                    <strong>${product.cost_per_item}</strong>
                </ListGroup.Item>
                {product.tax_amount > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Tax Amount</span>
                        <strong>${product.tax_amount}</strong>
                    </ListGroup.Item>
                )}
            </ListGroup>
        );
    };

    const renderInventoryInfo = () => {
        return (
            <Table borderless size="sm" className="mb-0">
                <tbody>
                    <tr>
                        <td width="40%">SKU</td>
                        <td>
                            <strong>{product.sku}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td>Barcode</td>
                        <td>
                            <strong>{product.barcode || "N/A"}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td>Quantity</td>
                        <td>
                            <strong>{product.quantity}</strong>
                            {product.low_stock_threshold > 0 && (
                                <ProgressBar
                                    now={product.stock_percentage}
                                    variant={
                                        product.quantity <=
                                        product.low_stock_threshold
                                            ? "warning"
                                            : "success"
                                    }
                                    className="mt-1"
                                    label={`${product.stock_percentage}%`}
                                />
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>Low Stock Threshold</td>
                        <td>
                            <strong>
                                {product.low_stock_threshold || "N/A"}
                            </strong>
                        </td>
                    </tr>
                    <tr>
                        <td>Stock Status</td>
                        <td>{renderStockStatus()}</td>
                    </tr>
                    <tr>
                        <td>Track Inventory</td>
                        <td>
                            <Badge
                                bg={
                                    product.track_inventory
                                        ? "success"
                                        : "secondary"
                                }
                            >
                                {product.track_inventory ? "Yes" : "No"}
                            </Badge>
                        </td>
                    </tr>
                    <tr>
                        <td>Allow Backorders</td>
                        <td>
                            <Badge
                                bg={
                                    product.allow_backorders
                                        ? "success"
                                        : "secondary"
                                }
                            >
                                {product.allow_backorders ? "Yes" : "No"}
                            </Badge>
                        </td>
                    </tr>
                </tbody>
            </Table>
        );
    };

    const renderShippingInfo = () => {
        if (product.is_digital) {
            return (
                <Alert variant="info">
                    This is a digital product and doesn't require shipping.
                </Alert>
            );
        }

        return (
            <Table borderless size="sm" className="mb-0">
                <tbody>
                    <tr>
                        <td width="40%">Requires Shipping</td>
                        <td>
                            <Badge
                                bg={
                                    product.requires_shipping
                                        ? "success"
                                        : "secondary"
                                }
                            >
                                {product.requires_shipping ? "Yes" : "No"}
                            </Badge>
                        </td>
                    </tr>
                    <tr>
                        <td>Weight</td>
                        <td>
                            <strong>
                                {product.weight} {product.weight_unit}
                            </strong>
                        </td>
                    </tr>
                    <tr>
                        <td>Dimensions</td>
                        <td>
                            <strong>
                                {product.length} × {product.width} ×{" "}
                                {product.height} {product.dimension_unit}
                            </strong>
                        </td>
                    </tr>
                </tbody>
            </Table>
        );
    };

    const renderSpecifications = () => {
        if (
            !product.specifications ||
            Object.keys(product.specifications).length === 0
        ) {
            return <Alert variant="secondary">No specifications added.</Alert>;
        }

        return (
            <Table striped bordered hover size="sm">
                <tbody>
                    {Object.entries(product.specifications).map(
                        ([key, value]) => (
                            <tr key={key}>
                                <td width="30%">
                                    <strong>{key}</strong>
                                </td>
                                <td>{value}</td>
                            </tr>
                        )
                    )}
                </tbody>
            </Table>
        );
    };

    const renderRelatedProducts = () => {
        if (
            !product.related_products ||
            product.related_products.length === 0
        ) {
            return (
                <Alert variant="secondary">No related products added.</Alert>
            );
        }

        return (
            <Row>
                {product.related_products.map((related) => (
                    <Col md={4} key={related.id} className="mb-3">
                        <Card>
                            <Card.Body className="p-2">
                                <div className="d-flex align-items-center">
                                    <Image
                                        src={
                                            related.image ||
                                            "/images/no-image.png"
                                        }
                                        rounded
                                        width={60}
                                        height={60}
                                        className="me-3"
                                    />
                                    <div>
                                        <h6 className="mb-1">{related.name}</h6>
                                        <div className="text-muted small">
                                            ${related.price}
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    const renderVariants = () => {
        if (
            !product.has_variants ||
            !product.variants ||
            product.variants.length === 0
        ) {
            return (
                <Alert variant="secondary">This product has no variants.</Alert>
            );
        }

        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Variant</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {product.variants.map((variant) => (
                        <tr key={variant.id}>
                            <td>{variant.name}</td>
                            <td>{variant.sku}</td>
                            <td>${variant.price}</td>
                            <td>{variant.quantity}</td>
                            <td>
                                <Badge
                                    bg={
                                        variant.is_active
                                            ? "success"
                                            : "secondary"
                                    }
                                >
                                    {variant.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        );
    };

    const renderImages = () => {
        if (!product.images || product.images.length === 0) {
            return (
                <Alert variant="secondary">
                    No images uploaded for this product.
                </Alert>
            );
        }

        return (
            <Row className="g-3">
                {product.images.map((image) => (
                    <Col xs={6} md={4} lg={3} key={image.id}>
                        <Card>
                            <Card.Img
                                variant="top"
                                src={`/storage/${image.image_path}`}
                            />
                            <Card.Body className="p-2 text-center">
                                {image.is_default && (
                                    <Badge bg="primary" className="mb-1">
                                        Default
                                    </Badge>
                                )}
                                <div className="d-flex justify-content-center">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-1"
                                    >
                                        <PencilSquare size={14} />
                                    </Button>
                                    <Button variant="outline-danger" size="sm">
                                        <Trash size={14} />
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <ErpLayout>
            <Head title={product.name} />

            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0 d-inline-block text-capitalize">
                        {product.name}
                    </h2>
                    <ButtonGroup>
                        <Button
                            variant="primary"
                            as={Link}
                            href={route("product.edit", product.id)}
                            size="sm"
                        >
                            <PencilSquare size={16} className="me-1" /> Edit
                        </Button>
                        <Button variant="outline-danger" size="sm">
                            <Trash size={16} className="me-1" /> Delete
                        </Button>
                    </ButtonGroup>
                </div>

                <hr className="dashed-hr" />

                <Row>
                    <Col md={4}>
                        <Card className="mb-4">
                            <Card.Body className="p-0">
                                {product.default_image ? (
                                    <Image
                                        src={`/storage/${product.default_image.image_path}`}
                                        fluid
                                        rounded
                                        className="w-100"
                                    />
                                ) : (
                                    <div
                                        className="bg-light d-flex align-items-center justify-content-center"
                                        style={{ height: "300px" }}
                                    >
                                        <div className="text-center">
                                            <ImageIcon
                                                size={48}
                                                className="text-muted mb-2"
                                            />
                                            <p className="text-muted">
                                                No Image Available
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                            <Card.Footer className="bg-white">
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted small">
                                        ID: {product.id}
                                    </span>
                                    <span className="text-muted small">
                                        Slug: {product.slug}
                                    </span>
                                </div>
                            </Card.Footer>
                        </Card>

                        <Card className="mb-4">
                            <Card.Header className="bg-white d-flex align-items-center">
                                <CashCoin size={18} className="me-2" />
                                <h5 className="mb-0">Pricing</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {renderPriceInfo()}
                            </Card.Body>
                        </Card>

                        <Card className="mb-4">
                            <Card.Header className="bg-white d-flex align-items-center">
                                <BoxSeam size={18} className="me-2" />
                                <h5 className="mb-0">Inventory</h5>
                            </Card.Header>
                            <Card.Body>{renderInventoryInfo()}</Card.Body>
                        </Card>
                    </Col>

                    <Col md={8}>
                        <Card className="mb-4">
                            <Card.Header className="bg-white">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        {renderStatusBadge()}
                                        <Badge
                                            bg={
                                                product.is_digital
                                                    ? "info"
                                                    : "primary"
                                            }
                                            className="ms-1"
                                        >
                                            {product.is_digital
                                                ? "Digital"
                                                : "Physical"}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className="text-muted me-2">
                                            Created:{" "}
                                            {new Date(
                                                product.created_at
                                            ).toLocaleDateString()}
                                        </span>
                                        <span className="text-muted">
                                            Updated:{" "}
                                            {new Date(
                                                product.updated_at
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Tab.Container
                                    activeKey={activeTab}
                                    onSelect={setActiveTab}
                                >
                                    <Nav variant="tabs" className="mb-4">
                                        <Nav.Item>
                                            <Nav.Link eventKey="overview">
                                                <InfoCircle className="me-1" />{" "}
                                                Overview
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="specifications">
                                                <ListCheck className="me-1" />{" "}
                                                Specifications
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="variants">
                                                <Grid3x3Gap className="me-1" />{" "}
                                                Variants
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="images">
                                                <ImageIcon className="me-1" />{" "}
                                                Images
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="analytics">
                                                <BarChart className="me-1" />{" "}
                                                Analytics
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>

                                    <Tab.Content>
                                        <Tab.Pane eventKey="overview">
                                            <Accordion
                                                activeKey={activeAccordion}
                                                onSelect={setActiveAccordion}
                                            >
                                                <Accordion.Item eventKey="basic-info">
                                                    <Accordion.Header>
                                                        <Gear className="me-2" />{" "}
                                                        Basic Information
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        <Table
                                                            borderless
                                                            size="sm"
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td width="30%">
                                                                        Category
                                                                    </td>
                                                                    <td>
                                                                        <strong>
                                                                            {product
                                                                                .category
                                                                                ?.name ||
                                                                                "N/A"}
                                                                        </strong>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        Brand
                                                                    </td>
                                                                    <td>
                                                                        <strong>
                                                                            {product
                                                                                .brand
                                                                                ?.name ||
                                                                                "N/A"}
                                                                        </strong>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        Branch
                                                                    </td>
                                                                    <td>
                                                                        <strong>
                                                                            {product
                                                                                .branch
                                                                                ?.name ||
                                                                                "N/A"}
                                                                        </strong>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Tax</td>
                                                                    <td>
                                                                        <strong>
                                                                            {product
                                                                                .tax
                                                                                ?.name ||
                                                                                "N/A"}
                                                                        </strong>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        Short
                                                                        Description
                                                                    </td>
                                                                    <td>
                                                                        <div
                                                                            dangerouslySetInnerHTML={{
                                                                                __html:
                                                                                    product.short_description ||
                                                                                    "N/A",
                                                                            }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        Description
                                                                    </td>
                                                                    <td>
                                                                        <div
                                                                            dangerouslySetInnerHTML={{
                                                                                __html:
                                                                                    product.description ||
                                                                                    "N/A",
                                                                            }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </Table>
                                                    </Accordion.Body>
                                                </Accordion.Item>

                                                <Accordion.Item eventKey="shipping">
                                                    <Accordion.Header>
                                                        <Truck className="me-2" />{" "}
                                                        Shipping Information
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        {renderShippingInfo()}
                                                    </Accordion.Body>
                                                </Accordion.Item>

                                                <Accordion.Item eventKey="seo">
                                                    <Accordion.Header>
                                                        <Tag className="me-2" />{" "}
                                                        SEO Information
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        <Table
                                                            borderless
                                                            size="sm"
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td width="30%">
                                                                        Meta
                                                                        Title
                                                                    </td>
                                                                    <td>
                                                                        <strong>
                                                                            {product.meta_title ||
                                                                                "N/A"}
                                                                        </strong>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        Meta
                                                                        Description
                                                                    </td>
                                                                    <td>
                                                                        <div className="text-muted">
                                                                            {product.meta_description ||
                                                                                "N/A"}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        Tags
                                                                    </td>
                                                                    <td>
                                                                        {product.tags &&
                                                                        product
                                                                            .tags
                                                                            .length >
                                                                            0 ? (
                                                                            <div className="d-flex flex-wrap gap-1">
                                                                                {product.tags.map(
                                                                                    (
                                                                                        tag
                                                                                    ) => (
                                                                                        <Badge
                                                                                            key={
                                                                                                tag
                                                                                            }
                                                                                            bg="light"
                                                                                            text="dark"
                                                                                            className="fw-normal"
                                                                                        >
                                                                                            {
                                                                                                tag
                                                                                            }
                                                                                        </Badge>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            "N/A"
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </Table>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            </Accordion>
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="specifications">
                                            {renderSpecifications()}
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="variants">
                                            {renderVariants()}
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="images">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5>Product Images</h5>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                >
                                                    <PencilSquare
                                                        size={16}
                                                        className="me-1"
                                                    />{" "}
                                                    Manage Images
                                                </Button>
                                            </div>
                                            {renderImages()}
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="analytics">
                                            <Card className="mb-4">
                                                <Card.Header className="bg-white">
                                                    <h5>Sales Performance</h5>
                                                </Card.Header>
                                                <Card.Body>
                                                    <Alert variant="info">
                                                        Analytics data will be
                                                        displayed here once the
                                                        product has sales.
                                                    </Alert>
                                                </Card.Body>
                                            </Card>

                                            <Card>
                                                <Card.Header className="bg-white">
                                                    <h5>Related Products</h5>
                                                </Card.Header>
                                                <Card.Body>
                                                    {renderRelatedProducts()}
                                                </Card.Body>
                                            </Card>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Tab.Container>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </ErpLayout>
    );
}
