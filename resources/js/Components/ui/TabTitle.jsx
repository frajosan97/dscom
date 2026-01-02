export default function TabTitle({ icon, label, count }) {
    return (
        <span className="d-flex align-items-center">
            {icon} <span className="ms-2">{label}</span>
            {count > 0 && (
                <span className="ms-2 bg-primary text-white rounded-pill px-2 py-1">
                    {count}
                </span>
            )}
        </span>
    );
}
