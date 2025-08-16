import { Table } from 'react-bootstrap';

export default function OrderItemsTable({ items, currency }) {
    if (!items || items.length === 0) {
        return (
            <div className="text-center text-muted py-4">
                <i className="bi bi-box-seam fs-1"></i>
                <p className="mt-2">No items in this order</p>
            </div>
        );
    }

    return (
        <Table striped bordered hover className="mt-3">
            <thead>
                <tr>
                    <th>Product</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Total</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, index) => (
                    <tr key={index}>
                        <td>
                            <div className="fw-semibold">{item.product.name}</div>
                            {item.product.sku && <div className="text-muted small">SKU: {item.product.sku}</div>}
                        </td>
                        <td className="text-end">{currency} {item.price}</td>
                        <td className="text-end">{item.quantity}</td>
                        <td className="text-end fw-semibold">{currency} {(item.price * item.quantity)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan={3} className="text-end fw-semibold">Subtotal</td>
                    <td className="text-end fw-semibold">
                        {currency} {items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                    </td>
                </tr>
            </tfoot>
        </Table>
    );
}