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

export default function BrandModal({ show, onHide, brand, onSuccess }) {
    const isEditMode = !!brand;

    // Form validation schema
    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required("Brand name is required")
            .max(255, "Brand name must not exceed 255 characters"),
        slug: Yup.string().max(255, "Slug must not exceed 255 characters"),
        description: Yup.string().nullable(),
        meta_title: Yup.string().nullable(),
        meta_description: Yup.string().nullable(),
        website_url: Yup.string().url("Must be a valid URL").nullable(),
        facebook_url: Yup.string().url("Must be a valid URL").nullable(),
        instagram_url: Yup.string().url("Must be a valid URL").nullable(),
        twitter_url: Yup.string().url("Must be a valid URL").nullable(),
        is_active: Yup.boolean(),
        is_featured: Yup.boolean(),
        order: Yup.number().integer("Must be an integer"),
    });

    // Formik form handling
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: brand?.name || "",
            slug: brand?.slug || "",
            description: brand?.description || "",
            meta_title: brand?.meta_title || "",
            meta_description: brand?.meta_description || "",
            logo: null,
            website_url: brand?.website_url || "",
            facebook_url: brand?.facebook_url || "",
            instagram_url: brand?.instagram_url || "",
            twitter_url: brand?.twitter_url || "",
            is_active: brand?.is_active ?? true,
            is_featured: brand?.is_featured ?? false,
            order: brand?.order || 0,
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
                    ? route("brand.update", brand.id)
                    : route("brand.store");

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
        formik.setFieldValue("logo", e.target.files[0]);
    };

    // Remove image
    const handleRemoveImage = () => {
        formik.setFieldValue("logo", null);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditMode ? "Edit Brand" : "Create New Brand"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3" controlId="name">
                                <Form.Label>
                                    Brand Name{" "}
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

                            <Form.Group className="mb-3" controlId="slug">
                                <Form.Label>Slug</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-link-45deg"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="slug"
                                        value={formik.values.slug}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.slug &&
                                            !!formik.errors.slug
                                        }
                                        disabled={formik.isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.slug}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>

                            <Form.Group
                                className="mb-3"
                                controlId="description"
                            >
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
                                        controlId="website_url"
                                    >
                                        <Form.Label>Website URL</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>
                                                <i className="bi bi-globe"></i>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="url"
                                                name="website_url"
                                                value={
                                                    formik.values.website_url
                                                }
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                isInvalid={
                                                    formik.touched
                                                        .website_url &&
                                                    !!formik.errors.website_url
                                                }
                                                disabled={formik.isSubmitting}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formik.errors.website_url}
                                            </Form.Control.Feedback>
                                        </InputGroup>
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

                            <Row>
                                <Col md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="facebook_url"
                                    >
                                        <Form.Label>Facebook URL</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>
                                                <i className="bi bi-facebook"></i>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="url"
                                                name="facebook_url"
                                                value={
                                                    formik.values.facebook_url
                                                }
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                isInvalid={
                                                    formik.touched
                                                        .facebook_url &&
                                                    !!formik.errors.facebook_url
                                                }
                                                disabled={formik.isSubmitting}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formik.errors.facebook_url}
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="instagram_url"
                                    >
                                        <Form.Label>Instagram URL</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>
                                                <i className="bi bi-instagram"></i>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="url"
                                                name="instagram_url"
                                                value={
                                                    formik.values.instagram_url
                                                }
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                isInvalid={
                                                    formik.touched
                                                        .instagram_url &&
                                                    !!formik.errors
                                                        .instagram_url
                                                }
                                                disabled={formik.isSubmitting}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formik.errors.instagram_url}
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group
                                className="mb-3"
                                controlId="twitter_url"
                            >
                                <Form.Label>Twitter URL</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-twitter"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="url"
                                        name="twitter_url"
                                        value={formik.values.twitter_url}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.twitter_url &&
                                            !!formik.errors.twitter_url
                                        }
                                        disabled={formik.isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.twitter_url}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="logo">
                                <Form.Label>Brand Logo</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={formik.isSubmitting}
                                />
                                {(formik.values.logo || brand?.logo_url) && (
                                    <div className="mt-3 text-center">
                                        <Image
                                            src={
                                                typeof formik.values.logo ===
                                                "string"
                                                    ? formik.values.logo
                                                    : formik.values.logo
                                                    ? URL.createObjectURL(
                                                          formik.values.logo
                                                      )
                                                    : brand?.logo_url
                                            }
                                            alt="Logo Preview"
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
                                            Remove Logo
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
                                    rows={3}
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
                            `${isEditMode ? "Update" : "Create"} Brand`
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
