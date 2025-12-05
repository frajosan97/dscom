import React, { useEffect, useCallback } from "react";
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

// Constants
const DEFAULT_VALUES = {
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
};

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

// Form field configuration
const formFields = [
    {
        name: "name",
        label: "Slider Name",
        type: "text",
        required: true,
        icon: "bi-sliders",
        colProps: { md: 12 },
    },
    {
        name: "autoplay_speed",
        label: "Autoplay Speed (ms)",
        type: "number",
        icon: "bi-speedometer2",
        min: 500,
        step: 500,
        colProps: { md: 4 },
    },
    {
        name: "slides_to_show",
        label: "Slides To Show",
        type: "number",
        icon: "bi-collection",
        min: 1,
        colProps: { md: 4 },
    },
    {
        name: "slides_to_scroll",
        label: "Slides To Scroll",
        type: "number",
        icon: "bi-arrow-left-right",
        min: 1,
        colProps: { md: 4 },
    },
];

const switchControls = [
    { id: "autoplay", label: "Autoplay", colProps: { md: 6, lg: 3 } },
    { id: "arrows", label: "Arrows", colProps: { md: 6, lg: 3 } },
    { id: "dots", label: "Pagination Dots", colProps: { md: 6, lg: 3 } },
    { id: "infinite", label: "Infinite Loop", colProps: { md: 6, lg: 3 } },
    { id: "is_active", label: "Active", colProps: { md: 6, lg: 3 } },
];

export default function SliderModal({
    showModal,
    setShowModal,
    formData,
    handleSubmit,
    isSubmitting,
}) {
    const parseFormData = useCallback((data) => {
        if (!data) return DEFAULT_VALUES;

        return {
            ...DEFAULT_VALUES,
            ...data,
            breakpoints: data.breakpoints
                ? JSON.stringify(data.breakpoints, null, 2)
                : "",
            custom_settings: data.custom_settings
                ? JSON.stringify(data.custom_settings, null, 2)
                : "",
        };
    }, []);

    const formik = useFormik({
        initialValues: DEFAULT_VALUES,
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
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

    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            setShowModal(false);
            formik.resetForm();
        }
    }, [isSubmitting, setShowModal, formik]);

    useEffect(() => {
        if (formData) {
            formik.setValues(parseFormData(formData));
        }
    }, [formData, parseFormData]);

    const renderFormField = (field) => {
        const { name, label, type, required, icon, min, step, colProps } =
            field;

        const isInvalid = formik.touched[name] && !!formik.errors[name];

        return (
            <Col key={name} {...colProps}>
                <Form.Group className="mb-3">
                    <Form.Label>
                        {label}{" "}
                        {required && <span className="text-danger">*</span>}
                    </Form.Label>
                    <InputGroup>
                        <InputGroup.Text>
                            <i className={`bi ${icon}`}></i>
                        </InputGroup.Text>
                        <Form.Control
                            type={type}
                            name={name}
                            min={min}
                            step={step}
                            value={formik.values[name]}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={isInvalid}
                            disabled={isSubmitting}
                            required={required}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors[name]}
                        </Form.Control.Feedback>
                    </InputGroup>
                </Form.Group>
            </Col>
        );
    };

    const renderSwitchControl = (control) => {
        const { id, label, colProps } = control;

        return (
            <Col key={id} {...colProps}>
                <Form.Check
                    type="switch"
                    id={id}
                    name={id}
                    label={label}
                    checked={formik.values[id]}
                    onChange={formik.handleChange}
                    disabled={isSubmitting}
                />
            </Col>
        );
    };

    const submitButtonText = isSubmitting
        ? formData?.id
            ? "Updating..."
            : "Creating..."
        : formData?.id
        ? "Update"
        : "Create";

    return (
        <Modal
            centered
            show={showModal}
            onHide={handleClose}
            backdrop={isSubmitting ? "static" : true}
            keyboard={!isSubmitting}
            size="lg"
        >
            <Form onSubmit={formik.handleSubmit} noValidate>
                <Modal.Header closeButton={!isSubmitting}>
                    <Modal.Title>
                        {formData?.id ? "Edit Slider" : "Create Slider"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row className="g-3 mb-3">
                        {formFields.map(renderFormField)}

                        <Col md={12}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <Card.Title>Slider Controls</Card.Title>
                                    <Row>
                                        {switchControls.map(
                                            renderSwitchControl
                                        )}
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="outline-danger"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outline-light"
                        type="submit"
                        disabled={isSubmitting || !formik.isValid}
                    >
                        {isSubmitting && (
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                        )}
                        {submitButtonText}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
