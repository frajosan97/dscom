import { Button, Card, FloatingLabel, Form, Spinner } from "react-bootstrap";
import { Save } from "react-bootstrap-icons";

export default function PublishCard({ data, setData, processing, renderStatusBadge }) {
    return (
        <Card className="mb-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Publish</h5>
                <div>
                    {renderStatusBadge()}
                </div>
            </Card.Header>
            <Card.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                        value={data.is_active ? 'active' : 'inactive'}
                        onChange={(e) => setData('is_active', e.target.value === 'active')}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Check
                        type="switch"
                        id="isFeatured"
                        label="Featured Product"
                        checked={data.is_featured}
                        onChange={(e) => setData('is_featured', e.target.checked)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Check
                        type="switch"
                        id="isBestseller"
                        label="Bestseller"
                        checked={data.is_bestseller}
                        onChange={(e) => setData('is_bestseller', e.target.checked)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Check
                        type="switch"
                        id="isNew"
                        label="Mark as New"
                        checked={data.is_new}
                        onChange={(e) => setData('is_new', e.target.checked)}
                    />
                </Form.Group>

                {data.is_new && (
                    <Form.Group className="mb-3">
                        <FloatingLabel controlId="newUntil" label="New Until">
                            <Form.Control
                                type="date"
                                value={data.new_until}
                                onChange={(e) => setData('new_until', e.target.value)}
                            />
                        </FloatingLabel>
                    </Form.Group>
                )}

                <div className="d-grid gap-2 mt-4">
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="me-2" /> Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}