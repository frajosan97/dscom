import React from "react";
import { Button, Card, Col, Container, Image, Row } from "react-bootstrap";
import { Link } from "@inertiajs/react";
import SlickSlider from "../Settings/SlickSlider";

export default function AboutUsShortDesc() {
    const images = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80",
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80",
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80",
        },
    ];

    const features = [
        {
            icon: "bi-tools",
            title: "Expert Repairs",
            description:
                "Our certified technicians provide fast and reliable repair services for all your electronic devices with a 90-day warranty on all repairs.",
        },
        {
            icon: "bi-cpu",
            title: "Genuine Spare Parts",
            description:
                "We stock only OEM and high-quality compatible parts for smartphones, laptops, and other electronics to ensure optimal performance.",
        },
        {
            icon: "bi-headset",
            title: "Technical Support",
            description:
                "Get free troubleshooting advice from our electronics experts before deciding on repairs or part replacements.",
        },
    ];

    const settings = {
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 6000,
        speed: 800,
        arrows: false,
        dots: false,
    };

    return (
        <Container fluid className="py-4">
            <Row className="g-3">
                {features.map((feature) => (
                    <Col md={4} key={feature.title}>
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="text-center p-4">
                                <div className="mb-3 text-primary">
                                    <i
                                        className={`bi ${feature.icon} fs-1`}
                                    ></i>
                                </div>
                                <h4>{feature.title}</h4>
                                <p className="text-muted">
                                    {feature.description}
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="g-3 d-flex align-items-center py-3">
                <Col lg={6} className="mb-3 mb-lg-0">
                    <h2 className="display-5 fw-bold mb-3">
                        Your Trusted Electronics Repair Partner
                    </h2>
                    <p className="lead text-muted">
                        At DSCom Technologies, we specialize in professional
                        electronics repair and genuine spare parts distribution.
                        With over a decade of experience, we've become the go-to
                        solution for device repairs and component replacements.
                    </p>
                    <p className="text-muted">
                        Our team of certified technicians stays updated with the
                        latest repair technologies and diagnostic tools. We
                        source parts directly from manufacturers to ensure
                        compatibility and longevity for your devices.
                    </p>
                    <Button
                        as={Link}
                        href="/about"
                        variant="primary"
                        size="lg"
                        className="mt-3"
                    >
                        Learn More About Us
                    </Button>
                </Col>
                <Col lg={6}>
                    <SlickSlider {...settings}>
                        {images.map((item) => (
                            <Card
                                key={item.id}
                                className="border-0 rounded shadow-sm"
                            >
                                <Card.Img
                                    className="rounded"
                                    src={item.image}
                                />
                            </Card>
                        ))}
                    </SlickSlider>
                </Col>
            </Row>
        </Container>
    );
}
