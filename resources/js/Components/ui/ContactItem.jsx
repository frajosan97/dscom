import { ListGroup } from "react-bootstrap";

export default function ContactItem({ icon, label, value, fallback, action }) {
    return (
        <ListGroup.Item className="d-flex align-items-center px-0 py-2 border-bottom">
            <span className="text-primary me-3 flex-shrink-0">{icon}</span>
            <div className="flex-grow-1">
                <small className="text-muted d-block">{label}</small>
                {action ? (
                    <a href={action} className="text-decoration-none">
                        {value || fallback}
                    </a>
                ) : (
                    <span className={!value ? "text-muted" : ""}>
                        {value || fallback}
                    </span>
                )}
            </div>
        </ListGroup.Item>
    );
}
