import { Head, router, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiEdit, FiShoppingCart } from "react-icons/fi";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";

import ErpLayout from "@/Layouts/ErpLayout";
import useFilterOptions from "@/Hooks/useData";
import ProductSelectionTab from "@/Components/Partials/Sale/ProductSelectionTab";
import SelectedProductsTable from "@/Components/Partials/Sale/SelectedProductsTable";
import SaleSummary from "@/Components/Partials/Sale/SaleSummary";
import CustomerModal from "@/Components/Modals/CustomerModal";
import xios from "@/Utils/axios";
import { num } from "@/Utils/helpers";

export default function SaleEdit({ sale }) {
    const {
        customers = [],
        products = [],
        paymentMethods = [],
        warehouses = [],
        shippingMethods = [],
        refreshCustomers,
    } = useFilterOptions();

    const [processing, setProcessing] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProducts, setSelectedProducts] = useState(sale.items || []);
    const [discountType, setDiscountType] = useState(
        sale.coupon?.type === "fixed_amount" ? "fixed" : "percentage"
    );
    const [paymentDate, setPaymentDate] = useState(
        sale.payment_date || new Date().toISOString().split("T")[0]
    );

    const { data, setData, errors, put } = useForm({
        // Order Information
        order_number: sale.order_number,
        invoice_number: sale.invoice_number,
        branch_id: sale.branch_id,
        user_id: sale.user_id,
        customer_id: sale.customer_id,

        // Customer Information
        customer_email: sale.customer_email,
        customer_phone: sale.customer_phone,
        customer_first_name: sale.customer_first_name,
        customer_last_name: sale.customer_last_name,
        customer_company: sale.customer_company,
        customer_tax_number: sale.customer_tax_number,

        // Address Information
        billing_address: sale.billing_address,
        shipping_address: sale.shipping_address,
        shipping_same_as_billing: sale.shipping_same_as_billing,

        // Status Information
        status: sale.status,
        fulfillment_status: sale.fulfillment_status,

        // Pricing Information
        subtotal: sale.subtotal,
        tax: sale.tax,
        shipping_cost: sale.shipping_cost,
        discount: sale.discount,
        total: sale.total,
        total_paid: sale.total_paid,
        total_refunded: sale.total_refunded,
        currency: sale.currency,

        // Payment Information
        payment_method_id: sale.payment_method_id,
        payment_method_code: sale.payment_method_code,
        payment_method_name: sale.payment_method_name,
        payment_status: sale.payment_status,
        payment_reference: sale.payment_reference,
        payment_date: paymentDate,

        // Shipping Information
        shipping_method_id: sale.shipping_method_id,
        tracking_number: sale.tracking_number,
        tracking_url: sale.tracking_url,
        shipped_at: sale.shipped_at,
        delivered_at: sale.delivered_at,

        // Coupon Information
        coupon_id: sale.coupon_id,
        coupon_code: sale.coupon_code,
        coupon_value: sale.coupon_value,

        // Notes
        customer_note: sale.customer_note,
        private_notes: sale.private_notes,

        // Technical Information
        custom_fields: sale.custom_fields,
        ip_address: sale.ip_address,
        user_agent: sale.user_agent,

        // Products
        items: sale.items || [],
    });

    useEffect(() => {
        const subtotal = selectedProducts.reduce(
            (sum, p) => sum + num(p.price) * num(p.quantity),
            0
        );

        const taxPct = num(data.tax_percentage);
        const taxAmount =
            taxPct > 0 ? (subtotal * taxPct) / 100 : num(data.tax);
        const discountAmount = num(data.discount);
        const shippingAmount = num(data.shipping_cost);

        const total = +(
            subtotal +
            taxAmount -
            discountAmount +
            shippingAmount
        ).toFixed(2);
        const dueAmount = +(total - num(data.total_paid)).toFixed(2);

        setData({
            ...data,
            subtotal: subtotal,
            tax: taxAmount,
            discount: discountAmount,
            total: total,
            total_paid: data.total_paid || 0,
            due_amount: dueAmount,
            items: selectedProducts.map((p) => ({
                product_id: p.product_id,
                product_variant_id: p.product_variant_id,
                product_name: p.product_name,
                description: p.description,
                price: p.price,
                original_price: p.original_price,
                tax_amount: p.tax_amount,
                discount_amount: p.discount_amount,
                quantity: p.quantity,
                total: p.price * p.quantity,
                options: p.options,
                attributes: p.attributes,
            })),
        });
    }, [
        selectedProducts,
        data.tax,
        data.discount,
        data.shipping_cost,
        data.total_paid,
    ]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // set processing to true
        setProcessing(true);

        try {
            const response = await xios.put(
                route("sales.update", sale.id),
                data
            );
            if (response.data.success) {
                toast.success(response.data.message);
                router.visit(route("sales.show", sale.id));
            }
        } catch (error) {
            setProcessing(false);
            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors;
                Object.values(errorMessages).forEach((messages) => {
                    messages.forEach((message) => {
                        toast.error(message);
                    });
                });
            } else {
                toast.error(
                    error.response?.data?.message ||
                        "An error occurred while updating the order"
                );
            }
        }
    };

    const addProduct = (product) => {
        const existingProduct = selectedProducts.find(
            (p) => p.product_id === product.id
        );
        if (existingProduct) {
            setSelectedProducts(
                selectedProducts.map((p) =>
                    p.product_id === product.id
                        ? {
                              ...p,
                              quantity: p.quantity + 1,
                              total: p.price * (p.quantity + 1),
                          }
                        : p
                )
            );
        } else {
            setSelectedProducts([
                ...selectedProducts,
                {
                    product_id: product.id,
                    product_name: product.name,
                    description: product.description,
                    price: product.price,
                    original_price: product.price,
                    tax_amount: 0,
                    discount_amount: 0,
                    quantity: 1,
                    total: product.price,
                    options: product.options || null,
                    attributes: product.attributes || null,
                },
            ]);
        }
    };

    const removeProduct = (productId) => {
        setSelectedProducts(
            selectedProducts.filter((p) => p.product_id !== productId)
        );
    };

    const updateProductQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setSelectedProducts(
            selectedProducts.map((p) =>
                p.product_id === productId
                    ? {
                          ...p,
                          quantity: parseInt(quantity),
                          total: p.price * parseInt(quantity),
                      }
                    : p
            )
        );
    };

    const updateProductPrice = (productId, price) => {
        setSelectedProducts(
            selectedProducts.map((p) =>
                p.product_id === productId
                    ? {
                          ...p,
                          price: parseFloat(price),
                          total: parseFloat(price) * p.quantity,
                      }
                    : p
            )
        );
    };

    const filteredProducts = (products || []).filter(
        (product) =>
            product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product?.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusOptions = [
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "processing", label: "Processing" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
        { value: "refunded", label: "Refunded" },
        { value: "partially_refunded", label: "Partially Refunded" },
        { value: "on_hold", label: "On Hold" },
        { value: "failed", label: "Failed" },
        { value: "completed", label: "Completed" },
    ];

    const paymentStatusOptions = [
        { value: "pending", label: "Pending" },
        { value: "paid", label: "Paid" },
        { value: "failed", label: "Failed" },
        { value: "partially_paid", label: "Partially Paid" },
        { value: "refunded", label: "Refunded" },
    ];

    const fulfillmentStatusOptions = [
        { value: "unfulfilled", label: "Unfulfilled" },
        { value: "partially_fulfilled", label: "Partially Fulfilled" },
        { value: "fulfilled", label: "Fulfilled" },
    ];

    const handleCustomerAdded = () => {
        refreshCustomers();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <Badge bg="warning">Pending</Badge>;
            case "confirmed":
                return <Badge bg="primary">Confirmed</Badge>;
            case "processing":
                return <Badge bg="info">Processing</Badge>;
            case "shipped":
                return <Badge bg="secondary">Shipped</Badge>;
            case "delivered":
                return <Badge bg="success">Delivered</Badge>;
            case "cancelled":
                return <Badge bg="danger">Cancelled</Badge>;
            case "refunded":
                return (
                    <Badge bg="light" text="dark">
                        Refunded
                    </Badge>
                );
            case "partially_refunded":
                return (
                    <Badge bg="light" text="dark">
                        Partially Refunded
                    </Badge>
                );
            case "on_hold":
                return <Badge bg="warning">On Hold</Badge>;
            case "failed":
                return <Badge bg="danger">Failed</Badge>;
            case "completed":
                return <Badge bg="success">Completed</Badge>;
            default:
                return <Badge bg="secondary">Unknown</Badge>;
        }
    };

    return (
        <ErpLayout>
            <Head title={`Edit Order #${sale.order_number}`} />
            <Container fluid>
                <form onSubmit={handleSubmit}>
                    <Row className="g-4">
                        <Col lg={8}>
                            <Card className="mb-4">
                                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                                    <div>
                                        <FiEdit className="me-2" />
                                        <strong>
                                            Edit Order #{sale.order_number}
                                        </strong>
                                        <span className="ms-3">
                                            {getStatusBadge(sale.status)}
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted">
                                            Created:{" "}
                                            {new Date(
                                                sale.created_at
                                            ).toLocaleString()}
                                        </small>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <ProductSelectionTab
                                        products={filteredProducts}
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        addProduct={addProduct}
                                    />

                                    <Card className="mt-3">
                                        <Card.Header className="bg-light">
                                            <h6 className="mb-0">
                                                Order Items
                                            </h6>
                                        </Card.Header>
                                        <Card.Body className="p-0">
                                            <SelectedProductsTable
                                                selectedProducts={
                                                    selectedProducts
                                                }
                                                removeProduct={removeProduct}
                                                updateProductQuantity={
                                                    updateProductQuantity
                                                }
                                                updateProductPrice={
                                                    updateProductPrice
                                                }
                                                currency={data.currency}
                                            />
                                        </Card.Body>
                                    </Card>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            <SaleSummary
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                customers={customers}
                                warehouses={warehouses}
                                paymentMethods={paymentMethods}
                                shippingMethods={shippingMethods}
                                statusOptions={statusOptions}
                                paymentStatusOptions={paymentStatusOptions}
                                fulfillmentStatusOptions={
                                    fulfillmentStatusOptions
                                }
                                discountType={discountType}
                                setDiscountType={setDiscountType}
                                paymentDate={paymentDate}
                                setPaymentDate={setPaymentDate}
                                handleSubmit={handleSubmit}
                                setShowCustomerModal={setShowCustomerModal}
                                isEdit={true}
                                order={sale}
                            />
                        </Col>
                    </Row>
                </form>

                <CustomerModal
                    show={showCustomerModal}
                    onClose={() => setShowCustomerModal(false)}
                    onCustomerAdded={handleCustomerAdded}
                />
            </Container>
        </ErpLayout>
    );
}
