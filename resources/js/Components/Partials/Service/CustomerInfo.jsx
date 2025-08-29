import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "@/Utils/axios";
import { Card, Form, Row, Col, InputGroup, ListGroup } from "react-bootstrap";
import { FaPlusSquare, FaUserTie } from "react-icons/fa";
import { toast } from "react-toastify";
import CustomerModal from "@/Components/Modals/CustomerModal";

const CustomerInfo = ({ customerData, setCustomerData }) => {
    const [customerType, setCustomerType] = useState("customer");
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerSearchValue, setCustomerSearchValue] = useState(
        customerData?.customer_name
    );
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const searchTimeoutRef = useRef(null);
    const searchInputRef = useRef(null);

    const customerTypeOptions = useMemo(
        () =>
            ["customer", "dealer"].map((type) => ({
                value: type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
            })),
        []
    );

    // Debounced customer search
    const handleCustomerSearch = useCallback(async (value) => {
        if (value.length < 2) {
            setShowResults(false);
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const { data } = await axios.get(route("api.customer.search"), {
                params: { value },
            });

            if (data.success) {
                setSearchResults(data.customers || []);
                setShowResults(true);
            } else {
                toast.error(data.message);
                setShowResults(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
            setShowResults(false);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounce input handler
    const handleSearchInputChange = useCallback(
        (e) => {
            const value = e.target.value;
            setCustomerSearchValue(value);

            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            searchTimeoutRef.current = setTimeout(() => {
                handleCustomerSearch(value);
            }, 500);
        },
        [handleCustomerSearch]
    );

    const handleCustomerSelect = useCallback(
        (customer) => {
            setCustomerData({
                customer_id: customer.id,
                customer_name: customer.full_name,
                customer_phone: customer.phone,
                customer_email: customer.email,
                customer_address: customer.address,
                customer_city: customer.city,
                customer_country: customer.country,
            });
            setCustomerSearchValue(customer.full_name);
            setShowResults(false);
        },
        [setCustomerData]
    );

    const handleAddNewCustomer = useCallback(() => {
        setShowCustomerModal(true);
        setShowResults(false);
    }, []);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                searchInputRef.current &&
                !searchInputRef.current.contains(e.target)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Cleanup timeout
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            {/* Customer/Dealer Info */}
            <Card className="border-0 rounded-0 shadow-sm mb-3">
                <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold text-capitalize">
                        {customerType} Information
                    </h6>
                    <div className="d-flex gap-3">
                        {customerTypeOptions.map(({ value, label }) => (
                            <Form.Check
                                key={value}
                                inline
                                type="radio"
                                id={`is${value}`}
                                label={label}
                                name="customerType"
                                value={value}
                                checked={customerType === value}
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
                        {/* Search Input */}
                        <Col md={12} className="mb-3" ref={searchInputRef}>
                            <InputGroup>
                                <InputGroup.Text className="rounded-0">
                                    <FaUserTie />
                                </InputGroup.Text>
                                <Form.Control
                                    type="search"
                                    placeholder="Search customer by name, phone, or email..."
                                    className="rounded-0"
                                    value={customerSearchValue}
                                    onChange={handleSearchInputChange}
                                    onFocus={() =>
                                        customerSearchValue.length > 1 &&
                                        setShowResults(true)
                                    }
                                />
                                <InputGroup.Text
                                    className="rounded-0 cursor-pointer"
                                    onClick={handleAddNewCustomer}
                                >
                                    <FaPlusSquare />
                                </InputGroup.Text>

                                {/* Search Results */}
                                {showResults && (
                                    <ListGroup
                                        className="position-absolute rounded-0 w-100"
                                        style={{
                                            zIndex: 1050,
                                            top: "100%",
                                        }}
                                    >
                                        {isSearching ? (
                                            <ListGroup.Item className="rounded-0 text-center">
                                                Searching...
                                            </ListGroup.Item>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((customer) => (
                                                <ListGroup.Item
                                                    key={customer.id}
                                                    action
                                                    onClick={() =>
                                                        handleCustomerSelect(
                                                            customer
                                                        )
                                                    }
                                                    className="rounded-0"
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="fw-medium">
                                                            {customer.full_name ||
                                                                customer.name}
                                                        </span>
                                                        <small className="text-muted">
                                                            {customer.phone}
                                                        </small>
                                                    </div>
                                                    {customer.email && (
                                                        <div className="small text-muted text-truncate">
                                                            {customer.email}
                                                        </div>
                                                    )}
                                                </ListGroup.Item>
                                            ))
                                        ) : (
                                            <ListGroup.Item className="rounded-0 text-center text-muted">
                                                No customers found
                                            </ListGroup.Item>
                                        )}
                                    </ListGroup>
                                )}
                            </InputGroup>
                        </Col>

                        {/* Customer Details */}
                        <Col md={4} className="mb-3">
                            <Form.Group>
                                <Form.Label>Customer Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={customerData.customer_name || ""}
                                    readOnly
                                    className="bg-light"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Form.Group>
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={customerData.customer_phone || ""}
                                    readOnly
                                    className="bg-light"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={customerData.customer_email || ""}
                                    readOnly
                                    className="bg-light"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-medium">
                                Address
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={customerData.customer_address || ""}
                                placeholder="Auto-filled address"
                                disabled
                                className="bg-light"
                            />
                        </Col>

                        <Col md={3} className="mb-3">
                            <Form.Label className="fw-medium">City</Form.Label>
                            <Form.Control
                                type="text"
                                value={customerData.customer_city || ""}
                                placeholder="Auto-filled city"
                                disabled
                                className="bg-light"
                            />
                        </Col>

                        <Col md={3} className="mb-3">
                            <Form.Label className="fw-medium">
                                Country
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={customerData.customer_country || ""}
                                placeholder="Auto-filled country"
                                disabled
                                className="bg-light"
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Customer Modal */}
            <CustomerModal
                show={showCustomerModal}
                onHide={() => setShowCustomerModal(false)}
                onClose={() => setShowCustomerModal(false)}
            />
        </>
    );
};

export default CustomerInfo;
