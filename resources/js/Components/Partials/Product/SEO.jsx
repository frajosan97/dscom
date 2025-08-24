import { Card, FloatingLabel, Form } from "react-bootstrap";
import Select from "react-select";

export default function SEOCard({
    data,
    setData,
    errors,
    selectedTags,
    handleTagChange,
    processing,
}) {
    return (
        <Card className="mb-4">
            <Card.Header className="bg-white">
                <h5 className="mb-0">SEO</h5>
            </Card.Header>
            <Card.Body>
                <Form.Group className="mb-3">
                    <FloatingLabel controlId="metaTitle" label="Meta Title">
                        <Form.Control
                            type="text"
                            value={data.meta_title}
                            onChange={(e) =>
                                setData("meta_title", e.target.value)
                            }
                            isInvalid={!!errors.meta_title}
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
                            value={data.meta_description}
                            onChange={(e) =>
                                setData("meta_description", e.target.value)
                            }
                            isInvalid={!!errors.meta_description}
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
                        noOptionsMessage={() => "Type to create new tags"}
                        isClearable
                        isSearchable
                        isDisabled={processing}
                    />
                </Form.Group>
            </Card.Body>
        </Card>
    );
}
