import { Card, Container } from "react-bootstrap";
import ProductsList from "./ProductsList";

export default function LaptopsList() {
    return (
        <Container fluid className="product-listing bg-white border-top py-4">
            <Card className="border-0 shadow-none">
                <Card.Body className="pt-0 px-0">
                    <ProductsList
                        categoryName={'laptops'}
                    />
                </Card.Body>
            </Card>
        </Container>
    );
}