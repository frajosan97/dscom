import React from 'react';
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import xios from '@/Utils/axios';

export default function WarehouseModal({ show, onHide, warehouse, branches, onSuccess }) {
    const isEditMode = !!warehouse;

    // Form validation schema
    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        code: Yup.string().required('Code is required'),
        branch_id: Yup.string().nullable(),
        address: Yup.string().required('Address is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string().required('State is required'),
        country: Yup.string().required('Country is required'),
        postal_code: Yup.string().required('Postal code is required'),
        contact_person: Yup.string().required('Contact person is required'),
        contact_phone: Yup.string().required('Contact phone is required'),
        contact_email: Yup.string().email('Invalid email format').required('Contact email is required'),
        is_active: Yup.boolean(),
        is_primary: Yup.boolean(),
    });

    // Formik form handling
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: warehouse?.name || '',
            code: warehouse?.code || '',
            branch_id: warehouse?.branch_id || '',
            address: warehouse?.address || '',
            city: warehouse?.city || '',
            state: warehouse?.state || '',
            country: warehouse?.country || 'Nigeria',
            postal_code: warehouse?.postal_code || '',
            latitude: warehouse?.latitude || '',
            longitude: warehouse?.longitude || '',
            contact_person: warehouse?.contact_person || '',
            contact_phone: warehouse?.contact_phone || '',
            contact_email: warehouse?.contact_email || '',
            contact_position: warehouse?.contact_position || '',
            opening_time: warehouse?.opening_time || '08:00',
            closing_time: warehouse?.closing_time || '18:00',
            working_days: warehouse?.working_days || [],
            is_primary: warehouse?.is_primary || false,
            is_active: warehouse?.is_active ?? true,
            notes: warehouse?.notes || '',
            _method: isEditMode ? 'PUT' : 'POST',
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                const postRoute = isEditMode
                    ? route('warehouse.update', warehouse.id)
                    : route('warehouse.store');

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

    // Days of week for working days selection
    const daysOfWeek = [
        { id: 'monday', name: 'Monday' },
        { id: 'tuesday', name: 'Tuesday' },
        { id: 'wednesday', name: 'Wednesday' },
        { id: 'thursday', name: 'Thursday' },
        { id: 'friday', name: 'Friday' },
        { id: 'saturday', name: 'Saturday' },
        { id: 'sunday', name: 'Sunday' },
    ];

    // Handle working days toggle
    const handleDayToggle = (dayId) => {
        const currentDays = formik.values.working_days || [];
        const newDays = currentDays.includes(dayId)
            ? currentDays.filter(id => id !== dayId)
            : [...currentDays, dayId];
        formik.setFieldValue('working_days', newDays);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Edit Warehouse' : 'Create New Warehouse'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="name">
                                <Form.Label>Warehouse Name *</Form.Label>
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
                            <Form.Group controlId="code">
                                <Form.Label>Warehouse Code *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="code"
                                    value={formik.values.code}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.code && !!formik.errors.code}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.code}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="branch_id">
                                <Form.Label>Branch</Form.Label>
                                <Form.Select
                                    name="branch_id"
                                    value={formik.values.branch_id}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.branch_id && !!formik.errors.branch_id}
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.branch_id}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="is_primary">
                                <Form.Check
                                    type="switch"
                                    id="is_primary"
                                    label="Primary Warehouse"
                                    checked={formik.values.is_primary}
                                    onChange={formik.handleChange}
                                    name="is_primary"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group controlId="address" className="mb-3">
                        <Form.Label>Address *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="address"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={formik.touched.address && !!formik.errors.address}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.address}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group controlId="city">
                                <Form.Label>City *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="city"
                                    value={formik.values.city}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.city && !!formik.errors.city}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.city}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="state">
                                <Form.Label>State *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="state"
                                    value={formik.values.state}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.state && !!formik.errors.state}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.state}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="postal_code">
                                <Form.Label>Postal Code *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="postal_code"
                                    value={formik.values.postal_code}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.postal_code && !!formik.errors.postal_code}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.postal_code}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="country">
                                <Form.Label>Country *</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="country"
                                    value={formik.values.country}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.country && !!formik.errors.country}
                                >
                                    <option value="Nigeria">Nigeria</option>
                                    <option value="Ghana">Ghana</option>
                                    <option value="South Africa">South Africa</option>
                                    <option value="Kenya">Kenya</option>
                                    <option value="Other">Other</option>
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.country}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="is_active">
                                <Form.Check
                                    type="switch"
                                    id="is_active"
                                    label="Is Active"
                                    checked={formik.values.is_active}
                                    onChange={formik.handleChange}
                                    name="is_active"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="latitude">
                                <Form.Label>Latitude</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.000001"
                                    name="latitude"
                                    value={formik.values.latitude}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="longitude">
                                <Form.Label>Longitude</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.000001"
                                    name="longitude"
                                    value={formik.values.longitude}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h5 className="mt-4 mb-3">Contact Information</h5>
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group controlId="contact_person">
                                <Form.Label>Contact Person *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contact_person"
                                    value={formik.values.contact_person}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.contact_person && !!formik.errors.contact_person}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.contact_person}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="contact_phone">
                                <Form.Label>Contact Phone *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contact_phone"
                                    value={formik.values.contact_phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.contact_phone && !!formik.errors.contact_phone}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.contact_phone}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="contact_email">
                                <Form.Label>Contact Email *</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="contact_email"
                                    value={formik.values.contact_email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.contact_email && !!formik.errors.contact_email}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.contact_email}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group controlId="contact_position" className="mb-3">
                        <Form.Label>Contact Position</Form.Label>
                        <Form.Control
                            type="text"
                            name="contact_position"
                            value={formik.values.contact_position}
                            onChange={formik.handleChange}
                        />
                    </Form.Group>

                    <h5 className="mt-4 mb-3">Operating Hours</h5>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="opening_time">
                                <Form.Label>Opening Time</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="opening_time"
                                    value={formik.values.opening_time}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="closing_time">
                                <Form.Label>Closing Time</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="closing_time"
                                    value={formik.values.closing_time}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group controlId="working_days" className="mb-3">
                        <Form.Label>Working Days</Form.Label>
                        <div className="d-flex flex-wrap gap-2">
                            {daysOfWeek.map(day => (
                                <Button
                                    key={day.id}
                                    variant={formik.values.working_days?.includes(day.id) ? 'primary' : 'outline-secondary'}
                                    onClick={() => handleDayToggle(day.id)}
                                    size="sm"
                                >
                                    {day.name}
                                </Button>
                            ))}
                        </div>
                    </Form.Group>

                    <Form.Group controlId="notes" className="mb-3">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="notes"
                            value={formik.values.notes}
                            onChange={formik.handleChange}
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