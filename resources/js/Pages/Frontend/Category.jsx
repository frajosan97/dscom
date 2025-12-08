import { useState, useEffect } from "react";
import ProductCard from "@/Components/Settings/ProductCard";
import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Breadcrumb,
    Card,
    Container,
    Row,
    Col,
    Button,
    Badge,
    Form,
    Dropdown,
    InputGroup,
    Placeholder,
} from "react-bootstrap";
import {
    FiGrid,
    FiList,
    FiFilter,
    FiChevronDown,
    FiSearch,
    FiSliders,
    FiX,
    FiStar,
    FiTrendingUp,
    FiClock,
} from "react-icons/fi";
import { BsGrid3X3Gap, BsListUl } from "react-icons/bs";

export default function Category({ category }) {
    const [viewMode, setViewMode] = useState("grid");
    const [sortBy, setSortBy] = useState("featured");
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter products based on search
    const filteredProducts = category?.products?.filter(
        (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    // Sort products
    const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
        switch (sortBy) {
            case "price-low":
                return a.price - b.price;
            case "price-high":
                return b.price - a.price;
            case "rating":
                return b.rating - a.rating;
            case "newest":
                return new Date(b.created_at) - new Date(a.created_at);
            default:
                return 0;
        }
    });

    const sortOptions = [
        { value: "featured", label: "Featured" },
        { value: "newest", label: "Newest Arrivals" },
        { value: "price-low", label: "Price: Low to High" },
        { value: "price-high", label: "Price: High to Low" },
        { value: "rating", label: "Highest Rated" },
    ];

    return (
        <AppLayout>
            <Head title={category.name.toUpperCase()} />

            {/* <div>
                <div className="category-hero position-relative bg-gradient-primary py-5 mb-4">
                    <div className="text-center text-white">
                        <h1 className="display-4 fw-bold mb-3 animate__animated animate__fadeIn">
                            {category.name}
                        </h1>
                        <p className="lead mb-4 opacity-90">
                            Discover our premium collection of{" "}
                            {category.name.toLowerCase()}
                        </p>
                    </div>
                </div>
                <div className="hero-wave">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>
            </div> */}

            <Container fluid className="py-4">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-4">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ href: "/" }}>
                        Home
                    </Breadcrumb.Item>
                    <Breadcrumb.Item
                        active
                        className="text-capitalize fw-semibold"
                    >
                        {category.name}
                    </Breadcrumb.Item>
                </Breadcrumb>

                {/* Sub-categories Carousel */}
                {category?.children?.length > 0 && (
                    <div className="mb-5">
                        <h3 className="h5 mb-3 d-flex align-items-center">
                            <FiGrid className="me-2" />
                            Shop by Sub-category
                        </h3>
                        <Row className="g-3">
                            {category.children.map((child) => (
                                <Col xs={6} sm={4} md={3} lg={2} key={child.id}>
                                    <Link
                                        href={`/category/${child.slug}`}
                                        className="text-decoration-none"
                                    >
                                        <Card className="subcategory-card h-100 border-0 shadow-sm hover-lift transition-all">
                                            <div className="position-relative overflow-hidden rounded-top">
                                                <Card.Img
                                                    variant="top"
                                                    src={`/${child.image}`}
                                                    alt={child.name}
                                                    className="transition-transform"
                                                    style={{
                                                        height: "120px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                                <div className="card-overlay"></div>
                                            </div>
                                            <Card.Body className="text-center py-3">
                                                <h6 className="mb-0 fw-semibold text-dark">
                                                    {child.name}
                                                </h6>
                                                <small className="text-muted">
                                                    {child.product_count || 0}{" "}
                                                    items
                                                </small>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}

                {/* Products Header with Controls */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                    <div className="mb-3 mb-md-0">
                        <h2 className="h3 mb-1">All Products</h2>
                        <p className="text-muted mb-0">
                            <Badge bg="light" text="dark" className="fw-normal">
                                {sortedProducts?.length || 0} products found
                            </Badge>
                        </p>
                    </div>

                    <div className="d-flex flex-wrap gap-3">
                        {/* Search */}
                        <InputGroup
                            className="search-box"
                            style={{ width: "250px" }}
                        >
                            <InputGroup.Text className="bg-white border-end-0">
                                <FiSearch className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search in category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-start-0"
                            />
                            {searchQuery && (
                                <Button
                                    variant="light"
                                    onClick={() => setSearchQuery("")}
                                    className="border-start-0"
                                >
                                    <FiX />
                                </Button>
                            )}
                        </InputGroup>

                        {/* Sort Dropdown */}
                        <Dropdown className="me-2">
                            <Dropdown.Toggle
                                variant="light"
                                className="d-flex align-items-center"
                            >
                                <FiTrendingUp className="me-2" />
                                Sort:{" "}
                                {
                                    sortOptions.find(
                                        (opt) => opt.value === sortBy
                                    )?.label
                                }
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {sortOptions.map((option) => (
                                    <Dropdown.Item
                                        key={option.value}
                                        active={sortBy === option.value}
                                        onClick={() => setSortBy(option.value)}
                                    >
                                        {option.label}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        {/* View Toggle */}
                        <div className="btn-group" role="group">
                            <Button
                                variant={
                                    viewMode === "grid" ? "primary" : "light"
                                }
                                onClick={() => setViewMode("grid")}
                                className="d-flex align-items-center"
                            >
                                <BsGrid3X3Gap />
                            </Button>
                            <Button
                                variant={
                                    viewMode === "list" ? "primary" : "light"
                                }
                                onClick={() => setViewMode("list")}
                                className="d-flex align-items-center"
                            >
                                <BsListUl />
                            </Button>
                        </div>

                        {/* Filter Toggle for Mobile */}
                        <Button
                            variant="outline-primary"
                            onClick={() => setFiltersVisible(!filtersVisible)}
                            className="d-md-none"
                        >
                            <FiSliders className="me-1" />
                            Filters
                        </Button>
                    </div>
                </div>

                <Row>
                    {/* Filters Sidebar */}
                    <Col
                        lg={3}
                        className={`mb-4 ${
                            filtersVisible ? "d-block" : "d-none d-lg-block"
                        }`}
                    >
                        <Card>
                            <Card.Header className="bg-white border-bottom">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <FiFilter className="me-2" />
                                    Filters
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {/* Price Range Filter */}
                                <div className="mb-4">
                                    <h6 className="mb-3">Price Range</h6>
                                    <Form.Range
                                        min="0"
                                        max="5000"
                                        step="50"
                                        value={priceRange[1]}
                                        onChange={(e) =>
                                            setPriceRange([
                                                0,
                                                parseInt(e.target.value),
                                            ])
                                        }
                                    />
                                    <div className="d-flex justify-content-between mt-2">
                                        <small className="text-muted">$0</small>
                                        <small className="text-muted">
                                            ${priceRange[1]}+
                                        </small>
                                    </div>
                                </div>

                                {/* Rating Filter */}
                                <div className="mb-4">
                                    <h6 className="mb-3">Customer Rating</h6>
                                    {[4, 3, 2, 1].map((stars) => (
                                        <Form.Check
                                            key={stars}
                                            type="checkbox"
                                            id={`rating-${stars}`}
                                            label={
                                                <div className="d-flex align-items-center">
                                                    {[...Array(5)].map(
                                                        (_, i) => (
                                                            <FiStar
                                                                key={i}
                                                                className={`me-1 ${
                                                                    i < stars
                                                                        ? "text-warning fill"
                                                                        : "text-muted"
                                                                }`}
                                                                size={14}
                                                            />
                                                        )
                                                    )}
                                                    <span className="ms-2">
                                                        & above
                                                    </span>
                                                </div>
                                            }
                                            className="mb-2"
                                        />
                                    ))}
                                </div>

                                {/* Clear Filters */}
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="w-100"
                                    onClick={() => {
                                        setPriceRange([0, 1000]);
                                        setSearchQuery("");
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Products Grid/List */}
                    <Col lg={9}>
                        {sortedProducts?.length > 0 ? (
                            <Row className="g-4">
                                {sortedProducts.map((item) => (
                                    <Col
                                        key={item.id}
                                        xs={viewMode === "list" ? 12 : 6}
                                        md={viewMode === "list" ? 12 : 4}
                                        lg={viewMode === "list" ? 12 : 3}
                                        xl={
                                            viewMode === "list"
                                                ? 12
                                                : viewMode === "grid"
                                                ? 3
                                                : 2
                                        }
                                    >
                                        <ProductCard
                                            product={item}
                                            viewMode={viewMode}
                                            showRating={true}
                                            showQuickView={true}
                                            showAddToCart={true}
                                            showWishlist={true}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div className="text-center py-5">
                                <div className="mb-4">
                                    <FiSearch
                                        size={64}
                                        className="text-muted opacity-50"
                                    />
                                </div>
                                <h4 className="mb-3">No products found</h4>
                                <p className="text-muted mb-4">
                                    Try adjusting your search or filter to find
                                    what you're looking for.
                                </p>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setPriceRange([0, 1000]);
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        )}

                        {/* Load More (Pagination) */}
                        {sortedProducts?.length > 0 && (
                            <div className="text-center mt-5">
                                <Button
                                    variant="outline-primary"
                                    size="lg"
                                    className="px-5"
                                >
                                    Load More Products
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>

            <style jsx>{`
                .category-hero {
                    background: linear-gradient(
                        135deg,
                        #667eea 0%,
                        #764ba2 100%
                    );
                    position: relative;
                    overflow: hidden;
                }

                .hero-wave {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    overflow: hidden;
                    line-height: 0;
                }

                .hero-wave svg {
                    position: relative;
                    display: block;
                    width: calc(100% + 1.3px);
                    height: 50px;
                    transform: rotate(180deg);
                }

                .hero-wave path {
                    fill: #ffffff;
                }

                .subcategory-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
                }

                .subcategory-card:hover img {
                    transform: scale(1.05);
                }

                .transition-all {
                    transition: all 0.3s ease;
                }

                .hover-lift:hover {
                    transform: translateY(-5px);
                }

                .card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        to bottom,
                        transparent 50%,
                        rgba(0, 0, 0, 0.1)
                    );
                }

                .rotate-270 {
                    transform: rotate(270deg);
                }

                .search-box {
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    border-radius: 8px;
                }

                .fill {
                    fill: currentColor;
                }

                @media (max-width: 768px) {
                    .category-hero {
                        padding: 3rem 0 !important;
                    }

                    .category-hero h1 {
                        font-size: 2rem !important;
                    }
                }
            `}</style>
        </AppLayout>
    );
}
