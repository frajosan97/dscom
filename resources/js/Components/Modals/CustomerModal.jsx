import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import xios from "@/Utils/axios";

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required("Customer name is required")
        .max(255, "Customer name must not exceed 255 characters"),
    email: Yup.string()
        .email("Invalid email address")
        .max(255, "Email must not exceed 255 characters"),
    phone: Yup.string().max(20, "Phone number must not exceed 20 characters"),
    tax_number: Yup.string().max(
        50,
        "Tax number must not exceed 50 characters"
    ),
    address: Yup.string().max(500, "Address must not exceed 500 characters"),
});

export default function CustomerModal({ show, onClose, onCustomerAdded }) {
    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            tax_number: "",
            address: "",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const response = await xios.post(
                    route("customers.store"),
                    values
                );

                if (response.data.success) {
                    toast.success("Customer added successfully.");
                    resetForm();
                    onClose();
                    onCustomerAdded();
                }
            } catch (error) {
                if (error.response && error.response.data.errors) {
                    Object.entries(error.response.data.errors).forEach(
                        ([field, messages]) => {
                            messages.forEach((message) => {
                                toast.error(`${field}: ${message}`);
                            });
                        }
                    );
                } else {
                    toast.error(
                        error.response?.data?.message ||
                            "An error occurred while adding the customer"
                    );
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton className="border-bottom-0">
                <Modal.Title className="h5">Add New Customer</Modal.Title>
            </Modal.Header>

            <Form onSubmit={formik.handleSubmit} noValidate>
                <Modal.Body className="pt-0">
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Name <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder="Customer name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.name &&
                                        !!formik.errors.name
                                    }
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.name}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="Customer email"
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
                            <Form.Group className="mb-3">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    placeholder="Phone number"
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

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tax Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="tax_number"
                                    placeholder="Tax identification number"
                                    value={formik.values.tax_number}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.tax_number &&
                                        !!formik.errors.tax_number
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.tax_number}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="address"
                                    placeholder="Full address"
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
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer className="border-top-0">
                    <Button variant="outline-secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                Saving...
                            </>
                        ) : (
                            "Save Customer"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
