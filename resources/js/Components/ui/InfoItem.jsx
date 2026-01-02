export default function InfoItem({
    label,
    value,
    fallback = "—",
    isHighlight = false,
}) {
    return (
        <div className="px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
            <span className="text-muted">{label}</span>
            <span
                className={`fw-semibold text-end ${
                    isHighlight ? "text-primary" : ""
                }`}
            >
                {value || fallback}
            </span>
        </div>
    );
}
