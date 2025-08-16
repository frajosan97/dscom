import { Head, Link } from "@inertiajs/react";
import { Breadcrumb, Card, Container, Row, Col, Button, Badge, Tab, Tabs, Image, Form, InputGroup, Alert, ListGroup, Modal, ButtonGroup } from "react-bootstrap";
import { useState } from "react";
import { FaHeart, FaRegHeart, FaShareAlt, FaShoppingCart, FaStar, FaRegStar, FaStarHalfAlt, FaMinus, FaPlus, FaFacebook, FaTwitter, FaPinterest, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import AppLayout from "@/Layouts/AppLayout";
import AddToCartBtn from "@/Components/Settings/AddToCartBtn";
import SlickSlider from "@/Components/Settings/SlickSlider";

export default function Product({ product }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(product.default_image);
    const [activeTab, setActiveTab] = useState('description');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const handleQuantityChange = (type) => {
        if (type === 'increment') {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const calculateAverageRating = () => {
        if (!product.reviews || product.reviews.length === 0) return 0;
        const total = product.reviews.reduce((sum, review) => sum + review.rating, 0);
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
            stars.push(<FaRegStar key={`empty-${i}`} className="text-warning" />);
        }
        return stars;
    };

    const handleAddToCart = () => {
        // Add to cart logic here
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
        twitter: `https://twitter.com/intent/tweet?url=${window.location.href}&text=Check out this product: ${product.name}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${window.location.href}&media=${selectedImage?.image_path}&description=${product.name}`,
        whatsapp: `https://wa.me/?text=Check out this product: ${product.name} ${window.location.href}`,
        email: `mailto:?subject=${product.name}&body=Check out this product: ${window.location.href}`
    };

    const settings = {
        slidesToShow: 5,
        autoplay: true,
        autoplaySpeed: 6000,
        speed: 800,
    };

    return (
        <AppLayout>
            <Head title={product.name.toUpperCase()} />

            <Container className="py-4">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-2">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ href: "/" }}>
                        Home
                    </Breadcrumb.Item>
                    {product.category && (
                        <Breadcrumb.Item linkAs={Link} linkProps={{ href: `/categories/${product.category.slug}` }}>
                            {product.category.name}
                        </Breadcrumb.Item>
                    )}
                    <Breadcrumb.Item active className="text-capitalize">
                        {product.name}
                    </Breadcrumb.Item>
                </Breadcrumb>

                <Row>
                    <Col md={9}>
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Body>
                                <Row>
                                    <Col md={5}>
                                        <div className="product-main-image mb-2">
                                            <Image
                                                src={`/storage/${selectedImage?.image_path}` || '/images/default-product.png'}
                                                alt={product.name}
                                                fluid
                                                className="w-100 rounded"
                                                style={{ maxHeight: '300px', objectFit: 'contain' }}
                                            />
                                        </div>
                                        <div className="product-thumbnails d-flex flex-wrap gap-2">
                                            {product.images?.map((image) => (
                                                <div
                                                    key={image.id}
                                                    className={`thumbnail ${selectedImage?.id === image.id ? 'active' : ''}`}
                                                    onClick={() => setSelectedImage(image)}
                                                    style={{ cursor: 'pointer', width: '80px', height: '80px' }}
                                                >
                                                    <Image
                                                        src={`/storage/${image.image_path}`}
                                                        alt={product.name}
                                                        fluid
                                                        className="h-100 w-100 rounded border"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </Col>
                                    <Col md={7}>
                                        <div className="d-flex justify-content-between align-items-start mb-2 border-bottom">
                                            <div>
                                                <h1 className="h3 mb-2 text-capitalize">{product.name}</h1>
                                                {product.brand && (
                                                    <div className="small">
                                                        <span className="text-muted">Brand: </span>
                                                        <Link href={`/brands/${product.brand.slug}`}>
                                                            {product.brand.name}
                                                        </Link>
                                                        {" | "}
                                                        <Link>
                                                            Similar products from  {product.brand.name}
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                                >
                                                    {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={handleShare}
                                                    title="Share this product"
                                                >
                                                    <FaShareAlt />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-3">
                                            {product.is_on_sale ? (
                                                <>
                                                    <span className="h4 text-danger me-2">${product.price}</span>
                                                    <span className="text-muted text-decoration-line-through me-2">${product.compare_price}</span>
                                                    <Badge bg="danger" className="align-middle">
                                                        {product.discount_percentage}% OFF
                                                    </Badge>
                                                </>
                                            ) : (
                                                <span className="h4">${product.price}</span>
                                            )}
                                        </div>

                                        {/* Stock Status */}
                                        <div className="mb-2">
                                            {product.quantity > 0 && product.low_stock_threshold > 0 && (
                                                <span className="text-muted small">
                                                    Only {product.quantity} items left
                                                </span>
                                            )}
                                        </div>

                                        {/* Short Description */}
                                        {product.short_description && (
                                            <div className="mb-2">
                                                <p className="text-muted">{product.short_description}</p>
                                            </div>
                                        )}

                                        {/* Rating */}
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="me-2">
                                                {renderStars()}
                                            </div>
                                            <span className="text-muted small me-2">
                                                {averageRating} ({product.reviews?.length || 0} reviews)
                                            </span>
                                            <Link href="#reviews" className="small">Write a review</Link>
                                        </div>

                                        {/* Variants */}
                                        {product.has_variants && product.variants?.length > 0 && (
                                            <div className="mb-2">
                                                <h6 className="mb-2">Options:</h6>
                                                {product.variants.map(variant => (
                                                    <Button
                                                        key={variant.id}
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="me-2 mb-2"
                                                    >
                                                        {variant.name}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Quantity and Add to Cart */}
                                        <div className="mb-2">
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="mb-0 me-3">Quantity:</h6>
                                                <InputGroup style={{ width: '140px' }}>
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() => handleQuantityChange('decrement')}
                                                        disabled={quantity <= 1}
                                                    >
                                                        <FaMinus />
                                                    </Button>
                                                    <Form.Control
                                                        type="number"
                                                        min="1"
                                                        value={quantity}
                                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                        className="text-center"
                                                    />
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() => handleQuantityChange('increment')}
                                                    >
                                                        <FaPlus />
                                                    </Button>
                                                </InputGroup>
                                            </div>
                                            <AddToCartBtn product={product} quantity={quantity} />
                                        </div>

                                        {/* Product Meta */}
                                        <div className="border-top pt-3">
                                            {product.category && (
                                                <div className="small">
                                                    <span className="text-muted">category: </span>
                                                    <Link href={`/categorys/${product.category.slug}`}>
                                                        {product.category.name}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={3}>
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Header className="bg-transparent h6 text-uppercase fw-semibold">
                                Delivery & Returns
                            </Card.Header>
                            <Card.Body>
                                {/* choose location */}
                                <h6>Choose your location</h6>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Product Tabs */}
                    <Col md={12}>
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Body className="p-0">
                                <Tabs
                                    activeKey={activeTab}
                                    onSelect={(k) => setActiveTab(k)}
                                    className="px-3 pt-3"
                                >
                                    <Tab eventKey="description" title="Description">
                                        <div className="p-3">
                                            {product.description ? (
                                                <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                            ) : (
                                                <p className="text-muted">No description available.</p>
                                            )}
                                        </div>
                                    </Tab>
                                    <Tab eventKey="specifications" title="Specifications">
                                        <div className="p-3">
                                            {product.specifications ? (
                                                <ListGroup variant="flush">
                                                    {Object.entries(product.specifications).map(([key, value]) => (
                                                        <ListGroup.Item key={key} className="d-flex border-0 px-0 py-2">
                                                            <span className="fw-bold me-2" style={{ minWidth: '150px' }}>{key}:</span>
                                                            <span>{value}</span>
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            ) : (
                                                <p className="text-muted">No specifications available.</p>
                                            )}
                                        </div>
                                    </Tab>
                                    <Tab eventKey="reviews" title={`Reviews (${product.reviews?.length || 0})`}>
                                        <div className="p-3" id="reviews">
                                            {product.reviews?.length > 0 ? (
                                                <>
                                                    {product.reviews.map(review => (
                                                        <div key={review.id} className="mb-4 border-bottom pb-3">
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <h6 className="mb-0">{review.customer_name}</h6>
                                                                <div className="text-warning">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        i < review.rating ? <FaStar key={i} /> : <FaRegStar key={i} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <p className="text-muted small mb-1">{new Date(review.created_at).toLocaleDateString()}</p>
                                                            <p className="mb-1">{review.comment}</p>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <p className="text-muted">No reviews yet. Be the first to review!</p>
                                            )}
                                            <div className="mt-4">
                                                <h5>Write a Review</h5>
                                                <Form>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Rating</Form.Label>
                                                        <div>
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <FaStar
                                                                    key={star}
                                                                    className="text-warning me-1"
                                                                    style={{ cursor: 'pointer' }}
                                                                    size={24}
                                                                />
                                                            ))}
                                                        </div>
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Your Name</Form.Label>
                                                        <Form.Control type="text" placeholder="Enter your name" />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Your Review</Form.Label>
                                                        <Form.Control as="textarea" rows={3} placeholder="Write your review here" />
                                                    </Form.Group>
                                                    <Button variant="primary">Submit Review</Button>
                                                </Form>
                                            </div>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Related Products */}
                    {product.related_products && product.related_products.length > 0 && (
                        <Col md={12}>
                            <Card className="border-0 rounded shadow-sm mb-3">
                                <Card.Header className="border-0 h6 fw-semibold text-capitalize">
                                    Related Products
                                </Card.Header>
                                <Card.Body className="p-2">
                                    <SlickSlider {...settings}>
                                        {product.related_products.map((item) => (
                                            <ProductCard key={item.id} item={item} />
                                        ))}
                                    </SlickSlider>
                                </Card.Body>
                            </Card>
                        </Col>
                    )}
                </Row>
            </Container>


            {/* Share Modal */}
            <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Share this product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-around mb-4">
                        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            <Button variant="outline-primary" className="rounded-circle p-3">
                                <FaFacebook size={24} />
                            </Button>
                            <div className="text-center mt-2 small">Facebook</div>
                        </a>
                        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            <Button variant="outline-info" className="rounded-circle p-3">
                                <FaTwitter size={24} />
                            </Button>
                            <div className="text-center mt-2 small">Twitter</div>
                        </a>
                        <a href={shareLinks.pinterest} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            <Button variant="outline-danger" className="rounded-circle p-3">
                                <FaPinterest size={24} />
                            </Button>
                            <div className="text-center mt-2 small">Pinterest</div>
                        </a>
                        <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            <Button variant="outline-success" className="rounded-circle p-3">
                                <FaWhatsapp size={24} />
                            </Button>
                            <div className="text-center mt-2 small">WhatsApp</div>
                        </a>
                        <a href={shareLinks.email} className="text-decoration-none">
                            <Button variant="outline-secondary" className="rounded-circle p-3">
                                <FaEnvelope size={24} />
                            </Button>
                            <div className="text-center mt-2 small">Email</div>
                        </a>
                    </div>
                    <Form.Group>
                        <Form.Label>Or copy link</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={window.location.href} readOnly />
                            <Button
                                variant="outline-secondary"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                }}
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