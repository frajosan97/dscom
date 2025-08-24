import React from "react";
import { Modal, Form, Button, Row, Col, Badge } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import xios from "@/Utils/axios";

export default function BranchModal({ show, onHide, branch, onSuccess }) {
    const isEditMode = !!branch;

    // Form validation schema
    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        code: Yup.string().required("Code is required"),
        email: Yup.string().email("Invalid email format").nullable(),
        phone: Yup.string().required("Phone is required"),
        address: Yup.string().required("Address is required"),
        city: Yup.string().required("City is required"),
        state: Yup.string().required("State is required"),
        country: Yup.string().required("Country is required"),
        postal_code: Yup.string().required("Postal code is required"),
        is_active: Yup.boolean(),
        is_online: Yup.boolean(),
        has_pickup: Yup.boolean(),
        has_delivery: Yup.boolean(),
        currency: Yup.string().required("Currency is required"),
    });

    // Formik form handling
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: branch?.name || "",
            code: branch?.code || "",
            email: branch?.email || "",
            phone: branch?.phone || "",
            manager_name: branch?.manager_name || "",
            manager_contact: branch?.manager_contact || "",
            address: branch?.address || "",
            city: branch?.city || "",
            state: branch?.state || "",
            country: branch?.country || "drc",
            postal_code: branch?.postal_code || "",
            latitude: branch?.latitude || "",
            longitude: branch?.longitude || "",
            opening_time: branch?.opening_time || "",
            closing_time: branch?.closing_time || "",
            working_days: branch?.working_days || [],
            is_active: branch?.is_active ?? true,
            is_online: branch?.is_online ?? false,
            has_pickup: branch?.has_pickup ?? false,
            has_delivery: branch?.has_delivery ?? false,
            delivery_radius: branch?.delivery_radius || "",
            delivery_fee: branch?.delivery_fee || "",
            currency: branch?.currency || "CDF",
            notes: branch?.notes || "",
            _method: isEditMode ? "PUT" : "POST",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                // post route
                const postRoute = isEditMode
                    ? route("branch.update", branch.id)
                    : route("branch.store");

                const response = await xios.post(postRoute, values);

                if (response.data.success === true) {
                    onSuccess(response.data.message);
                    onHide();
                }
            } catch (error) {
                if (error.response?.data?.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    console.error("Error submitting form:", error);
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Days of week for working days selection
    const daysOfWeek = [
        { id: 1, name: "Monday" },
        { id: 2, name: "Tuesday" },
        { id: 3, name: "Wednesday" },
        { id: 4, name: "Thursday" },
        { id: 5, name: "Friday" },
        { id: 6, name: "Saturday" },
        { id: 7, name: "Sunday" },
    ];

    // Handle working days toggle
    const handleDayToggle = (dayId) => {
        const currentDays = formik.values.working_days || [];
        const newDays = currentDays.includes(dayId)
            ? currentDays.filter((id) => id !== dayId)
            : [...currentDays, dayId];
        formik.setFieldValue("working_days", newDays);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditMode ? "Edit Branch" : "Create New Branch"}
                </Modal.Title>
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
                                    isInvalid={
                                        formik.touched.name &&
                                        !!formik.errors.name
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.name}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="code">
                                <Form.Label>Code *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="code"
                                    value={formik.values.code}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.code &&
                                        !!formik.errors.code
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.code}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.email &&
                                        !!formik.errors.email
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.email}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="phone">
                                <Form.Label>Phone *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.phone &&
                                        !!formik.errors.phone
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.phone}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="manager_name">
                                <Form.Label>Manager Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="manager_name"
                                    value={formik.values.manager_name}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="manager_contact">
                                <Form.Label>Manager Contact</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="manager_contact"
                                    value={formik.values.manager_contact}
                                    onChange={formik.handleChange}
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
                            isInvalid={
                                formik.touched.address &&
                                !!formik.errors.address
                            }
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
                                    isInvalid={
                                        formik.touched.city &&
                                        !!formik.errors.city
                                    }
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
                                    isInvalid={
                                        formik.touched.state &&
                                        !!formik.errors.state
                                    }
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
                                    isInvalid={
                                        formik.touched.postal_code &&
                                        !!formik.errors.postal_code
                                    }
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
                                >
                                    <option value="drc">DR Congo</option>
                                    <option value="other">Other</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="currency">
                                <Form.Label>Currency *</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="currency"
                                    value={formik.values.currency}
                                    onChange={formik.handleChange}
                                >
                                    <option value="CDF">CDF</option>
                                    <option value="USD">USD</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

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
                            {daysOfWeek.map((day) => (
                                <Button
                                    key={day.id}
                                    variant={
                                        formik.values.working_days?.includes(
                                            day.id
                                        )
                                            ? "primary"
                                            : "outline-secondary"
                                    }
                                    onClick={() => handleDayToggle(day.id)}
                                    size="sm"
                                >
                                    {day.name}
                                </Button>
                            ))}
                        </div>
                    </Form.Group>

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

                    <Row className="mb-3">
                        <Col>
                            <Form.Check
                                type="switch"
                                id="is_active"
                                label="Is Active"
                                checked={formik.values.is_active}
                                onChange={formik.handleChange}
                                name="is_active"
                            />
                        </Col>
                        <Col>
                            <Form.Check
                                type="switch"
                                id="is_online"
                                label="Supports Online Orders"
                                checked={formik.values.is_online}
                                onChange={formik.handleChange}
                                name="is_online"
                            />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col>
                            <Form.Check
                                type="switch"
                                id="has_pickup"
                                label="Supports Pickup"
                                checked={formik.values.has_pickup}
                                onChange={formik.handleChange}
                                name="has_pickup"
                            />
                        </Col>
                        <Col>
                            <Form.Check
                                type="switch"
                                id="has_delivery"
                                label="Supports Delivery"
                                checked={formik.values.has_delivery}
                                onChange={formik.handleChange}
                                name="has_delivery"
                            />
                        </Col>
                    </Row>

                    {formik.values.has_delivery && (
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="delivery_radius">
                                    <Form.Label>
                                        Delivery Radius (km)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        name="delivery_radius"
                                        value={formik.values.delivery_radius}
                                        onChange={formik.handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="delivery_fee">
                                    <Form.Label>Delivery Fee</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="delivery_fee"
                                        value={formik.values.delivery_fee}
                                        onChange={formik.handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}

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
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
