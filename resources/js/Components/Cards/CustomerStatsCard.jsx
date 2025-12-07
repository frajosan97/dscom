import React from "react";
import { Card } from "react-bootstrap";
import PropTypes from "prop-types";

const CustomerStatsCard = ({
    title,
    value,
    icon,
    color = "primary",
    subtitle,
    trend,
    onClick,
    className = "",
}) => {
    const colorMap = {
        primary:
            "bg-primary bg-opacity-10 text-primary border-primary border-opacity-25",
        secondary:
            "bg-secondary bg-opacity-10 text-secondary border-secondary border-opacity-25",
        success:
            "bg-success bg-opacity-10 text-success border-success border-opacity-25",
        danger: "bg-danger bg-opacity-10 text-danger border-danger border-opacity-25",
        warning:
            "bg-warning bg-opacity-10 text-warning border-warning border-opacity-25",
        info: "bg-info bg-opacity-10 text-info border-info border-opacity-25",
        dark: "bg-dark bg-opacity-10 text-dark border-dark border-opacity-25",
        light: "bg-light bg-opacity-25 text-dark border-light",
    };

    return (
        <Card
            className={`border-0 shadow-sm hover-lift ${colorMap[color]} p-3 ${className}`}
            onClick={onClick}
            style={{
                cursor: onClick ? "pointer" : "default",
                transition: "all 0.3s ease",
                minHeight: "120px",
            }}
        >
            <Card.Body className="p-0">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                            <div
                                className={`rounded-circle p-2 me-3 bg-${color} bg-opacity-25`}
                            >
                                <div className={`text-${color} h4 mb-0`}>
                                    {icon}
                                </div>
                            </div>
                            <div>
                                <div className="text-muted small mb-1">
                                    {title}
                                </div>
                                <div className="fw-bold h3 mb-0">{value}</div>
                            </div>
                        </div>

                        {subtitle && (
                            <div className="text-muted small mb-2">
                                {subtitle}
                            </div>
                        )}

                        {trend && (
                            <div className="d-flex align-items-center">
                                <span
                                    className={`badge bg-${getTrendColor(
                                        trend
                                    )} bg-opacity-25 text-${getTrendColor(
                                        trend
                                    )} me-2`}
                                >
                                    {trend.includes("+") ? "↗" : "↘"} {trend}
                                </span>
                                <span
                                    className={`text-${getTrendColor(
                                        trend
                                    )} small`}
                                >
                                    {trend.includes("+")
                                        ? "Increase"
                                        : "Decrease"}
                                </span>
                            </div>
                        )}
                    </div>

                    {trend && (
                        <div className={`text-${getTrendColor(trend)} h4`}>
                            {trend.includes("+") ? "📈" : "📉"}
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

const getTrendColor = (trend) => {
    if (!trend) return "secondary";
    if (trend.includes("+")) return "success";
    if (trend.includes("-")) return "danger";
    return "secondary";
};

CustomerStatsCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.element.isRequired,
    color: PropTypes.oneOf([
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "dark",
        "light",
    ]),
    subtitle: PropTypes.string,
    trend: PropTypes.string,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

CustomerStatsCard.defaultProps = {
    color: "primary",
    className: "",
};

export default CustomerStatsCard;
