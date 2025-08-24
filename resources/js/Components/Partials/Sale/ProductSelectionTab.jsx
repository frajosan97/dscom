import { Card, InputGroup, Form, Row, Col, Badge } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";

export default function ProductSelectionTab({
    products,
    searchTerm,
    setSearchTerm,
    addProduct,
}) {
    return (
        <>
            <Form.Group controlId="productSearch" className="mb-4">
                <InputGroup>
                    <InputGroup.Text>
                        <Search />
                    </InputGroup.Text>
                    <Form.Control
                        type="search"
                        placeholder="Search products by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="py-2"
                    />
                </InputGroup>
            </Form.Group>

            <Row className="products-grid">
                {products.slice(0, 4).map((product) => (
                    <Col xs={6} md={4} lg={3} key={product.id}>
                        <Card
                            className="product-card"
                            style={{ cursor: "pointer" }}
                            onClick={() => addProduct(product)}
                        >
                            <Card.Img
                                variant="top"
                                src={`/storage/${product.default_image?.image_path}`}
                            />
                            <Card.Body>
                                <Card.Title className="text-truncate">
                                    {product.name}
                                </Card.Title>
                                <Card.Text>${product.price}</Card.Text>
                                <Badge bg="secondary">{product.code}</Badge>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );
}
