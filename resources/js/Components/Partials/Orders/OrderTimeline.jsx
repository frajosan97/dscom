import { ListGroup } from "react-bootstrap";
import { format } from "date-fns";

export default function OrderTimeline({ history }) {
    if (!history || history.length === 0) {
        return (
            <div className="text-center text-muted py-4">
                <i className="bi bi-clock-history fs-1"></i>
                <p className="mt-2">No status history available</p>
            </div>
        );
    }

    return (
        <ListGroup variant="flush">
            {history.map((item, index) => (
                <ListGroup.Item
                    key={index}
                    className="border-start-0 border-end-0"
                >
                    <div className="d-flex justify-content-between">
                        <div>
                            <strong>{item.status}</strong>
                            {item.note && (
                                <div className="text-muted small mt-1">
                                    {item.note}
                                </div>
                            )}
                        </div>
                        <div className="text-muted small">
                            {format(
                                new Date(item.created_at),
                                "MMM dd, yyyy HH:mm"
                            )}
                        </div>
                    </div>
                    {index < history.length - 1 && (
                        <div className="vr position-absolute h-100 ms-3"></div>
                    )}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}
