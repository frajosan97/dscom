import { useState } from "react";
import {
    Row,
    Col,
    Card,
    ProgressBar,
    Badge,
    Button,
    Form,
} from "react-bootstrap";
import { Star, GraphUp, Award, Calendar, Plus } from "react-bootstrap-icons";
import { formatDate } from "@/Utils/helpers";

export default function PerformanceTab({ employee }) {
    const [metrics] = useState([
        { label: "Quality of Work", value: 85, target: 90 },
        { label: "Productivity", value: 92, target: 85 },
        { label: "Team Collaboration", value: 78, target: 80 },
        { label: "Initiative", value: 88, target: 85 },
        { label: "Punctuality", value: 95, target: 95 },
        { label: "Sales Performance", value: 89, target: 85 },
        { label: "Customer Satisfaction", value: 91, target: 90 },
        { label: "Goal Achievement", value: 87, target: 85 },
    ]);

    const [goals] = useState([
        {
            id: 1,
            title: "Increase sales by 15%",
            dueDate: "2024-03-31",
            progress: 65,
        },
        {
            id: 2,
            title: "Complete leadership training",
            dueDate: "2024-02-28",
            progress: 100,
        },
        {
            id: 3,
            title: "Improve customer satisfaction score",
            dueDate: "2024-04-15",
            progress: 40,
        },
    ]);

    const [reviews] = useState([
        {
            id: 1,
            rating: 4.5,
            date: "2024-01-15",
            reviewer: "John Manager",
            comments: "Excellent performance this quarter.",
        },
        {
            id: 2,
            rating: 4.0,
            date: "2023-10-20",
            reviewer: "Sarah Director",
            comments: "Good work on the project delivery.",
        },
        {
            id: 3,
            rating: 4.2,
            date: "2023-07-05",
            reviewer: "Michael Lead",
            comments: "Showing great initiative and leadership.",
        },
    ]);

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comments: "",
        reviewer: "",
    });

    const handleAddReview = () => {
        if (newReview.comments && newReview.reviewer) {
            console.log("Adding new review:", newReview);
            setShowReviewForm(false);
            setNewReview({ rating: 5, comments: "", reviewer: "" });
        }
    };

    const calculateOverallScore = () => {
        if (metrics.length === 0) return 0;
        const total = metrics.reduce((sum, metric) => sum + metric.value, 0);
        return Math.round(total / metrics.length);
    };

    return (
        <div>
            {/* Overall Score Card */}
            <Card className="border-0 bg-info text-white mb-4">
                <Card.Body className="text-center p-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                        <Award size={32} className="me-3" />
                        <div>
                            <h2 className="fw-bold mb-0">
                                {calculateOverallScore()}%
                            </h2>
                            <p className="mb-0">Overall Performance Score</p>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center gap-4">
                        <div className="text-center">
                            <div className="h4 fw-bold mb-1">92</div>
                            <small>Productivity</small>
                        </div>
                        <div className="text-center">
                            <div className="h4 fw-bold mb-1">85</div>
                            <small>Quality</small>
                        </div>
                        <div className="text-center">
                            <div className="h4 fw-bold mb-1">95</div>
                            <small>Attendance</small>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Row className="g-4">
                {/* Performance Metrics */}
                <Col lg={8}>
                    <Card className="border-0 bg-light h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-semibold mb-0 d-flex align-items-center">
                                    <GraphUp className="me-2" /> Performance
                                    Metrics
                                </h6>
                                <small className="text-muted">
                                    Last updated:{" "}
                                    {new Date().toLocaleDateString()}
                                </small>
                            </div>

                            {metrics.map((metric, index) => (
                                <div key={index} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <div className="d-flex align-items-center">
                                            <span className="me-2">
                                                {metric.label}
                                            </span>
                                            {metric.value >= metric.target ? (
                                                <Badge
                                                    bg="success"
                                                    className="py-1"
                                                >
                                                    ✓
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    bg="warning"
                                                    className="py-1"
                                                >
                                                    ↗
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="fw-bold">
                                            {metric.value}%{" "}
                                            <small className="text-muted">
                                                ({metric.target}% target)
                                            </small>
                                        </span>
                                    </div>
                                    <ProgressBar
                                        now={metric.value}
                                        max={100}
                                        variant={
                                            metric.value >= metric.target
                                                ? "success"
                                                : "warning"
                                        }
                                        style={{ height: "8px" }}
                                    />
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Goals & Reviews */}
                <Col lg={4}>
                    {/* Goals Section */}
                    <Card className="border-0 bg-light mb-3">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-semibold mb-0 d-flex align-items-center">
                                    <Award className="me-2" /> Goals
                                </h6>
                                <Button variant="outline-primary" size="sm">
                                    <Plus size={14} />
                                </Button>
                            </div>

                            {goals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className="mb-3 pb-3 border-bottom"
                                >
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="fw-semibold">
                                            {goal.title}
                                        </span>
                                        <small className="text-muted">
                                            Due:{" "}
                                            {formatDate(goal.dueDate, "MMM DD")}
                                        </small>
                                    </div>
                                    <ProgressBar
                                        now={goal.progress}
                                        label={`${goal.progress}%`}
                                        variant={
                                            goal.progress === 100
                                                ? "success"
                                                : goal.progress > 70
                                                ? "info"
                                                : "warning"
                                        }
                                        style={{ height: "6px" }}
                                    />
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quarterly Performance Chart Placeholder */}
            <Card className="border-0 bg-light mt-2">
                <Card.Body>
                    <h6 className="fw-semibold mb-3">
                        Quarterly Performance Trend
                    </h6>
                    <div className="text-center py-5 border rounded bg-white">
                        <GraphUp size={48} className="text-muted mb-3" />
                        <h5 className="text-muted">Performance Trend Chart</h5>
                        <small className="text-muted">
                            Visual representation of performance over time
                        </small>
                        <div className="mt-4">
                            <Button variant="outline-secondary" size="sm">
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}
