// @/Components/Cards/AttendanceStatsCard.jsx
import React from "react";
import { Card } from "react-bootstrap";

const AttendanceStatsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
}) => (
    <Card className={`border-0 shadow-sm hover-lift bg-${color} bg-opacity-10`}>
        <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <h6 className="text-muted mb-2">{title}</h6>
                    <h3 className="mb-0">{value}</h3>
                    <small className={`text-${color}`}>{subtitle}</small>
                </div>
                <div
                    className={`avatar-sm p-1 bg-${color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                >
                    <Icon className={`text-${color}`} size={24} />
                </div>
            </div>
        </Card.Body>
    </Card>
);

export default AttendanceStatsCard;
