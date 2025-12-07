import React from "react";
import { Card } from "react-bootstrap";
import PropTypes from "prop-types";

const EmployeeStatsCard = ({
    title,
    value,
    icon,
    color = "primary",
    subtitle,
    trend,
    progress,
    size = "normal",
    onClick,
    className = "",
}) => {
    // Color mapping for consistent styling
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

    // Size configurations
    const sizeConfig = {
        small: {
            cardClass: "p-3",
            iconSize: "h4",
            valueSize: "h5",
            titleSize: "small",
            subtitleSize: "text-xs",
        },
        normal: {
            cardClass: "p-4",
            iconSize: "h3",
            valueSize: "h3",
            titleSize: "h6",
            subtitleSize: "small",
        },
        large: {
            cardClass: "p-4",
            iconSize: "display-6",
            valueSize: "display-6",
            titleSize: "h5",
            subtitleSize: "h6",
        },
    };

    const config = sizeConfig[size];

    return (
        <Card
            className={`border-0 shadow-sm transition-all h-100 hover-lift ${colorMap[color]} ${config.cardClass} ${className}`}
            onClick={onClick}
            style={{
                cursor: onClick ? "pointer" : "default",
                transition: "all 0.3s ease",
            }}
        >
            <Card.Body className="p-0">
                <div className="d-flex align-items-center justify-content-between">
                    {/* Left side - Icon and Main Content */}
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                            <div
                                className={`rounded-circle p-2 me-3 bg-${color} bg-opacity-25`}
                            >
                                <div
                                    className={`text-${color} ${config.iconSize} mb-0`}
                                >
                                    {icon}
                                </div>
                            </div>
                            <div>
                                <div
                                    className={`text-muted ${config.titleSize} mb-1`}
                                >
                                    {title}
                                </div>
                                <div
                                    className={`fw-bold ${config.valueSize} mb-0`}
                                >
                                    {value}
                                </div>
                            </div>
                        </div>

                        {/* Subtitle */}
                        {subtitle && (
                            <div
                                className={`text-muted ${config.subtitleSize} mb-2`}
                            >
                                {subtitle}
                            </div>
                        )}

                        {/* Trend Indicator */}
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
                                    className={`text-${getTrendColor(trend)} ${
                                        config.subtitleSize
                                    }`}
                                >
                                    {trend.includes("+")
                                        ? "Increase"
                                        : "Decrease"}{" "}
                                    from last period
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right side - Progress or Additional Info */}
                    <div className="text-end">
                        {progress !== undefined && progress !== null ? (
                            <div className="d-flex flex-column align-items-end">
                                <div className="mb-2">
                                    <div
                                        className={`text-${color} fw-bold ${config.iconSize}`}
                                    >
                                        {progress}%
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div
                                    className="progress"
                                    style={{ width: "80px", height: "6px" }}
                                >
                                    <div
                                        className={`progress-bar bg-${color}`}
                                        role="progressbar"
                                        style={{ width: `${progress}%` }}
                                        aria-valuenow={progress}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    />
                                </div>
                            </div>
                        ) : (
                            trend && (
                                <div
                                    className={`text-${getTrendColor(trend)} ${
                                        config.iconSize
                                    }`}
                                >
                                    {trend.includes("+") ? "📈" : "📉"}
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Full-width Progress Bar (alternative layout) */}
                {progress !== undefined &&
                    progress !== null &&
                    size !== "small" && (
                        <div className="mt-3">
                            <div className="d-flex justify-content-between mb-1">
                                <span
                                    className={`text-${color} ${config.subtitleSize}`}
                                >
                                    Progress
                                </span>
                                <span
                                    className={`text-${color} fw-bold ${config.subtitleSize}`}
                                >
                                    {progress}%
                                </span>
                            </div>
                            <div className="progress" style={{ height: "8px" }}>
                                <div
                                    className={`progress-bar bg-${color}`}
                                    role="progressbar"
                                    style={{ width: `${progress}%` }}
                                    aria-valuenow={progress}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                />
                            </div>
                        </div>
                    )}
            </Card.Body>
        </Card>
    );
};

/** Helper function to determine trend color */
const getTrendColor = (trend) => {
    if (!trend) return "secondary";
    if (trend.includes("+")) return "success";
    if (trend.includes("-")) return "danger";
    return "secondary";
};

/** PropTypes for type checking */
EmployeeStatsCard.propTypes = {
    /** Card title */
    title: PropTypes.string.isRequired,

    /** Main value to display */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

    /** Icon component */
    icon: PropTypes.element.isRequired,

    /** Color theme */
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

    /** Subtitle text */
    subtitle: PropTypes.string,

    /** Trend indicator (e.g., "+12.5%") */
    trend: PropTypes.string,

    /** Progress percentage (0-100) */
    progress: PropTypes.number,

    /** Size variant */
    size: PropTypes.oneOf(["small", "normal", "large"]),

    /** Click handler */
    onClick: PropTypes.func,

    /** Additional CSS classes */
    className: PropTypes.string,
};

/** Default props */
EmployeeStatsCard.defaultProps = {
    color: "primary",
    size: "normal",
    className: "",
};

export default EmployeeStatsCard;
