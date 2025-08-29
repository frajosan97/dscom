import { Head } from "@inertiajs/react";
import { Tab, Nav, Row, Col, Button, Form, Card, Badge } from "react-bootstrap";
import { useState, useMemo, useCallback } from "react";
import JobEntryInfo from "@/Components/Partials/RepairOrder/JobEntryInfo";
import ErpLayout from "@/Layouts/ErpLayout";

const OrderShow = ({ order = null }) => {
    const [activeKey, setActiveKey] = useState("job-entry-info");

    // Tab configuration
    const tabs = useMemo(
        () => [
            {
                key: "job-entry-info",
                label: "Job Entry Info",
                icon: "bi-person",
            },
            {
                key: "service-info",
                label: "Service Info",
                icon: "bi-gear",
            },
            {
                key: "delivery-info",
                label: "Delivery Info",
                icon: "bi-truck",
            },
            {
                key: "ret-outside-service",
                label: "Ret Outside Service",
                icon: "bi-arrow-left-right",
            },
            {
                key: "call-info",
                label: "Call Info",
                icon: "bi-telephone",
            },
            {
                key: "refund-loss",
                label: "Refund & Loss",
                icon: "bi-currency-dollar",
            },
            {
                key: "feedback",
                label: "Feedback",
                icon: "bi-chat",
            },
        ],
        []
    );

    // Navigation helpers
    const handleNext = useCallback(() => {
        const idx = tabs.findIndex((t) => t.key === activeKey);
        if (idx < tabs.length - 1) setActiveKey(tabs[idx + 1].key);
    }, [activeKey, tabs]);

    const handlePrevious = useCallback(() => {
        const idx = tabs.findIndex((t) => t.key === activeKey);
        if (idx > 0) setActiveKey(tabs[idx - 1].key);
    }, [activeKey, tabs]);

    const isFirstTab = activeKey === tabs[0].key;
    const isLastTab = activeKey === tabs[tabs.length - 1].key;

    return (
        <ErpLayout>
            <Head title="Service Job Details" />

            <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
                <Row>
                    {/* Sidebar Nav */}
                    <Col sm={3} md={2} className="border-end bg-light">
                        <Nav variant="pills" className="flex-column">
                            {tabs.map(({ key, label, icon }) => (
                                <Nav.Item key={key} className="mb-2">
                                    <Nav.Link
                                        eventKey={key}
                                        className="d-flex align-items-center"
                                    >
                                        <i className={`${icon} me-2`} />
                                        <span className="d-none d-md-inline">
                                            {label}
                                        </span>
                                    </Nav.Link>
                                </Nav.Item>
                            ))}
                        </Nav>
                    </Col>

                    {/* Tab Content */}
                    <Col sm={9} md={10}>
                        <Tab.Content>
                            {/* Job Entry Info Tab */}
                            <Tab.Pane eventKey="job-entry-info">
                                <JobEntryInfo order={order} />
                            </Tab.Pane>
                        </Tab.Content>

                        {/* Navigation Buttons */}
                        <div className="d-flex justify-content-between mt-4">
                            <Button
                                variant="outline-primary"
                                onClick={handlePrevious}
                                disabled={isFirstTab}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleNext}
                                disabled={isLastTab}
                            >
                                Next
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Tab.Container>
        </ErpLayout>
    );
};

export default OrderShow;
