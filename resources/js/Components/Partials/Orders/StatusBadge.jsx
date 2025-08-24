import { Badge } from "react-bootstrap";

export default function StatusBadge({ status }) {
    switch (status) {
        case "pending":
            return (
                <Badge bg="danger">
                    <i className="bi bi-hourglass-split me-1"></i> Pending
                </Badge>
            );
        case "confirmed":
            return (
                <Badge bg="primary">
                    <i className="bi bi-check-circle me-1"></i> Confirmed
                </Badge>
            );
        case "processing":
            return (
                <Badge bg="info">
                    <i className="bi bi-gear-wide-connected me-1"></i>{" "}
                    Processing
                </Badge>
            );
        case "shipped":
            return (
                <Badge bg="warning" text="dark">
                    <i className="bi bi-truck me-1"></i> Shipped
                </Badge>
            );
        case "delivered":
            return (
                <Badge bg="success">
                    <i className="bi bi-check2-all me-1"></i> Delivered
                </Badge>
            );
        case "cancelled":
            return (
                <Badge bg="danger">
                    <i className="bi bi-x-circle me-1"></i> Cancelled
                </Badge>
            );
        case "refunded":
            return (
                <Badge bg="info">
                    <i className="bi bi-arrow-counterclockwise me-1"></i>{" "}
                    Refunded
                </Badge>
            );
        case "partially_refunded":
            return (
                <Badge bg="info">
                    <i className="bi bi-arrow-counterclockwise me-1"></i>{" "}
                    Partially Refunded
                </Badge>
            );
        case "on_hold":
            return (
                <Badge bg="warning" text="dark">
                    <i className="bi bi-pause-circle me-1"></i> On Hold
                </Badge>
            );
        case "failed":
            return (
                <Badge bg="danger">
                    <i className="bi bi-exclamation-octagon me-1"></i> Failed
                </Badge>
            );
        case "completed":
            return (
                <Badge bg="success">
                    <i className="bi bi-check2-circle me-1"></i> Completed
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
