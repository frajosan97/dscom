import { Badge, Card } from "react-bootstrap";
import AddToCartBtn from "../Settings/AddToCartBtn";
import { Link } from "@inertiajs/react";

export default function ProductCard({ item }) {

    return (
        <Card className="h-100 product-card">
            <div className="position-relative">
                <Card.Img
                    src={`/storage/${item.default_image.image_path}`}
                    alt={item.name}
                    className="product-image"
                    variant="top"
                />
                <div className="product-badges position-absolute top-0 start-0 m-2">
                    {item.isNew && (
                        <Badge bg="success" className="me-1">New</Badge>
                    )}
                    {item.isBestSeller && (
                        <Badge bg="danger" className="me-1">Bestseller</Badge>
                    )}
                    {item.compare_price && (
                        <Badge bg="info">
                            {Math.round((1 - item.price / item.compare_price) * 100)}% OFF
                        </Badge>
                    )}
                </div>
            </div>

            <Card.Body
                className="d-flex flex-column text-decoration-none"
                as={Link}
                href={route("product.show", item.slug)}
            >
                {/* Title */}
                <Card.Title className="product-name text-truncate text-capitalize">
                    {item.name}
                </Card.Title>

                {/* Specs / short description*/}
                {item.specs && item.specs.map((spec, idx) => (
                    <Card.Text>
                        <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                            {spec}
                        </Badge>
                    </Card.Text>
                ))}

                <Card.Text className="d-flex align-items-center">
                    <h4 className="mb-0 product-price">${item.price}</h4>
                    {item.compare_price && (
                        <del className="ms-2 text-danger small">
                            ${item.compare_price}
                        </del>
                    )}
                </Card.Text>
            </Card.Body>
            <Card.Footer>
                <AddToCartBtn product={item} />
            </Card.Footer>
        </Card>
    )
}