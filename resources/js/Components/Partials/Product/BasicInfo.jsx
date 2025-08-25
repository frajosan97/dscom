import RichTextEditor from "@/Components/Settings/RichTextEditor";
import { Card, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import Select from "react-select";

export default function BasicInfoTab({
    data,
    setData,
    errors,
    categories,
    brands,
}) {
    return (
        <Card className="border-0 rounded-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-semibold text-capitalize">
                    Basic Information
                </h6>
            </Card.Header>
            <Card.Body>
                <Row className="g-3">
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                isInvalid={!!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.name}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Category</Form.Label>
                            <Select
                                options={categories}
                                value={data.category_id}
                                onChange={(e) =>
                                    setData("category_id", e.value)
                                }
                                isInvalid={!!errors.category_id}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.category_id}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Brand</Form.Label>
                            <Select
                                options={brands}
                                value={data.brand_id}
                                onChange={(e) => setData("brand_id", e.value)}
                                isInvalid={!!errors.brand_id}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.brand_id}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Short Description</Form.Label>
                            <Form.Control
                                type="text"
                                value={data.short_description}
                                onChange={(e) =>
                                    setData("short_description", e.target.value)
                                }
                                isInvalid={!!errors.short_description}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.short_description}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <RichTextEditor
                                value={data.description}
                                onChange={(content) =>
                                    setData("description", content)
                                }
                                placeholder="Enter product description..."
                            />
                            {errors.description && (
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.description}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}
