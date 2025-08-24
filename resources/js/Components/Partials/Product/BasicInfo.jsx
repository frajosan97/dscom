import RichTextEditor from "@/Components/Settings/RichTextEditor";
import { Col, FloatingLabel, Form, Row } from "react-bootstrap";

export default function BasicInfoTab({
    data,
    setData,
    errors,
    categories,
    brands,
}) {
    return (
        <Row className="g-3">
            <Col md={12}>
                <FloatingLabel
                    controlId="name"
                    label="Product Name"
                    className="mb-3"
                >
                    <Form.Control
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.name}
                    </Form.Control.Feedback>
                </FloatingLabel>
            </Col>

            <Col md={6}>
                <FloatingLabel controlId="category" label="Category">
                    <Form.Select
                        value={data.category_id}
                        onChange={(e) => setData("category_id", e.target.value)}
                        isInvalid={!!errors.category_id}
                    >
                        <option value="">Select Category</option>
                        {categories?.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {errors.category_id}
                    </Form.Control.Feedback>
                </FloatingLabel>
            </Col>

            <Col md={6}>
                <FloatingLabel controlId="brand" label="Brand">
                    <Form.Select
                        value={data.brand_id}
                        onChange={(e) => setData("brand_id", e.target.value)}
                        isInvalid={!!errors.brand_id}
                    >
                        <option value="">Select Brand</option>
                        {brands?.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                                {brand.name}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {errors.brand_id}
                    </Form.Control.Feedback>
                </FloatingLabel>
            </Col>

            <Col md={12}>
                <FloatingLabel
                    controlId="shortDescription"
                    label="Short Description"
                >
                    <Form.Control
                        as="textarea"
                        style={{ height: "80px" }}
                        value={data.short_description}
                        onChange={(e) =>
                            setData("short_description", e.target.value)
                        }
                        isInvalid={!!errors.short_description}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.short_description}
                    </Form.Control.Feedback>
                </FloatingLabel>
            </Col>

            <Col md={12}>
                <Form.Label>Description</Form.Label>
                <RichTextEditor
                    value={data.description}
                    onChange={(content) => setData("description", content)}
                    placeholder="Enter product description..."
                />
                {errors.description && (
                    <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.description}
                    </Form.Control.Feedback>
                )}
            </Col>
        </Row>
    );
}
