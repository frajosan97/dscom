import { Card, InputGroup, Row, Col, Form, Button } from 'react-bootstrap';
import { Phone, Plus, Search } from 'react-bootstrap-icons';

export default function ServiceSelectionTab({ services, searchTerm, setSearchTerm, addService, customService, setCustomService, addCustomService }) {
    return (
        <>
            <Form.Group controlId="serviceSearch" className="mb-4">
                <InputGroup>
                    <InputGroup.Text>
                        <Search />
                    </InputGroup.Text>
                    <Form.Control
                        type="search"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="py-2"
                    />
                </InputGroup>
            </Form.Group>

            <Row className="products-grid mb-3">
                {services.slice(0, 6).map(service => (
                    <Col xs={6} md={4} lg={3} key={service.id}>
                        <Card className="product-card" style={{ cursor: 'pointer' }} onClick={() => addService(service)}>
                            <Card.Body className="text-center d-flex flex-column">
                                <div className="bg-light rounded-circle p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                                    <Phone size={24} className="text-primary" />
                                </div>
                                <Card.Title className="text-truncate">{service.name}</Card.Title>
                                <Card.Text>${service.price}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card>
                <Card.Header>
                    <h6 className="mb-0 fw-bold">Add Custom Service</h6>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={5}>
                            <Form.Group>
                                <Form.Label className="fw-medium">Service Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={customService.name}
                                    onChange={(e) => setCustomService({ ...customService, name: e.target.value })}
                                    placeholder="e.g., Screen Repair"
                                    className="py-2"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-medium">Price</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>$</InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        value={customService.price}
                                        onChange={(e) => setCustomService({ ...customService, price: e.target.value })}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="py-2"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-medium">Description</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={customService.description}
                                    onChange={(e) => setCustomService({ ...customService, description: e.target.value })}
                                    placeholder="Optional description"
                                    className="py-2"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={1} className="d-flex align-items-end">
                            <Button
                                variant="primary"
                                onClick={addCustomService}
                                disabled={!customService.name || !customService.price}
                                className="w-100 py-2"
                            >
                                <Plus size={18} />
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
}