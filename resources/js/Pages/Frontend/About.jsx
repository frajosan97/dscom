import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
    FaShoppingBag,
    FaHeart,
    FaAward,
    FaUsers,
    FaLeaf,
    FaRocket,
    FaPlay,
} from "react-icons/fa";
import { FiTwitter, FiLinkedin, FiInstagram } from "react-icons/fi";
import "../../../css/About.css";

export default function About() {
    const stats = [
        { value: "10,000+", label: "Happy Customers", icon: <FaHeart /> },
        { value: "5+", label: "Years Experience", icon: <FaAward /> },
        { value: "500+", label: "Quality Products", icon: <FaShoppingBag /> },
        { value: "24/7", label: "Customer Support", icon: <FaUsers /> },
    ];

    const teamMembers = [
        {
            name: "Alex Johnson",
            role: "CEO & Founder",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        },
        {
            name: "Sarah Williams",
            role: "Marketing Director",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80",
        },
        {
            name: "Michael Chen",
            role: "Product Designer",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        },
    ];

    const values = [
        {
            title: "Sustainability",
            icon: <FaLeaf />,
            description:
                "We're committed to eco-friendly practices and sustainable sourcing.",
        },
        {
            title: "Innovation",
            icon: <FaRocket />,
            description:
                "Constantly evolving to bring you the latest trends and technologies.",
        },
        {
            title: "Customer First",
            icon: <FaHeart />,
            description:
                "Your satisfaction is our top priority in every decision we make.",
        },
    ];

    return (
        <AppLayout>
            <Head title="About Us" />

            <Container fluid className="px-0 about-page">
                {/* Hero Section */}
                <section className="about-hero-section">
                    <Container>
                        <Row className="align-items-center">
                            <Col lg={6}>
                                <h1 className="display-4 fw-bold mb-4">
                                    Our Story
                                </h1>
                                <p className="lead mb-4">
                                    Founded in 2018, we started as a small team
                                    with a big dream - to revolutionize online
                                    shopping. Today, we're proud to serve
                                    thousands of customers worldwide with
                                    curated, high-quality products.
                                </p>
                                <Button
                                    variant="primary"
                                    as={Link}
                                    href="/"
                                    size="lg"
                                    className="rounded-pill px-4"
                                >
                                    Shop Now
                                </Button>
                            </Col>
                            <Col lg={6} className="d-none d-lg-block">
                                <div className="hero-image-wrapper">
                                    <img
                                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                                        alt="Team collaborating in modern office"
                                        className="img-fluid rounded-4 shadow"
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Stats Section */}
                <section className="stats-section py-5">
                    <Container>
                        <Row className="g-4">
                            {stats.map((stat, index) => (
                                <Col md={3} sm={6} key={index}>
                                    <Card className="stat-card text-center border-0 shadow-sm h-100">
                                        <Card.Body className="py-4">
                                            <div className="stat-icon mb-3">
                                                {stat.icon}
                                            </div>
                                            <h3 className="fw-bold">
                                                {stat.value}
                                            </h3>
                                            <p className="mb-0 text-muted">
                                                {stat.label}
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>

                {/* Our Mission */}
                <section className="mission-section py-5 bg-light">
                    <Container>
                        <Row className="align-items-center">
                            <Col lg={6} className="mb-4 mb-lg-0">
                                <h2 className="section-title mb-4">
                                    Our Mission
                                </h2>
                                <p className="lead">
                                    To provide exceptional value through
                                    carefully curated products, outstanding
                                    customer service, and a seamless shopping
                                    experience that exceeds expectations.
                                </p>
                                <p>
                                    We believe in building lasting relationships
                                    with our customers by offering products that
                                    enhance their lives while maintaining the
                                    highest standards of quality and ethical
                                    business practices.
                                </p>
                            </Col>
                            <Col lg={6}>
                                <div className="mission-video rounded-4 overflow-hidden shadow">
                                    <div className="ratio ratio-16x9">
                                        <img
                                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                                            alt="Team meeting discussing strategy"
                                            className="img-fluid"
                                        />
                                        <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10">
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                className="rounded-circle play-button"
                                            >
                                                <FaPlay />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Our Team */}
                <section className="team-section py-5">
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="section-title">Meet Our Team</h2>
                            <p className="text-muted">
                                The passionate people behind your shopping
                                experience
                            </p>
                        </div>
                        <Row className="g-4">
                            {teamMembers.map((member, index) => (
                                <Col lg={4} md={6} key={index}>
                                    <Card className="team-card border-0 shadow-sm h-100 overflow-hidden">
                                        <div className="team-img-wrapper">
                                            <Card.Img
                                                variant="top"
                                                src={member.image}
                                                alt={member.name}
                                            />
                                        </div>
                                        <Card.Body className="text-center py-4">
                                            <h5 className="mb-1">
                                                {member.name}
                                            </h5>
                                            <p className="text-muted mb-3">
                                                {member.role}
                                            </p>
                                            <div className="social-links">
                                                <Button
                                                    variant="link"
                                                    className="text-dark"
                                                >
                                                    <FiTwitter />
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    className="text-dark"
                                                >
                                                    <FiLinkedin />
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    className="text-dark"
                                                >
                                                    <FiInstagram />
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>

                {/* Our Values */}
                <section className="values-section py-5 bg-light">
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="section-title">Our Core Values</h2>
                            <p className="text-muted">
                                What drives us every day
                            </p>
                        </div>
                        <Row className="g-4">
                            {values.map((value, index) => (
                                <Col lg={4} md={6} key={index}>
                                    <Card className="value-card border-0 shadow-sm h-100">
                                        <Card.Body className="p-4 text-center">
                                            <div className="value-icon mb-3">
                                                {value.icon}
                                            </div>
                                            <h4 className="mb-3">
                                                {value.title}
                                            </h4>
                                            <p className="mb-0 text-muted">
                                                {value.description}
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>

                {/* CTA Section */}
                <section className="cta-section py-5 bg-primary text-white">
                    <Container className="text-center">
                        <h2 className="mb-4">
                            Ready to experience the difference?
                        </h2>
                        <p className="lead mb-4">
                            Join thousands of satisfied customers shopping with
                            us today.
                        </p>
                        <Button
                            variant="light"
                            size="lg"
                            className="rounded-pill px-4 me-2"
                        >
                            Shop Now
                        </Button>
                        <Button
                            variant="outline-light"
                            size="lg"
                            className="rounded-pill px-4"
                        >
                            Contact Us
                        </Button>
                    </Container>
                </section>
            </Container>
        </AppLayout>
    );
}
