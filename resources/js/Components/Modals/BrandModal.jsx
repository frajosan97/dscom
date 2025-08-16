import React, { useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner, InputGroup } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required("Brand name is required")
        .max(255, "Brand name must not exceed 255 characters"),
    slug: Yup.string().max(255, "Slug must not exceed 255 characters"),
    is_active: Yup.boolean(),
    is_featured: Yup.boolean(),
    order: Yup.number().integer("Must be an integer"),
});

export default function BrandModal({
    showModal,
    setShowModal,
    formData,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    isSubmitting,
}) {
    const formik = useFormik({
        initialValues: {
            id: formData?.id || "",
            name: formData?.name || "",
            slug: formData?.slug || "",
            description: formData?.description || "",
            meta_title: formData?.meta_title || "",
            meta_description: formData?.meta_description || "",
            logo: formData?.logo || null,
            website_url: formData?.website_url || "",
            facebook_url: formData?.facebook_url || "",
            instagram_url: formData?.instagram_url || "",
            twitter_url: formData?.twitter_url || "",
            is_active: formData?.is_active !== undefined ? formData.is_active : true,
            is_featured: formData?.is_featured !== undefined ? formData.is_featured : false,
            order: formData?.order || 0,
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
                is_active: formData.is_active !== undefined ? formData.is_active : true,
                is_featured: formData.is_featured !== undefined ? formData.is_featured : false,
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
                        {formData.id ? "Edit Brand" : "Create Brand"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Brand Name <span className="text-danger">*</span>
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
                                        isInvalid={formik.touched.name && !!formik.errors.name}
                                        disabled={isSubmitting}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.name}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
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
                                        isInvalid={formik.touched.slug && !!formik.errors.slug}
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.slug}
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
                                <Form.Label>Logo</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        formik.setFieldValue("logo", e.target.files[0]);
                                        handleFileChange(e);
                                    }}
                                    disabled={isSubmitting}
                                />
                                {formik.values.logo && typeof formik.values.logo === 'string' && (
                                    <div className="mt-2">
                                        <img
                                            src={formik.values.logo}
                                            alt="Current logo"
                                            className="img-thumbnail"
                                            width={100}
                                        />
                                    </div>
                                )}
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
                                    isInvalid={formik.touched.order && !!formik.errors.order}
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.order}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Website URL</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-globe"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="website_url"
                                        value={formik.values.website_url}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={formik.touched.website_url && !!formik.errors.website_url}
                                    // disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.website_url}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Facebook URL</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-facebook"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="facebook_url"
                                        value={formik.values.facebook_url}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={formik.touched.facebook_url && !!formik.errors.facebook_url}
                                    // disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.facebook_url}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Instagram URL</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-instagram"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="instagram_url"
                                        value={formik.values.instagram_url}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={formik.touched.instagram_url && !!formik.errors.instagram_url}
                                    // disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.instagram_url}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Twitter URL</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-twitter"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="twitter_url"
                                        value={formik.values.twitter_url}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={formik.touched.twitter_url && !!formik.errors.twitter_url}
                                    // disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.twitter_url}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Meta Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="meta_title"
                                    value={formik.values.meta_title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.meta_title && !!formik.errors.meta_title}
                                // disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.meta_title}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Meta Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="meta_description"
                                    value={formik.values.meta_description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.meta_description && !!formik.errors.meta_description}
                                // disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.meta_description}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
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

                        <Col md={6}>
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