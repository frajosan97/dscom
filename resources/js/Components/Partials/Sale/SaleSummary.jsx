import React, { useMemo } from 'react';
import { Form, Button, Badge, Card, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { PlusCircle, Save, Printer, Truck, CreditCard, Person, GeoAlt, Calendar } from 'react-bootstrap-icons';
import { capitalize, formatCurrency } from '@/Utils/helpers';

export default function SaleSummary({
    data,
    setData,
    errors,
    processing,
    customers,
    warehouses,
    paymentMethods,
    shippingMethods,
    statusOptions,
    paymentStatusOptions,
    fulfillmentStatusOptions,
    discountType,
    setDiscountType,
    paymentDate,
    setPaymentDate,
    handleSubmit,
    setShowCustomerModal,
    isEdit,
    order
}) {
    console.log(data);
    // Memoize options to prevent unnecessary recalculations
    const customerOptions = useMemo(() => customers?.map(customer => ({
        value: customer.id,
        label: `${capitalize(customer.first_name)} ${capitalize(customer.last_name)}`
    })), [customers]);

    const paymentMethodsOptions = useMemo(() => paymentMethods?.map(paymentMethod => ({
        value: paymentMethod.id,
        label: capitalize(paymentMethod.name)
    })), [paymentMethods]);

    const warehousesOptions = useMemo(() => warehouses?.map(warehouse => ({
        value: warehouse.id,
        label: capitalize(warehouse.name)
    })), [warehouses]);

    const shippingMethodsOptions = useMemo(() => shippingMethods?.map(method => ({
        value: method.id,
        label: capitalize(method.name)
    })), [shippingMethods]);

    const formatAddress = (address) => {
        if (!address) return 'N/A';
        return (
            <>
                {address.street && <div>{address.street}</div>}
                {address.city && <div>{address.city}, {address.state} {address.postal_code}</div>}
                {address.country && <div>{address.country}</div>}
            </>
        );
    };

    // Calculate derived values once
    const taxValue = data.tax_type === 'percentage' ? data.tax_percentage || 0 : data.tax || 0;
    const discountValue = discountType === 'percentage' ? data.discount_percentage || 0 : data.discount || 0;

    return (
        <Card className="mb-4">
            <Card.Header className="bg-white  py-3">
                <h5 className="mb-0 fw-semibold">Order Summary</h5>
            </Card.Header>
            <Card.Body className="p-3">
                {/* Customer Section */}
                <Card className="mb-3">
                    <Card.Header className="bg-light d-flex align-items-center py-2">
                        <Person size={18} className="me-2 text-primary" />
                        <span className="fw-semibold">Customer Information</span>
                    </Card.Header>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">Customer</Form.Label>
                            <div className="d-flex">
                                <Select
                                    options={customerOptions}
                                    value={customerOptions?.find(c => c.value === data.customer_id)}
                                    onChange={(selected) => setData('customer_id', selected ? selected.value : null)}
                                    placeholder="Select customer..."
                                    className="flex-grow-1 me-2"
                                    classNamePrefix="select"
                                    isClearable
                                />
                                <Button
                                    variant="outline-primary"
                                    onClick={() => setShowCustomerModal(true)}
                                    className="px-3"
                                >
                                    <PlusCircle size={16} />
                                </Button>
                            </div>
                            {errors.customer_id && <Form.Text className="text-danger">{errors.customer_id}</Form.Text>}
                        </Form.Group>

                        {data.customer_id && (
                            <div className="border-top pt-3">
                                <Row>
                                    <Col md={6} className="mb-2">
                                        <div className="small text-muted mb-1">Email</div>
                                        <div className="fw-medium">{data.customer_email || 'N/A'}</div>
                                    </Col>
                                    <Col md={6} className="mb-2">
                                        <div className="small text-muted mb-1">Phone</div>
                                        <div className="fw-medium">{data.customer_phone || 'N/A'}</div>
                                    </Col>
                                </Row>
                                {data.customer_company && (
                                    <Row className="mt-2">
                                        <Col>
                                            <div className="small text-muted mb-1">Company</div>
                                            <div className="fw-medium">{data.customer_company}</div>
                                        </Col>
                                    </Row>
                                )}
                                {data.customer_tax_number && (
                                    <Row className="mt-2">
                                        <Col>
                                            <div className="small text-muted mb-1">Tax Number</div>
                                            <div className="fw-medium">{data.customer_tax_number}</div>
                                        </Col>
                                    </Row>
                                )}
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Order Information Section */}
                <Card className="mb-3">
                    <Card.Header className="bg-light d-flex align-items-center py-2">
                        <Calendar size={18} className="me-2 text-primary" />
                        <span className="fw-semibold">Order Information</span>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Order Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Warehouse</Form.Label>
                                    <Select
                                        options={warehousesOptions}
                                        value={warehousesOptions?.find(w => w.value === data.warehouse_id)}
                                        onChange={(selected) => setData('warehouse_id', selected ? selected.value : null)}
                                        placeholder="Select warehouse..."
                                        classNamePrefix="select"
                                    />
                                    {errors.warehouse_id && <Form.Text className="text-danger">{errors.warehouse_id}</Form.Text>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">Reference</Form.Label>
                            <Form.Control
                                type="text"
                                value={data.reference}
                                onChange={(e) => setData('reference', e.target.value)}
                                readOnly={isEdit}
                                className="py-2"
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Status</Form.Label>
                                    <Select
                                        options={statusOptions}
                                        value={statusOptions?.find(s => s.value === data.status)}
                                        onChange={(selected) => setData('status', selected.value)}
                                        classNamePrefix="select"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Fulfillment Status</Form.Label>
                                    <Select
                                        options={fulfillmentStatusOptions}
                                        value={fulfillmentStatusOptions?.find(f => f.value === data.fulfillment_status)}
                                        onChange={(selected) => setData('fulfillment_status', selected.value)}
                                        classNamePrefix="select"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Pricing Section */}
                <Card className="mb-3">
                    <Card.Header className="bg-light py-2">
                        <span className="fw-semibold">Pricing Summary</span>
                    </Card.Header>
                    <Card.Body>
                        <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Subtotal:</span>
                                <span className="fw-medium">{formatCurrency(data.subtotal)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Tax:</span>
                                <span className="fw-medium">{formatCurrency(data.tax)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Discount:</span>
                                <span className="fw-medium text-danger">-{formatCurrency(data.discount)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">Shipping:</span>
                                <span className="fw-medium">{formatCurrency(data.shipping_cost)}</span>
                            </div>
                            <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-3">
                                <span>Total:</span>
                                <span>{formatCurrency(data.total)}</span>
                            </div>
                        </div>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Tax Type</Form.Label>
                                    <div className="d-flex">
                                        <Button
                                            variant={data.tax_type === 'percentage' ? 'primary' : 'outline-primary'}
                                            className="me-2"
                                            onClick={() => setData('tax_type', 'percentage')}
                                            size="sm"
                                        >
                                            %
                                        </Button>
                                        <Button
                                            variant={data.tax_type === 'fixed' ? 'primary' : 'outline-primary'}
                                            onClick={() => setData('tax_type', 'fixed')}
                                            size="sm"
                                        >
                                            Fixed
                                        </Button>
                                    </div>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">
                                        {data.tax_type === 'percentage' ? 'Percentage' : 'Amount'}
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step={data.tax_type === 'percentage' ? "1" : "0.01"}
                                        value={taxValue}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            if (data.tax_type === 'percentage') {
                                                const percentage = value > 100 ? 100 : value;
                                                setData('tax_percentage', percentage);
                                                setData('tax', (data.subtotal * percentage) / 100);
                                            } else {
                                                setData('tax', value);
                                            }
                                        }}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Discount Section */}
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Discount Type</Form.Label>
                                    <div className="d-flex">
                                        <Button
                                            variant={discountType === 'percentage' ? 'primary' : 'outline-primary'}
                                            className="me-2"
                                            onClick={() => setDiscountType('percentage')}
                                            size="sm"
                                        >
                                            %
                                        </Button>
                                        <Button
                                            variant={discountType === 'fixed' ? 'primary' : 'outline-primary'}
                                            onClick={() => setDiscountType('fixed')}
                                            size="sm"
                                        >
                                            Fixed
                                        </Button>
                                    </div>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">
                                        {discountType === 'percentage' ? 'Percentage' : 'Amount'}
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step={discountType === 'percentage' ? "1" : "0.01"}
                                        value={discountValue}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            if (discountType === 'percentage') {
                                                const percentage = value > 100 ? 100 : value;
                                                setData('discount_percentage', percentage);
                                                setData('discount', (data.subtotal * percentage) / 100);
                                            } else {
                                                setData('discount', value);
                                            }
                                        }}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">Shipping Amount</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.shipping_cost}
                                onChange={(e) => setData('shipping_cost', parseFloat(e.target.value) || 0)}
                                className="py-2"
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>

                {/* Payment Section */}
                <Card className="mb-3">
                    <Card.Header className="bg-light d-flex align-items-center py-2">
                        <CreditCard size={18} className="me-2 text-primary" />
                        <span className="fw-semibold">Payment Information</span>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Payment Status</Form.Label>
                                    <Select
                                        options={paymentStatusOptions}
                                        value={paymentStatusOptions?.find(p => p.value === data.payment_status)}
                                        onChange={(selected) => setData('payment_status', selected.value)}
                                        classNamePrefix="select"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Payment Method</Form.Label>
                                    <Select
                                        options={paymentMethodsOptions}
                                        value={paymentMethodsOptions?.find(p => p.value === data.payment_method_id)}
                                        onChange={(selected) => setData('payment_method_id', selected.value)}
                                        classNamePrefix="select"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Paid Amount</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.total_paid}
                                        onChange={(e) => setData('total_paid', parseFloat(e.target.value) || 0)}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Payment Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {data.payment_reference && (
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-medium">Payment Reference</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={data.payment_reference}
                                    onChange={(e) => setData('payment_reference', e.target.value)}
                                    className="py-2"
                                />
                            </Form.Group>
                        )}
                    </Card.Body>
                </Card>

                {/* Shipping Section */}
                <Card className="mb-3">
                    <Card.Header className="bg-light d-flex align-items-center py-2">
                        <Truck size={18} className="me-2 text-primary" />
                        <span className="fw-semibold">Shipping Information</span>
                    </Card.Header>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">Shipping Method</Form.Label>
                            <Select
                                options={shippingMethodsOptions}
                                value={shippingMethodsOptions?.find(m => m.value === data.shipping_method_id)}
                                onChange={(selected) => setData('shipping_method_id', selected.value)}
                                placeholder="Select shipping method..."
                                classNamePrefix="select"
                            />
                        </Form.Group>

                        {data.shipping_method_id && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Tracking Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={data.tracking_number}
                                        onChange={(e) => setData('tracking_number', e.target.value)}
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Tracking URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={data.tracking_url}
                                        onChange={(e) => setData('tracking_url', e.target.value)}
                                        placeholder="https://"
                                        className="py-2"
                                    />
                                </Form.Group>
                            </>
                        )}
                    </Card.Body>
                </Card>

                {/* Address Section */}
                <Card className="mb-3">
                    <Card.Header className="bg-light d-flex align-items-center py-2">
                        <GeoAlt size={18} className="me-2 text-primary" />
                        <span className="fw-semibold">Address Information</span>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6} className="mb-3">
                                <h6 className="mb-2 fw-medium">Billing Address</h6>
                                <div className="p-3 bg-light rounded">
                                    {formatAddress(data.billing_address)}
                                </div>
                            </Col>
                            <Col md={6} className="mb-3">
                                <h6 className="mb-2 fw-medium">Shipping Address</h6>
                                <div className="p-3 bg-light rounded">
                                    {data.shipping_same_as_billing ? (
                                        <span className="text-muted">Same as billing address</span>
                                    ) : (
                                        formatAddress(data.shipping_address)
                                    )}
                                </div>
                            </Col>
                        </Row>
                        <Form.Check
                            type="checkbox"
                            label="Shipping same as billing"
                            checked={data.shipping_same_as_billing}
                            onChange={(e) => setData('shipping_same_as_billing', e.target.checked)}
                            className="mt-2"
                        />
                    </Card.Body>
                </Card>

                {/* Notes Section */}
                <Card className="mb-3">
                    <Card.Header className="bg-light py-2">
                        <span className="fw-semibold">Notes</span>
                    </Card.Header>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">Customer Note</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={data.customer_note}
                                onChange={(e) => setData('customer_note', e.target.value)}
                                placeholder="Visible to customer..."
                                className="py-2"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fw-medium">Private Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={data.private_notes}
                                onChange={(e) => setData('private_notes', e.target.value)}
                                placeholder="Internal notes only..."
                                className="py-2"
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>

                {/* Action Buttons */}
                <div className="d-grid gap-3">
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={processing || data.total === 0}
                        onClick={handleSubmit}
                        size="lg"
                        className="py-2"
                    >
                        <Save className="me-2" size={18} />
                        {processing ? 'Processing...' : isEdit ? 'Update Order' : 'Create Order'}
                    </Button>
                    <Button
                        variant="outline-secondary"
                        size="lg"
                        className="py-2"
                    >
                        <Printer className="me-2" size={18} />
                        Save & Print
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
}