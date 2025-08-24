import React from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import xios from "@/Utils/axios";

export default function PaymentMethodModal({
    show,
    onHide,
    method,
    onSuccess,
}) {
    const isEditMode = !!method;

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        code: Yup.string().required("Code is required"),
        description: Yup.string().nullable(),
        is_active: Yup.boolean(),
        is_default: Yup.boolean(),
        requires_approval: Yup.boolean(),
        processing_fee: Yup.number().min(0, "Fee cannot be negative"),
        fee_type: Yup.string()
            .oneOf(["fixed", "percentage"])
            .required("Fee type is required"),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: method?.name || "",
            code: method?.code || "",
            description: method?.description || "",
            is_active: method?.is_active ?? true,
            is_default: method?.is_default ?? false,
            requires_approval: method?.requires_approval ?? false,
            processing_fee: method?.processing_fee || 0,
            fee_type: method?.fee_type || "fixed",
            _method: isEditMode ? "PUT" : "POST",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                const postRoute = isEditMode
                    ? route("payment-method.update", method.id)
                    : route("payment-method.store");

                const response = await xios.post(postRoute, values);

                if (response.data.success === true) {
                    onSuccess(response.data.message);
                    onHide();
                }
            } catch (error) {
                console.log(error);
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

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditMode
                        ? "Edit Payment Method"
                        : "Create New Payment Method"}
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

                    <Form.Group controlId="description" className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                        />
                    </Form.Group>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="processing_fee">
                                <Form.Label>Processing Fee</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="processing_fee"
                                    value={formik.values.processing_fee}
                                    onChange={formik.handleChange}
                                    isInvalid={
                                        formik.touched.processing_fee &&
                                        !!formik.errors.processing_fee
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.processing_fee}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="fee_type">
                                <Form.Label>Fee Type</Form.Label>
                                <Form.Select
                                    name="fee_type"
                                    value={formik.values.fee_type}
                                    onChange={formik.handleChange}
                                    isInvalid={
                                        formik.touched.fee_type &&
                                        !!formik.errors.fee_type
                                    }
                                >
                                    <option value="fixed">Fixed Amount</option>
                                    <option value="percentage">
                                        Percentage
                                    </option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.fee_type}
                                </Form.Control.Feedback>
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
                                id="is_default"
                                label="Default Method"
                                checked={formik.values.is_default}
                                onChange={formik.handleChange}
                                name="is_default"
                            />
                        </Col>
                        <Col>
                            <Form.Check
                                type="switch"
                                id="requires_approval"
                                label="Requires Approval"
                                checked={formik.values.requires_approval}
                                onChange={formik.handleChange}
                                name="requires_approval"
                            />
                        </Col>
                    </Row>
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
