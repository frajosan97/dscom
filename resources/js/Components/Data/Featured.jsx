import React from "react";
import { Badge, ListGroup, Spinner, Container, Row, Col, Stack, Alert } from "react-bootstrap";
import { Star } from "react-feather";
import { Link } from "@inertiajs/react";
import useFilterOptions from "@/Hooks/useData";

export default function FeatureList() {
    const { products, isLoading } = useFilterOptions();
    const featuredProducts = products?.filter(product => product.is_featured) || [];

    const renderRatingStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={14}
                fill={i < Math.floor(rating) ? "#FFD700" : "none"}
                stroke={i < Math.floor(rating) ? "#FFD700" : "#ccc"}
                className="me-1"
            />
        ));
    };

    if (isLoading) {
        return (
            <Container className="text-center py-4">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (featuredProducts.length === 0) {
        return (
            <Alert variant="info" className="text-center">
                No featured products found
            </Alert>
        );
    }

    return (
        <ListGroup variant="flush">
            {featuredProducts.map((product) => (
                <ListGroup.Item
                    key={product.id}
                    action
                    as={Link}
                    href={route("product.show", product.slug)}
                    className="py-3"
                >
                    <Row className="align-items-center g-3">
                        <Col xs="auto">
                            <div className="position-relative">
                                <img
                                    src={`/storage/${product.default_image?.image_path}`}
                                    alt={product.name}
                                    className="rounded"
                                    loading="lazy"
                                    width="80"
                                    height="80"
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/images/placeholder-product.png';
                                    }}
                                />
                                {product.badge && (
                                    <Badge
                                        bg={product.badge === "New" ? "success" : "danger"}
                                        className="position-absolute top-0 start-0 translate-middle"
                                        pill
                                    >
                                        {product.badge}
                                    </Badge>
                                )}
                            </div>
                        </Col>
                        <Col>
                            <Stack gap={1}>
                                <h6 className="mb-0 text-truncate">{product.name}</h6>
                                <div className="d-flex align-items-center">
                                    <div className="d-flex me-2">
                                        {renderRatingStars(product.rating)}
                                    </div>
                                    <small className="text-muted">
                                        ({product.reviewCount} reviews)
                                    </small>
                                </div>
                                <div>
                                    <span className="fw-bold text-primary me-2">
                                        ${product.price}
                                    </span>
                                    {product.compare_price && (
                                        <del className="text-muted small">
                                            ${product.compare_price}
                                        </del>
                                    )}
                                </div>
                            </Stack>
                        </Col>
                    </Row>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}