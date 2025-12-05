import { Badge, Card } from "react-bootstrap";
import { Link } from "@inertiajs/react";
import { formatCurrency } from "@/Utils/helpers";
import { FaStar, FaShoppingCart, FaEye } from "react-icons/fa";
import AddToCartBtn from "../Settings/AddToCartBtn";

export default function ProductCard({
    product,
    systemMode = null,
    showCategory = false,
    showStockStatus = false,
    showActions = true,
    className = "",
    ...props
}) {
    // Calculate discount percentage
    const getDiscountPercentage = () => {
        if (
            !product.compare_price ||
            product.compare_price <= product.base_price
        ) {
            return 0;
        }
        return Math.round(
            ((product.compare_price - product.base_price) /
                product.compare_price) *
                100
        );
    };

    // Get product image URL
    const getImageUrl = () => {
        if (product.default_image?.image_path) {
            return `/storage/${product.default_image.image_path}`;
        }
        if (product.images?.length > 0) {
            return `/storage/${product.images[0].image_path}`;
        }
        return "/images/default-product.jpg";
    };

    // Get product status badge
    const getStatusBadge = () => {
        if (!product.is_active) {
            return { text: "Inactive", variant: "secondary" };
        }
        if (!product.is_in_stock && !product.allow_backorders) {
            return { text: "Out of Stock", variant: "danger" };
        }
        if (product.is_on_sale) {
            return { text: "On Sale", variant: "danger" };
        }
        if (product.is_new) {
            return { text: "New", variant: "success" };
        }
        return null;
    };

    // Handle card click based on mode
    const handleCardClick = () => {
        if (systemMode === "erp") {
            router.visit(route("product.edit", product.id));
        }
    };

    // Render ERP mode card
    const renderERPCard = () => (
        <Card
            className={`h-100 product-card erp-mode border ${className}`}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            {...props}
        >
            <div className="position-relative overflow-hidden">
                <div
                    className="product-image-wrapper"
                    style={{ height: "150px" }}
                >
                    <Card.Img
                        src={getImageUrl()}
                        alt={product.name}
                        className="product-image h-100 w-100 object-fit-cover"
                        loading="lazy"
                    />
                </div>

                {/* Status overlay */}
                <div className="position-absolute top-0 end-0 m-2">
                    <Badge
                        bg={getStatusBadge()?.variant || "light"}
                        className="text-uppercase"
                        pill
                    >
                        {getStatusBadge()?.text || "Active"}
                    </Badge>
                </div>
            </div>

            <Card.Body className="d-flex flex-column p-3">
                {/* Category */}
                {showCategory && product.category && (
                    <small className="text-muted text-uppercase mb-1">
                        {product.category.name}
                    </small>
                )}

                {/* Product Name */}
                <Card.Title
                    className="product-name fs-6 fw-semibold mb-2 text-truncate"
                    title={product.name}
                >
                    {product.name}
                </Card.Title>

                {/* SKU & Stock Info */}
                <div className="mb-2">
                    {product.sku && (
                        <small className="text-muted d-block">
                            SKU: {product.sku}
                        </small>
                    )}
                    {showStockStatus && (
                        <div className="d-flex align-items-center gap-2 mt-1">
                            <span
                                className={`badge bg-${
                                    product.is_in_stock ? "success" : "danger"
                                }`}
                            >
                                {product.is_in_stock
                                    ? "In Stock"
                                    : "Out of Stock"}
                            </span>
                            {product.track_quantity && (
                                <small className="text-muted">
                                    Qty: {product.total_quantity || 0}
                                </small>
                            )}
                        </div>
                    )}
                </div>

                {/* Pricing */}
                <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <div className="fs-5 fw-bold text-primary">
                                {formatCurrency(product.base_price)}
                            </div>
                            {product.cost_per_item && (
                                <small className="text-muted">
                                    Cost:{" "}
                                    {formatCurrency(product.cost_per_item)}
                                </small>
                            )}
                        </div>
                        {getDiscountPercentage() > 0 && (
                            <Badge bg="danger" className="fs-6">
                                -{getDiscountPercentage()}%
                            </Badge>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="d-flex justify-content-between small text-muted">
                        <div>
                            <FaStar className="text-warning" />{" "}
                            {product.rating || "N/A"}
                        </div>
                        <div>
                            <FaEye className="me-1" /> {product.views || 0}
                        </div>
                        <div>
                            <FaShoppingCart className="me-1" />{" "}
                            {product.sold_count || 0}
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );

    // Render Storefront mode card
    const renderStorefrontCard = () => (
        <Card
            className={`h-100 text-capitalize product-card storefront-mode border-0 shadow-sm hover-shadow transition-all ${className}`}
            {...props}
        >
            <Link
                href={route("product.show", product.slug)}
                className="text-decoration-none text-dark"
            >
                <div className="position-relative overflow-hidden">
                    <div
                        className="product-image-wrapper"
                        style={{ height: "200px" }}
                    >
                        <Card.Img
                            src={getImageUrl()}
                            alt={product.name}
                            className="product-image h-100 w-100 object-fit-cover transition-transform"
                            loading="lazy"
                        />
                        {/* Hover overlay */}
                        <div className="product-overlay position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 hover-bg-opacity-75 transition-all d-flex align-items-center justify-content-center">
                            <FaEye className="text-white fs-4 opacity-0 hover-opacity-100 transition-all" />
                        </div>
                    </div>

                    {/* Product badges */}
                    <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
                        {product.is_new && (
                            <Badge bg="success" className="shadow-sm">
                                New
                            </Badge>
                        )}
                        {product.is_bestseller && (
                            <Badge bg="danger" className="shadow-sm">
                                <FaStar className="me-1" /> Bestseller
                            </Badge>
                        )}
                        {getDiscountPercentage() > 0 && (
                            <Badge bg="info" className="shadow-sm">
                                {getDiscountPercentage()}% OFF
                            </Badge>
                        )}
                    </div>
                </div>

                <Card.Body className="p-3">
                    {/* Category */}
                    {showCategory && product.category && (
                        <small className="text-muted text-uppercase d-block mb-1">
                            {product.category.name}
                        </small>
                    )}

                    {/* Product Name */}
                    <Card.Title
                        className="product-name fs-6 fw-semibold mb-2 text-truncate"
                        title={product.name}
                    >
                        {product.name}
                    </Card.Title>

                    {/* Short Description */}
                    {product.short_description && (
                        <Card.Text className="text-muted small mb-2 line-clamp-2">
                            {product.short_description}
                        </Card.Text>
                    )}

                    {/* Variants Preview */}
                    {(product.sizes || product.colors) && (
                        <div className="d-flex gap-1 mb-3">
                            {product.sizes?.slice(0, 3).map((size, idx) => (
                                <Badge
                                    key={`size-${idx}`}
                                    bg="light"
                                    text="dark"
                                    className="border"
                                >
                                    {size}
                                </Badge>
                            ))}
                            {product.colors?.slice(0, 3).map((color, idx) => (
                                <Badge
                                    key={`color-${idx}`}
                                    bg={color.toLowerCase()}
                                    text={
                                        color.toLowerCase() === "white"
                                            ? "dark"
                                            : "white"
                                    }
                                    className="border"
                                    style={{ backgroundColor: color }}
                                >
                                    {color}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Pricing */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <div className="fs-5 fw-bold text-primary">
                                {formatCurrency(product.base_price)}
                            </div>
                            {product.compare_price &&
                                product.compare_price > product.base_price && (
                                    <del className="text-muted small">
                                        {formatCurrency(product.compare_price)}
                                    </del>
                                )}
                        </div>

                        {/* Rating */}
                        {product.rating && (
                            <div className="d-flex align-items-center">
                                <FaStar className="text-warning me-1" />
                                <span className="small">{product.rating}</span>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Link>

            {/* Actions */}
            {showActions && (
                <Card.Footer className="border-0 bg-transparent p-3 pt-0">
                    <AddToCartBtn
                        product={product}
                        variant="primary"
                        className="w-100"
                        size="sm"
                    />
                </Card.Footer>
            )}
        </Card>
    );

    return systemMode === "erp" ? renderERPCard() : renderStorefrontCard();
}

// Add CSS styles for hover effects (can be moved to a CSS file)
const cardStyles = `
    .product-card {
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .product-image {
        transition: transform 0.3s;
    }
    
    .product-card:hover .product-image {
        transform: scale(1.05);
    }
    
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .hover-shadow {
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .hover-shadow:hover {
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
`;

// Add styles to document head
if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = cardStyles;
    document.head.appendChild(styleSheet);
}
