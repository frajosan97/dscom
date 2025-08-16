import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiTool, FiEdit } from 'react-icons/fi';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';

import ErpLayout from '@/Layouts/ErpLayout';
import useFilterOptions from '@/Hooks/useData';
import DeviceTypeModal from '@/Components/Modals/DeviceTypeModal';
import xios from '@/Utils/axios';

export default function ServiceEdit({ service }) {
    const {
        deviceTypes = [],
        refreshDeviceTypes,
    } = useFilterOptions();

    const [showDeviceTypeModal, setShowDeviceTypeModal] = useState(false);
    const [pricingRows, setPricingRows] = useState(service.pricings || []);

    const { data, setData, errors, put, processing } = useForm({
        name: service.name,
        slug: service.slug,
        description: service.description,
        detailed_description: service.detailed_description,
        repair_process: service.repair_process,
        base_price: service.base_price,
        estimated_duration: service.estimated_duration,
        warranty_days: service.warranty_days,
        is_active: service.is_active,
        is_featured: service.is_featured,
        image: service.image,
        metadata: service.metadata || {},
        pricings: service.pricings || []
    });

    useEffect(() => {
        setPricingRows(service.pricings || []);
    }, [service]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await xios.put(route('repair-services.update', service.id), {
                ...data,
                pricings: pricingRows.filter(row => row.device_type_id)
            });

            if (response.data.success) {
                toast.success(response.data.message);
                router.visit(route('repair-services.show', service.id));
            }
        } catch (error) {
            console.error(error);
            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors;
                Object.values(errorMessages).forEach(messages => {
                    messages.forEach(message => {
                        toast.error(message);
                    });
                });
            } else {
                toast.error(error.response?.data?.message || 'An error occurred while updating the service');
            }
        }
    };

    const addPricingRow = () => {
        setPricingRows([...pricingRows,
        { device_type_id: null, price: 0, min_price: null, max_price: null, is_flat_rate: false, price_notes: '' }
        ]);
    };

    const removePricingRow = (index) => {
        if (pricingRows.length > 1) {
            const newRows = [...pricingRows];
            newRows.splice(index, 1);
            setPricingRows(newRows);
        }
    };

    const updatePricingRow = (index, field, value) => {
        const newRows = [...pricingRows];
        newRows[index][field] = value;
        setPricingRows(newRows);
    };

    const handleDeviceTypeAdded = () => {
        refreshDeviceTypes();
    };

    return (
        <ErpLayout>
            <Head title={`Edit ${service.name}`} />
            <Container fluid>
                <form onSubmit={handleSubmit}>
                    <Row className="g-4">
                        <Col lg={8}>
                            <Card className="mb-4">
                                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                                    <div>
                                        <FiTool className="me-2" />
                                        <strong>Edit Repair Service</strong>
                                    </div>
                                    <Badge bg="info">
                                        <FiEdit className="me-1" /> Editing
                                    </Badge>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Service Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            isInvalid={!!errors.name}
                                            required
                                        />
                                        {errors.name && <Form.Text className="text-danger">{errors.name}</Form.Text>}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Slug *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value)}
                                            isInvalid={!!errors.slug}
                                            required
                                        />
                                        {errors.slug && <Form.Text className="text-danger">{errors.slug}</Form.Text>}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Detailed Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            value={data.detailed_description}
                                            onChange={(e) => setData('detailed_description', e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Repair Process</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            value={data.repair_process}
                                            onChange={(e) => setData('repair_process', e.target.value)}
                                            placeholder="Step-by-step repair process..."
                                        />
                                    </Form.Group>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h6 className="mb-0">Service Settings</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Base Price *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.base_price}
                                            onChange={(e) => setData('base_price', parseFloat(e.target.value) || 0)}
                                            isInvalid={!!errors.base_price}
                                            required
                                        />
                                        {errors.base_price && <Form.Text className="text-danger">{errors.base_price}</Form.Text>}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Estimated Duration (minutes)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            value={data.estimated_duration}
                                            onChange={(e) => setData('estimated_duration', parseInt(e.target.value) || null)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Warranty Days</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            value={data.warranty_days}
                                            onChange={(e) => setData('warranty_days', parseInt(e.target.value) || null)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            label="Active Service"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            label="Featured Service"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                        />
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Device Type Pricing</h6>
                                    <Button variant="outline-primary" size="sm" onClick={addPricingRow}>
                                        <FiPlus /> Add Pricing
                                    </Button>
                                </Card.Header>
                                <Card.Body>
                                    {pricingRows.map((row, index) => (
                                        <div key={index} className="mb-3 border-bottom pb-3">
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Device Type</Form.Label>
                                                        <Form.Select
                                                            value={row.device_type_id || ''}
                                                            onChange={(e) => updatePricingRow(index, 'device_type_id', e.target.value ? parseInt(e.target.value) : null)}
                                                        >
                                                            <option value="">Select device type</option>
                                                            {deviceTypes.map(type => (
                                                                <option key={type.id} value={type.id}>{type.name}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Price *</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={row.price}
                                                            onChange={(e) => updatePricingRow(index, 'price', parseFloat(e.target.value) || 0)}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Min Price</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={row.min_price || ''}
                                                            onChange={(e) => updatePricingRow(index, 'min_price', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Max Price</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={row.max_price || ''}
                                                            onChange={(e) => updatePricingRow(index, 'max_price', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-2">
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Flat Rate (ignore min/max)"
                                                    checked={row.is_flat_rate}
                                                    onChange={(e) => updatePricingRow(index, 'is_flat_rate', e.target.checked)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Price Notes</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    value={row.price_notes}
                                                    onChange={(e) => updatePricingRow(index, 'price_notes', e.target.value)}
                                                />
                                            </Form.Group>
                                            {pricingRows.length > 1 && (
                                                <div className="text-end">
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => removePricingRow(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </Card.Body>
                            </Card>

                            <div className="d-grid gap-2">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={processing}
                                    className="mb-2"
                                >
                                    {processing ? 'Processing...' : 'Update Service'}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </form>

                <DeviceTypeModal
                    show={showDeviceTypeModal}
                    onClose={() => setShowDeviceTypeModal(false)}
                    onDeviceTypeAdded={handleDeviceTypeAdded}
                />
            </Container>
        </ErpLayout>
    );
}