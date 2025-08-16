import { Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "@inertiajs/react";
import ProductsList from "./ProductsList";

export default function PhonesWithBannerList() {
    return (
        <Container fluid className="product-listing bg-white border-top py-4">
            <Card className="border-0 shadow-none">
                <Card.Body className="pt-0 px-0">
                    <Row>
                        <Col md={3} className="mb-4 mb-md-0">
                            <Card className="h-100 phone-banner">
                                <Card.Body className="text-center">
                                    <p className="text-white">Mobile does everything</p>
                                    <h4 className="mb-3 text-white-50">Work, Play, Connect</h4>
                                    <Link className="action-link">
                                        Buy Now
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={9}>
                            <div className="d-flex justify-content-between align-items-center bg-white border-0 pb-3">
                                <div>
                                    <h2 className="mb-0">Improve your mobile</h2>
                                </div>
                                <Link className="action-link">
                                    View All <i className="bi bi-arrow-right"></i>
                                </Link>
                            </div>

                            <ProductsList
                                categoryName={'phones'}
                                withBanner={true}
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}