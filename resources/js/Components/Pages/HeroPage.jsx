import React from 'react';
import { Col, Container, Row } from "react-bootstrap";
import Categories from '../Data/Categories';
import Slider from '../Data/Slider';
import "../../../css/HeroPage.css";
import Featured from '../Data/Featured';

export default function HeroPage() {
    return (
        <Container fluid className="hero-page bg-white border">
            <Row>
                {/* Categories Column - Hidden on mobile, shown on lg+ */}
                <Col lg={3} className="d-none d-md-block categories-col border-end px-0">
                    <Categories />
                </Col>

                {/* Main Slider Column */}
                <Col lg={6} md={12} className="main-slider-col">
                    <Slider sliderName="hero" />
                </Col>

                {/* Featured Products Column */}
                <Col lg={3} md={12} className="featured-column border-start px-0">
                    <Featured />
                </Col>
            </Row>
        </Container>
    );
}