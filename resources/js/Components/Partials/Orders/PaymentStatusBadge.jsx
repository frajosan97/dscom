import { Badge } from "react-bootstrap";

export default function PaymentStatusBadge({ status }) {
    switch (status) {
        case "pending":
            return (
                <Badge bg="danger">
                    <i className="bi bi-hourglass-split me-1"></i> Pending
                </Badge>
            );
        case "paid":
            return (
                <Badge bg="success">
                    <i className="bi bi-currency-dollar me-1"></i> Paid
                </Badge>
            );
        case "failed":
            return (
                <Badge bg="danger">
                    <i className="bi bi-exclamation-octagon me-1"></i> Failed
                </Badge>
            );
        case "partially_paid":
            return (
                <Badge bg="warning" text="dark">
                    <i className="bi bi-currency-exchange me-1"></i> Partially
                    Paid
                </Badge>
            );
        case "refunded":
            return (
                <Badge bg="info">
                    <i className="bi bi-arrow-counterclockwise me-1"></i>{" "}
                    Refunded
                </Badge>
            );
        default:
            return (
                <Badge bg="primary">
                    <i className="bi bi-question-circle me-1"></i> Unknown
                </Badge>
            );
    }
}
