import React, { useEffect } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    Spinner,
    InputGroup,
    Image,
} from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required("Category name is required")
        .max(255, "Category name must not exceed 255 characters"),
    icon: Yup.string().max(255, "Icon must not exceed 255 characters"),
    parent_id: Yup.string().nullable(),
    is_active: Yup.boolean(),
    is_featured: Yup.boolean(),
    order: Yup.number().integer("Must be an integer"),
});

export default function CategoryModal({
    showModal,
    setShowModal,
    formData,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    isSubmitting,
    parentCategories,
}) {
    const formik = useFormik({
        initialValues: {
            id: "",
            name: "",
            icon: "",
            description: "",
            parent_id: "",
            is_active: true,
            is_featured: false,
            image: null,
            meta_title: "",
            meta_description: "",
            order: 0,
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            handleSubmit(values);
        },
    });

    useEffect(() => {
        if (formData) {
            formik.setValues({
                ...formik.values,
                ...formData,
                is_active:
                    formData.is_active !== undefined
                        ? formData.is_active
                        : true,
                is_featured:
                    formData.is_featured !== undefined
                        ? formData.is_featured
                        : false,
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
                        {formData.id ? "Edit Category" : "Create Category"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Category Name{" "}
                                    <span className="text-danger">*</span>
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-tag"></i>
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

                            <Form.Group className="mb-3">
                                <Form.Label>Icon</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-emoji-smile"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="icon"
                                        value={formik.values.icon}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.icon &&
                                            !!formik.errors.icon
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.icon}
                                    </Form.Control.Feedback>
                                </InputGroup>
                                <Form.Text className="text-muted">
                                    Enter icon class (e.g., "bi bi-arrow-right")
                                </Form.Text>
                            </Form.Group>

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

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Parent Category</Form.Label>
                                        <Form.Select
                                            name="parent_id"
                                            value={formik.values.parent_id}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isInvalid={
                                                formik.touched.parent_id &&
                                                !!formik.errors.parent_id
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <option value="">
                                                None (Top Level)
                                            </option>
                                            {parentCategories.map(
                                                (category) => (
                                                    <option
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </option>
                                                )
                                            )}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.parent_id}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Order</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="order"
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
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Category Image</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        formik.setFieldValue(
                                            "image",
                                            e.target.files[0]
                                        );
                                        handleFileChange(e);
                                    }}
                                    disabled={isSubmitting}
                                />
                                {(formik.values.image ||
                                    formData?.image_url) && (
                                    <div className="mt-3 text-center">
                                        <Image
                                            src={
                                                typeof formik.values.image ===
                                                "string"
                                                    ? formik.values.image
                                                    : formik.values.image
                                                    ? URL.createObjectURL(
                                                          formik.values.image
                                                      )
                                                    : formData?.image_url
                                            }
                                            alt="Image Preview"
                                            fluid
                                            thumbnail
                                            style={{ maxHeight: "150px" }}
                                        />
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="text-danger mt-2"
                                            onClick={() => {
                                                formik.setFieldValue(
                                                    "image",
                                                    null
                                                );
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            Remove Image
                                        </Button>
                                    </div>
                                )}
                            </Form.Group>

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

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="is_featured"
                                    name="is_featured"
                                    label="Featured"
                                    checked={formik.values.is_featured}
                                    onChange={formik.handleChange}
                                    disabled={isSubmitting}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Meta Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="meta_title"
                                    value={formik.values.meta_title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.meta_title &&
                                        !!formik.errors.meta_title
                                    }
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.meta_title}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Meta Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="meta_description"
                                    value={formik.values.meta_description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.meta_description &&
                                        !!formik.errors.meta_description
                                    }
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.meta_description}
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
