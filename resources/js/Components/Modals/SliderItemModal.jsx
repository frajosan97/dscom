import React, { useEffect, useMemo } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    Spinner,
    InputGroup,
} from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    title: Yup.string().max(255, "Title must not exceed 255 characters"),
    subtitle: Yup.string().max(255, "Subtitle must not exceed 255 characters"),
    image: Yup.mixed()
        .nullable()
        .test("is-required", "Desktop image is required", function (value) {
            return this.parent.id || value;
        }),
    start_at: Yup.date().nullable(),
    end_at: Yup.date()
        .nullable()
        .min(Yup.ref("start_at"), "End date must be after start date"),
});

export default function SliderItemModal({
    showModal,
    setShowModal,
    formData,
    handleSubmit,
    isSubmitting,
}) {
    const initialValues = useMemo(
        () => ({
            id: "",
            slider_id: "",
            title: "",
            subtitle: "",
            description: "",
            image: null,
            mobile_image: null,
            button_text: "",
            button_url: "",
            secondary_button_text: "",
            secondary_button_url: "",
            order: 0,
            is_active: true,
            text_color: "#ffffff",
            start_at: "",
            end_at: "",
        }),
        []
    );

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            handleSubmit(values);
        },
    });

    useEffect(() => {
        if (formData && showModal) {
            formik.setValues({
                ...initialValues,
                ...formData,
                is_active:
                    formData.is_active !== undefined
                        ? formData.is_active
                        : true,
            });
        }
    }, [formData, showModal]);

    const handleFileChange = (e, fieldName) => {
        formik.setFieldValue(fieldName, e.target.files[0]);
    };

    const handleModalClose = () => {
        if (!isSubmitting) {
            setShowModal(false);
            setTimeout(() => {
                formik.resetForm();
            }, 300); // Delay reset to allow modal animation to complete
        }
    };

    return (
        <Modal
            centered
            show={showModal}
            onHide={handleModalClose}
            backdrop={isSubmitting ? "static" : true}
            keyboard={!isSubmitting}
            size="lg"
        >
            <Form onSubmit={formik.handleSubmit} noValidate>
                <Modal.Header closeButton={!isSubmitting}>
                    <Modal.Title>
                        {formik.values.id
                            ? "Edit Slide Item"
                            : "Create Slide Item"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Title</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-text-paragraph"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={formik.values.title}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.title &&
                                            !!formik.errors.title
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.title}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Subtitle</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-text-center"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="subtitle"
                                        value={formik.values.subtitle}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.subtitle &&
                                            !!formik.errors.subtitle
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.subtitle}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        {/* <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.description &&
                                        !!formik.errors.description
                                    }
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.description}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col> */}

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Desktop Image{" "}
                                    {!formik.values.id && (
                                        <span className="text-danger">*</span>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={(e) =>
                                        handleFileChange(e, "image")
                                    }
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.image &&
                                        !!formik.errors.image
                                    }
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.image}
                                </Form.Control.Feedback>
                                {formik.values.image &&
                                    typeof formik.values.image === "string" && (
                                        <div className="mt-2">
                                            <img
                                                src={`/${formik.values.image}`}
                                                alt="Current"
                                                className="img-thumbnail"
                                                width={100}
                                            />
                                        </div>
                                    )}
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Mobile Image</Form.Label>
                                <Form.Control
                                    type="file"
                                    name="mobile_image"
                                    accept="image/*"
                                    onChange={(e) =>
                                        handleFileChange(e, "mobile_image")
                                    }
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.mobile_image &&
                                        !!formik.errors.mobile_image
                                    }
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.mobile_image}
                                </Form.Control.Feedback>
                                {formik.values.mobile_image &&
                                    typeof formik.values.mobile_image ===
                                        "string" && (
                                        <div className="mt-2">
                                            <img
                                                src={`/${formik.values.mobile_image}`}
                                                alt="Mobile Preview"
                                                className="img-thumbnail"
                                                style={{ maxHeight: "150px" }}
                                            />
                                        </div>
                                    )}
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Primary Button Text</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-button-play"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="button_text"
                                        value={formik.values.button_text}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.button_text &&
                                            !!formik.errors.button_text
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.button_text}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Primary Button URL</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-link-45deg"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="url"
                                        name="button_url"
                                        value={formik.values.button_url}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.button_url &&
                                            !!formik.errors.button_url
                                        }
                                        disabled={isSubmitting}
                                        placeholder="https://example.com"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.button_url}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Secondary Button Text</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-button-play"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="secondary_button_text"
                                        value={
                                            formik.values.secondary_button_text
                                        }
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched
                                                .secondary_button_text &&
                                            !!formik.errors
                                                .secondary_button_text
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.secondary_button_text}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Secondary Button URL</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-link-45deg"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="url"
                                        name="secondary_button_url"
                                        value={
                                            formik.values.secondary_button_url
                                        }
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched
                                                .secondary_button_url &&
                                            !!formik.errors.secondary_button_url
                                        }
                                        disabled={isSubmitting}
                                        placeholder="https://example.com"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.secondary_button_url}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Order</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-sort-numeric-down"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        name="order"
                                        min="0"
                                        value={formik.values.order}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.order &&
                                            !!formik.errors.order
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.order}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Text Color</Form.Label>
                                <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                        type="color"
                                        name="text_color"
                                        value={formik.values.text_color}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.text_color &&
                                            !!formik.errors.text_color
                                        }
                                        style={{
                                            width: "60px",
                                            height: "38px",
                                            padding: "3px",
                                        }}
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control
                                        type="text"
                                        name="text_color"
                                        value={formik.values.text_color}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.text_color &&
                                            !!formik.errors.text_color
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.text_color}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Start Date/Time</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="start_at"
                                    value={formik.values.start_at}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.start_at &&
                                        !!formik.errors.start_at
                                    }
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.start_at}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>End Date/Time</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="end_at"
                                    value={formik.values.end_at}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.end_at &&
                                        !!formik.errors.end_at
                                    }
                                    min={formik.values.start_at}
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.end_at}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="is_active"
                                    name="is_active"
                                    label="Active"
                                    checked={formik.values.is_active}
                                    onChange={formik.handleChange}
                                    disabled={isSubmitting}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={handleModalClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting || !formik.isValid}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                {formik.values.id
                                    ? "Updating..."
                                    : "Creating..."}
                            </>
                        ) : formik.values.id ? (
                            "Update"
                        ) : (
                            "Create"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
