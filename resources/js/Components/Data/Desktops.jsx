import { Card, Container } from "react-bootstrap";
import ProductsList from "./ProductsList";

export default function DesktopsList() {
    return (
        <Container fluid className="product-listing bg-white border-top py-4">
            <Card className="border-0 shadow-none">
                <Card.Body className="pt-0 px-0">
                    <ProductsList categoryName={"desktops"} />
                </Card.Body>
            </Card>
        </Container>
    );
}
