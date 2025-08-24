import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    FiPackage,
    FiCheckCircle,
    FiTruck,
    FiHome,
    FiSearch,
    FiMapPin,
    FiCalendar,
    FiDollarSign,
} from "react-icons/fi";
import AppLayout from "@/Layouts/AppLayout";
import axios from "axios";
import {
    Container,
    Card,
    Form,
    InputGroup,
    Button,
    ProgressBar,
    Row,
    Col,
    Image,
    Alert,
    Spinner,
    ListGroup,
    Badge,
} from "react-bootstrap";

export default function OrderTracking({ initialOrder }) {
    const [activeStep, setActiveStep] = useState("placed");
    const [trackingId, setTrackingId] = useState("");
    const [searchPerformed, setSearchPerformed] = useState(!!initialOrder);
    const [order, setOrder] = useState(initialOrder || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Define order status steps
    const steps = [
        {
            id: "placed",
            label: "Order Placed",
            icon: <FiCheckCircle />,
            description: "Your order has been received",
        },
        {
            id: "processed",
            label: "Processing",
            icon: <FiPackage />,
            description: "We're preparing your order",
        },
        {
            id: "shipped",
            label: "Shipped",
            icon: <FiTruck />,
            description: "Your order is on the way",
        },
        {
            id: "delivered",
            label: "Delivered",
            icon: <FiHome />,
            description: "Your order has been delivered",
        },
    ];

    // Calculate progress percentage
    const progressPercentage =
        ((steps.findIndex((step) => step.id === activeStep) + 1) /
            steps.length) *
        100;

    const fetchOrder = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(route("order.track", id));
            setOrder(response.data);
            setActiveStep(response.data.status || "placed");
            setSearchPerformed(true);
        } catch (err) {
            setError("No order found with the provided tracking ID.");
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (trackingId.trim()) {
            fetchOrder(trackingId);
        }
    };

    // If initialOrder is passed as prop (server-side), set it up
    useEffect(() => {
        if (initialOrder) {
            setOrder(initialOrder);
            setActiveStep(initialOrder.status || "placed");
        }
    }, [initialOrder]);

    return (
        <AppLayout>
            <Head title="Track Your Order" />

            <Container className="my-5">
                <Card className="border-0 shadow-sm p-4">
                    <Card.Body>
                        <div className="text-center mb-4">
                            <h1>Track Your Order</h1>
                            <p className="text-muted">
                                Enter your order ID or tracking number to check
                                the status
                            </p>
                        </div>

                        {/* Search Form */}
                        <Form onSubmit={handleSearch} className="mb-4">
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your order ID or tracking number"
                                    value={trackingId}
                                    onChange={(e) =>
                                        setTrackingId(e.target.value)
                                    }
                                    required
                                />
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                            <span className="ms-2">
                                                Searching...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <FiSearch className="me-2" />
                                            Track Order
                                        </>
                                    )}
                                </Button>
                            </InputGroup>
                        </Form>

                        {loading && (
                            <Alert variant="info" className="text-center">
                                <Spinner
                                    animation="border"
                                    size="sm"
                                    className="me-2"
                                />
                                Searching for your order...
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="danger" className="text-center">
                                <p>{error}</p>
                                <p className="mb-0">
                                    Please check your order number and try
                                    again.
                                </p>
                            </Alert>
                        )}

                        {order && (
                            <>
                                {/* Order Overview */}
                                <Card className="mb-4">
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <h2>Order #{order.id}</h2>
                                                <ListGroup variant="flush">
                                                    <ListGroup.Item>
                                                        <FiCalendar className="me-2" />
                                                        Placed on{" "}
                                                        {new Date(
                                                            order.created_at
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </ListGroup.Item>
                                                    <ListGroup.Item>
                                                        <FiMapPin className="me-2" />
                                                        Estimated delivery:{" "}
                                                        {order.estimated_delivery
                                                            ? new Date(
                                                                  order.estimated_delivery
                                                              ).toLocaleDateString(
                                                                  "en-US",
                                                                  {
                                                                      year: "numeric",
                                                                      month: "long",
                                                                      day: "numeric",
                                                                  }
                                                              )
                                                            : "Calculating..."}
                                                    </ListGroup.Item>
                                                </ListGroup>
                                            </Col>
                                            <Col md={6}>
                                                <div className="mt-3 mt-md-0">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span>
                                                            Order Status
                                                        </span>
                                                        <strong>
                                                            {
                                                                steps.find(
                                                                    (step) =>
                                                                        step.id ===
                                                                        activeStep
                                                                )?.label
                                                            }
                                                        </strong>
                                                    </div>
                                                    <ProgressBar
                                                        now={progressPercentage}
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Order Status Timeline */}
                                <Card className="mb-4">
                                    <Card.Body>
                                        <h3 className="mb-4">Order Status</h3>
                                        <div className="timeline">
                                            {steps.map((step, index) => (
                                                <div
                                                    key={step.id}
                                                    className={`timeline-step ${
                                                        activeStep === step.id
                                                            ? "active"
                                                            : ""
                                                    } ${
                                                        steps.findIndex(
                                                            (s) =>
                                                                s.id ===
                                                                activeStep
                                                        ) > index
                                                            ? "completed"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="step-icon-container">
                                                        <div className="step-icon">
                                                            {step.icon}
                                                        </div>
                                                        {index <
                                                            steps.length -
                                                                1 && (
                                                            <div className="step-connector"></div>
                                                        )}
                                                    </div>
                                                    <div className="step-content">
                                                        <h4>{step.label}</h4>
                                                        <p className="text-muted">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Order Details */}
                                <Row className="mb-4">
                                    {/* Order Items */}
                                    <Col md={8} className="mb-4 mb-md-0">
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>
                                                    Order Items
                                                </Card.Title>
                                                <ListGroup variant="flush">
                                                    {order.items?.map(
                                                        (item, i) => (
                                                            <ListGroup.Item
                                                                key={i}
                                                            >
                                                                <Row className="align-items-center">
                                                                    <Col
                                                                        xs={3}
                                                                        md={2}
                                                                    >
                                                                        <Image
                                                                            src={
                                                                                item.image ||
                                                                                "https://via.placeholder.com/80"
                                                                            }
                                                                            alt={
                                                                                item.name
                                                                            }
                                                                            fluid
                                                                            rounded
                                                                        />
                                                                    </Col>
                                                                    <Col
                                                                        xs={6}
                                                                        md={8}
                                                                    >
                                                                        <h5 className="mb-1">
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </h5>
                                                                        <div className="d-flex justify-content-between">
                                                                            <span>
                                                                                Qty:{" "}
                                                                                {
                                                                                    item.quantity
                                                                                }
                                                                            </span>
                                                                            <span>
                                                                                $
                                                                                {item.price.toFixed(
                                                                                    2
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </Col>
                                                                    <Col
                                                                        xs={3}
                                                                        md={2}
                                                                        className="text-end"
                                                                    >
                                                                        <Badge
                                                                            bg="light"
                                                                            text="dark"
                                                                        >
                                                                            $
                                                                            {(
                                                                                item.price *
                                                                                item.quantity
                                                                            ).toFixed(
                                                                                2
                                                                            )}
                                                                        </Badge>
                                                                    </Col>
                                                                </Row>
                                                            </ListGroup.Item>
                                                        )
                                                    )}
                                                </ListGroup>
                                                <div className="d-flex justify-content-between mt-3 fw-bold fs-5">
                                                    <span>Total</span>
                                                    <span>
                                                        $
                                                        {order.total?.toFixed(
                                                            2
                                                        )}
                                                    </span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    {/* Shipping Information */}
                                    <Col md={4}>
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>
                                                    Shipping Information
                                                </Card.Title>
                                                <ListGroup variant="flush">
                                                    <ListGroup.Item>
                                                        <h5>Tracking Number</h5>
                                                        <p className="text-muted">
                                                            {
                                                                order.tracking_number
                                                            }
                                                        </p>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item>
                                                        <h5>Carrier</h5>
                                                        <p className="text-muted">
                                                            {order.carrier}
                                                        </p>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item>
                                                        <h5>
                                                            Shipping Address
                                                        </h5>
                                                        <p className="text-muted">
                                                            {
                                                                order.shipping_address
                                                            }
                                                        </p>
                                                    </ListGroup.Item>
                                                </ListGroup>
                                                <Button
                                                    variant="outline-primary"
                                                    className="w-100 mt-3"
                                                >
                                                    Track Package on Carrier
                                                    Website
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Delivery Map Placeholder */}
                                <Card>
                                    <Card.Body className="p-0">
                                        <Card.Title className="p-3">
                                            Delivery Progress
                                        </Card.Title>
                                        <div className="position-relative">
                                            <div
                                                className="map-placeholder"
                                                style={{
                                                    height: "300px",
                                                    backgroundColor: "#f5f5f5",
                                                }}
                                            ></div>
                                            <div
                                                className="position-absolute top-50 start-50 translate-middle text-center p-3 bg-white rounded shadow-sm"
                                                style={{ width: "80%" }}
                                            >
                                                <h4>Package in Transit</h4>
                                                <p className="text-muted">
                                                    Your package is on its way
                                                    to the destination
                                                </p>
                                                <Button variant="primary">
                                                    View Full Tracking Details
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </AppLayout>
    );
}
