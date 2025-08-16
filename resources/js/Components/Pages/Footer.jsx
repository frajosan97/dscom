import { usePage } from "@inertiajs/react";
import { Container, Row, Col, Stack, Image, Form, Button } from "react-bootstrap";
import { Mail, CreditCard, Facebook, Instagram, Twitter, Linkedin, Youtube } from "react-feather";
import "../../../css/Footer.css";

export default function Footer() {
    const { props } = usePage();
    const { systemMode } = props;

    return (
        <footer className="footer-container">
            {systemMode !== 'erp' && (
                < Container fluid className="footer-main-content">
                    <Row>
                        {/* About Column */}
                        <Col lg={3} md={6} className="footer-column">
                            <div className="footer-logo">
                                <Image
                                    src="/storage/images/logos/logo-2.png"
                                />
                            </div>
                            <p className="footer-about">
                                Your premier destination for the latest fashion, electronics, and lifestyle products.
                            </p>
                            <div className="social-links">
                                <a href="#" className="social-link facebook">
                                    <Facebook size={18} />
                                </a>
                                <a href="#" className="social-link instagram">
                                    <Instagram size={18} />
                                </a>
                                <a href="#" className="social-link twitter">
                                    <Twitter size={18} />
                                </a>
                                <a href="#" className="social-link youtube">
                                    <Youtube size={18} />
                                </a>
                                <a href="#" className="social-link linkedin">
                                    <Linkedin size={18} />
                                </a>
                            </div>
                        </Col>

                        {/* Quick Links */}
                        <Col lg={3} md={6} className="footer-column">
                            <h4 className="footer-heading">Shop</h4>
                            <ul className="footer-links">
                                <li><a href="#"><span className="link-icon">→</span> New Arrivals</a></li>
                                <li><a href="#"><span className="link-icon">→</span> Best Sellers</a></li>
                                <li><a href="#"><span className="link-icon">→</span> Sale Items</a></li>
                                <li><a href="#"><span className="link-icon">→</span> Gift Cards</a></li>
                                <li><a href="#"><span className="link-icon">→</span> Lookbook</a></li>
                            </ul>
                        </Col>

                        {/* Customer Service */}
                        <Col lg={3} md={6} className="footer-column">
                            <h4 className="footer-heading">Help</h4>
                            <ul className="footer-links">
                                <li><a href="#"><span className="link-icon">→</span> Contact Us</a></li>
                                <li><a href="#"><span className="link-icon">→</span> FAQs</a></li>
                                <li><a href="#"><span className="link-icon">→</span> Shipping Info</a></li>
                                <li><a href="#"><span className="link-icon">→</span> Returns & Exchanges</a></li>
                                <li><a href="#"><span className="link-icon">→</span> Size Guide</a></li>
                            </ul>
                        </Col>

                        {/* Newsletter */}
                        <Col lg={3} md={6} className="footer-column">
                            <h4 className="footer-heading">Newsletter</h4>
                            <p>Subscribe for exclusive offers and updates</p>
                            <Form className="newsletter-form">
                                <Form.Control
                                    type="email"
                                    placeholder="Your email address"
                                    className="newsletter-input"
                                />
                                <Button variant="primary" className="newsletter-button">
                                    Subscribe <Mail size={16} className="ms-2" />
                                </Button>
                            </Form>
                            <div className="payment-methods">
                                <CreditCard size={20} className="payment-icon" />
                                <span>Secure payments:</span>
                                <img src="/storage/images/icons/payments.png" alt="payments" />
                            </div>
                        </Col>
                    </Row>
                </Container>
            )}

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <Container fluid>
                    <Row>
                        <Col md={12} className="copyright-col text-center">
                            <p>© {new Date().getFullYear()} DSCom Technologies. All rights reserved.</p>
                        </Col>
                    </Row>
                </Container>
            </div>
        </footer >
    );
}