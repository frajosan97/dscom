import { Head } from "@inertiajs/react";
import { Tab, Nav, Row, Col, Button, Form } from "react-bootstrap";
import { useState } from "react";

import ErpLayout from "@/Layouts/ErpLayout";

import CustomerInfo from "@/Components/Partials/Service/CustomerInfo";
import InitiaCheck from "@/Components/Partials/Service/InitialCheck";
import JobDetails from "@/Components/Partials/Service/JobDetails";
import PaymentInfo from "@/Components/Partials/Service/PaymentInfo";
import OtherInfo from "@/Components/Partials/Service/OtherInfo";

const ServiceCreate = () => {
    const data = {
        customer: null,
    };

    const [activeKey, setActiveKey] = useState("customer");

    const tabs = [
        { key: "customer", label: "Customer Info", icon: "bi-person" },
        { key: "details", label: "Job Details", icon: "bi-clipboard" },
        {
            key: "initial-check",
            label: "Initial Check",
            icon: "bi-check-circle",
        },
        { key: "payment-info", label: "Payment Info", icon: "bi-credit-card" },
        { key: "other-info", label: "Other Info", icon: "bi-info-circle" },
    ];

    const handleNext = () => {
        const currentIndex = tabs.findIndex((tab) => tab.key === activeKey);
        if (currentIndex < tabs.length - 1) {
            setActiveKey(tabs[currentIndex + 1].key);
        }
    };

    const handlePrevious = () => {
        const currentIndex = tabs.findIndex((tab) => tab.key === activeKey);
        if (currentIndex > 0) {
            setActiveKey(tabs[currentIndex - 1].key);
        }
    };

    const handleSubmit = () => {
        // Handle form submission here
        alert("Form submitted successfully!");
    };

    const isFirstTab = activeKey === tabs[0].key;
    const isLastTab = activeKey === tabs[tabs.length - 1].key;

    return (
        <ErpLayout>
            <Head title="Job Entry" />

            <Form>
                <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
                    <Row>
                        {/* Sidebar Nav */}
                        <Col sm={3} md={2} className="border-end">
                            <Nav variant="pills" className="flex-column">
                                {tabs.map((tab) => (
                                    <Nav.Item key={tab.key}>
                                        <Nav.Link
                                            eventKey={tab.key}
                                            className="d-flex align-items-center"
                                        >
                                            <i
                                                className={`${tab.icon} me-2`}
                                            ></i>
                                            {tab.label}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </Col>

                        {/* Tab Content */}
                        <Col sm={9} md={10}>
                            <Tab.Content>
                                <Tab.Pane eventKey="customer">
                                    <CustomerInfo />
                                </Tab.Pane>
                                <Tab.Pane eventKey="details">
                                    <JobDetails />
                                </Tab.Pane>
                                <Tab.Pane eventKey="initial-check">
                                    <InitiaCheck />
                                </Tab.Pane>
                                <Tab.Pane eventKey="payment-info">
                                    <PaymentInfo />
                                </Tab.Pane>
                                <Tab.Pane eventKey="other-info">
                                    <OtherInfo />
                                </Tab.Pane>
                            </Tab.Content>

                            {/* Navigation Buttons */}
                            <div className="d-flex justify-content-between mt-4 pt-3 bg-light border-top">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handlePrevious}
                                    disabled={isFirstTab}
                                    className="d-flex align-items-center"
                                >
                                    <i className="bi bi-chevron-left me-1"></i>
                                    Previous
                                </Button>

                                {isLastTab ? (
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        className="d-flex align-items-center"
                                    >
                                        <i className="bi bi-check-circle me-1"></i>
                                        Submit
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        onClick={handleNext}
                                        className="d-flex align-items-center"
                                    >
                                        Next
                                        <i className="bi bi-chevron-right ms-1"></i>
                                    </Button>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Tab.Container>
            </Form>
        </ErpLayout>
    );
};

export default ServiceCreate;
