import { useState } from "react";
import { Card, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import xios from "@/Utils/axios";
import CustomerModal from "@/Components/Modals/CustomerModal";

const CustomerInfo = () => {
    const [customerType, setCustomerType] = useState("customer");
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Holds selected customer object
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Dynamic search options state
    const [options, setOptions] = useState({
        name: [],
        email: [],
        phone: [],
    });

    const searchCustomer = async (value, field) => {
        try {
            if (!value || value.length <= 2) {
                setOptions((prev) => ({ ...prev, [field]: [] }));
                return;
            }

            const response = await xios.get(
                route("api.customer.search", { value, field })
            );

            let newOptions = [{ value: "create", label: `➕ Add ${value}` }];

            if (response.data.success && response.data.customers.length > 0) {
                newOptions = [
                    ...newOptions,
                    ...response.data.customers.map((customer) => ({
                        value: customer, // store full object
                        label: customer[field] ?? "",
                    })),
                ];
            }

            setOptions((prev) => ({ ...prev, [field]: newOptions }));
        } catch (error) {
            // console.log(error);
        }
    };

    const handleSelectChange = (e, field) => {
        if (!e) return;

        if (e.value === "create") {
            setShowCreateModal(true);
        } else {
            const customer = e.value; // full customer object
            setSelectedCustomer(customer);
        }
    };

    return (
        <>
            {/* Customer/Dealer Info */}
            <Card className="border-0 rounded-0 shadow-sm mb-3">
                <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold text-capitalize">
                        {customerType} Information
                    </h6>
                    <div className="d-flex gap-3">
                        {["customer", "dealer"].map((type) => (
                            <Form.Check
                                key={type}
                                inline
                                type="radio"
                                id={`is${type}`}
                                label={
                                    type.charAt(0).toUpperCase() + type.slice(1)
                                }
                                name="customerType"
                                value={type}
                                checked={customerType === type}
                                onChange={(e) =>
                                    setCustomerType(e.target.value)
                                }
                                className="fw-medium"
                            />
                        ))}
                    </div>
                </Card.Header>

                <Card.Body className="p-4">
                    <Row>
                        {/* Name / Email / Phone */}
                        {["name", "email", "phone"].map((field) => (
                            <Col md={4} className="mb-3" key={field}>
                                <Form.Label className="fw-medium">
                                    {field === "name"
                                        ? "Full Name"
                                        : field === "email"
                                        ? "Email Address"
                                        : "Phone Number"}
                                </Form.Label>
                                <Select
                                    options={options[field]}
                                    placeholder={`Search by ${field}`}
                                    onChange={(e) =>
                                        handleSelectChange(e, field)
                                    }
                                    onInputChange={(value) => {
                                        searchCustomer(value, field);
                                        return value;
                                    }}
                                    value={
                                        selectedCustomer
                                            ? {
                                                  value: selectedCustomer,
                                                  label:
                                                      field === "name"
                                                          ? selectedCustomer.full_name
                                                          : field === "email"
                                                          ? selectedCustomer.email
                                                          : selectedCustomer.phone,
                                              }
                                            : null
                                    }
                                />
                            </Col>
                        ))}

                        {/* Address */}
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-medium">
                                Address
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedCustomer?.address || ""}
                                placeholder="Auto-filled address"
                                disabled
                            />
                        </Col>

                        {/* City */}
                        <Col md={3} className="mb-3">
                            <Form.Label className="fw-medium">City</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedCustomer?.city || ""}
                                placeholder="Auto-filled city"
                                disabled
                            />
                        </Col>

                        {/* Country */}
                        <Col md={3} className="mb-3">
                            <Form.Label className="fw-medium">
                                Country
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedCustomer?.country || ""}
                                placeholder="Auto-filled country"
                                disabled
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Previous Jobs */}
            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="bg-transparent">
                    <h6 className="mb-0 fw-semibold text-capitalize">
                        Previous Jobs
                    </h6>
                </Card.Header>
                <Card.Body className="p-4">
                    <p className="text-muted mb-0">
                        No previous jobs available.
                    </p>
                </Card.Body>
            </Card>

            <CustomerModal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                onClose={() => setShowCreateModal(false)}
            />
        </>
    );
};

export default CustomerInfo;
