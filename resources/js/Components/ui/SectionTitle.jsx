export default function SectionTitle({ icon, title }) {
    return (
        <h6 className="fw-semibold mb-3 text-primary d-flex align-items-center">
            {icon} <span className="ms-2">{title}</span>
        </h6>
    );
}
