import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    Card,
    Container,
    Row,
    Col,
    Button,
    Image,
    Form,
    Table,
    Alert,
    Badge,
    Spinner,
} from "react-bootstrap";
import {
    FaTrash,
    FaPlus,
    FaMinus,
    FaArrowLeft,
    FaCreditCard,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaShoppingBag,
    FaBox,
    FaTag,
} from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Link } from "@inertiajs/react";
import xios from "@/Utils/axios";
import { formatCurrency } from "@/Utils/helpers";

export default function Cart() {
    const { auth } = usePage().props;
    const {
        cartItems = [],
        addToCart = () => {},
        removeFromCart = () => {},
        updateQuantity = () => {},
        clearCart = () => {},
        cartTotal = 0,
        itemCount = 0,
    } = useCart();

    console.log(cartItems);

    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutStatus, setCheckoutStatus] = useState(null);
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [orderNumber, setOrderNumber] = useState(0);
    const [shippingFee, setShippingFee] = useState(5.99);
    const [freeShippingThreshold] = useState(50);

    // Calculate shipping cost
    const calculateShipping = () => {
        return cartTotal >= freeShippingThreshold ? 0 : shippingFee;
    };

    const shippingCost = calculateShipping();

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        setCheckoutStatus(null);

        try {
            if (auth?.user) {
                const response = await xios.post(route("cart.checkout"), {
                    cartItems,
                    cartTotal: grandTotal,
                    itemCount,
                    discount,
                    shippingCost,
                    couponCode: discount > 0 ? couponCode : null,
                });

                if (response.status === 200) {
                    setOrderNumber(
                        response.data.order_number || response.data.orderNumber
                    );
                    setIsCheckingOut(false);
                    setCheckoutStatus("success");
                    clearCart();
                }
            } else {
                router.get(route("login"));
            }
        } catch (error) {
            setIsCheckingOut(false);
            setCheckoutStatus("error");
            console.error("Checkout error:", error);
        }
    };

    const applyCoupon = () => {
        if (!couponCode.trim()) return;

        // Simple coupon logic - in production, validate against backend
        const coupon = couponCode.toUpperCase();
        if (coupon === "SAVE10") {
            setDiscount(cartTotal * 0.1); // 10% discount
            setCheckoutStatus(null);
        } else if (coupon === "FREESHIP" && cartTotal < freeShippingThreshold) {
            setShippingFee(0);
            setCheckoutStatus(null);
        } else if (coupon === "SAVE20") {
            setDiscount(Math.min(cartTotal * 0.2, 50)); // 20% discount, max $50
            setCheckoutStatus(null);
        } else {
            setCheckoutStatus("invalid_coupon");
        }
    };

    const removeCoupon = () => {
        setCouponCode("");
        setDiscount(0);
        setShippingFee(5.99); // Reset to default
        setCheckoutStatus(null);
    };

    const grandTotal = cartTotal - discount + shippingCost;

    // Calculate estimated delivery date (3-5 business days)
    const getEstimatedDelivery = () => {
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 5);
        return deliveryDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    };

    // Get image URL for cart item
    const getItemImage = (item) => {
        if (item.image) return item.image;
        if (item.default_image?.image_path)
            return `/storage/${item.default_image.image_path}`;
        if (item.images?.[0]?.image_path)
            return `/storage/${item.images[0].image_path}`;
        return "/images/default-product.jpg";
    };

    return (
        <AppLayout>
            <Head title="Your Shopping Cart" />

            <Container className="py-4">
                {checkoutStatus === "success" ? (
                    // Success order
                    <Card className="border-0 shadow-sm py-5">
                        <Card.Body className="text-center py-5">
                            <FaCheckCircle
                                size={48}
                                className="text-success mb-3"
                            />
                            <h3 className="fw-bold mb-3">
                                Order Placed Successfully!
                            </h3>
                            <p className="text-muted mb-4">
                                Thank you for your purchase. Your order number
                                is{" "}
                                <strong className="text-primary">
                                    #{orderNumber}
                                </strong>
                                .
                            </p>
                            <div className="d-flex justify-content-center gap-3">
                                <Button as={Link} href="/" variant="primary">
                                    Continue Shopping
                                </Button>
                                <Button
                                    as={Link}
                                    href={route("orders.index")}
                                    variant="outline-primary"
                                >
                                    View Orders
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                ) : cartItems.length === 0 ? (
                    // Empty cart
                    <Card className="border-0 shadow-sm py-5">
                        <Card.Body className="text-center py-5">
                            <FaShoppingBag
                                size={48}
                                className="text-muted mb-3"
                            />
                            <h4 className="fw-bold mb-3">Your cart is empty</h4>
                            <p className="text-muted mb-4">
                                Looks like you haven't added any items to your
                                cart yet
                            </p>
                            <Button
                                as={Link}
                                href="/"
                                variant="primary"
                                size="lg"
                            >
                                Start Shopping
                            </Button>
                        </Card.Body>
                    </Card>
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h2 className="mb-1">Your Shopping Cart</h2>
                                <p className="text-muted mb-0">
                                    {itemCount}{" "}
                                    {itemCount === 1 ? "item" : "items"}
                                </p>
                            </div>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={clearCart}
                                className="d-flex align-items-center"
                            >
                                <FaTrash className="me-2" /> Clear Cart
                            </Button>
                        </div>

                        <Row>
                            <Col lg={8}>
                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Body className="p-0">
                                        <Table
                                            responsive
                                            hover
                                            className="mb-0"
                                        >
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="ps-4">
                                                        Product
                                                    </th>
                                                    <th className="text-end">
                                                        Price
                                                    </th>
                                                    <th className="text-center">
                                                        Quantity
                                                    </th>
                                                    <th className="text-end pe-4">
                                                        Total
                                                    </th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cartItems.map((item) => (
                                                    <tr
                                                        key={`${item.id}-${
                                                            item.variantKey ||
                                                            ""
                                                        }`}
                                                        className="align-middle"
                                                    >
                                                        <td className="ps-4">
                                                            <div className="d-flex align-items-center">
                                                                <div className="position-relative me-3">
                                                                    <Image
                                                                        src={getItemImage(
                                                                            item
                                                                        )}
                                                                        alt={
                                                                            item.name
                                                                        }
                                                                        width={
                                                                            80
                                                                        }
                                                                        height={
                                                                            80
                                                                        }
                                                                        className="rounded-2 border object-fit-cover"
                                                                        style={{
                                                                            minWidth:
                                                                                "80px",
                                                                            backgroundColor:
                                                                                "#f8f9fa",
                                                                        }}
                                                                    />
                                                                    {item.compare_price &&
                                                                        item.compare_price >
                                                                            item.price && (
                                                                            <Badge
                                                                                bg="danger"
                                                                                className="position-absolute top-0 start-0 translate-middle"
                                                                            >
                                                                                Sale
                                                                            </Badge>
                                                                        )}
                                                                </div>
                                                                <div>
                                                                    <h6 className="mb-1 fw-semibold">
                                                                        <Link
                                                                            // href={route(
                                                                            //     "product.show",
                                                                            //     item.slug
                                                                            // )}
                                                                            className="text-decoration-none text-dark"
                                                                        >
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </Link>
                                                                    </h6>
                                                                    {item.sku && (
                                                                        <div className="mb-1">
                                                                            <small className="text-muted">
                                                                                SKU:{" "}
                                                                                {
                                                                                    item.sku
                                                                                }
                                                                            </small>
                                                                        </div>
                                                                    )}
                                                                    {/* Display variations if available */}
                                                                    {(item.color ||
                                                                        item.size ||
                                                                        item.material) && (
                                                                        <div className="d-flex flex-wrap gap-2">
                                                                            {item.color && (
                                                                                <Badge
                                                                                    bg="light"
                                                                                    text="dark"
                                                                                    className="d-flex align-items-center gap-1"
                                                                                >
                                                                                    <span
                                                                                        className="rounded-circle"
                                                                                        style={{
                                                                                            width: "12px",
                                                                                            height: "12px",
                                                                                            backgroundColor:
                                                                                                item.color,
                                                                                        }}
                                                                                    />
                                                                                    {
                                                                                        item.color
                                                                                    }
                                                                                </Badge>
                                                                            )}
                                                                            {item.size && (
                                                                                <Badge
                                                                                    bg="light"
                                                                                    text="dark"
                                                                                >
                                                                                    {
                                                                                        item.size
                                                                                    }
                                                                                </Badge>
                                                                            )}
                                                                            {item.material && (
                                                                                <Badge
                                                                                    bg="light"
                                                                                    text="dark"
                                                                                >
                                                                                    {
                                                                                        item.material
                                                                                    }
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-end align-middle">
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    {formatCurrency(
                                                                        item.price
                                                                    )}
                                                                </div>
                                                                {item.compare_price &&
                                                                    item.compare_price >
                                                                        item.price && (
                                                                        <div className="text-muted small text-decoration-line-through">
                                                                            {formatCurrency(
                                                                                item.compare_price
                                                                            )}
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <div className="d-flex align-items-center justify-content-center">
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="px-3 py-1 rounded-start"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.id,
                                                                            item.quantity -
                                                                                1,
                                                                            item.variantKey
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        item.quantity <=
                                                                        1
                                                                    }
                                                                >
                                                                    <FaMinus
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                </Button>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="1"
                                                                    max={
                                                                        item.max_quantity ||
                                                                        99
                                                                    }
                                                                    value={
                                                                        item.quantity
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newQty =
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            );
                                                                        if (
                                                                            !isNaN(
                                                                                newQty
                                                                            ) &&
                                                                            newQty >
                                                                                0
                                                                        ) {
                                                                            updateQuantity(
                                                                                item.id,
                                                                                newQty,
                                                                                item.variantKey
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="rounded-0 text-center border-start-0 border-end-0"
                                                                    style={{
                                                                        width: "70px",
                                                                    }}
                                                                />
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="px-3 py-1 rounded-end"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.id,
                                                                            item.quantity +
                                                                                1,
                                                                            item.variantKey
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        item.max_quantity &&
                                                                        item.quantity >=
                                                                            item.max_quantity
                                                                    }
                                                                >
                                                                    <FaPlus
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="text-end align-middle fw-bold pe-4">
                                                            {formatCurrency(
                                                                item.price *
                                                                    item.quantity
                                                            )}
                                                        </td>
                                                        <td className="text-end align-middle">
                                                            <Button
                                                                variant="link"
                                                                className="text-danger p-0"
                                                                onClick={() =>
                                                                    removeFromCart(
                                                                        item.id,
                                                                        item.variantKey
                                                                    )
                                                                }
                                                                title="Remove item"
                                                            >
                                                                <FaTrash
                                                                    size={18}
                                                                />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <Button
                                        as={Link}
                                        href="/"
                                        variant="outline-primary"
                                        className="d-flex align-items-center"
                                    >
                                        <FaArrowLeft className="me-2" />
                                        Continue Shopping
                                    </Button>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={clearCart}
                                        >
                                            Clear Cart
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                window.location.reload()
                                            }
                                        >
                                            Update Cart
                                        </Button>
                                    </div>
                                </div>
                            </Col>

                            <Col lg={4}>
                                <Card
                                    className="border-0 shadow-sm"
                                    style={{ top: "20px" }}
                                >
                                    <Card.Body>
                                        <h5 className="mb-4 fw-bold">
                                            Order Summary
                                        </h5>

                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted">
                                                    Subtotal:
                                                </span>
                                                <span className="fw-semibold">
                                                    {formatCurrency(cartTotal)}
                                                </span>
                                            </div>

                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted">
                                                    Shipping:
                                                </span>
                                                <span
                                                    className={
                                                        shippingCost === 0
                                                            ? "text-success fw-semibold"
                                                            : ""
                                                    }
                                                >
                                                    {shippingCost === 0
                                                        ? "FREE"
                                                        : formatCurrency(
                                                              shippingCost
                                                          )}
                                                </span>
                                            </div>

                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted">
                                                    Estimated Tax:
                                                </span>
                                                <span>
                                                    {formatCurrency(
                                                        cartTotal * 0.08
                                                    )}
                                                </span>
                                            </div>

                                            {/* Coupon Section */}
                                            <div className="mb-3">
                                                <Form.Group controlId="couponCode">
                                                    <Form.Label className="small fw-semibold">
                                                        Have a coupon?
                                                    </Form.Label>
                                                    <div className="input-group">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter coupon code"
                                                            value={couponCode}
                                                            onChange={(e) => {
                                                                setCouponCode(
                                                                    e.target
                                                                        .value
                                                                );
                                                                setCheckoutStatus(
                                                                    null
                                                                );
                                                            }}
                                                            className="border-end-0"
                                                        />
                                                        <Button
                                                            variant={
                                                                discount > 0 ||
                                                                shippingCost ===
                                                                    0
                                                                    ? "success"
                                                                    : "outline-secondary"
                                                            }
                                                            onClick={
                                                                discount > 0 ||
                                                                shippingCost ===
                                                                    0
                                                                    ? removeCoupon
                                                                    : applyCoupon
                                                            }
                                                            className="border-start-0"
                                                        >
                                                            {discount > 0 ||
                                                            shippingCost === 0
                                                                ? "Applied"
                                                                : "Apply"}
                                                        </Button>
                                                    </div>
                                                </Form.Group>
                                                {checkoutStatus ===
                                                    "invalid_coupon" && (
                                                    <Alert
                                                        variant="danger"
                                                        className="mt-2 py-2 small"
                                                    >
                                                        <FaTimesCircle className="me-2" />
                                                        Invalid coupon code
                                                    </Alert>
                                                )}
                                                {(discount > 0 ||
                                                    shippingCost === 0) && (
                                                    <div className="mt-2">
                                                        {discount > 0 && (
                                                            <div className="d-flex justify-content-between mb-1">
                                                                <span className="text-muted">
                                                                    <FaTag className="me-1" />{" "}
                                                                    Discount:
                                                                </span>
                                                                <span className="text-success fw-semibold">
                                                                    -
                                                                    {formatCurrency(
                                                                        discount
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {shippingCost === 0 &&
                                                            cartTotal <
                                                                freeShippingThreshold && (
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span className="text-muted">
                                                                        <FaTruck className="me-1" />{" "}
                                                                        Shipping
                                                                        Discount:
                                                                    </span>
                                                                    <span className="text-success fw-semibold">
                                                                        -
                                                                        {formatCurrency(
                                                                            5.99
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                    </div>
                                                )}
                                            </div>

                                            <hr />
                                            <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                                                <span>Grand Total:</span>
                                                <span className="text-primary">
                                                    {formatCurrency(grandTotal)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Shipping Info */}
                                        <Alert
                                            variant="info"
                                            className="d-flex align-items-start small"
                                        >
                                            <FaTruck className="me-2 mt-1" />
                                            <div>
                                                <div className="fw-semibold">
                                                    Free Shipping Available!
                                                </div>
                                                {cartTotal >=
                                                freeShippingThreshold ? (
                                                    <div className="text-success">
                                                        You've qualified for
                                                        free shipping!
                                                    </div>
                                                ) : (
                                                    <div>
                                                        Spend{" "}
                                                        {formatCurrency(
                                                            freeShippingThreshold -
                                                                cartTotal
                                                        )}{" "}
                                                        more for free shipping
                                                    </div>
                                                )}
                                            </div>
                                        </Alert>

                                        {/* Delivery Estimate */}
                                        <div className="mb-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <FaBox className="me-2 text-muted" />
                                                <span className="small text-muted">
                                                    Estimated Delivery:
                                                </span>
                                            </div>
                                            <div className="ps-4">
                                                <div className="fw-semibold">
                                                    {getEstimatedDelivery()}
                                                </div>
                                                <div className="text-muted small">
                                                    3-5 business days
                                                </div>
                                            </div>
                                        </div>

                                        {/* Checkout Button */}
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-100 mb-3 py-3 fw-bold"
                                            onClick={handleCheckout}
                                            disabled={isCheckingOut}
                                        >
                                            {isCheckingOut ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        className="me-2"
                                                    />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <FaCreditCard className="me-2" />
                                                    Proceed to Checkout
                                                </>
                                            )}
                                        </Button>

                                        <div className="text-center">
                                            <small className="text-muted">
                                                or{" "}
                                                <Link
                                                    href="/"
                                                    className="text-decoration-none"
                                                >
                                                    continue shopping
                                                </Link>
                                            </small>
                                        </div>

                                        {/* Secure Payment Info */}
                                        <div className="mt-3 pt-3 border-top text-center">
                                            <div className="small text-muted mb-2">
                                                <FaCheckCircle className="me-1 text-success" />
                                                Secure payment powered by Stripe
                                            </div>
                                            <div className="text-muted small">
                                                Your payment information is
                                                encrypted and secure
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Container>
        </AppLayout>
    );
}
