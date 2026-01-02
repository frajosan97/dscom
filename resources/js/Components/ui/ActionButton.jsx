import { Button } from "react-bootstrap";

export default function ActionButton({
    icon,
    label,
    variant,
    onClick,
    disabled = false,
}) {
    return (
        <Button
            variant={variant}
            className="rounded-pill text-start d-flex align-items-center"
            onClick={onClick}
            disabled={disabled}
        >
            {icon} <span className="ms-2">{label}</span>
        </Button>
    );
}
