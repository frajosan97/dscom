import { useCart } from "@/Context/CartContext";
import { Head } from "@inertiajs/react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
    Button,
    ButtonGroup,
    Col,
    Form,
    FormControl,
    InputGroup,
    Row,
    ListGroup,
} from "react-bootstrap";
import { Save, X } from "react-feather";
import {
    FaCalendarAlt,
    FaPlusSquare,
    FaPrint,
    FaReceipt,
    FaUserTie,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import CustomerModal from "@/Components/Modals/CustomerModal";
import Cart from "@/Components/Partials/Sale/Cart";
import PaymentsMethods from "@/Components/Partials/Sale/PaymentMethods";
import ProductsList from "@/Components/Partials/Sale/ProductsList";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";
import useData from "@/Hooks/useData";

const SaleForm = ({ sale = null }) => {
    const { cartItems, clearCart, cartTotal, setCartItems } = useCart();
    const [processing, setProcessing] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerSearchValue, setCustomerSearchValue] = useState(
        sale?.customer?.name || sale?.customer?.full_name || ""
    );
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(
        sale?.customer_id || null
    );
    const [selectedDate, setSelectedDate] = useState(
        sale?.date
            ? new Date(sale.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
    );
    const searchRef = useRef(null);

    // Initialize payment data
    const { paymentMethods } = useData();
    const [paymentData, setPaymentData] = useState({});

    useEffect(() => {
        const initialPayments = paymentMethods.reduce((acc, method) => {
            const payments =
                sale?.payments?.filter(
                    (p) =>
                        p.payment_method_name?.toLowerCase() ===
                        method.name.toLowerCase()
                ) || [];
            acc[method.name.toLowerCase()] = payments.map((p) => p.metadata);
            return acc;
        }, {});
        setPaymentData(initialPayments);
    }, [sale, paymentMethods]);

    // Default sale data
    const DEFAULT_SALE_DATA = useMemo(
        () => ({
            id: sale?.id || null,
            order_number: sale?.order_number || null,
            date: sale?.date || selectedDate,
            customer_id: sale?.customer_id || selectedCustomer,
        }),
        [sale, selectedDate, selectedCustomer]
    );

    useEffect(() => {
        if (sale?.items?.length > 0) {
            setTimeout(() => {
                setCartItems(
                    sale.items.map((item) => ({
                        id: item.product_id,
                        name: item.product_name,
                        price: item.price,
                        image: "",
                        quantity: item.quantity,
                    }))
                );
            }, 0);
        } else {
            clearCart();
        }
    }, [sale, clearCart, setCartItems]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Customer search
    const handleCustomerSearch = useCallback(async (e) => {
        const value = e.target.value;
        setCustomerSearchValue(value);

        if (value.length <= 2) {
            setShowResults(false);
            return;
        }

        try {
            const { data } = await xios.get(route("api.customer.search"), {
                params: { value },
            });

            if (data.success) {
                setSearchResults(data.customers);
                setShowResults(true);
            } else {
                toast.error(data.message);
                setShowResults(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
            setShowResults(false);
        }
    }, []);

    const selectCustomer = useCallback((customer) => {
        setSelectedCustomer(customer.id);
        setCustomerSearchValue(customer.name || customer.full_name);
        setShowResults(false);
    }, []);

    const handleDateChange = useCallback((e) => {
        setSelectedDate(e.target.value);
    }, []);

    const handleSaleReset = useCallback(() => {
        clearCart();
        setSelectedDate(new Date().toISOString().split("T")[0]);
        setSelectedCustomer(null);
        setCustomerSearchValue("");
        setShowCustomerModal(false);
        setShowResults(false);
        setProcessing(false);
    }, [clearCart]);

    const handleSubmit = useCallback(
        async (e, shouldPrint = false) => {
            e.preventDefault();

            if (!selectedCustomer) {
                toast.error("Please select a customer before submitting.");
                return;
            }

            if (cartTotal === 0) {
                toast.error(
                    "Cart is empty. Please add products before submitting."
                );
                return;
            }

            setProcessing(true);

            try {
                const result = await Swal.fire({
                    title: "Confirm submission",
                    text: sale
                        ? "Do you want to update this sale?"
                        : "Do you want to save this sale?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: sale
                        ? "Yes, update it!"
                        : "Yes, save it!",
                });

                if (!result.isConfirmed) {
                    setProcessing(false);
                    return;
                }

                const formData = new FormData();

                Object.entries({
                    ...DEFAULT_SALE_DATA,
                    date: selectedDate,
                    customer_id: selectedCustomer,
                    _method: sale ? "PUT" : "POST",
                }).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        formData.append(key, value);
                    }
                });

                formData.append("cartItems", JSON.stringify(cartItems));
                formData.append("paymentData", JSON.stringify(paymentData));

                const url = sale
                    ? route("sales.update", { sale: sale.id })
                    : route("sales.store");

                const { data } = await xios.post(url, formData);

                if (data.success) {
                    toast.success(data.message);

                    if (!sale) handleSaleReset();

                    if (shouldPrint) {
                        window.open(
                            route("sales.print", { sale: data.sale.id }),
                            "_blank"
                        );
                    }
                }
            } catch (error) {
                toast.error(
                    error.response?.data?.message || "An error occurred"
                );
            } finally {
                setProcessing(false);
            }
        },
        [
            DEFAULT_SALE_DATA,
            cartItems,
            cartTotal,
            handleSaleReset,
            paymentData,
            sale,
            selectedCustomer,
            selectedDate,
        ]
    );

    return (
        <ErpLayout>
            <Head title={sale ? "Edit Sale" : "Create New Sale"} />

            <Form onSubmit={(e) => handleSubmit(e, false)}>
                <Row className="g-2">
                    <Col md={8}>
                        <Row className="g-2">
                            {/* Date */}
                            <Col md={4}>
                                <InputGroup>
                                    <InputGroup.Text className="rounded-0">
                                        <FaCalendarAlt />
                                    </InputGroup.Text>
                                    <FormControl
                                        type="date"
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        className="rounded-0"
                                    />
                                </InputGroup>
                            </Col>

                            {/* Order Number */}
                            <Col md={4}>
                                <InputGroup>
                                    <InputGroup.Text className="rounded-0">
                                        <FaReceipt />
                                    </InputGroup.Text>
                                    <FormControl
                                        type="text"
                                        value={
                                            DEFAULT_SALE_DATA.order_number || ""
                                        }
                                        placeholder="Order Number"
                                        className="rounded-0"
                                        disabled
                                    />
                                </InputGroup>
                            </Col>

                            {/* Customer */}
                            <Col md={4} ref={searchRef}>
                                <InputGroup>
                                    <InputGroup.Text className="rounded-0">
                                        <FaUserTie />
                                    </InputGroup.Text>
                                    <FormControl
                                        type="search"
                                        placeholder="Customer Name or Phone..."
                                        className="rounded-0"
                                        value={customerSearchValue}
                                        onChange={handleCustomerSearch}
                                        onFocus={() =>
                                            customerSearchValue.length > 2 &&
                                            setShowResults(true)
                                        }
                                    />
                                    <InputGroup.Text
                                        className="rounded-0"
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                            setShowCustomerModal(true)
                                        }
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
                                            {searchResults.length > 0 ? (
                                                searchResults.map(
                                                    (customer) => (
                                                        <ListGroup.Item
                                                            key={customer.id}
                                                            action
                                                            onClick={() =>
                                                                selectCustomer(
                                                                    customer
                                                                )
                                                            }
                                                            className="rounded-0"
                                                        >
                                                            <div className="d-flex justify-content-between">
                                                                <span>
                                                                    {customer.name ||
                                                                        customer.full_name}
                                                                </span>
                                                                <small className="text-muted">
                                                                    {
                                                                        customer.phone
                                                                    }
                                                                </small>
                                                            </div>
                                                            {customer.email && (
                                                                <div className="small text-muted">
                                                                    {
                                                                        customer.email
                                                                    }
                                                                </div>
                                                            )}
                                                        </ListGroup.Item>
                                                    )
                                                )
                                            ) : (
                                                <ListGroup.Item className="rounded-0 text-center text-muted">
                                                    No customers found
                                                </ListGroup.Item>
                                            )}
                                        </ListGroup>
                                    )}
                                </InputGroup>
                            </Col>

                            {/* Products & Payments */}
                            <Col md={12}>
                                <ProductsList />
                                <PaymentsMethods
                                    paymentData={paymentData}
                                    setPaymentData={setPaymentData}
                                />
                            </Col>
                        </Row>
                    </Col>

                    {/* Cart (Right Side) */}
                    <Col md={4}>
                        <Cart
                            paymentData={paymentData}
                            setPaymentData={setPaymentData}
                        />

                        <ButtonGroup className="d-flex gap-2 mt-2">
                            <Button
                                type="button"
                                variant="success"
                                className="rounded-0 shadow-sm"
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={cartTotal === 0 || processing}
                            >
                                <FaPrint className="me-1" />
                                {processing
                                    ? "Processing..."
                                    : sale
                                    ? "Update & Print"
                                    : "Save & Print"}
                            </Button>
                            <Button
                                type="button"
                                variant="warning"
                                className="rounded-0 shadow-sm"
                                onClick={handleSaleReset}
                                disabled={processing}
                            >
                                <X className="me-1" />
                                {sale ? "Reset Changes" : "Cancel"}
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="rounded-0 shadow-sm"
                                disabled={cartTotal === 0 || processing}
                            >
                                <Save className="me-1" />
                                {processing
                                    ? "Processing..."
                                    : sale
                                    ? "Update Sale"
                                    : "Save"}
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            </Form>

            <CustomerModal
                show={showCustomerModal}
                onHide={() => setShowCustomerModal(false)}
                onClose={() => setShowCustomerModal(false)}
                onSuccess={(newCustomer) => {
                    selectCustomer(newCustomer);
                    setShowCustomerModal(false);
                }}
            />
        </ErpLayout>
    );
};

export default SaleForm;
