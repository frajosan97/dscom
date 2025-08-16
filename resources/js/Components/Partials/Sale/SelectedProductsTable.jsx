import { formatCurrency } from '@/Utils/helpers';
import { Table, Form, Button } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';

export default function SelectedProductsTable({ selectedProducts, removeProduct, updateProductQuantity, updateProductPrice }) {
    return (
        <Table striped hover className="mb-0">
            <thead>
                <tr>
                    <th width="5%">#</th>
                    <th width="35%">Product</th>
                    <th width="15%">Price</th>
                    <th width="15%">Quantity</th>
                    <th width="15%">Total</th>
                    <th width="15%">Action</th>
                </tr>
            </thead>
            <tbody>
                {selectedProducts.length > 0 ? (
                    selectedProducts.map((product, index) => (
                        <tr key={product.product_id}>
                            <td>{index + 1}</td>
                            <td>
                                <div className="d-flex align-items-center">
                                    {product.image && (
                                        <img
                                            src={`/storage/${product.image}`}
                                            alt={product.product_name}
                                            width="40"
                                            className="me-2"
                                        />
                                    )}
                                    <div>
                                        <h6 className="mb-0">{product.product_name}</h6>
                                        <small className="text-muted">{product.code}</small>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <Form.Control
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={product.price}
                                    onChange={(e) => updateProductPrice(product.product_id, e.target.value)}
                                />
                            </td>
                            <td>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={product.quantity}
                                    onChange={(e) => updateProductQuantity(product.product_id, e.target.value)}
                                />
                            </td>
                            <td>{formatCurrency(product.price * product.quantity)}</td>
                            <td>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeProduct(product.product_id)}
                                >
                                    <Trash size={14} />
                                </Button>
                            </td>
                        </tr>

                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                            No products added yet
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
}