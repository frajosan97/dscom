import React, { useEffect } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    Spinner,
    InputGroup,
    Card,
} from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required("Slider name is required")
        .max(255, "Slider name must not exceed 255 characters"),
    autoplay_speed: Yup.number()
        .integer("Must be an integer")
        .min(500, "Minimum autoplay speed is 500ms"),
    slides_to_show: Yup.number()
        .integer("Must be an integer")
        .min(1, "Minimum slides to show is 1"),
    slides_to_scroll: Yup.number()
        .integer("Must be an integer")
        .min(1, "Minimum slides to scroll is 1"),
});

export default function SliderModal({
    showModal,
    setShowModal,
    formData,
    handleInputChange,
    handleSubmit,
    isSubmitting,
    sliderTypes,
}) {
    const formik = useFormik({
        initialValues: {
            id: "",
            name: "",
            type: "default",
            is_active: true,
            autoplay: true,
            arrows: true,
            dots: false,
            infinite: true,
            autoplay_speed: 3000,
            slides_to_show: 1,
            slides_to_scroll: 1,
            breakpoints: null,
            custom_settings: null,
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            // Parse JSON fields before submission
            const parsedValues = {
                ...values,
                breakpoints: values.breakpoints
                    ? JSON.parse(values.breakpoints)
                    : null,
                custom_settings: values.custom_settings
                    ? JSON.parse(values.custom_settings)
                    : null,
            };
            handleSubmit(parsedValues);
        },
    });

    useEffect(() => {
        if (formData) {
            formik.setValues({
                ...formData,
                breakpoints: formData.breakpoints
                    ? JSON.stringify(formData.breakpoints, null, 2)
                    : "",
                custom_settings: formData.custom_settings
                    ? JSON.stringify(formData.custom_settings, null, 2)
                    : "",
                is_active:
                    formData.is_active !== undefined
                        ? formData.is_active
                        : true,
                autoplay:
                    formData.autoplay !== undefined ? formData.autoplay : true,
                arrows: formData.arrows !== undefined ? formData.arrows : true,
                dots: formData.dots !== undefined ? formData.dots : false,
                infinite:
                    formData.infinite !== undefined ? formData.infinite : true,
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
                        {formData.id ? "Edit Slider" : "Create Slider"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3 mb-3">
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Slider Name{" "}
                                    <span className="text-danger">*</span>
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-sliders"></i>
                                    </InputGroup.Text>
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
                                        disabled={isSubmitting}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.name}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Autoplay Speed (ms)</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-speedometer2"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        name="autoplay_speed"
                                        min="500"
                                        step="500"
                                        value={formik.values.autoplay_speed}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.autoplay_speed &&
                                            !!formik.errors.autoplay_speed
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.autoplay_speed}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Slides To Show</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-collection"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        name="slides_to_show"
                                        min="1"
                                        value={formik.values.slides_to_show}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.slides_to_show &&
                                            !!formik.errors.slides_to_show
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.slides_to_show}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Slides To Scroll</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-arrow-left-right"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        name="slides_to_scroll"
                                        min="1"
                                        value={formik.values.slides_to_scroll}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.slides_to_scroll &&
                                            !!formik.errors.slides_to_scroll
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.slides_to_scroll}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <Card.Title>Slider Controls</Card.Title>
                                    <Row>
                                        <Col md={6} lg={3}>
                                            <Form.Check
                                                type="switch"
                                                id="autoplay"
                                                name="autoplay"
                                                label="Autoplay"
                                                checked={formik.values.autoplay}
                                                onChange={formik.handleChange}
                                                disabled={isSubmitting}
                                            />
                                        </Col>
                                        <Col md={6} lg={3}>
                                            <Form.Check
                                                type="switch"
                                                id="arrows"
                                                name="arrows"
                                                label="Arrows"
                                                checked={formik.values.arrows}
                                                onChange={formik.handleChange}
                                                disabled={isSubmitting}
                                            />
                                        </Col>
                                        <Col md={6} lg={3}>
                                            <Form.Check
                                                type="switch"
                                                id="dots"
                                                name="dots"
                                                label="Pagination Dots"
                                                checked={formik.values.dots}
                                                onChange={formik.handleChange}
                                                disabled={isSubmitting}
                                            />
                                        </Col>
                                        <Col md={6} lg={3}>
                                            <Form.Check
                                                type="switch"
                                                id="infinite"
                                                name="infinite"
                                                label="Infinite Loop"
                                                checked={formik.values.infinite}
                                                onChange={formik.handleChange}
                                                disabled={isSubmitting}
                                            />
                                        </Col>
                                        <Col md={6} lg={3}>
                                            <Form.Check
                                                type="switch"
                                                id="is_active"
                                                name="is_active"
                                                label="Active"
                                                checked={
                                                    formik.values.is_active
                                                }
                                                onChange={formik.handleChange}
                                                disabled={isSubmitting}
                                            />
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
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
                                    {formData.id
                                        ? "Updating..."
                                        : "Creating..."}
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
