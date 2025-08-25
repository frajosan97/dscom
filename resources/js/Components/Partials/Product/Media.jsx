import { Card } from "react-bootstrap";

export default function MediaTab({ renderImages }) {
    return (
        <Card className="border-0 rounded-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-semibold text-capitalize">
                    Product Images
                </h6>
            </Card.Header>
            <Card.Body>{renderImages()}</Card.Body>
        </Card>
    );
}
