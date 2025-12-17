import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import {
    FaMobileAlt,
    FaTools,
    FaHandsHelping,
    FaShieldAlt,
    FaAward,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaGlobe,
    FaBullseye,
    FaEye,
    FaStar,
    FaUsers,
    FaCogs,
} from "react-icons/fa";
import "../../../css/About.css";

export default function About() {
    const stats = [
        { value: "1,000+", label: "Devices Repaired", icon: <FaTools /> },
        { value: "98%", label: "Customer Satisfaction", icon: <FaAward /> },
        { value: "50+", label: "Brands Supported", icon: <FaMobileAlt /> },
        { value: "24/7", label: "Support Available", icon: <FaHandsHelping /> },
    ];

    const coreValues = [
        {
            title: "Customer-Centric Approach",
            icon: <FaUsers />,
            description:
                "Prioritizing customer satisfaction with efficient and friendly service.",
        },
        {
            title: "Quality & Reliability",
            icon: <FaShieldAlt />,
            description:
                "Using high-quality parts and qualified technicians for lasting repairs.",
        },
        {
            title: "Accessibility",
            icon: <FaBullseye />,
            description:
                "Offering competitive prices without compromising service quality.",
        },
        {
            title: "Innovation",
            icon: <FaCogs />,
            description:
                "Staying up-to-date with the latest technology trends.",
        },
    ];

    const services = [
        {
            title: "Mobile Phone Sales",
            items: [
                "New and refurbished smartphones (all brands)",
                "Basic phones and tablets",
                "Genuine accessories (chargers, cases, screen protectors, etc.)",
            ],
        },
        {
            title: "Professional Repairs",
            items: [
                "Screen replacement",
                "Battery replacement",
                "Software and hardware troubleshooting",
                "Water damage repair",
                "Charging port and speaker repair",
            ],
        },
        {
            title: "Mobile Solutions & Support",
            items: [
                "Software updates and optimization",
                "Data recovery and backup",
                "Unlocking and network solutions",
            ],
        },
    ];

    const whyChooseUs = [
        "Expert Technicians – Certified professionals with extensive repair experience",
        "Fast Service – Efficient diagnostics and repairs",
        "Genuine Parts – High-quality components for durable repairs",
        "Competitive Pricing – Affordable rates for all services",
        "Customer Warranty – Guaranteed service with assurance on repairs",
    ];

    const targetMarket = [
        "Individual smartphone users",
        "Businesses and corporate clients",
        "Mobile device retailers and wholesalers",
        "Tech enthusiasts seeking reliable repairs",
    ];

    const futureGoals = [
        "Expand service centers to major cities across the DRC",
        "Launch mobile technology training programs for local technicians",
        "Establish partnerships with major phone brands for authorized repairs",
    ];

    return (
        <AppLayout>
            <Head title="About DSCOM Technology" />

            <Container fluid className="px-0 about-page">
                {/* Hero Section */}
                <section className="about-hero-section">
                    <Container>
                        <Row className="align-items-center">
                            <Col lg={6}>
                                <h1 className="display-4 fw-bold mb-4">
                                    DSCOM Technology
                                </h1>
                                <p className="lead mb-3">
                                    <strong>
                                        Kinshasa, Democratic Republic of Congo
                                        (DRC)
                                    </strong>
                                </p>
                                <p className="mb-4">
                                    Your trusted partner for mobile technology
                                    solutions, repairs, and innovative mobile
                                    services in Kinshasa.
                                </p>
                                <Button
                                    variant="primary"
                                    as={Link}
                                    href="/contact"
                                    size="lg"
                                    className="rounded-pill px-4"
                                >
                                    Contact Us
                                </Button>
                            </Col>
                            <Col lg={6} className="d-none d-lg-block">
                                <div className="hero-image-wrapper">
                                    <img
                                        src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                                        alt="Mobile repair workshop with technicians"
                                        className="img-fluid rounded-4 shadow"
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Stats Section */}
                <section className="stats-section py-5 bg-light">
                    <Container>
                        <Row className="g-4">
                            {stats.map((stat, index) => (
                                <Col md={3} sm={6} key={index}>
                                    <Card className="stat-card text-center border-0 shadow-sm h-100">
                                        <Card.Body className="py-4">
                                            <div className="stat-icon mb-3 text-primary">
                                                {stat.icon}
                                            </div>
                                            <h3 className="fw-bold text-primary">
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

                {/* Mission & Vision */}
                <section className="mission-section py-5">
                    <Container>
                        <Row className="g-4">
                            <Col lg={6}>
                                <Card className="h-100 border-0 shadow-sm">
                                    <Card.Body className="p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <FaBullseye
                                                className="text-primary me-3"
                                                size={24}
                                            />
                                            <h3 className="mb-0">
                                                Our Mission
                                            </h3>
                                        </div>
                                        <blockquote className="blockquote mb-0">
                                            <p className="lead fst-italic">
                                                "To provide fast, reliable, and
                                                affordable repairs, along with
                                                innovative mobile solutions,
                                                ensuring customer satisfaction
                                                through quality service."
                                            </p>
                                        </blockquote>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={6}>
                                <Card className="h-100 border-0 shadow-sm">
                                    <Card.Body className="p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <FaEye
                                                className="text-primary me-3"
                                                size={24}
                                            />
                                            <h3 className="mb-0">Our Vision</h3>
                                        </div>
                                        <blockquote className="blockquote mb-0">
                                            <p className="lead fst-italic">
                                                "To become the most reliable and
                                                leading technology services
                                                provider in the Democratic
                                                Republic of Congo, delivering
                                                excellence in mobile solutions
                                                and repairs."
                                            </p>
                                        </blockquote>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Core Values */}
                <section className="values-section py-5 bg-light">
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="section-title">Our Core Values</h2>
                            <p className="text-muted">
                                The principles that guide everything we do
                            </p>
                        </div>
                        <Row className="g-4">
                            {coreValues.map((value, index) => (
                                <Col lg={3} md={6} key={index}>
                                    <Card className="value-card border-0 shadow-sm h-100">
                                        <Card.Body className="p-4 text-center">
                                            <div className="value-icon mb-3 text-primary">
                                                {value.icon}
                                            </div>
                                            <h5 className="mb-3">
                                                {value.title}
                                            </h5>
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

                {/* Products & Services */}
                <section className="services-section py-5">
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="section-title">
                                Products & Services
                            </h2>
                            <p className="text-muted">
                                Comprehensive mobile technology solutions
                            </p>
                        </div>
                        <Row className="g-4">
                            {services.map((service, index) => (
                                <Col lg={4} key={index}>
                                    <Card className="h-100 border-0 shadow-sm">
                                        <Card.Body className="p-4">
                                            <h4 className="mb-4 text-primary">
                                                {service.title}
                                            </h4>
                                            <ListGroup variant="flush">
                                                {service.items.map(
                                                    (item, itemIndex) => (
                                                        <ListGroup.Item
                                                            key={itemIndex}
                                                            className="border-0 ps-0"
                                                        >
                                                            <FaStar
                                                                className="text-warning me-2"
                                                                size={12}
                                                            />
                                                            {item}
                                                        </ListGroup.Item>
                                                    )
                                                )}
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>

                {/* Why Choose DSCOM Technology */}
                <section className="why-choose-section py-5 bg-light">
                    <Container>
                        <Row className="align-items-center">
                            <Col lg={6} className="mb-4 mb-lg-0">
                                <h2 className="section-title mb-4">
                                    Why Choose DSCOM Technology?
                                </h2>
                                <ListGroup variant="flush">
                                    {whyChooseUs.map((item, index) => (
                                        <ListGroup.Item
                                            key={index}
                                            className="border-0 bg-transparent mb-2"
                                        >
                                            <div className="d-flex">
                                                <div className="me-3 text-success">
                                                    <FaStar size={16} />
                                                </div>
                                                <span>{item}</span>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Col>
                            <Col lg={6}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="p-4">
                                        <h4 className="mb-4">Target Market</h4>
                                        <Row>
                                            {targetMarket.map(
                                                (market, index) => (
                                                    <Col
                                                        md={6}
                                                        key={index}
                                                        className="mb-2"
                                                    >
                                                        <div className="d-flex align-items-center">
                                                            <FaUsers
                                                                className="text-primary me-2"
                                                                size={14}
                                                            />
                                                            <span>
                                                                {market}
                                                            </span>
                                                        </div>
                                                    </Col>
                                                )
                                            )}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Future Goals */}
                <section className="goals-section py-5">
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="section-title">Future Goals</h2>
                            <p className="text-muted">
                                Our roadmap for growth and expansion
                            </p>
                        </div>
                        <Row className="justify-content-center">
                            <Col lg={8}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="p-4">
                                        <ListGroup variant="flush">
                                            {futureGoals.map((goal, index) => (
                                                <ListGroup.Item
                                                    key={index}
                                                    className="border-0 mb-3"
                                                >
                                                    <div className="d-flex align-items-start">
                                                        <div className="me-3 mt-1">
                                                            <div
                                                                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: "30px",
                                                                    height: "30px",
                                                                }}
                                                            >
                                                                {index + 1}
                                                            </div>
                                                        </div>
                                                        <h5 className="mb-1">
                                                            {goal}
                                                        </h5>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Contact Information */}
                <section className="contact-section py-5 bg-primary text-white">
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="mb-4">Contact Information</h2>
                            <p className="lead mb-0">
                                Get in touch with DSCOM Technology
                            </p>
                        </div>
                        <Row className="g-4">
                            <Col lg={4} md={6}>
                                <Card className="border-0 shadow-sm h-100 bg-dark text-white">
                                    <Card.Body className="p-4 text-center">
                                        <FaMapMarkerAlt
                                            className="mb-3"
                                            size={32}
                                        />
                                        <h5 className="mb-3">Address</h5>
                                        <p className="mb-0">
                                            Avenue Du Tchad, No.7
                                            <br />
                                            IMMEUBLE RENAISSANCE, Local 6<br />
                                            Opposite the EQUITY BCDC
                                            HEADQUARTERS
                                            <br />
                                            Kinshasa, DRC
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={4} md={6}>
                                <Card className="border-0 shadow-sm h-100 bg-dark text-white">
                                    <Card.Body className="p-4 text-center">
                                        <FaPhoneAlt
                                            className="mb-3"
                                            size={32}
                                        />
                                        <h5 className="mb-3">Phone</h5>
                                        <p className="lead mb-0">
                                            <a
                                                href="tel:+243827306680"
                                                className="text-white text-decoration-none"
                                            >
                                                +243 827 306 680
                                            </a>
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={4} md={6}>
                                <Card className="border-0 shadow-sm h-100 bg-dark text-white">
                                    <Card.Body className="p-4 text-center">
                                        <FaEnvelope
                                            className="mb-3"
                                            size={32}
                                        />
                                        <h5 className="mb-3">
                                            Email & Website
                                        </h5>
                                        <p className="mb-2">
                                            <a
                                                href="mailto:info@dscomtechnology.com"
                                                className="text-white text-decoration-none"
                                            >
                                                info@dscomtechnology.com
                                            </a>
                                        </p>
                                        <p className="mb-0">
                                            <a
                                                href="https://www.dscomtechnology.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white text-decoration-none"
                                            >
                                                <FaGlobe className="me-2" />
                                                www.dscomtechnology.com
                                            </a>
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Final Commitment */}
                <section className="commitment-section py-5">
                    <Container>
                        <div className="text-center">
                            <h3 className="mb-4">Our Commitment</h3>
                            <p className="lead mb-0">
                                DSCOM Technology is committed to providing
                                high-quality mobile solutions, ensuring every
                                customer receives a fully functional device and
                                satisfactory service. Trust us for all your
                                telephony needs in Kinshasa!
                            </p>
                        </div>
                    </Container>
                </section>
            </Container>
        </AppLayout>
    );
}
