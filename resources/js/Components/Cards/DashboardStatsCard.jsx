import React from "react";
import { Card } from "react-bootstrap";

const DashboardStatsCard = ({ title, amount, subtitle, icon, color }) => (
    <Card
        className={`border-0 border-start border-5 border-${color} bg-${color} bg-opacity-10 shadow-sm h-100`}
    >
        <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
                <h6 className="text-muted mb-2">{title}</h6>
                <h3 className="mb-0">{amount}</h3>
                <small className={`text-${color}`}>{subtitle}</small>
            </div>

            <div
                className={`rounded-circle bg-${color} bg-opacity-10 d-flex align-items-center justify-content-center`}
                style={{ width: 45, height: 45, fontSize: 35 }}
            >
                {icon}
            </div>
        </Card.Body>
    </Card>
);

export default DashboardStatsCard;
