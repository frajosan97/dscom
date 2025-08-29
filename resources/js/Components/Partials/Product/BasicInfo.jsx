import RichTextEditor from "@/Components/Settings/RichTextEditor";
import { createFormHandlers, findSelectedOption } from "@/Utils/helpers";
import { Card, Col, Form, Row } from "react-bootstrap";
import Select from "react-select";

export default function BasicInfoTab({
    data,
    setData,
    errors,
    setErrors,
    categories,
    brands,
}) {
    // Create pre-bound handlers using your factory function
    const { handleInput, handleSelect, handleRichText } = createFormHandlers(
        setData,
        errors,
        setErrors
    );

    // Format categories and brands for react-select
    const categoryOptions = categories.map((c) => ({
        value: c.id,
        label: c.name,
    }));

    const brandOptions = brands.map((b) => ({
        value: b.id,
        label: b.name,
    }));

    // Find selected options
    const selectedCategory = findSelectedOption(
        data.category_id,
        categoryOptions
    );
    const selectedBrand = findSelectedOption(data.brand_id, brandOptions);

    return (
        <Card className="border-0 rounded-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-semibold text-capitalize">
                    Basic Information
                </h6>
            </Card.Header>

            <Card.Body>
                <Row className="g-3">
                    {/* Name Field */}
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Product Name *
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={data.name || ""}
                                onChange={handleInput}
                                isInvalid={!!errors.name}
                                placeholder="Enter product name"
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.name}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    {/* Category Field */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Category *
                            </Form.Label>
                            <Select
                                options={categoryOptions}
                                value={selectedCategory}
                                onChange={handleSelect("category_id")}
                                isInvalid={!!errors.category_id}
                                placeholder="Select category..."
                                isClearable
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: errors.category_id
                                            ? "#dc3545"
                                            : base.borderColor,
                                        minHeight: "44px",
                                    }),
                                }}
                            />
                            {errors.category_id && (
                                <div className="text-danger small mt-1">
                                    {errors.category_id}
                                </div>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Brand Field */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Brand
                            </Form.Label>
                            <Select
                                options={brandOptions}
                                value={selectedBrand}
                                onChange={handleSelect("brand_id")}
                                isInvalid={!!errors.brand_id}
                                placeholder="Select brand..."
                                isClearable
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: errors.brand_id
                                            ? "#dc3545"
                                            : base.borderColor,
                                        minHeight: "44px",
                                    }),
                                }}
                            />
                            {errors.brand_id && (
                                <div className="text-danger small mt-1">
                                    {errors.brand_id}
                                </div>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Short Description Field */}
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Short Description
                                <span className="text-muted fw-normal">
                                    {" "}
                                    (Max 255 characters)
                                </span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="short_description"
                                value={data.short_description || ""}
                                onChange={handleInput}
                                isInvalid={!!errors.short_description}
                                placeholder="Brief description of the product..."
                                maxLength={255}
                                className="py-2"
                            />
                            <div className="d-flex justify-content-between mt-1">
                                <Form.Text className="text-muted">
                                    {data.short_description?.length || 0}/255
                                    characters
                                </Form.Text>
                                {errors.short_description && (
                                    <Form.Control.Feedback
                                        type="invalid"
                                        className="d-block"
                                    >
                                        {errors.short_description}
                                    </Form.Control.Feedback>
                                )}
                            </div>
                        </Form.Group>
                    </Col>

                    {/* Description Field */}
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Description *
                            </Form.Label>
                            <RichTextEditor
                                value={data.description || ""}
                                onChange={handleRichText("description")}
                                placeholder="Enter detailed product description..."
                                className={
                                    errors.description
                                        ? "border border-danger rounded"
                                        : ""
                                }
                            />
                            {errors.description && (
                                <div className="text-danger small mt-1">
                                    {errors.description}
                                </div>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Character Count Summary */}
                    <Col md={12}>
                        <div className="bg-light p-3 rounded">
                            <h6 className="fw-semibold mb-2">
                                Content Summary
                            </h6>
                            <Row>
                                <Col md={4}>
                                    <div className="d-flex justify-content-between">
                                        <span>Name:</span>
                                        <strong>
                                            {data.name?.length || 0} characters
                                        </strong>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="d-flex justify-content-between">
                                        <span>Short Description:</span>
                                        <strong>
                                            {data.short_description?.length ||
                                                0}
                                            /255
                                        </strong>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="d-flex justify-content-between">
                                        <span>Description:</span>
                                        <strong>
                                            {data.description
                                                ? data.description.replace(
                                                      /<[^>]*>/g,
                                                      ""
                                                  ).length
                                                : 0}{" "}
                                            characters
                                        </strong>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}
