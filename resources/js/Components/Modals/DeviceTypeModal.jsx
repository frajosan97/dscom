import React from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import xios from '@/Utils/axios';

export default function DeviceTypeModal({ show, onHide, deviceType, parentDeviceTypes, onSuccess }) {
    const isEditMode = !!deviceType;

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        slug: Yup.string().required('Slug is required'),
        parent_id: Yup.number().nullable(),
        description: Yup.string().nullable(),
        is_active: Yup.boolean(),
        order: Yup.number().min(0, 'Order must be positive')
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: deviceType?.name || '',
            slug: deviceType?.slug || '',
            parent_id: deviceType?.parent_id || null,
            description: deviceType?.description || '',
            icon: deviceType?.icon || '',
            image: deviceType?.image || '',
            is_active: deviceType?.is_active ?? true,
            order: deviceType?.order || 0,
            _method: isEditMode ? 'PUT' : 'POST'
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                const postRoute = isEditMode
                    ? route('device-type.update', deviceType.id)
                    : route('device-type.store');

                const response = await xios.post(postRoute, values);

                if (response.data.success === true) {
                    onSuccess(response.data.message);
                    onHide();
                }
            } catch (error) {
                if (error.response?.data?.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    console.error('Error submitting form:', error);
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Edit Device Type' : 'Create New Device Type'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="name">
                                <Form.Label>Name *</Form.Label>
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
                        <Col md={6}>
                            <Form.Group controlId="parent_id">
                                <Form.Label>Parent Category</Form.Label>
                                <Form.Select
                                    name="parent_id"
                                    value={formik.values.parent_id || ''}
                                    onChange={formik.handleChange}
                                >
                                    <option value="">No Parent (Top Level)</option>
                                    {parentDeviceTypes?.map(parent => (
                                        <option key={parent.id} value={parent.id}>
                                            {parent.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="order">
                                <Form.Label>Display Order</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    name="order"
                                    value={formik.values.order}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group controlId="description" className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                        />
                    </Form.Group>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="icon">
                                <Form.Label>Icon Class/Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="icon"
                                    value={formik.values.icon}
                                    onChange={formik.handleChange}
                                    placeholder="e.g. fa-solid fa-mobile-screen"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="image">
                                <Form.Label>Image URL</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="image"
                                    value={formik.values.image}
                                    onChange={formik.handleChange}
                                    placeholder="URL to device type image"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group controlId="is_active" className="mb-3">
                        <Form.Check
                            type="switch"
                            id="is_active"
                            label="Active"
                            checked={formik.values.is_active}
                            onChange={formik.handleChange}
                            name="is_active"
                        />
                    </Form.Group>
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