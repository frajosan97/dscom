import { Head } from "@inertiajs/react";
import { Tab, Nav, Row, Col, Button, Form } from "react-bootstrap";
import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import ErpLayout from "@/Layouts/ErpLayout";
import CustomerInfo from "@/Components/Partials/Service/CustomerInfo";
import InitialCheck from "@/Components/Partials/Service/InitialCheck";
import JobDetails from "@/Components/Partials/Service/JobDetails";
import PaymentInfo from "@/Components/Partials/Service/PaymentInfo";
import OtherInfo from "@/Components/Partials/Service/OtherInfo";
import useData from "@/Hooks/useData";
import axios from "axios";
import Swal from "sweetalert2";

const ServiceForm = ({ service = null }) => {
    const [activeKey, setActiveKey] = useState("customer");

    console.log(service);

    // Initialize payment data
    const { paymentMethods } = useData();
    const [paymentData, setPaymentData] = useState({});

    const generateOrderNumber = () => {
        const date = new Date();
        const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
        const randomPart = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0");
        return `JOB-${datePart}-${randomPart}`;
    };

    const getTodayDate = () => {
        return new Date().toISOString().split("T")[0];
    };

    // Section states
    const [customerData, setCustomerData] = useState({
        customer_id: service?.customer?.id || "",
        customer_name: service?.customer?.full_name || "",
        customer_phone: service?.customer?.phone || "",
        customer_email: service?.customer?.email || "",
    });

    const [jobDetailsData, setJobDetailsData] = useState({
        order_number: service?.order_number || generateOrderNumber,
        entry_date: service?.entry_date || getTodayDate,
        company: service?.device_metadata?.company || "",
        brand: service?.device_metadata?.brand || "",
        model: service?.device_metadata?.model || "",
        serial: service?.device_metadata?.serial || "",
        specs: service?.device_metadata?.specs || "",
        password: service?.device_metadata?.password || "",
        color: service?.device_metadata?.color || "",
        issue: service?.device_metadata?.issue || "",
        remarks: service?.device_metadata?.remarks || "",
        provider: service?.device_metadata?.provider || "",
        warranty: service?.device_metadata?.warranty || "",
        service_type: service?.service_type || "",
        priority: service?.priority || "normal",
        assigned_technician_id: service?.assigned_technician_id || "",
        expected_completion_date: service?.expected_completion_date || "",
        repair_service_id: service?.repair_service_id || "",
    });

    const [initialCheckData, setInitialCheckData] = useState({
        display: service?.initial_check_metadata?.display || "",
        back_panel: service?.initial_check_metadata?.back_panel || "",
        status: service?.initial_check_metadata?.status || "",
        physical_condition:
            service?.initial_check_metadata?.physical_condition || "",
        risk_agreed: service?.initial_check_metadata?.risk_agreed || "",
        accessories: service?.initial_check_metadata?.accessories || [],
        remarks: service?.initial_check_metadata?.remarks || "",
        checked_by: service?.initial_check_metadata?.checked_by || "",
        check_date: service?.initial_check_metadata?.check_date || "",
    });

    const [otherInfoData, setOtherInfoData] = useState({
        assigned_technician_id: service?.assigned_technician_id || "",
        created_by: service?.created_by || "",
        completion_date: service?.completion_date || "",
        attachments: service?.attachments || [],
    });

    // Populate form data when service is provided (edit mode)
    useEffect(() => {
        if (service) {
            const initialPayments = paymentMethods.reduce((acc, method) => {
                const payments =
                    service?.payments?.filter(
                        (p) =>
                            p.payment_method_name?.toLowerCase() ===
                            method.name.toLowerCase()
                    ) || [];
                acc[method.name.toLowerCase()] = payments.map(
                    (p) => p.metadata
                );
                return acc;
            }, {});
            setPaymentData(initialPayments);
        }
    }, [service, paymentMethods]);

    // Tab configuration
    const tabs = useMemo(
        () => [
            { key: "customer", label: "Customer Info", icon: "bi-person" },
            { key: "details", label: "Job Details", icon: "bi-clipboard" },
            {
                key: "initial-check",
                label: "Initial Check",
                icon: "bi-check-circle",
            },
            {
                key: "payment-info",
                label: "Payment Info",
                icon: "bi-credit-card",
            },
            { key: "other-info", label: "Other Info", icon: "bi-info-circle" },
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

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        const confirm = await Swal.fire({
            title: "Confirm Submission",
            text: service
                ? "Update this service entry?"
                : "Create new service entry?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: service ? "Yes, update it!" : "Yes, create it!",
        });

        if (!confirm.isConfirmed) return;

        // Show loading swal
        const loadingSwal = Swal.fire({
            title: "Please wait...",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const formData = new FormData();
            formData.append("customer", JSON.stringify(customerData));
            formData.append("job_details", JSON.stringify(jobDetailsData));
            formData.append("initial_check", JSON.stringify(initialCheckData));
            formData.append("payment_info", JSON.stringify(paymentData));
            formData.append("other_info", JSON.stringify(otherInfoData));

            // Append files if any
            if (
                otherInfoData.attachments &&
                otherInfoData.attachments.length > 0
            ) {
                otherInfoData.attachments.forEach((file, index) => {
                    if (file instanceof File) {
                        formData.append(`attachments[${index}]`, file);
                    }
                });
            }

            const url = service
                ? route("services.update", service?.id)
                : route("services.store");

            const method = service ? "put" : "post";

            const { data } = await axios[method](url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (data.success) {
                Swal.close();
                toast.success(data.message);
            } else {
                Swal.close();
                toast.error("Something went wrong!");
            }
        } catch (error) {
            Swal.close();
            console.log(error);
            toast.error(error.response?.data?.message || "Request failed");
        }
    };

    return (
        <ErpLayout>
            <Head title={service ? "Edit Service" : "Create Service"} />

            <Form onSubmit={handleSubmit}>
                <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
                    <Row>
                        {/* Sidebar Nav */}
                        <Col sm={3} md={2} className="border-end bg-light">
                            <Nav variant="pills" className="flex-column">
                                {tabs.map(({ key, label, icon }) => (
                                    <Nav.Item key={key}>
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
                                <Tab.Pane eventKey="customer">
                                    <CustomerInfo
                                        customerData={customerData}
                                        setCustomerData={setCustomerData}
                                    />
                                </Tab.Pane>
                                <Tab.Pane eventKey="details">
                                    <JobDetails
                                        jobDetailsData={jobDetailsData}
                                        setJobDetailsData={setJobDetailsData}
                                    />
                                </Tab.Pane>
                                <Tab.Pane eventKey="initial-check">
                                    <InitialCheck
                                        initialCheckData={initialCheckData}
                                        setInitialCheckData={
                                            setInitialCheckData
                                        }
                                    />
                                </Tab.Pane>
                                <Tab.Pane eventKey="payment-info">
                                    <PaymentInfo
                                        paymentData={paymentData}
                                        setPaymentData={setPaymentData}
                                    />
                                </Tab.Pane>
                                <Tab.Pane eventKey="other-info">
                                    <OtherInfo
                                        otherInfoData={otherInfoData}
                                        setOtherInfoData={setOtherInfoData}
                                    />
                                </Tab.Pane>
                            </Tab.Content>

                            {/* Navigation Buttons */}
                            <div className="d-flex justify-content-between mt-4 pt-3 border-top">
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
                                        type="submit"
                                        variant="primary"
                                        className="d-flex align-items-center"
                                    >
                                        <i className="bi bi-check-circle me-1"></i>
                                        {service ? "Update" : "Submit"}
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

export default ServiceForm;
