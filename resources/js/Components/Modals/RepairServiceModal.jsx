import React from 'react';
import { Modal, Form, Button, Row, Col, Tab, Nav } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import xios from '@/Utils/axios';

export default function RepairServiceModal({ show, onHide, service, deviceTypes, onSuccess }) {
    const isEditMode = !!service;

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        slug: Yup.string().required('Slug is required'),
        base_price: Yup.number().required('Base price is required').min(0, 'Price must be positive'),
        estimated_duration: Yup.number().nullable().min(0, 'Duration must be positive'),
        warranty_days: Yup.number().nullable().min(0, 'Warranty days must be positive'),
        is_active: Yup.boolean(),
        is_featured: Yup.boolean(),
        device_types: Yup.array().of(
            Yup.object().shape({
                id: Yup.number().required(),
                price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
                min_price: Yup.number().nullable().min(0, 'Min price must be positive'),
                max_price: Yup.number().nullable().min(0, 'Max price must be positive'),
                is_flat_rate: Yup.boolean(),
                price_notes: Yup.string().nullable()
            })
        )
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: service?.name || '',
            slug: service?.slug || '',
            description: service?.description || '',
            detailed_description: service?.detailed_description || '',
            repair_process: service?.repair_process || '',
            base_price: service?.base_price || 0,
            estimated_duration: service?.estimated_duration || null,
            warranty_days: service?.warranty_days || null,
            is_active: service?.is_active ?? true,
            is_featured: service?.is_featured ?? false,
            image: service?.image || null,
            device_types: service?.device_types?.map(dt => ({
                id: dt.id,
                name: dt.name,
                price: dt.pivot.price,
                min_price: dt.pivot.min_price,
                max_price: dt.pivot.max_price,
                is_flat_rate: dt.pivot.is_flat_rate,
                price_notes: dt.pivot.price_notes
            })) || deviceTypes.map(dt => ({
                id: dt.id,
                name: dt.name,
                price: 0,
                min_price: null,
                max_price: null,
                is_flat_rate: false,
                price_notes: ''
            })),
            _method: isEditMode ? 'PUT' : 'POST'
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                const postRoute = isEditMode
                    ? route('repair-service.update', service.id)
                    : route('repair-service.store');

                const response = await xios.post(postRoute, values);

                if (response.data.success === true) {
                    onSuccess(response.data.message);
                    onHide();
                }
            } catch (error) {
                if (error.response?.data?.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    // 
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleDeviceTypeChange = (index, field, value) => {
        const updatedDeviceTypes = [...formik.values.device_types];
        updatedDeviceTypes[index][field] = value;
        formik.setFieldValue('device_types', updatedDeviceTypes);
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Edit Repair Service' : 'Create New Repair Service'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                    <Tab.Container defaultActiveKey="basic">
                        <Row>
                            <Col md={3}>
                                <Nav variant="pills" className="flex-column">
                                    <Nav.Item>
                                        <Nav.Link eventKey="basic">Basic Information</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="pricing">Pricing by Device</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="details">Service Details</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col md={9}>
                                <Tab.Content>
                                    <Tab.Pane eventKey="basic">
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group controlId="name">
                                                    <Form.Label>Service Name *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={formik.values.name}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        isInvalid={formik.touched.name && !!formik.errors.name}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {formik.errors.name}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="slug">
                                                    <Form.Label>Slug *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="slug"
                                                        value={formik.values.slug}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        isInvalid={formik.touched.slug && !!formik.errors.slug}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {formik.errors.slug}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Form.Group controlId="base_price">
                                                    <Form.Label>Base Price (₦) *</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        name="base_price"
                                                        value={formik.values.base_price}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        isInvalid={formik.touched.base_price && !!formik.errors.base_price}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {formik.errors.base_price}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group controlId="estimated_duration">
                                                    <Form.Label>Estimated Duration (minutes)</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        name="estimated_duration"
                                                        value={formik.values.estimated_duration || ''}
                                                        onChange={formik.handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group controlId="warranty_days">
                                                    <Form.Label>Warranty (days)</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        name="warranty_days"
                                                        value={formik.values.warranty_days || ''}
                                                        onChange={formik.handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col>
                                                <Form.Check
                                                    type="switch"
                                                    id="is_active"
                                                    label="Active"
                                                    checked={formik.values.is_active}
                                                    onChange={formik.handleChange}
                                                    name="is_active"
                                                />
                                            </Col>
                                            <Col>
                                                <Form.Check
                                                    type="switch"
                                                    id="is_featured"
                                                    label="Featured"
                                                    checked={formik.values.is_featured}
                                                    onChange={formik.handleChange}
                                                    name="is_featured"
                                                />
                                            </Col>
                                        </Row>

                                        <Form.Group controlId="description" className="mb-3">
                                            <Form.Label>Short Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="description"
                                                value={formik.values.description}
                                                onChange={formik.handleChange}
                                            />
                                        </Form.Group>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="pricing">
                                        <h5 className="mb-3">Device Type Pricing</h5>
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Device Type</th>
                                                        <th>Price</th>
                                                        <th>Min Price</th>
                                                        <th>Max Price</th>
                                                        <th>Flat Rate</th>
                                                        <th>Notes</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formik.values.device_types?.map((dt, index) => (
                                                        <tr key={dt.id}>
                                                            <td>{dt.name}</td>
                                                            <td>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    name={`device_types[${index}].price`}
                                                                    value={dt.price}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                />
                                                            </td>
                                                            <td>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    name={`device_types[${index}].min_price`}
                                                                    value={dt.min_price || ''}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                />
                                                            </td>
                                                            <td>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    name={`device_types[${index}].max_price`}
                                                                    value={dt.max_price || ''}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                />
                                                            </td>
                                                            <td className="text-center">
                                                                <Form.Check
                                                                    type="switch"
                                                                    name={`device_types[${index}].is_flat_rate`}
                                                                    checked={dt.is_flat_rate}
                                                                    onChange={(e) => {
                                                                        formik.setFieldValue(
                                                                            `device_types[${index}].is_flat_rate`,
                                                                            e.target.checked
                                                                        );
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <Form.Control
                                                                    type="text"
                                                                    name={`device_types[${index}].price_notes`}
                                                                    value={dt.price_notes || ''}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="details">
                                        <Form.Group controlId="detailed_description" className="mb-3">
                                            <Form.Label>Detailed Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                name="detailed_description"
                                                value={formik.values.detailed_description}
                                                onChange={formik.handleChange}
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="repair_process" className="mb-3">
                                            <Form.Label>Repair Process</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                name="repair_process"
                                                value={formik.values.repair_process}
                                                onChange={formik.handleChange}
                                            />
                                        </Form.Group>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}