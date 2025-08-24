import { Card, Form } from "react-bootstrap";

export default function ProductTypeCard({ data, setData }) {
    return (
        <Card className="mb-4">
            <Card.Header className="bg-white">
                <h5 className="mb-0">Product Type</h5>
            </Card.Header>
            <Card.Body>
                <Form.Group className="mb-3">
                    <Form.Check
                        type="switch"
                        id="isDigital"
                        label="Digital Product"
                        checked={data.is_digital}
                        onChange={(e) =>
                            setData("is_digital", e.target.checked)
                        }
                    />
                </Form.Group>

                {!data.is_digital && (
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="switch"
                            id="requiresShipping"
                            label="Requires Shipping"
                            checked={data.requires_shipping}
                            onChange={(e) =>
                                setData("requires_shipping", e.target.checked)
                            }
                        />
                    </Form.Group>
                )}

                <Form.Group className="mb-3">
                    <Form.Check
                        type="switch"
                        id="hasVariants"
                        label="Product Has Variants"
                        checked={data.has_variants}
                        onChange={(e) =>
                            setData("has_variants", e.target.checked)
                        }
                    />
                </Form.Group>
            </Card.Body>
        </Card>
    );
}
