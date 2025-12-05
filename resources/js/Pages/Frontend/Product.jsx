import { Head, Link } from "@inertiajs/react";
import {
    Breadcrumb,
    Card,
    Container,
    Row,
    Col,
    Button,
    Badge,
    Tab,
    Tabs,
    Image,
    Form,
    InputGroup,
    Alert,
    ListGroup,
    Modal,
    ButtonGroup,
} from "react-bootstrap";
import { useState } from "react";
import {
    FaHeart,
    FaRegHeart,
    FaShareAlt,
    FaShoppingCart,
    FaStar,
    FaRegStar,
    FaStarHalfAlt,
    FaMinus,
    FaPlus,
    FaFacebook,
    FaTwitter,
    FaPinterest,
    FaWhatsapp,
    FaEnvelope,
    FaCheck,
    FaTruck,
    FaShieldAlt,
    FaExchangeAlt,
} from "react-icons/fa";
import AppLayout from "@/Layouts/AppLayout";
import AddToCartBtn from "@/Components/Settings/AddToCartBtn";
import SlickSlider from "@/Components/Settings/SlickSlider";
import { formatCurrency } from "@/Utils/helpers";

export default function Product({ product }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(
        product.default_image || product.images?.[0]
    );
    const [activeTab, setActiveTab] = useState("description");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // Get product images
    const productImages = product.images || [];

    // Calculate stock status
    const getStockStatus = () => {
        if (!product.track_quantity) {
            return {
                status: "available",
                text: "In Stock",
                variant: "success",
            };
        }

        if (product.total_quantity > 0) {
            return {
                status: "available",
                text: `In Stock (${product.total_quantity} available)`,
                variant: "success",
            };
        }

        if (product.allow_backorders) {
            return {
                status: "backorder",
                text: "Available on Backorder",
                variant: "warning",
            };
        }

        return {
            status: "out_of_stock",
            text: "Out of Stock",
            variant: "danger",
        };
    };

    const stockStatus = getStockStatus();

    const handleQuantityChange = (type) => {
        if (type === "increment") {
            setQuantity((prev) => prev + 1);
        } else if (type === "decrement" && quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const calculateAverageRating = () => {
        // This would come from your reviews relationship
        if (!product.reviews || product.reviews.length === 0) return 0;
        const total = product.reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );
        return total / product.reviews.length;
    };

    const averageRating = calculateAverageRating();
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const renderStars = () => {
        let stars = [];
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} className="text-warning" />);
        }
        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half" className="text-warning" />);
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FaRegStar key={`empty-${i}`} className="text-warning" />
            );
        }
        return stars;
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
        twitter: `https://twitter.com/intent/tweet?url=${window.location.href}&text=Check out this product: ${product.name}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${window.location.href}&media=${selectedImage?.image_path}&description=${product.name}`,
        whatsapp: `https://wa.me/?text=Check out this product: ${product.name} ${window.location.href}`,
        email: `mailto:?subject=${product.name}&body=Check out this product: ${window.location.href}`,
    };

    // Get product variations
    const productVariations = product.variations || [];

    // Get product specifications from metadata or separate fields
    const productSpecifications = product.metadata?.specifications || {};

    // Calculate discount percentage
    const discountPercentage =
        product.compare_price && product.compare_price > product.base_price
            ? Math.round(
                  ((product.compare_price - product.base_price) /
                      product.compare_price) *
                      100
              )
            : 0;

    // Related products settings
    const relatedProductsSettings = {
        slidesToShow: 4,
        autoplay: true,
        autoplaySpeed: 4000,
        speed: 600,
        customSettings: {
            infinite: true,
            arrows: true,
            dots: false,
            responsive: [
                {
                    breakpoint: 992,
                    settings: { slidesToShow: 3 },
                },
                {
                    breakpoint: 768,
                    settings: { slidesToShow: 2, arrows: false },
                },
                {
                    breakpoint: 576,
                    settings: { slidesToShow: 1, arrows: false, dots: true },
                },
            ],
        },
    };

    return (
        <AppLayout>
            <Head title={product.name} />

            <Container fluid className="py-4">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-3">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ href: "/" }}>
                        Home
                    </Breadcrumb.Item>
                    {product.category && (
                        <Breadcrumb.Item
                            linkAs={Link}
                            linkProps={{
                                href: `/categories/${product.category.slug}`,
                            }}
                        >
                            {product.category.name}
                        </Breadcrumb.Item>
                    )}
                    <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
                </Breadcrumb>

                {showSuccessAlert && (
                    <Alert
                        variant="success"
                        className="mb-3 d-flex align-items-center"
                        dismissible
                        onClose={() => setShowSuccessAlert(false)}
                    >
                        <FaCheck className="me-2" />
                        Product added to cart successfully!
                    </Alert>
                )}

                <Row>
                    {/* Left Column - Product Images */}
                    <Col lg={6}>
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Body className="p-3">
                                {/* Main Image */}
                                <div className="product-main-image mb-3">
                                    <Image
                                        src={
                                            selectedImage
                                                ? `/storage/${selectedImage.image_path}`
                                                : "/images/default-product.png"
                                        }
                                        alt={product.name}
                                        fluid
                                        className="w-100 rounded-3"
                                        style={{
                                            maxHeight: "400px",
                                            objectFit: "contain",
                                            backgroundColor: "#f8f9fa",
                                        }}
                                    />
                                </div>

                                {/* Thumbnails */}
                                {productImages.length > 1 && (
                                    <div className="product-thumbnails">
                                        <SlickSlider
                                            slidesToShow={4}
                                            arrows={true}
                                            dots={false}
                                        >
                                            {productImages.map((image) => (
                                                <div
                                                    key={image.id}
                                                    className="px-1"
                                                >
                                                    <div
                                                        className={`thumbnail rounded-2 border ${
                                                            selectedImage?.id ===
                                                            image.id
                                                                ? "border-primary"
                                                                : "border-light"
                                                        }`}
                                                        onClick={() =>
                                                            setSelectedImage(
                                                                image
                                                            )
                                                        }
                                                        style={{
                                                            cursor: "pointer",
                                                            height: "80px",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <Image
                                                            src={`/storage/${image.image_path}`}
                                                            alt={`${
                                                                product.name
                                                            } - ${
                                                                image.alt_text ||
                                                                "Image"
                                                            }`}
                                                            className="h-100 w-100 object-fit-cover"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </SlickSlider>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column - Product Details */}
                    <Col lg={6}>
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Body>
                                {/* Product Header */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h1 className="h3 fw-bold mb-2 text-capitalize">
                                            {product.name}
                                        </h1>
                                        <div className="d-flex align-items-center gap-3 mb-2">
                                            {product.brand && (
                                                <Link
                                                    href={`/brands/${product.brand.slug}`}
                                                    className="text-decoration-none"
                                                >
                                                    <Badge
                                                        bg="light"
                                                        text="dark"
                                                        className="fw-normal"
                                                    >
                                                        {product.brand.name}
                                                    </Badge>
                                                </Link>
                                            )}
                                            {product.sku && (
                                                <small className="text-muted">
                                                    SKU: {product.sku}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant={
                                                isWishlisted
                                                    ? "danger"
                                                    : "outline-danger"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setIsWishlisted(!isWishlisted)
                                            }
                                            title={
                                                isWishlisted
                                                    ? "Remove from wishlist"
                                                    : "Add to wishlist"
                                            }
                                            className="rounded-circle"
                                        >
                                            {isWishlisted ? (
                                                <FaHeart />
                                            ) : (
                                                <FaRegHeart />
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={handleShare}
                                            title="Share this product"
                                            className="rounded-circle"
                                        >
                                            <FaShareAlt />
                                        </Button>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="d-flex align-items-center mb-3">
                                    <div className="me-2">{renderStars()}</div>
                                    <span className="text-muted small me-3">
                                        {averageRating.toFixed(1)} (
                                        {product.reviews?.length || 0} reviews)
                                    </span>
                                    <Link
                                        href="#reviews"
                                        className="small text-decoration-none"
                                    >
                                        Write a review
                                    </Link>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="h3 fw-bold text-primary me-3">
                                            {formatCurrency(product.base_price)}
                                        </span>
                                        {discountPercentage > 0 && (
                                            <>
                                                <span className="text-muted text-decoration-line-through me-2">
                                                    {formatCurrency(
                                                        product.compare_price
                                                    )}
                                                </span>
                                                <Badge
                                                    bg="danger"
                                                    className="fs-6"
                                                >
                                                    -{discountPercentage}%
                                                </Badge>
                                            </>
                                        )}
                                    </div>
                                    {product.cost_per_item && (
                                        <small className="text-muted">
                                            Cost per item:{" "}
                                            {formatCurrency(
                                                product.cost_per_item
                                            )}
                                        </small>
                                    )}
                                </div>

                                {/* Stock Status */}
                                <div className="mb-4">
                                    <Badge
                                        bg={stockStatus.variant}
                                        className="fs-6 py-2 px-3 mb-2"
                                    >
                                        {stockStatus.text}
                                    </Badge>
                                    {product.low_stock_alert &&
                                        product.total_quantity <=
                                            product.low_stock_alert && (
                                            <div className="text-warning small mt-1">
                                                <FaCheck className="me-1" />
                                                Low stock alert: Only{" "}
                                                {product.total_quantity} left!
                                            </div>
                                        )}
                                </div>

                                {/* Short Description */}
                                {product.short_description && (
                                    <div className="mb-4">
                                        <p className="text-muted">
                                            {product.short_description}
                                        </p>
                                    </div>
                                )}

                                {/* Variants */}
                                {productVariations.length > 0 && (
                                    <div className="mb-4">
                                        <h6 className="fw-semibold mb-3">
                                            Available Options:
                                        </h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {productVariations.map(
                                                (variant, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="rounded-pill"
                                                    >
                                                        {variant}
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Colors */}
                                {product.colors?.length > 0 && (
                                    <div className="mb-4">
                                        <h6 className="fw-semibold mb-2">
                                            Colors:
                                        </h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {product.colors.map(
                                                (color, index) => (
                                                    <div
                                                        key={index}
                                                        className="rounded-circle border"
                                                        style={{
                                                            width: "32px",
                                                            height: "32px",
                                                            backgroundColor:
                                                                color,
                                                            cursor: "pointer",
                                                            border: "2px solid #dee2e6",
                                                        }}
                                                        title={color}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Sizes */}
                                {product.sizes?.length > 0 && (
                                    <div className="mb-4">
                                        <h6 className="fw-semibold mb-2">
                                            Sizes:
                                        </h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {product.sizes.map(
                                                (size, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="rounded-1"
                                                    >
                                                        {size}
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity and Add to Cart */}
                                <div className="mb-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <h6
                                            className="fw-semibold mb-0 me-3"
                                            style={{ minWidth: "100px" }}
                                        >
                                            Quantity:
                                        </h6>
                                        <ButtonGroup className="rounded-3">
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        "decrement"
                                                    )
                                                }
                                                disabled={quantity <= 1}
                                                className="border-end-0"
                                            >
                                                <FaMinus />
                                            </Button>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                max={
                                                    product.track_quantity
                                                        ? product.total_quantity
                                                        : 999
                                                }
                                                value={quantity}
                                                onChange={(e) =>
                                                    setQuantity(
                                                        Math.max(
                                                            1,
                                                            parseInt(
                                                                e.target.value
                                                            ) || 1
                                                        )
                                                    )
                                                }
                                                className="text-center border-0"
                                                style={{ width: "60px" }}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        "increment"
                                                    )
                                                }
                                                className="border-start-0"
                                                disabled={
                                                    product.track_quantity &&
                                                    quantity >=
                                                        product.total_quantity
                                                }
                                            >
                                                <FaPlus />
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                    <div className="d-flex gap-3">
                                        <AddToCartBtn
                                            product={product}
                                            quantity={quantity}
                                            disabled={
                                                stockStatus.status ===
                                                "out_of_stock"
                                            }
                                            className="flex-grow-1 py-3"
                                        />
                                    </div>
                                </div>

                                {/* Product Features */}
                                <div className="border-top pt-4">
                                    <Row>
                                        <Col xs={6} className="mb-3">
                                            <div className="d-flex align-items-center">
                                                <FaTruck className="text-primary me-2" />
                                                <div>
                                                    <small className="fw-semibold">
                                                        Free Shipping
                                                    </small>
                                                    <div className="text-muted small">
                                                        On orders over $50
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={6} className="mb-3">
                                            <div className="d-flex align-items-center">
                                                <FaShieldAlt className="text-primary me-2" />
                                                <div>
                                                    <small className="fw-semibold">
                                                        2-Year Warranty
                                                    </small>
                                                    <div className="text-muted small">
                                                        Guaranteed quality
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="d-flex align-items-center">
                                                <FaExchangeAlt className="text-primary me-2" />
                                                <div>
                                                    <small className="fw-semibold">
                                                        30-Day Returns
                                                    </small>
                                                    <div className="text-muted small">
                                                        Easy returns
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="d-flex align-items-center">
                                                <FaCheck className="text-primary me-2" />
                                                <div>
                                                    <small className="fw-semibold">
                                                        Secure Payment
                                                    </small>
                                                    <div className="text-muted small">
                                                        100% secure
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Product Tabs */}
                    <Col md={12}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="p-0">
                                <Tabs
                                    activeKey={activeTab}
                                    onSelect={(k) => setActiveTab(k)}
                                    className="px-3 pt-3 border-bottom-0"
                                    fill
                                >
                                    <Tab
                                        eventKey="description"
                                        title="Description"
                                    >
                                        <div className="p-4">
                                            {product.description ? (
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: product.description,
                                                    }}
                                                />
                                            ) : (
                                                <p className="text-muted text-center py-4">
                                                    No description available.
                                                </p>
                                            )}
                                        </div>
                                    </Tab>
                                    <Tab
                                        eventKey="specifications"
                                        title="Specifications"
                                    >
                                        <div className="p-4">
                                            {Object.keys(productSpecifications)
                                                .length > 0 ? (
                                                <Row>
                                                    {Object.entries(
                                                        productSpecifications
                                                    ).map(([key, value]) => (
                                                        <Col
                                                            md={6}
                                                            key={key}
                                                            className="mb-3"
                                                        >
                                                            <div className="d-flex border-bottom pb-2">
                                                                <span
                                                                    className="fw-semibold text-muted me-2"
                                                                    style={{
                                                                        minWidth:
                                                                            "150px",
                                                                    }}
                                                                >
                                                                    {key}:
                                                                </span>
                                                                <span>
                                                                    {value}
                                                                </span>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            ) : (
                                                <p className="text-muted text-center py-4">
                                                    No specifications available.
                                                </p>
                                            )}
                                        </div>
                                    </Tab>
                                    <Tab
                                        eventKey="reviews"
                                        title={`Reviews (${
                                            product.reviews?.length || 0
                                        })`}
                                    >
                                        <div className="p-4" id="reviews">
                                            {/* Reviews content - same as before */}
                                            <p className="text-center text-muted py-4">
                                                Reviews functionality would be
                                                implemented here
                                            </p>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Related Products */}
                    {product.related_products &&
                        product.related_products.length > 0 && (
                            <Col md={12}>
                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Header className="bg-transparent border-0 py-3">
                                        <h4 className="mb-0 fw-semibold">
                                            Related Products
                                        </h4>
                                    </Card.Header>
                                    <Card.Body className="pt-0">
                                        <SlickSlider
                                            {...relatedProductsSettings}
                                        >
                                            {product.related_products.map(
                                                (product) => (
                                                    <div
                                                        key={product.id}
                                                        className="px-2"
                                                    >
                                                        <ProductCard
                                                            product={product}
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </SlickSlider>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                </Row>
            </Container>

            {/* Share Modal */}
            <Modal
                show={showShareModal}
                onHide={() => setShowShareModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="h5">Share this product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-around mb-4">
                        {Object.entries({
                            facebook: {
                                icon: FaFacebook,
                                color: "primary",
                                label: "Facebook",
                            },
                            twitter: {
                                icon: FaTwitter,
                                color: "info",
                                label: "Twitter",
                            },
                            pinterest: {
                                icon: FaPinterest,
                                color: "danger",
                                label: "Pinterest",
                            },
                            whatsapp: {
                                icon: FaWhatsapp,
                                color: "success",
                                label: "WhatsApp",
                            },
                            email: {
                                icon: FaEnvelope,
                                color: "secondary",
                                label: "Email",
                            },
                        }).map(([platform, { icon: Icon, color, label }]) => (
                            <a
                                key={platform}
                                href={shareLinks[platform]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none text-center"
                            >
                                <Button
                                    variant={`outline-${color}`}
                                    className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                                    style={{ width: "60px", height: "60px" }}
                                >
                                    <Icon size={24} />
                                </Button>
                                <div className="text-center mt-2 small">
                                    {label}
                                </div>
                            </a>
                        ))}
                    </div>
                    <Form.Group>
                        <Form.Label className="fw-semibold">
                            Or copy link
                        </Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                value={
                                    typeof window !== "undefined"
                                        ? window.location.href
                                        : ""
                                }
                                readOnly
                                className="border-end-0"
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => {
                                    if (
                                        typeof navigator !== "undefined" &&
                                        navigator.clipboard
                                    ) {
                                        navigator.clipboard.writeText(
                                            window.location.href
                                        );
                                    }
                                }}
                                className="border-start-0"
                            >
                                Copy
                            </Button>
                        </InputGroup>
                    </Form.Group>
                </Modal.Body>
            </Modal>
        </AppLayout>
    );
}
