import { Badge } from "react-bootstrap";

export default function StatusBadge({ status }) {
    const statusColors = {
        active: "success",
        completed: "success",
        present: "success",
        pending: "warning",
        in_progress: "info",
        late: "warning",
        absent: "danger",
        cancelled: "danger",
        on_time: "success",
        paid: "success",
        unpaid: "danger",
        processing: "info",
    };

    const formattedStatus = status?.replace("_", " ") || "Unknown";

    return (
        <Badge bg={statusColors[status] || "secondary"} pill>
            {formattedStatus}
        </Badge>
    );
}
