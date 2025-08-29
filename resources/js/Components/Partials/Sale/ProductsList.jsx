import ProductCard from "@/Components/Settings/ProductCard";
import useData from "@/Hooks/useData";
import {
    Card,
    Col,
    FormControl,
    InputGroup,
    Row,
    Spinner,
    Alert,
} from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { useState, useMemo, useCallback } from "react";

const ProductsList = () => {
    const { products, isLoading } = useData();
    const [searchTerm, setSearchTerm] = useState("");

    // Filter products based on search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return products;

        const term = searchTerm.toLowerCase().trim();
        return products.filter(
            (product) =>
                product.barcode?.toLowerCase().includes(term) ||
                product.name?.toLowerCase().includes(term) ||
                product.specifications?.toLowerCase().includes(term) ||
                product.description?.toLowerCase().includes(term)
        );
    }, [products, searchTerm]);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchTerm("");
    }, []);

    return (
        <Card className="border-0 rounded-0 shadow-sm">
            <Card.Header className="bg-white fw-bold py-2">
                <InputGroup>
                    <InputGroup.Text className="rounded-0 bg-light">
                        <FaSearch />
                    </InputGroup.Text>
                    <FormControl
                        type="search"
                        placeholder="Search by barcode, name, specifications..."
                        className="rounded-0"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        autoFocus
                    />
                </InputGroup>
            </Card.Header>
            <Card.Body>
                {isLoading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <div className="text-center">
                            <Spinner animation="border" variant="primary" />
                            <h6 className="mt-2 text-muted">
                                Loading products...
                            </h6>
                        </div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-5">
                        {searchTerm ? (
                            <Alert variant="light" className="rounded-0">
                                <h6>No products found</h6>
                                <p className="text-muted mb-0">
                                    No products match "
                                    <strong>{searchTerm}</strong>"
                                </p>
                            </Alert>
                        ) : (
                            <Alert variant="light" className="rounded-0">
                                <h6>No products available</h6>
                                <p className="text-muted mb-0">
                                    Please add products to get started
                                </p>
                            </Alert>
                        )}
                    </div>
                ) : (
                    <Row className="g-2">
                        {filteredProducts.map((product) => (
                            <Col xs={6} md={4} lg={3} xl={2} key={product.id}>
                                <ProductCard systemMode="erp" item={product} />
                            </Col>
                        ))}
                    </Row>
                )}
            </Card.Body>
        </Card>
    );
};

export default ProductsList;
