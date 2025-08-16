import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "../../../css/ContactInfo.css";

export default function ContactInfoBar() {
    const contacts = [
        {
            icon: <FaPhone size={24} />,
            title: "Call Us",
            info: "+243 (894) 779-059",
            link: "tel:+243894779059",
            color: "primary"
        },
        {
            icon: <FaWhatsapp size={24} />,
            title: "WhatsApp",
            info: "+243 (894) 779-059",
            link: "https://wa.me/243894779059",
            color: "success"
        },
        {
            icon: <FaEnvelope size={24} />,
            title: "Email Us",
            info: "info@dscomtechnologies.com",
            link: "mailto:info@dscomtechnologies.com",
            color: "danger"
        },
        {
            icon: <FaMapMarkerAlt size={24} />,
            title: "Visit Us",
            info: (
                <>
                    Avenue Du Tchad, No.7 IMMEUBLE RENAISSANCE, Local 6
                    <br />
                    Ref. Opposite EQUITY BCDC HEAD OFFICE
                </>
            ),
            link: "https://maps.google.com?q=123+Tech+Ave",
            color: "warning"
        },
    ];

    return (
        <div className="contact-info-bar py-4 bg-gradient">
            <Container fluid>
                <Row className="g-3">
                    {contacts.map((contact, index) => (
                        <Col md={3} sm={6} key={index}>
                            <a
                                href={contact.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-card d-flex align-items-center p-3 bg-white rounded shadow-sm text-decoration-none text-dark"
                            >
                                <div className="contact-icon-wrapper me-3">
                                    {contact.icon}
                                </div>
                                <div>
                                    <h5 className="mb-1 fw-bold">{contact.title}</h5>
                                    <p className="mb-0 text-muted">{contact.info}</p>
                                </div>
                            </a>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
}