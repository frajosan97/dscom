import {
    Alert,
    Button,
    Card,
    Col,
    Form,
    ListGroup,
    Row,
} from "react-bootstrap";
import { Plus, X } from "react-bootstrap-icons";

export default function SpecificationsCard({
    data,
    specificationKey,
    setSpecificationKey,
    specificationValue,
    setSpecificationValue,
    addSpecification,
    removeSpecification,
}) {
    return (
        <Card className="mb-4">
            <Card.Header className="bg-white">
                <h5 className="mb-0">Specifications</h5>
            </Card.Header>
            <Card.Body>
                {Object.keys(data.specifications).length > 0 ? (
                    <ListGroup variant="flush" className="mb-3">
                        {Object.entries(data.specifications).map(
                            ([key, value]) => (
                                <ListGroup.Item
                                    key={key}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <div>
                                        <strong>{key}:</strong> {value}
                                    </div>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => removeSpecification(key)}
                                    >
                                        <X size={14} />
                                    </Button>
                                </ListGroup.Item>
                            )
                        )}
                    </ListGroup>
                ) : (
                    <Alert variant="secondary">
                        No specifications added yet.
                    </Alert>
                )}

                <div className="mt-3">
                    <Row className="g-2">
                        <Col md={5}>
                            <Form.Control
                                type="text"
                                placeholder="Key"
                                value={specificationKey}
                                onChange={(e) =>
                                    setSpecificationKey(e.target.value)
                                }
                            />
                        </Col>
                        <Col md={5}>
                            <Form.Control
                                type="text"
                                placeholder="Value"
                                value={specificationValue}
                                onChange={(e) =>
                                    setSpecificationValue(e.target.value)
                                }
                            />
                        </Col>
                        <Col md={2}>
                            <Button
                                variant="primary"
                                onClick={addSpecification}
                                disabled={
                                    !specificationKey || !specificationValue
                                }
                            >
                                <Plus size={18} />
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Card.Body>
        </Card>
    );
}
