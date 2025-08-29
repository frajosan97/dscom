import { useCart } from "@/Context/CartContext";
import { formatCurrency } from "@/Utils/helpers";
import {
    Badge,
    Card,
    FormControl,
    InputGroup,
    Table,
    Button,
    Row,
    Col,
} from "react-bootstrap";
import {
    FaDollarSign,
    FaTrash,
    FaShoppingCart,
    FaReceipt,
    FaExchangeAlt,
    FaWallet,
} from "react-icons/fa";
import { useMemo } from "react";

const Cart = ({ paymentData = {}, totalPaid: totalPaidProp }) => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, itemCount } =
        useCart();

    // Normalize any value to an array of transactions
    const toTransactions = (val) => {
        if (Array.isArray(val)) return val;
        if (val && Array.isArray(val.transactions)) return val.transactions;
        return [];
    };

    // Build per-method breakdown (ignore non-transaction fields like numbers)
    const paymentBreakdown = useMemo(() => {
        return Object.entries(paymentData)
            .filter(
                ([, v]) => Array.isArray(v) || Array.isArray(v?.transactions)
            )
            .map(([method, v]) => {
                const txs = toTransactions(v);
                const total = txs.reduce(
                    (sum, tx) => sum + (Number(tx.amount) || 0),
                    0
                );
                return { method, total };
            });
    }, [paymentData]);

    // If a totalPaid prop is provided, use it; otherwise compute from breakdown
    const computedTotalPaid = useMemo(
        () => paymentBreakdown.reduce((s, m) => s + m.total, 0),
        [paymentBreakdown]
    );
    const totalPaid =
        typeof totalPaidProp === "number" ? totalPaidProp : computedTotalPaid;

    const balanceDue = Math.max(cartTotal - totalPaid, 0);
    const change = totalPaid > cartTotal ? totalPaid - cartTotal : 0;

    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity >= 1) updateQuantity(id, newQuantity);
    };

    return (
        <Card className="border-0 rounded-0 shadow-sm">
            {/* --- Header --- */}
            <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center py-3">
                <span>Sale Summary</span>
                <Badge bg="primary" pill>
                    <FaShoppingCart className="me-1" />
                    {itemCount}
                </Badge>
            </Card.Header>

            {/* --- Body (Cart Items) --- */}
            <Card.Body
                className="p-0"
                style={{ maxHeight: "400px", overflowY: "auto" }}
            >
                {cartItems.length === 0 ? (
                    <div className="text-center py-5">
                        <FaShoppingCart size={48} className="text-muted mb-3" />
                        <h4>Your cart is empty</h4>
                        <p className="text-muted mb-4">
                            Looks like you haven't added any items yet
                        </p>
                    </div>
                ) : (
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-3">Product</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                                <th className="pe-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item) => (
                                <tr key={item.id}>
                                    <td className="align-middle ps-3">
                                        {item.name || `Product ${item.id}`}
                                    </td>
                                    <td className="align-middle text-end">
                                        {formatCurrency(item.price)}
                                    </td>
                                    <td className="align-middle">
                                        <FormControl
                                            type="number"
                                            min="1"
                                            className="text-center"
                                            style={{ width: "70px" }}
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleQuantityChange(
                                                    item.id,
                                                    parseInt(e.target.value) ||
                                                        1
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="align-middle text-end fw-semibold">
                                        {formatCurrency(
                                            item.price * item.quantity
                                        )}
                                    </td>
                                    <td className="align-middle text-end pe-3">
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() =>
                                                removeFromCart(item.id)
                                            }
                                            title="Remove item"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>

            {/* --- Footer (Summary) --- */}
            <Card.Footer className="bg-white p-3">
                {/* Total Billed */}
                <div className="mb-3">
                    <InputGroup>
                        <InputGroup.Text
                            className="fw-bold bg-light"
                            style={{ width: "160px" }}
                        >
                            <FaDollarSign className="me-1" />
                            Total Billed
                        </InputGroup.Text>
                        <FormControl
                            value={formatCurrency(cartTotal)}
                            className="text-end fw-bold bg-light"
                            disabled
                        />
                    </InputGroup>
                </div>

                {/* Payments Breakdown */}
                <Row className="g-2 mb-3">
                    {paymentBreakdown.map(({ method, total }) => (
                        <Col md={12} key={method}>
                            <InputGroup>
                                <InputGroup.Text
                                    className="fw-bold bg-light text-capitalize"
                                    style={{ width: "160px" }}
                                >
                                    <FaWallet className="me-1" />
                                    {method}
                                </InputGroup.Text>
                                <FormControl
                                    value={formatCurrency(total)}
                                    className="text-end fw-bold bg-light"
                                    disabled
                                />
                            </InputGroup>
                        </Col>
                    ))}
                </Row>

                <hr />

                {/* Totals */}
                <div className="mb-2">
                    <InputGroup>
                        <InputGroup.Text
                            className="fw-bold bg-light"
                            style={{ width: "160px" }}
                        >
                            <FaReceipt className="me-1" />
                            Total Paid
                        </InputGroup.Text>
                        <FormControl
                            value={formatCurrency(totalPaid)}
                            className="text-end fw-bold bg-light"
                            disabled
                        />
                    </InputGroup>
                </div>

                <div className="mb-2">
                    <InputGroup>
                        <InputGroup.Text
                            className={`fw-bold ${
                                balanceDue > 0 ? "text-warning" : "text-success"
                            } bg-light`}
                            style={{ width: "160px" }}
                        >
                            <FaExchangeAlt className="me-1" />
                            Balance Due
                        </InputGroup.Text>
                        <FormControl
                            value={formatCurrency(balanceDue)}
                            className={`text-end fw-bold ${
                                balanceDue > 0 ? "text-warning" : "text-success"
                            }`}
                            disabled
                        />
                    </InputGroup>
                </div>

                {change > 0 && (
                    <div className="mb-2">
                        <InputGroup>
                            <InputGroup.Text
                                className="fw-bold text-info bg-light"
                                style={{ width: "160px" }}
                            >
                                <FaExchangeAlt className="me-1" />
                                Change
                            </InputGroup.Text>
                            <FormControl
                                value={formatCurrency(change)}
                                className="text-end fw-bold text-info"
                                disabled
                            />
                        </InputGroup>
                    </div>
                )}
            </Card.Footer>
        </Card>
    );
};

export default Cart;
