import React from "react";
import { Card, Row, Col, Form, FloatingLabel } from "react-bootstrap";
import Select from "react-select";

const OthersTab = ({
    data,
    setData,
    errors,
    selectedTags,
    handleTagChange,
    renderStatusBadge,
}) => {
    return (
        <Card className="border-0 rounded-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center py-3">
                <h6 className="mb-0 fw-semibold text-capitalize">
                    Other Information
                </h6>
            </Card.Header>
            <Card.Body className="p-4">
                <Row>
                    {/* Publish Section */}
                    <Col md={6} className="mb-4">
                        <Card className="h-100">
                            <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                                <h6 className="mb-0">Publish</h6>
                                <div>{renderStatusBadge()}</div>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={
                                            data.is_active
                                                ? "active"
                                                : "inactive"
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "is_active",
                                                e.target.value === "active"
                                            )
                                        }
                                        isInvalid={!!errors.is_active}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.is_active}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id="isFeatured"
                                        label="Featured Product"
                                        checked={data.is_featured || false}
                                        onChange={(e) =>
                                            setData(
                                                "is_featured",
                                                e.target.checked
                                            )
                                        }
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id="isBestseller"
                                        label="Bestseller"
                                        checked={data.is_bestseller || false}
                                        onChange={(e) =>
                                            setData(
                                                "is_bestseller",
                                                e.target.checked
                                            )
                                        }
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id="isNew"
                                        label="Mark as New"
                                        checked={data.is_new || false}
                                        onChange={(e) =>
                                            setData("is_new", e.target.checked)
                                        }
                                    />
                                </Form.Group>

                                {data.is_new && (
                                    <Form.Group className="mb-3">
                                        <FloatingLabel
                                            controlId="newUntil"
                                            label="New Until"
                                        >
                                            <Form.Control
                                                type="date"
                                                value={data.new_until || ""}
                                                onChange={(e) =>
                                                    setData(
                                                        "new_until",
                                                        e.target.value
                                                    )
                                                }
                                                isInvalid={!!errors.new_until}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.new_until}
                                            </Form.Control.Feedback>
                                        </FloatingLabel>
                                    </Form.Group>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Product Type Section */}
                    <Col md={6} className="mb-4">
                        <Card className="h-100">
                            <Card.Header className="bg-white py-3">
                                <h6 className="mb-0">Product Type</h6>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id="isDigital"
                                        label="Digital Product"
                                        checked={data.is_digital || false}
                                        onChange={(e) =>
                                            setData(
                                                "is_digital",
                                                e.target.checked
                                            )
                                        }
                                    />
                                </Form.Group>

                                {!data.is_digital && (
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="switch"
                                            id="requiresShipping"
                                            label="Requires Shipping"
                                            checked={
                                                data.requires_shipping || false
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "requires_shipping",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id="hasVariants"
                                        label="Product Has Variants"
                                        checked={data.has_variants || false}
                                        onChange={(e) =>
                                            setData(
                                                "has_variants",
                                                e.target.checked
                                            )
                                        }
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Shipping Section */}
                    <Col md={6} className="mb-4">
                        <Card className="h-100">
                            <Card.Header className="bg-white py-3">
                                <h6 className="mb-0">Shipping</h6>
                            </Card.Header>
                            <Card.Body>
                                {!data.is_digital && (
                                    <>
                                        <Row className="g-2 mb-3">
                                            <Col md={6}>
                                                <FloatingLabel
                                                    controlId="weight"
                                                    label="Weight"
                                                >
                                                    <Form.Control
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={
                                                            data.weight || ""
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "weight",
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.weight
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.weight}
                                                    </Form.Control.Feedback>
                                                </FloatingLabel>
                                            </Col>
                                            <Col md={6}>
                                                <FloatingLabel
                                                    controlId="weightUnit"
                                                    label="Unit"
                                                >
                                                    <Form.Select
                                                        value={
                                                            data.weight_unit ||
                                                            "kg"
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "weight_unit",
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="kg">
                                                            kg
                                                        </option>
                                                        <option value="g">
                                                            g
                                                        </option>
                                                        <option value="lb">
                                                            lb
                                                        </option>
                                                        <option value="oz">
                                                            oz
                                                        </option>
                                                    </Form.Select>
                                                </FloatingLabel>
                                            </Col>
                                        </Row>

                                        <h6 className="mt-3 mb-2">
                                            Dimensions
                                        </h6>
                                        <Row className="g-2">
                                            <Col md={4}>
                                                <FloatingLabel
                                                    controlId="length"
                                                    label="Length"
                                                >
                                                    <Form.Control
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={
                                                            data.length || ""
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "length",
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                    />
                                                </FloatingLabel>
                                            </Col>
                                            <Col md={4}>
                                                <FloatingLabel
                                                    controlId="width"
                                                    label="Width"
                                                >
                                                    <Form.Control
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={data.width || ""}
                                                        onChange={(e) =>
                                                            setData(
                                                                "width",
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                    />
                                                </FloatingLabel>
                                            </Col>
                                            <Col md={4}>
                                                <FloatingLabel
                                                    controlId="height"
                                                    label="Height"
                                                >
                                                    <Form.Control
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={
                                                            data.height || ""
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "height",
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                    />
                                                </FloatingLabel>
                                            </Col>
                                            <Col md={12} className="mt-2">
                                                <FloatingLabel
                                                    controlId="dimensionUnit"
                                                    label="Unit"
                                                >
                                                    <Form.Select
                                                        value={
                                                            data.dimension_unit ||
                                                            "cm"
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "dimension_unit",
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="cm">
                                                            cm
                                                        </option>
                                                        <option value="m">
                                                            m
                                                        </option>
                                                        <option value="in">
                                                            in
                                                        </option>
                                                        <option value="ft">
                                                            ft
                                                        </option>
                                                    </Form.Select>
                                                </FloatingLabel>
                                            </Col>
                                        </Row>
                                    </>
                                )}
                                {data.is_digital && (
                                    <div className="text-muted text-center py-4">
                                        Digital products don't require shipping
                                        information
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* SEO Section */}
                    <Col md={6} className="mb-4">
                        <Card className="h-100">
                            <Card.Header className="bg-white py-3">
                                <h6 className="mb-0">SEO</h6>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <FloatingLabel
                                        controlId="metaTitle"
                                        label="Meta Title"
                                    >
                                        <Form.Control
                                            type="text"
                                            value={data.meta_title || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "meta_title",
                                                    e.target.value
                                                )
                                            }
                                            isInvalid={!!errors.meta_title}
                                            placeholder=" "
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.meta_title}
                                        </Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <FloatingLabel
                                        controlId="metaDescription"
                                        label="Meta Description"
                                    >
                                        <Form.Control
                                            as="textarea"
                                            style={{ height: "100px" }}
                                            value={data.meta_description || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "meta_description",
                                                    e.target.value
                                                )
                                            }
                                            isInvalid={
                                                !!errors.meta_description
                                            }
                                            placeholder=" "
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.meta_description}
                                        </Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Tags</Form.Label>
                                    <Select
                                        isMulti
                                        value={selectedTags}
                                        onChange={handleTagChange}
                                        options={[]}
                                        placeholder="Type and press enter to add tags"
                                        noOptionsMessage={() =>
                                            "Type to create new tags"
                                        }
                                        isClearable
                                        isSearchable
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default OthersTab;
