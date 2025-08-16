import React, { useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner, InputGroup, Image } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const SweetAlert = withReactContent(Swal);

const validationSchema = Yup.object().shape({
    title: Yup.string().max(255, "Title must not exceed 255 characters"),
    subtitle: Yup.string().max(255, "Subtitle must not exceed 255 characters"),
    image: Yup.mixed().required("Desktop image is required"),
    start_at: Yup.date().nullable(),
    end_at: Yup.date().nullable().min(Yup.ref('start_at'), "End date must be after start date"),
});

export default function SliderItemModal({
    showModal,
    setShowModal,
    formData,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    isSubmitting,
    sliderId,
}) {
    const formik = useFormik({
        initialValues: {
            id: "",
            slider_id: sliderId,
            title: "",
            subtitle: "",
            description: "",
            image: null,
            mobile_image: null,
            video_url: "",
            button_text: "",
            button_url: "",
            secondary_button_text: "",
            secondary_button_url: "",
            order: 0,
            is_active: true,
            content_position: JSON.stringify({ x: "center", y: "center" }, null, 2),
            text_color: "#ffffff",
            overlay_color: "#000000",
            overlay_opacity: 30,
            start_at: "",
            end_at: "",
            custom_fields: null,
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            // Parse JSON fields before submission
            const parsedValues = {
                ...values,
                content_position: JSON.parse(values.content_position),
                custom_fields: values.custom_fields ? JSON.parse(values.custom_fields) : null,
            };
            handleSubmit(parsedValues);
        },
    });

    useEffect(() => {
        if (formData) {
            formik.setValues({
                ...formData,
                content_position: formData.content_position
                    ? JSON.stringify(formData.content_position, null, 2)
                    : JSON.stringify({ x: "center", y: "center" }, null, 2),
                custom_fields: formData.custom_fields
                    ? JSON.stringify(formData.custom_fields, null, 2)
                    : null,
                is_active: formData.is_active !== undefined ? formData.is_active : true,
            });
        }
    }, [formData]);

    return (
        <Modal
            centered
            show={showModal}
            onHide={() => {
                if (!isSubmitting) {
                    setShowModal(false);
                    formik.resetForm();
                }
            }}
            backdrop={isSubmitting ? "static" : true}
            keyboard={!isSubmitting}
            size="lg"
        >
            <Form onSubmit={formik.handleSubmit} noValidate>
                <Modal.Header closeButton={!isSubmitting}>
                    <Modal.Title>
                        {formData.id ? "Edit Slide Item" : "Create Slide Item"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3 mb-3">
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
                                        isInvalid={formik.touched.title && !!formik.errors.title}
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
                                        isInvalid={formik.touched.subtitle && !!formik.errors.subtitle}
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.subtitle}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.description && !!formik.errors.description}
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.description}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Desktop Image <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={(e) => {
                                        formik.setFieldValue("image", e.target.files[0]);
                                        handleFileChange(e, "image");
                                    }}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.image && !!formik.errors.image}
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.image}
                                </Form.Control.Feedback>
                                {formik.values.image && typeof formik.values.image === 'string' && (
                                    <div className="mt-2">
                                        <img
                                            src={formik.values.image}
                                            alt="Current Image"
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
                                    onChange={(e) => {
                                        formik.setFieldValue("mobile_image", e.target.files[0]);
                                        handleFileChange(e, "mobile_image");
                                    }}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.mobile_image && !!formik.errors.mobile_image}
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.mobile_image}
                                </Form.Control.Feedback>
                                {(formik.values.mobile_image || formData?.mobile_image_url) && (
                                    <div className="mt-2">
                                        <Image
                                            src={
                                                typeof formik.values.mobile_image === 'string'
                                                    ? formik.values.mobile_image
                                                    : formik.values.mobile_image
                                                        ? URL.createObjectURL(formik.values.mobile_image)
                                                        : formData?.mobile_image_url
                                            }
                                            alt="Mobile Preview"
                                            thumbnail
                                            style={{ maxHeight: '150px' }}
                                        />
                                    </div>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Video URL</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-play-btn"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="url"
                                        name="video_url"
                                        value={formik.values.video_url}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={formik.touched.video_url && !!formik.errors.video_url}
                                        disabled={isSubmitting}
                                        placeholder="https://example.com/video.mp4"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.video_url}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="g-3 mb-3">
                        <Col md={6}>
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
                                        isInvalid={formik.touched.button_text && !!formik.errors.button_text}
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.button_text}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
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
                                        isInvalid={formik.touched.button_url && !!formik.errors.button_url}
                                        disabled={isSubmitting}
                                        placeholder="https://example.com"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.button_url}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Secondary Button Text</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-button-play"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="secondary_button_text"
                                        value={formik.values.secondary_button_text}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={formik.touched.secondary_button_text && !!formik.errors.secondary_button_text}
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.secondary_button_text}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Secondary Button URL</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-link-45deg"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="url"
                                        name="secondary_button_url"
                                        value={formik.values.secondary_button_url}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={formik.touched.secondary_button_url && !!formik.errors.secondary_button_url}
                                        disabled={isSubmitting}
                                        placeholder="https://example.com"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.secondary_button_url}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="g-3 mb-3">
                        <Col md={4}>
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
                                        isInvalid={formik.touched.order && !!formik.errors.order}
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.order}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Text Color</Form.Label>
                                <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                        type="color"
                                        name="text_color"
                                        value={formik.values.text_color}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={formik.touched.text_color && !!formik.errors.text_color}
                                        style={{ width: '60px', height: '38px', padding: '3px' }}
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control
                                        type="text"
                                        name="text_color"
                                        value={formik.values.text_color}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={formik.touched.text_color && !!formik.errors.text_color}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.text_color}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Overlay Opacity</Form.Label>
                                <div className="d-flex align-items-center gap-2">
                                    <Form.Range
                                        name="overlay_opacity"
                                        min="0"
                                        max="100"
                                        value={formik.values.overlay_opacity}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={formik.touched.overlay_opacity && !!formik.errors.overlay_opacity}
                                        disabled={isSubmitting}
                                    />
                                    <span className="text-muted">{formik.values.overlay_opacity}%</span>
                                </div>
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.overlay_opacity}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Content Position (JSON)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="content_position"
                                    value={formik.values.content_position}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.content_position && !!formik.errors.content_position}
                                    // disabled={isSubmitting}
                                    placeholder='{"x": "center", "y": "center"}'
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.content_position}
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

                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Start Date/Time</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="start_at"
                                    value={formik.values.start_at}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.start_at && !!formik.errors.start_at}
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.start_at}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>End Date/Time</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="end_at"
                                    value={formik.values.end_at}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.end_at && !!formik.errors.end_at}
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
                                <Form.Label>Custom Fields (JSON)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="custom_fields"
                                    value={formik.values.custom_fields || ''}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.custom_fields && !!formik.errors.custom_fields}
                                    // disabled={isSubmitting}
                                    placeholder='Any additional custom data in JSON format'
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.custom_fields}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-danger"
                        onClick={() => {
                            setShowModal(false);
                            formik.resetForm();
                        }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outline-light"
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
                                />
                                <span className="ms-2">
                                    {formData.id ? "Updating..." : "Creating..."}
                                </span>
                            </>
                        ) : formData.id ? (
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