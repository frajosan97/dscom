export default function InfoRow({ label, value, isCurrency = false, icon }) {
    return (
        <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted d-flex align-items-center">
                {icon && <span className="me-2">{icon}</span>}
                {label}
            </span>
            <span className={`fw-bold ${isCurrency ? "text-success" : ""}`}>
                {value}
            </span>
        </div>
    );
}
