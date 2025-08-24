import { Table, Badge } from "react-bootstrap";
import { format } from "date-fns";

export default function OrderPaymentsTable({ payments, currency }) {
    if (!payments || payments.length === 0) {
        return (
            <div className="text-center text-muted py-4">
                <i className="bi bi-credit-card fs-1"></i>
                <p className="mt-2">No payments recorded</p>
            </div>
        );
    }

    const getPaymentStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return <Badge bg="success">Completed</Badge>;
            case "pending":
                return (
                    <Badge bg="warning" text="dark">
                        Pending
                    </Badge>
                );
            case "failed":
                return <Badge bg="danger">Failed</Badge>;
            case "refunded":
                return <Badge bg="info">Refunded</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    return (
        <Table striped bordered hover className="mt-3">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th className="text-end">Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {payments.map((payment, index) => (
                    <tr key={index}>
                        <td>
                            {format(
                                new Date(payment.created_at),
                                "MMM dd, yyyy"
                            )}
                        </td>
                        <td>{payment.payment_method.name}</td>
                        <td>{payment.transaction_id || "-"}</td>
                        <td className="text-end">
                            {currency} {payment.amount}
                        </td>
                        <td>{getPaymentStatusBadge(payment.status)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan={3} className="text-end fw-semibold">
                        Total Paid
                    </td>
                    <td className="text-end fw-semibold">
                        {currency}{" "}
                        {payments.reduce(
                            (sum, payment) => sum + payment.amount,
                            0
                        )}
                    </td>
                    <td></td>
                </tr>
            </tfoot>
        </Table>
    );
}
