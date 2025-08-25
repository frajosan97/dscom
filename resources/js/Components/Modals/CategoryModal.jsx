import React from "react";
import {
    Modal,
    Form,
    Button,
    Row,
    Col,
    Spinner,
    InputGroup,
    Image,
} from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import xios from "@/Utils/axios";
import Select from "react-select";

export default function CategoryModal({
    show,
    onHide,
    category,
    onSuccess,
    parentCategories,
}) {
    const isEditMode = !!category;

    // Form validation schema
    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required("Category name is required")
            .max(255, "Category name must not exceed 255 characters"),
        slug: Yup.string().nullable(),
        icon: Yup.string().max(255, "Icon must not exceed 255 characters"),
        description: Yup.string().nullable(),
        parent_id: Yup.string().nullable(),
        meta_title: Yup.string().nullable(),
        meta_description: Yup.string().nullable(),
        is_active: Yup.boolean(),
        is_featured: Yup.boolean(),
        order: Yup.number().integer("Must be an integer"),
    });

    // Formik form handling
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: category?.name || "",
            slug: category?.slug || "",
            icon: category?.icon || "",
            description: category?.description || "",
            parent_id: category?.parent_id || "",
            meta_title: category?.meta_title || "",
            meta_description: category?.meta_description || "",
            is_active: category?.is_active ?? true,
            is_featured: category?.is_featured ?? false,
            order: category?.order || 0,
            image: null,
            _method: isEditMode ? "PUT" : "POST",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                const formData = new FormData();

                // Append all form values to FormData
                Object.entries(values).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        formData.append(key, value);
                    }
                });

                // Post route
                const postRoute = isEditMode
                    ? route("category.update", category.id)
                    : route("category.store");

                const response = await xios.post(postRoute, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

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

    // Handle file change
    const handleFileChange = (e) => {
        formik.setFieldValue("image", e.target.files[0]);
    };

    // Remove image
    const handleRemoveImage = () => {
        formik.setFieldValue("image", null);
    };

    const parentCategoryOptions = parentCategories.map((category) => ({
        value: category.id,
        label: category.name,
    }));

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditMode ? "Edit Category" : "Create New Category"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3" controlId="name">
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
                                        disabled={formik.isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.name}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="icon">
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
                                        disabled={formik.isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.icon}
                                    </Form.Control.Feedback>
                                </InputGroup>
                                <Form.Text className="text-muted">
                                    Enter icon class (e.g., "bi bi-arrow-right")
                                </Form.Text>
                            </Form.Group>

                            <Form.Group
                                className="mb-3"
                                controlId="description"
                            >
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.description &&
                                        !!formik.errors.description
                                    }
                                    disabled={formik.isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.description}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="parent_id"
                                    >
                                        <Form.Label>Parent Category</Form.Label>
                                        <Select
                                            name="parent_id"
                                            value={parentCategoryOptions.find(
                                                (option) =>
                                                    option.value ===
                                                    formik.values.parent_id
                                            )}
                                            onChange={(selectedOption) => {
                                                formik.setFieldValue(
                                                    "parent_id",
                                                    selectedOption
                                                        ? selectedOption.value
                                                        : ""
                                                );
                                            }}
                                            onBlur={formik.handleBlur}
                                            options={parentCategoryOptions}
                                            isDisabled={formik.isSubmitting}
                                            isClearable
                                            placeholder="Parent category..."
                                        />
                                        {formik.touched.parent_id &&
                                            formik.errors.parent_id && (
                                                <Form.Control.Feedback type="invalid">
                                                    {formik.errors.parent_id}
                                                </Form.Control.Feedback>
                                            )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="order"
                                    >
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
                                            disabled={formik.isSubmitting}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.order}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="image">
                                <Form.Label>Category Image</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={formik.isSubmitting}
                                />
                                {(formik.values.image ||
                                    category?.image_url) && (
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
                                                    : category?.image_url
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
                                            onClick={handleRemoveImage}
                                            disabled={formik.isSubmitting}
                                        >
                                            Remove Image
                                        </Button>
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="is_active">
                                <Form.Check
                                    type="switch"
                                    id="is_active"
                                    name="is_active"
                                    label="Active"
                                    checked={formik.values.is_active}
                                    onChange={formik.handleChange}
                                    disabled={formik.isSubmitting}
                                />
                            </Form.Group>

                            <Form.Group
                                className="mb-3"
                                controlId="is_featured"
                            >
                                <Form.Check
                                    type="switch"
                                    id="is_featured"
                                    name="is_featured"
                                    label="Featured"
                                    checked={formik.values.is_featured}
                                    onChange={formik.handleChange}
                                    disabled={formik.isSubmitting}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="meta_title">
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
                                    disabled={formik.isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.meta_title}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group
                                className="mb-3"
                                controlId="meta_description"
                            >
                                <Form.Label>Meta Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="meta_description"
                                    value={formik.values.meta_description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.meta_description &&
                                        !!formik.errors.meta_description
                                    }
                                    disabled={formik.isSubmitting}
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
                        variant="secondary"
                        onClick={onHide}
                        disabled={formik.isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                {isEditMode ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            `${isEditMode ? "Update" : "Create"} Category`
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
