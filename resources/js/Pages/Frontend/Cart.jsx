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
    Trash,
    Plus,
    Minus,
    ArrowLeft,
    CreditCard,
    Truck,
    CheckCircle,
    XCircle,
} from "react-feather";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Link } from "@inertiajs/react";
import xios from "@/Utils/axios";

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

    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutStatus, setCheckoutStatus] = useState(null);
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [orderNumber, setOrderNumber] = useState(0);

    const handleCheckout = async () => {
        // set checking out
        setIsCheckingOut(true);

        try {
            if (auth?.user) {
                const response = await xios.post(route("cart.checkout"), {
                    cartItems,
                    cartTotal,
                    itemCount,
                    discount,
                });

                if (response.status === 200) {
                    setOrderNumber(response.data.orderNumber);
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
        }
    };

    const applyCoupon = () => {
        // Simple coupon logic - in production, validate against backend
        if (couponCode.toUpperCase() === "SAVE10") {
            setDiscount(cartTotal * 0.1); // 10% discount
            setCheckoutStatus(null);
        } else if (couponCode) {
            setCheckoutStatus("invalid_coupon");
        }
    };

    const removeCoupon = () => {
        setCouponCode("");
        setDiscount(0);
        setCheckoutStatus(null);
    };

    const grandTotal = cartTotal - discount;

    return (
        <AppLayout>
            <Head title="Your Shopping Cart" />

            <Container className="py-4">
                {checkoutStatus === "success" ? (
                    // Success order
                    <Card className="border-0 shadow-sm py-5">
                        <Card.Body className="text-center py-5">
                            <CheckCircle
                                size={48}
                                className="text-success mb-3"
                            />
                            <h3>Order Placed Successfully!</h3>
                            <p className="text-muted mb-4">
                                Thank you for your purchase. Your order number
                                is #{orderNumber}.
                            </p>
                            <div className="d-flex justify-content-center gap-3">
                                <Button as={Link} href="/" variant="primary">
                                    Continue Shopping
                                </Button>
                                <Button
                                    as={Link}
                                    href="/orders"
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
                            <Truck size={48} className="text-muted mb-3" />
                            <h4>Your cart is empty</h4>
                            <p className="text-muted mb-4">
                                Looks like you haven't added any items to your
                                cart yet
                            </p>
                            <Button as={Link} href="/" variant="primary">
                                Continue Shopping
                            </Button>
                        </Card.Body>
                    </Card>
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="mb-0">
                                Your Cart ({itemCount}{" "}
                                {itemCount === 1 ? "item" : "items"})
                            </h2>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={clearCart}
                            >
                                <Trash size={16} className="me-1" /> Clear Cart
                            </Button>
                        </div>

                        <Row>
                            <Col lg={8}>
                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Body className="p-0">
                                        <Table responsive className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Product</th>
                                                    <th className="text-end">
                                                        Price
                                                    </th>
                                                    <th>Quantity</th>
                                                    <th className="text-end">
                                                        Total
                                                    </th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cartItems.map((item) => (
                                                    <tr
                                                        key={`${item.id}-${item.variant}`}
                                                    >
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <Image
                                                                    src={
                                                                        item.image ||
                                                                        "/images/placeholder-product.png"
                                                                    }
                                                                    alt={
                                                                        item.name
                                                                    }
                                                                    width={80}
                                                                    height={80}
                                                                    className="me-3 rounded border object-fit-cover"
                                                                    style={{
                                                                        minWidth:
                                                                            "80px",
                                                                    }}
                                                                />
                                                                <div>
                                                                    <h6 className="mb-1">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </h6>
                                                                    {item.color && (
                                                                        <div className="d-flex align-items-center mb-1">
                                                                            <span className="text-muted me-2">
                                                                                Color:
                                                                            </span>
                                                                            <span
                                                                                className="d-inline-block rounded-circle"
                                                                                style={{
                                                                                    width: "16px",
                                                                                    height: "16px",
                                                                                    backgroundColor:
                                                                                        item.color,
                                                                                    border: "1px solid #dee2e6",
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {item.size && (
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="text-muted me-2">
                                                                                Size:
                                                                            </span>
                                                                            <Badge
                                                                                bg="light"
                                                                                text="dark"
                                                                            >
                                                                                {
                                                                                    item.size
                                                                                }
                                                                            </Badge>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="align-middle text-end">
                                                            ${item.price}
                                                        </td>
                                                        <td className="align-middle">
                                                            <div className="d-flex align-items-center">
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="px-2 py-0"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.id,
                                                                            item.quantity -
                                                                                1,
                                                                            item.variant
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        item.quantity <=
                                                                        1
                                                                    }
                                                                >
                                                                    <Minus
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </Button>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="1"
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
                                                                                item.variant
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="mx-2 text-center"
                                                                    style={{
                                                                        width: "60px",
                                                                    }}
                                                                />
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="px-2 py-0"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.id,
                                                                            item.quantity +
                                                                                1,
                                                                            item.variant
                                                                        )
                                                                    }
                                                                >
                                                                    <Plus
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="align-middle text-end fw-bold">
                                                            $
                                                            {item.price *
                                                                item.quantity}
                                                        </td>
                                                        <td className="align-middle text-end">
                                                            <Button
                                                                variant="link"
                                                                className="text-danger p-0"
                                                                onClick={() =>
                                                                    removeFromCart(
                                                                        item.id,
                                                                        item.variant
                                                                    )
                                                                }
                                                            >
                                                                <Trash
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

                                <div className="d-flex justify-content-between mb-4">
                                    <Button
                                        as={Link}
                                        href="/"
                                        variant="outline-primary"
                                    >
                                        <ArrowLeft size={16} className="me-1" />{" "}
                                        Continue Shopping
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => window.location.reload()}
                                    >
                                        Update Cart
                                    </Button>
                                </div>
                            </Col>

                            <Col lg={4}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                        <h5 className="mb-4">Order Summary</h5>

                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Subtotal:</span>
                                                <span>${cartTotal}</span>
                                            </div>

                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Shipping:</span>
                                                <span>
                                                    {cartTotal > 50
                                                        ? "Free"
                                                        : "$5.99"}
                                                </span>
                                            </div>

                                            <div className="mb-3">
                                                <Form.Group controlId="couponCode">
                                                    <div className="input-group">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Coupon code"
                                                            value={couponCode}
                                                            onChange={(e) =>
                                                                setCouponCode(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        <Button
                                                            variant={
                                                                discount > 0
                                                                    ? "success"
                                                                    : "outline-secondary"
                                                            }
                                                            onClick={
                                                                discount > 0
                                                                    ? removeCoupon
                                                                    : applyCoupon
                                                            }
                                                        >
                                                            {discount > 0
                                                                ? "Applied"
                                                                : "Apply"}
                                                        </Button>
                                                    </div>
                                                </Form.Group>
                                                {checkoutStatus ===
                                                    "invalid_coupon" && (
                                                    <Alert
                                                        variant="danger"
                                                        className="mt-2 py-1 small"
                                                    >
                                                        <XCircle
                                                            size={14}
                                                            className="me-1"
                                                        />
                                                        Invalid coupon code
                                                    </Alert>
                                                )}
                                                {discount > 0 && (
                                                    <div className="d-flex justify-content-between mt-2">
                                                        <span>Discount:</span>
                                                        <span className="text-success">
                                                            -${discount}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <hr />
                                            <div className="d-flex justify-content-between fw-bold fs-5">
                                                <span>Total:</span>
                                                <span>${grandTotal}</span>
                                            </div>
                                        </div>

                                        <Alert
                                            variant="info"
                                            className="d-flex align-items-center small"
                                        >
                                            <Truck size={16} className="me-2" />
                                            {cartTotal > 50
                                                ? "You qualify for free shipping!"
                                                : `Spend $${
                                                      50 - cartTotal
                                                  } more for free shipping`}
                                        </Alert>

                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-100 mb-3"
                                            onClick={handleCheckout}
                                            disabled={isCheckingOut}
                                        >
                                            {isCheckingOut ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard
                                                        size={18}
                                                        className="me-2"
                                                    />
                                                    Proceed to Checkout
                                                </>
                                            )}
                                        </Button>

                                        <div className="text-center small text-muted">
                                            or{" "}
                                            <Link href="/">
                                                continue shopping
                                            </Link>
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
