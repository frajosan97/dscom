import { useCart } from "@/Context/CartContext";
import { Head, Link } from "@inertiajs/react";
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
    Card,
    Badge,
    Spinner,
    Alert,
    Dropdown,
} from "react-bootstrap";
import { Save, X, Search, Filter, Hash } from "react-feather";
import {
    FaCalendarAlt,
    FaPlusSquare,
    FaPrint,
    FaReceipt,
    FaUserTie,
    FaSearch,
    FaBarcode,
    FaTag,
    FaBox,
    FaTimes,
    FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { printReceipt } from "@/Components/Print/PrintReceipt";

import Cart from "@/Components/Partials/Sale/Cart";
import PaymentsMethods from "@/Components/Partials/Sale/PaymentMethods";
import ErpLayout from "@/Layouts/ErpLayout";
import xios from "@/Utils/axios";
import Swal from "sweetalert2";
import useData from "@/Hooks/useData";
import ProductCard from "@/Components/Settings/ProductCard";
import { formatCurrency } from "@/Utils/helpers";

const SaleForm = ({ sale = null }) => {
    const { cartItems, clearCart, cartTotal, setCartItems, addToCart } =
        useCart();
    const [processing, setProcessing] = useState(false);
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
    const customerSearchRef = useRef(null);

    // Product search state
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("barcode"); // Default to barcode
    const [isSearchingProducts, setIsSearchingProducts] = useState(false);
    const [searchedProducts, setSearchedProducts] = useState([]);
    const [productSearchResults, setProductSearchResults] = useState([]);
    const [showProductSearchResults, setShowProductSearchResults] =
        useState(false);
    const productSearchRef = useRef(null);

    // Barcode specific state
    const [barcodeInput, setBarcodeInput] = useState("");
    const [isBarcodeMode, setIsBarcodeMode] = useState(true);
    const [barcodeTimeout, setBarcodeTimeout] = useState(null);
    const barcodeInputRef = useRef(null);

    // Initialize payment data
    const { products, paymentMethods } = useData();
    const [paymentData, setPaymentData] = useState({});

    // Function to generate order number
    const generateOrderNumber = useCallback(() => {
        // If editing an existing sale, use the existing order number
        if (sale?.order_number) {
            return sale.order_number;
        }

        // Generate a new order number for new sales
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${randomNum}`;
    }, [sale]);

    // Default sale data
    const DEFAULT_SALE_DATA = useMemo(
        () => ({
            id: sale?.id || null,
            order_number: generateOrderNumber(),
            date: sale?.date || selectedDate,
            customer_id: sale?.customer_id || selectedCustomer,
        }),
        [sale, selectedDate, selectedCustomer, generateOrderNumber]
    );

    // Initialize payment data from sale
    useEffect(() => {
        if (!sale?.payments || !paymentMethods.length) return;

        const initialPayments = paymentMethods.reduce((acc, method) => {
            const methodName = method.name.toLowerCase();
            const payments = sale.payments.filter(
                (p) => p.payment_method_name?.toLowerCase() === methodName
            );

            if (payments.length > 0) {
                acc[methodName] = payments.map((p) => p.metadata || {});
            }
            return acc;
        }, {});

        setPaymentData(initialPayments);
    }, [sale, paymentMethods]);

    // Initialize cart from sale items
    useEffect(() => {
        if (sale?.items?.length > 0) {
            const saleCartItems = sale.items.map((item) => ({
                id: item.product_id,
                name: item.product_name,
                price: item.unit_price || item.price,
                image: "",
                quantity: item.quantity,
                product_item_id: item.product_item_id,
                sku: item.sku,
            }));
            setCartItems(saleCartItems);
        }
    }, [sale, setCartItems]);

    // Focus on barcode input on mount
    useEffect(() => {
        if (barcodeInputRef.current && !sale) {
            barcodeInputRef.current.focus();
        }
    }, [sale]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                customerSearchRef.current &&
                !customerSearchRef.current.contains(event.target) &&
                productSearchRef.current &&
                !productSearchRef.current.contains(event.target)
            ) {
                setShowResults(false);
                setShowProductSearchResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Filter products based on search
    useEffect(() => {
        if (!products || products.length === 0) return;

        if (!productSearchQuery.trim()) {
            setSearchedProducts(products);
            return;
        }

        const query = productSearchQuery.toLowerCase().trim();
        let filteredProducts = [];

        switch (searchType) {
            case "barcode":
                filteredProducts = products.filter(
                    (product) =>
                        product.barcode?.toLowerCase().includes(query) ||
                        product.product_items?.some((item) =>
                            item.barcode?.toLowerCase().includes(query)
                        )
                );
                break;
            case "sku":
                filteredProducts = products.filter(
                    (product) =>
                        product.sku?.toLowerCase().includes(query) ||
                        product.product_items?.some((item) =>
                            item.sku?.toLowerCase().includes(query)
                        )
                );
                break;
            case "category":
                filteredProducts = products.filter(
                    (product) =>
                        product.category?.name?.toLowerCase().includes(query) ||
                        product.product_items?.some((item) =>
                            item.category?.name?.toLowerCase().includes(query)
                        )
                );
                break;
            case "name":
            default:
                filteredProducts = products.filter(
                    (product) =>
                        product.name?.toLowerCase().includes(query) ||
                        product.description?.toLowerCase().includes(query) ||
                        product.product_items?.some(
                            (item) =>
                                item.name?.toLowerCase().includes(query) ||
                                item.description?.toLowerCase().includes(query)
                        )
                );
                break;
        }

        setSearchedProducts(filteredProducts);
    }, [products, productSearchQuery, searchType]);

    // Quick add product from search results - MOVED BEFORE searchByBarcode
    const quickAddProduct = useCallback(
        (product) => {
            // Check if product already in cart
            const existingItem = cartItems.find(
                (item) =>
                    item.id === product.id ||
                    (product.product_item_id &&
                        item.product_item_id === product.product_item_id)
            );

            if (existingItem) {
                // Update quantity
                const updatedCart = cartItems.map((item) =>
                    item.id === product.id ||
                    (product.product_item_id &&
                        item.product_item_id === product.product_item_id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
                setCartItems(updatedCart);
                toast.info(`Increased quantity of ${product.name}`);
            } else {
                // Add new item
                const newItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price || product.selling_price || 0,
                    image: product.image || product.image_url || "",
                    quantity: 1,
                    product_item_id: product.product_item_id || null,
                    sku: product.sku || product.code,
                    barcode: product.barcode,
                    stock: product.stock_quantity || product.quantity || 0,
                };
                addToCart(newItem);
                toast.success(`Added ${product.name} to cart`);
            }

            // Clear search
            setProductSearchQuery("");
            setBarcodeInput("");
            setShowProductSearchResults(false);

            // Refocus on barcode input
            if (barcodeInputRef.current && isBarcodeMode) {
                barcodeInputRef.current.focus();
            }
        },
        [cartItems, setCartItems, addToCart, isBarcodeMode]
    );

    // Customer search
    const handleCustomerSearch = useCallback(async (value) => {
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
                setSearchResults(data.customers || []);
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

    // Search product by barcode - MOVED AFTER quickAddProduct
    const searchByBarcode = useCallback(
        async (barcode) => {
            if (!barcode.trim()) {
                setProductSearchResults([]);
                return;
            }

            setIsSearchingProducts(true);
            try {
                // First search in local products
                const localResults = products.filter(
                    (product) =>
                        product.barcode === barcode ||
                        product.product_items?.some(
                            (item) => item.barcode === barcode
                        )
                );

                if (localResults.length > 0) {
                    setProductSearchResults(localResults);
                    setShowProductSearchResults(true);
                    // Auto-add if only one result found
                    if (localResults.length === 1) {
                        quickAddProduct(localResults[0]);
                        setBarcodeInput("");
                    }
                    setIsSearchingProducts(false);
                    return;
                }

                // If not found locally, search via API
                const { data } = await xios.get(route("api.products.search"), {
                    params: {
                        query: barcode,
                        search_type: "barcode",
                    },
                });

                if (data.success && data.products?.length > 0) {
                    setProductSearchResults(data.products);
                    setShowProductSearchResults(true);
                    // Auto-add if only one result found
                    if (data.products.length === 1) {
                        quickAddProduct(data.products[0]);
                        setBarcodeInput("");
                    }
                } else {
                    toast.info(`No product found with barcode: ${barcode}`);
                    setProductSearchResults([]);
                }
            } catch (error) {
                console.error("Barcode search error:", error);
                toast.error("Failed to search product");
            } finally {
                setIsSearchingProducts(false);
            }
        },
        [products, quickAddProduct]
    );

    // Handle barcode input with auto-submit
    const handleBarcodeInput = useCallback(
        (e) => {
            const value = e.target.value;
            setBarcodeInput(value);

            // Clear previous timeout
            if (barcodeTimeout) {
                clearTimeout(barcodeTimeout);
            }

            // Set a timeout to auto-search after barcode is entered
            // Barcode scanners typically send an Enter key or pause at the end
            const newTimeout = setTimeout(() => {
                if (value.trim().length >= 3) {
                    // Minimum barcode length
                    searchByBarcode(value);
                }
            }, 300); // 300ms delay to allow barcode scanner to complete

            setBarcodeTimeout(newTimeout);
        },
        [barcodeTimeout, searchByBarcode]
    );

    // Handle manual product search (by name or specs)
    const handleManualProductSearch = useCallback(
        async (query) => {
            if (!query.trim()) {
                setProductSearchResults([]);
                setShowProductSearchResults(false);
                return;
            }

            setIsSearchingProducts(true);
            try {
                const { data } = await xios.get(route("api.products.search"), {
                    params: {
                        query,
                        search_type: searchType,
                    },
                });

                if (data.success) {
                    setProductSearchResults(data.products || []);
                    setShowProductSearchResults(true);
                } else {
                    toast.error(data.message);
                    setProductSearchResults([]);
                }
            } catch (error) {
                console.error("Product search error:", error);
                setProductSearchResults([]);
            } finally {
                setIsSearchingProducts(false);
            }
        },
        [searchType]
    );

    const selectCustomer = useCallback((customer) => {
        setSelectedCustomer(customer.id);
        setCustomerSearchValue(customer.name || customer.full_name || "");
        setShowResults(false);
    }, []);

    const handleDateChange = useCallback((e) => {
        setSelectedDate(e.target.value);
    }, []);

    const handleSaleReset = useCallback(() => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will reset all changes and clear the cart.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, reset!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                clearCart();
                setSelectedDate(new Date().toISOString().split("T")[0]);
                setSelectedCustomer(null);
                setCustomerSearchValue("");
                setProductSearchQuery("");
                setBarcodeInput("");
                setShowResults(false);
                setShowProductSearchResults(false);
                setPaymentData({});
                toast.success("Sale form has been reset");

                // Refocus on barcode input
                if (barcodeInputRef.current && isBarcodeMode) {
                    barcodeInputRef.current.focus();
                }
            }
        });
    }, [clearCart, isBarcodeMode]);

    const validateForm = useCallback(() => {
        if (!selectedCustomer) {
            toast.error("Please select a customer before submitting.");
            return false;
        }

        if (cartTotal <= 0) {
            toast.error(
                "Cart is empty. Please add products before submitting."
            );
            return false;
        }

        // Validate payment data if needed
        const totalPayments = Object.values(paymentData)
            .flat()
            .reduce(
                (sum, payment) => sum + (parseFloat(payment.amount) || 0),
                0
            );

        if (totalPayments < cartTotal) {
            toast.warning("Total payments are less than cart total.");
        }

        return true;
    }, [selectedCustomer, cartTotal, paymentData]);

    const handleSubmit = useCallback(
        async (e, shouldPrint = false) => {
            e.preventDefault();

            if (!validateForm()) {
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
                    cancelButtonText: "Cancel",
                });

                if (!result.isConfirmed) {
                    setProcessing(false);
                    return;
                }

                const formData = {
                    ...DEFAULT_SALE_DATA,
                    date: selectedDate,
                    customer_id: selectedCustomer,
                    cartItems: cartItems.map((item) => ({
                        product_id: item.id,
                        product_item_id: item.product_item_id,
                        quantity: item.quantity,
                        unit_price: item.price,
                    })),
                    paymentData,
                };

                const url = sale
                    ? route("sales.update", { sale: sale.id })
                    : route("sales.store");

                const method = sale ? "PUT" : "POST";

                const response = await xios({
                    method,
                    url,
                    data: formData,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.data.success) {
                    toast.success(response.data.message);

                    if (shouldPrint && response.data.data?.order) {
                        printReceipt(response.data.data.order);
                    }

                    if (!sale) {
                        // Clear cart only for new sales
                        clearCart();
                        setProductSearchQuery("");
                        setBarcodeInput("");
                        // Refocus on barcode input after saving
                        if (barcodeInputRef.current && isBarcodeMode) {
                            barcodeInputRef.current.focus();
                        }
                    }
                }
            } catch (error) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.response?.data?.errors ||
                    "An error occurred while saving the sale";
                toast.error(errorMessage);
                console.error("Sale submission error:", error);
            } finally {
                setProcessing(false);
            }
        },
        [
            DEFAULT_SALE_DATA,
            cartItems,
            cartTotal,
            paymentData,
            sale,
            selectedCustomer,
            selectedDate,
            validateForm,
            clearCart,
            isBarcodeMode,
        ]
    );

    const handleSearchChange = (e) => {
        handleCustomerSearch(e.target.value);
    };

    // Helper function to get order number display text
    const getOrderNumberDisplay = () => {
        if (sale?.order_number) {
            return sale.order_number;
        }
        return DEFAULT_SALE_DATA.order_number || "Auto-generated";
    };

    // Search type options
    const searchTypeOptions = [
        {
            value: "barcode",
            label: "Barcode",
            icon: <FaBarcode className="me-1" />,
        },
        {
            value: "name",
            label: "Name",
            icon: <FaTag className="me-1" />,
        },
        {
            value: "sku",
            label: "SKU",
            icon: <Hash size={14} className="me-1" />,
        },
        {
            value: "category",
            label: "Category",
            icon: <FaBox className="me-1" />,
        },
    ];

    return (
        <ErpLayout>
            <Head title={sale ? "Edit Sale" : "Create New Sale"} />

            <Form onSubmit={(e) => handleSubmit(e, false)}>
                <Row className="g-2">
                    <Col md={8}>
                        <Row className="g-2 mb-3">
                            {/* Date */}
                            <Col md={3}>
                                <InputGroup>
                                    <InputGroup.Text className="rounded-0">
                                        <FaCalendarAlt />
                                    </InputGroup.Text>
                                    <FormControl
                                        type="date"
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        className="rounded-0"
                                        required
                                    />
                                </InputGroup>
                            </Col>

                            {/* Order Number */}
                            <Col md={3}>
                                <InputGroup>
                                    <InputGroup.Text className="rounded-0">
                                        <FaReceipt />
                                    </InputGroup.Text>
                                    <FormControl
                                        type="text"
                                        value={getOrderNumberDisplay()}
                                        placeholder="Order Number"
                                        className="rounded-0"
                                        disabled
                                        readOnly
                                    />
                                </InputGroup>
                            </Col>

                            {/* Customer */}
                            <Col md={6} ref={customerSearchRef}>
                                <InputGroup>
                                    <InputGroup.Text className="rounded-0">
                                        <FaUserTie />
                                    </InputGroup.Text>
                                    <FormControl
                                        type="search"
                                        placeholder="Customer Name or Phone..."
                                        className="rounded-0"
                                        value={customerSearchValue}
                                        onChange={handleSearchChange}
                                        onFocus={() =>
                                            customerSearchValue.length > 2 &&
                                            setShowResults(true)
                                        }
                                        required
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        className="rounded-0"
                                        type="button"
                                        as={Link}
                                        href={route("customers.create")}
                                    >
                                        <FaPlusSquare />
                                    </Button>

                                    {/* Customer Search Results */}
                                    {showResults &&
                                        searchResults.length > 0 && (
                                            <ListGroup
                                                className="position-absolute rounded-0 w-100"
                                                style={{
                                                    zIndex: 1050,
                                                    top: "100%",
                                                    maxHeight: "300px",
                                                    overflowY: "auto",
                                                }}
                                            >
                                                {searchResults.map(
                                                    (customer) => (
                                                        <ListGroup.Item
                                                            key={customer.id}
                                                            action
                                                            onClick={() =>
                                                                selectCustomer(
                                                                    customer
                                                                )
                                                            }
                                                            className="rounded-0 border-top-0"
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <strong>
                                                                        {customer.name ||
                                                                            customer.full_name}
                                                                    </strong>
                                                                    <div className="small text-muted">
                                                                        {customer.email &&
                                                                            `${customer.email} • `}
                                                                        {
                                                                            customer.phone
                                                                        }
                                                                    </div>
                                                                </div>
                                                                {customer.id ===
                                                                    selectedCustomer && (
                                                                    <span className="badge bg-success">
                                                                        Selected
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </ListGroup.Item>
                                                    )
                                                )}
                                            </ListGroup>
                                        )}
                                </InputGroup>
                            </Col>

                            {/* Product Search Section */}
                            <Col xs={12} ref={productSearchRef}>
                                <Card className="rounded-0 border">
                                    <Card.Body className="p-3">
                                        <Row className="align-items-center g-2">
                                            <Col xs="auto">
                                                <Button
                                                    variant={
                                                        isBarcodeMode
                                                            ? "primary"
                                                            : "outline-primary"
                                                    }
                                                    className="rounded-0"
                                                    onClick={() =>
                                                        setIsBarcodeMode(true)
                                                    }
                                                    title="Barcode Scanner Mode"
                                                >
                                                    <FaBarcode className="me-1" />
                                                    Scan
                                                </Button>
                                            </Col>
                                            <Col xs="auto">
                                                <Button
                                                    variant={
                                                        !isBarcodeMode
                                                            ? "primary"
                                                            : "outline-primary"
                                                    }
                                                    className="rounded-0"
                                                    onClick={() =>
                                                        setIsBarcodeMode(false)
                                                    }
                                                    title="Manual Search Mode"
                                                >
                                                    <FaSearch className="me-1" />
                                                    Search
                                                </Button>
                                            </Col>
                                            <Col>
                                                {isBarcodeMode ? (
                                                    <InputGroup>
                                                        <InputGroup.Text className="rounded-0">
                                                            <FaBarcode />
                                                        </InputGroup.Text>
                                                        <FormControl
                                                            ref={
                                                                barcodeInputRef
                                                            }
                                                            type="text"
                                                            placeholder="Scan barcode or enter barcode number..."
                                                            className="rounded-0"
                                                            value={barcodeInput}
                                                            onChange={
                                                                handleBarcodeInput
                                                            }
                                                            onKeyPress={(e) => {
                                                                if (
                                                                    e.key ===
                                                                    "Enter"
                                                                ) {
                                                                    e.preventDefault();
                                                                    searchByBarcode(
                                                                        barcodeInput
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        {barcodeInput && (
                                                            <Button
                                                                variant="outline-secondary"
                                                                className="rounded-0"
                                                                onClick={() => {
                                                                    setBarcodeInput(
                                                                        ""
                                                                    );
                                                                    barcodeInputRef.current.focus();
                                                                }}
                                                            >
                                                                <FaTimes />
                                                            </Button>
                                                        )}
                                                    </InputGroup>
                                                ) : (
                                                    <InputGroup>
                                                        <Dropdown>
                                                            <Dropdown.Toggle
                                                                variant="outline-secondary"
                                                                className="rounded-0"
                                                                id="search-type-dropdown"
                                                            >
                                                                {
                                                                    searchTypeOptions.find(
                                                                        (opt) =>
                                                                            opt.value ===
                                                                            searchType
                                                                    )?.icon
                                                                }
                                                                {
                                                                    searchTypeOptions.find(
                                                                        (opt) =>
                                                                            opt.value ===
                                                                            searchType
                                                                    )?.label
                                                                }
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu className="rounded-0">
                                                                {searchTypeOptions.map(
                                                                    (
                                                                        option
                                                                    ) => (
                                                                        <Dropdown.Item
                                                                            key={
                                                                                option.value
                                                                            }
                                                                            onClick={() =>
                                                                                setSearchType(
                                                                                    option.value
                                                                                )
                                                                            }
                                                                            active={
                                                                                searchType ===
                                                                                option.value
                                                                            }
                                                                        >
                                                                            {
                                                                                option.icon
                                                                            }
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </Dropdown.Item>
                                                                    )
                                                                )}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                        <FormControl
                                                            type="search"
                                                            placeholder={`Search by ${searchType}...`}
                                                            className="rounded-0"
                                                            value={
                                                                productSearchQuery
                                                            }
                                                            onChange={(e) => {
                                                                setProductSearchQuery(
                                                                    e.target
                                                                        .value
                                                                );
                                                                handleManualProductSearch(
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            onKeyPress={(e) => {
                                                                if (
                                                                    e.key ===
                                                                    "Enter"
                                                                ) {
                                                                    e.preventDefault();
                                                                    handleManualProductSearch(
                                                                        productSearchQuery
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            variant="outline-primary"
                                                            className="rounded-0"
                                                            onClick={() =>
                                                                handleManualProductSearch(
                                                                    productSearchQuery
                                                                )
                                                            }
                                                            disabled={
                                                                isSearchingProducts ||
                                                                !productSearchQuery.trim()
                                                            }
                                                        >
                                                            {isSearchingProducts ? (
                                                                <Spinner
                                                                    animation="border"
                                                                    size="sm"
                                                                />
                                                            ) : (
                                                                <FaSearch />
                                                            )}
                                                        </Button>
                                                        {productSearchQuery && (
                                                            <Button
                                                                variant="outline-secondary"
                                                                className="rounded-0"
                                                                onClick={() => {
                                                                    setProductSearchQuery(
                                                                        ""
                                                                    );
                                                                    setProductSearchResults(
                                                                        []
                                                                    );
                                                                    setShowProductSearchResults(
                                                                        false
                                                                    );
                                                                }}
                                                            >
                                                                <FaTimes />
                                                            </Button>
                                                        )}
                                                    </InputGroup>
                                                )}
                                            </Col>
                                        </Row>

                                        {/* Product Search Results */}
                                        {showProductSearchResults &&
                                            productSearchResults.length > 0 && (
                                                <Card className="mt-2 rounded-0">
                                                    <Card.Header className="py-2 px-3 bg-light d-flex justify-content-between align-items-center">
                                                        <small className="text-muted">
                                                            Found{" "}
                                                            {
                                                                productSearchResults.length
                                                            }{" "}
                                                            product(s)
                                                        </small>
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="p-0"
                                                            onClick={() =>
                                                                setShowProductSearchResults(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            <FaTimes />
                                                        </Button>
                                                    </Card.Header>
                                                    <ListGroup
                                                        variant="flush"
                                                        className="max-h-300 overflow-auto"
                                                    >
                                                        {productSearchResults.map(
                                                            (product) => (
                                                                <ListGroup.Item
                                                                    key={
                                                                        product.id
                                                                    }
                                                                    className="p-2 border-bottom"
                                                                    action
                                                                    onClick={() =>
                                                                        quickAddProduct(
                                                                            product
                                                                        )
                                                                    }
                                                                >
                                                                    <Row className="align-items-center">
                                                                        <Col xs="auto">
                                                                            {product.image ? (
                                                                                <img
                                                                                    src={
                                                                                        product.image
                                                                                    }
                                                                                    alt={
                                                                                        product.name
                                                                                    }
                                                                                    className="rounded"
                                                                                    style={{
                                                                                        width: "40px",
                                                                                        height: "40px",
                                                                                        objectFit:
                                                                                            "cover",
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <div
                                                                                    className="rounded bg-secondary d-flex align-items-center justify-content-center"
                                                                                    style={{
                                                                                        width: "40px",
                                                                                        height: "40px",
                                                                                    }}
                                                                                >
                                                                                    <FaBox className="text-white" />
                                                                                </div>
                                                                            )}
                                                                        </Col>
                                                                        <Col>
                                                                            <div className="d-flex justify-content-between">
                                                                                <div>
                                                                                    <strong>
                                                                                        {
                                                                                            product.name
                                                                                        }
                                                                                    </strong>
                                                                                    {product.description && (
                                                                                        <div className="small text-muted">
                                                                                            {product
                                                                                                .description
                                                                                                .length >
                                                                                            50
                                                                                                ? `${product.description.substring(
                                                                                                      0,
                                                                                                      50
                                                                                                  )}...`
                                                                                                : product.description}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="text-end">
                                                                                    <div className="fw-bold">
                                                                                        {formatCurrency(
                                                                                            product.price ||
                                                                                                product.selling_price ||
                                                                                                0
                                                                                        )}
                                                                                    </div>
                                                                                    {product.barcode && (
                                                                                        <small className="text-muted">
                                                                                            <FaBarcode className="me-1" />
                                                                                            {
                                                                                                product.barcode
                                                                                            }
                                                                                        </small>
                                                                                    )}
                                                                                    {product.stock_quantity !==
                                                                                        undefined && (
                                                                                        <div className="small">
                                                                                            Stock:{" "}
                                                                                            {
                                                                                                product.stock_quantity
                                                                                            }
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </Col>
                                                                    </Row>
                                                                </ListGroup.Item>
                                                            )
                                                        )}
                                                    </ListGroup>
                                                </Card>
                                            )}

                                        {showProductSearchResults &&
                                            productSearchResults.length ===
                                                0 && (
                                                <Alert
                                                    variant="info"
                                                    className="mt-2 mb-0 rounded-0"
                                                >
                                                    <FaInfoCircle className="me-2" />
                                                    No products found. Try a
                                                    different search term.
                                                </Alert>
                                            )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Products & Payments */}
                        <Row className="g-2">
                            <Col xs={12}>
                                <PaymentsMethods
                                    paymentData={paymentData}
                                    setPaymentData={setPaymentData}
                                    cartTotal={cartTotal}
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

                        <ButtonGroup className="d-flex gap-2 mt-3">
                            <Button
                                type="button"
                                variant="success"
                                className="rounded-0 shadow-sm flex-fill"
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={processing || cartTotal === 0}
                            >
                                <FaPrint className="me-2" />
                                {processing
                                    ? "Processing..."
                                    : sale
                                    ? "Update & Print"
                                    : "Save & Print"}
                            </Button>
                            <Button
                                type="button"
                                variant="warning"
                                className="rounded-0 shadow-sm flex-fill"
                                onClick={handleSaleReset}
                                disabled={processing}
                            >
                                <X className="me-2" />
                                {sale ? "Reset" : "Cancel"}
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="rounded-0 shadow-sm flex-fill"
                                disabled={processing || cartTotal === 0}
                            >
                                <Save className="me-2" />
                                {processing
                                    ? "Processing..."
                                    : sale
                                    ? "Update Sale"
                                    : "Save Sale"}
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            </Form>
        </ErpLayout>
    );
};

export default SaleForm;
