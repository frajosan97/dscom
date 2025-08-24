import AppLayout from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import {
    FaPhone,
    FaWhatsapp,
    FaEnvelope,
    FaMapMarkerAlt,
    FaPaperPlane,
    FaClock,
} from "react-icons/fa";
import "../../../css/Contact.css";

export default function Contact() {
    const contacts = [
        {
            icon: <FaPhone size={24} />,
            title: "Call Us",
            info: "+243 (894) 779-059",
            link: "tel:+243894779059",
            color: "primary",
        },
        {
            icon: <FaWhatsapp size={24} />,
            title: "WhatsApp",
            info: "+243 (894) 779-059",
            link: "https://wa.me/243894779059",
            color: "success",
        },
        {
            icon: <FaEnvelope size={24} />,
            title: "Email Us",
            info: "info@dscomtechnologies.com",
            link: "mailto:info@dscomtechnologies.com",
            color: "danger",
        },
    ];

    const businessHours = [
        { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
        { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
        { day: "Sunday", hours: "Closed" },
    ];

    return (
        <AppLayout>
            <Head title="Contact Us" />

            <Container fluid className="px-0 contact-page">
                {/* Hero Section */}
                <section className="contact-hero-section bg-light py-5">
                    <Container>
                        <Row className="align-items-center">
                            <Col lg={6}>
                                <h1 className="display-4 fw-bold mb-3">
                                    Get in Touch
                                </h1>
                                <p className="lead mb-4">
                                    Have questions or need assistance? We're
                                    here to help! Reach out to our friendly team
                                    through any of these channels.
                                </p>
                            </Col>
                            <Col lg={6} className="d-none d-lg-block">
                                <div className="contact-hero-image">
                                    <img
                                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                                        alt="Customer support team"
                                        className="img-fluid rounded-4 shadow"
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Contact Methods */}
                <section className="contact-methods-section py-5">
                    <Container>
                        <Row className="g-4">
                            {contacts.map((method, index) => (
                                <Col md={4} key={index}>
                                    <Card
                                        className={`contact-method-card border-0 shadow-sm h-100 bg-${method.color}-subtle`}
                                    >
                                        <Card.Body className="p-4 text-center">
                                            <div
                                                className={`contact-method-icon mb-3 text-${method.color}`}
                                            >
                                                {method.icon}
                                            </div>
                                            <h4 className="mb-3">
                                                {method.title}
                                            </h4>
                                            <p className="mb-3">
                                                {method.info}
                                            </p>
                                            <Button
                                                variant={method.color}
                                                href={method.link}
                                                target="_blank"
                                                className="rounded-pill px-3"
                                            >
                                                {method.title}
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>

                {/* Contact Form + Info */}
                <section className="contact-form-section py-5 bg-light">
                    <Container>
                        <Row className="g-4">
                            <Col lg={7}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="p-4 p-md-5">
                                        <h2 className="mb-4">
                                            Send Us a Message
                                        </h2>
                                        <Form>
                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <Form.Group controlId="formName">
                                                        <Form.Label>
                                                            Your Name
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter your name"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group controlId="formEmail">
                                                        <Form.Label>
                                                            Email Address
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            placeholder="Enter your email"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group controlId="formPhone">
                                                        <Form.Label>
                                                            Phone Number
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="tel"
                                                            placeholder="Enter your phone number"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group controlId="formSubject">
                                                        <Form.Label>
                                                            Subject
                                                        </Form.Label>
                                                        <Form.Select>
                                                            <option>
                                                                Select a subject
                                                            </option>
                                                            <option>
                                                                General Inquiry
                                                            </option>
                                                            <option>
                                                                Order Support
                                                            </option>
                                                            <option>
                                                                Returns &
                                                                Refunds
                                                            </option>
                                                            <option>
                                                                Technical
                                                                Support
                                                            </option>
                                                            <option>
                                                                Other
                                                            </option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12}>
                                                    <Form.Group controlId="formMessage">
                                                        <Form.Label>
                                                            Your Message
                                                        </Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={5}
                                                            placeholder="Type your message here..."
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12}>
                                                    <Button
                                                        variant="primary"
                                                        size="lg"
                                                        className="rounded-pill px-4"
                                                    >
                                                        <FaPaperPlane className="me-2" />{" "}
                                                        Send Message
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={5}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body className="p-4 p-md-5">
                                        <h2 className="mb-4">
                                            Contact Information
                                        </h2>

                                        <div className="mb-4">
                                            <h5 className="mb-3 d-flex align-items-center">
                                                <FaMapMarkerAlt className="me-2 text-primary" />{" "}
                                                Our Location
                                            </h5>
                                            <p className="ms-4">
                                                Avenue Du Tchad, No.7 IMMEUBLE
                                                RENAISSANCE, Local 6
                                                <br />
                                                Ref. Opposite EQUITY BCDC HEAD
                                                OFFICE
                                            </p>
                                            <Button
                                                variant="outline-primary"
                                                href="https://maps.google.com?q=123+Business+Ave+New+York"
                                                target="_blank"
                                                className="mt-2 rounded-pill px-3"
                                            >
                                                View on Map
                                            </Button>
                                        </div>

                                        <div className="mb-4">
                                            <h5 className="mb-3 d-flex align-items-center">
                                                <FaClock className="me-2 text-primary" />{" "}
                                                Business Hours
                                            </h5>
                                            <ul className="list-unstyled ms-4">
                                                {businessHours.map(
                                                    (item, index) => (
                                                        <li
                                                            key={index}
                                                            className="mb-2 d-flex justify-content-between"
                                                        >
                                                            <span>
                                                                {item.day}
                                                            </span>
                                                            <span className="text-muted">
                                                                {item.hours}
                                                            </span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Map Section */}
                <section className="map-section">
                    <Container fluid className="px-0">
                        <div className="ratio ratio-16x9">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.21520917933!2d-73.98784492423959!3d40.74844097138985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ0JzU0LjQiTiA3M8KwNTknMTMuNiJX!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                                allowFullScreen=""
                                loading="lazy"
                                title="Our Location on Map"
                            ></iframe>
                        </div>
                    </Container>
                </section>
            </Container>
        </AppLayout>
    );
}
