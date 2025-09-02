import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import Categories from "../Data/Categories";
import Slider from "../Data/Slider";
import Featured from "../Data/Featured";

export default function HeroPage() {
    return (
        <Row className="g-0">
            {/* Categories Column - Hidden on mobile, shown on lg+ */}
            <Col lg={3} className="categories-col d-none d-md-block">
                <Categories />
            </Col>

            {/* Main Slider Column */}
            <Col lg={6} md={12} className="main-slider-col">
                <Slider sliderName="hero" />
            </Col>

            {/* Featured Products Column */}
            <Col lg={3} md={12} className="featured-column">
                <Featured />
            </Col>
        </Row>
    );
}
