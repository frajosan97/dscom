import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiTool, FiUser, FiDollarSign, FiCalendar, FiInfo, FiPlus } from 'react-icons/fi';
import { Container, Row, Col, Card, Form, Button, Badge, Alert, Modal } from 'react-bootstrap';

import ErpLayout from '@/Layouts/ErpLayout';
import useFilterOptions from '@/Hooks/useData';
import xios from '@/Utils/axios';

export default function ServiceRequestCreate() {
    const {
        repairServices = [],
        deviceTypes = [],
        technicians = [],
        branches = [],
        refreshData,
    } = useFilterOptions();

    const { data, setData, errors, post, processing } = useForm({
        customer_id: null,
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        branch_id: null,
        repair_service_id: null,
        device_type_id: null,
        device_brand: '',
        device_model: '',
        device_serial: '',
        device_age: null,
        device_issue: '',
        device_notes: '',
        device_images: [],
        assigned_technician_id: null,
        diagnosis_fee: 0,
        estimated_cost: 0,
        priority: 'medium',
        expected_completion_date: null,
        terms_accepted: false
    });

    const [selectedService, setSelectedService] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewImages, setPreviewImages] = useState([]);

    // Calculate service pricing based on device type
    useEffect(() => {
        if (data.repair_service_id && data.device_type_id) {
            const service = repairServices.find(s => s.id === data.repair_service_id);
            if (service) {
                setSelectedService(service);
                const pricing = service.pricings.find(p => p.device_type_id === data.device_type_id);
                if (pricing) {
                    setData('diagnosis_fee', pricing.price * 0.2); // 20% of service price as diagnosis fee
                    setData('estimated_cost', pricing.price);
                }
            }
        }
    }, [data.repair_service_id, data.device_type_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!data.terms_accepted) {
            toast.error('You must accept the terms and conditions');
            return;
        }

        try {
            const response = await xios.post(route('repair-orders.store'), {
                ...data,
                device_images: previewImages.map(img => img.file)
            }, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            if (response.data.success) {
                toast.success('Service request created successfully!');
                router.visit(route('repair-orders.show', response.data.order.id));
            }
        } catch (error) {
            console.error(error);
            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors;
                Object.values(errorMessages).forEach(messages => {
                    messages.forEach(message => {
                        toast.error(message);
                    });
                });
            } else {
                toast.error(error.response?.data?.message || 'An error occurred while creating the service request');
            }
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + previewImages.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        const newPreviewImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setPreviewImages([...previewImages, ...newPreviewImages]);
    };

    const removeImage = (index) => {
        const newImages = [...previewImages];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        setPreviewImages(newImages);
    };

    const calculateTotal = () => {
        return data.diagnosis_fee + data.estimated_cost;
    };

    return (
        <ErpLayout>
            <Head title="Create New Service Request" />
            <Container fluid>
                <form onSubmit={handleSubmit}>
                    <Row className="g-4">
                        <Col lg={8}>
                            <Card className="mb-4">
                                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                                    <div>
                                        <FiTool className="me-2" />
                                        <strong>New Service Request</strong>
                                    </div>
                                    <Badge bg="primary">
                                        <FiPlus className="me-1" /> New Request
                                    </Badge>
                                </Card.Header>
                                <Card.Body>
                                    <h5 className="mb-4"><FiUser className="me-2" /> Customer Information</h5>
                                    
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Customer Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.customer_name}
                                                    onChange={(e) => setData('customer_name', e.target.value)}
                                                    isInvalid={!!errors.customer_name}
                                                    required
                                                />
                                                {errors.customer_name && <Form.Text className="text-danger">{errors.customer_name}</Form.Text>}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Customer Email</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    value={data.customer_email}
                                                    onChange={(e) => setData('customer_email', e.target.value)}
                                                    isInvalid={!!errors.customer_email}
                                                />
                                                {errors.customer_email && <Form.Text className="text-danger">{errors.customer_email}</Form.Text>}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Customer Phone *</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    value={data.customer_phone}
                                                    onChange={(e) => setData('customer_phone', e.target.value)}
                                                    isInvalid={!!errors.customer_phone}
                                                    required
                                                />
                                                {errors.customer_phone && <Form.Text className="text-danger">{errors.customer_phone}</Form.Text>}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Branch *</Form.Label>
                                                <Form.Select
                                                    value={data.branch_id || ''}
                                                    onChange={(e) => setData('branch_id', e.target.value ? parseInt(e.target.value) : null)}
                                                    isInvalid={!!errors.branch_id}
                                                    required
                                                >
                                                    <option value="">Select branch</option>
                                                    {branches.map(branch => (
                                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                                    ))}
                                                </Form.Select>
                                                {errors.branch_id && <Form.Text className="text-danger">{errors.branch_id}</Form.Text>}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <hr className="my-4" />
                                    <h5 className="mb-4"><FiTool className="me-2" /> Service Information</h5>
                                    
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Service Type *</Form.Label>
                                                <Form.Select
                                                    value={data.repair_service_id || ''}
                                                    onChange={(e) => setData('repair_service_id', e.target.value ? parseInt(e.target.value) : null)}
                                                    isInvalid={!!errors.repair_service_id}
                                                    required
                                                >
                                                    <option value="">Select service</option>
                                                    {repairServices.map(service => (
                                                        <option key={service.id} value={service.id}>{service.name}</option>
                                                    ))}
                                                </Form.Select>
                                                {errors.repair_service_id && <Form.Text className="text-danger">{errors.repair_service_id}</Form.Text>}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Device Type *</Form.Label>
                                                <Form.Select
                                                    value={data.device_type_id || ''}
                                                    onChange={(e) => setData('device_type_id', e.target.value ? parseInt(e.target.value) : null)}
                                                    isInvalid={!!errors.device_type_id}
                                                    required
                                                    disabled={!data.repair_service_id}
                                                >
                                                    <option value="">Select device type</option>
                                                    {deviceTypes.map(type => (
                                                        <option key={type.id} value={type.id}>{type.name}</option>
                                                    ))}
                                                </Form.Select>
                                                {errors.device_type_id && <Form.Text className="text-danger">{errors.device_type_id}</Form.Text>}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Device Brand *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.device_brand}
                                                    onChange={(e) => setData('device_brand', e.target.value)}
                                                    isInvalid={!!errors.device_brand}
                                                    required
                                                />
                                                {errors.device_brand && <Form.Text className="text-danger">{errors.device_brand}</Form.Text>}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Device Model *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.device_model}
                                                    onChange={(e) => setData('device_model', e.target.value)}
                                                    isInvalid={!!errors.device_model}
                                                    required
                                                />
                                                {errors.device_model && <Form.Text className="text-danger">{errors.device_model}</Form.Text>}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Device Serial Number</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.device_serial}
                                                    onChange={(e) => setData('device_serial', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Device Age (years)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    value={data.device_age || ''}
                                                    onChange={(e) => setData('device_age', e.target.value ? parseInt(e.target.value) : null)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Device Issue Description *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={data.device_issue}
                                            onChange={(e) => setData('device_issue', e.target.value)}
                                            isInvalid={!!errors.device_issue}
                                            required
                                            placeholder="Describe the issue you're experiencing..."
                                        />
                                        {errors.device_issue && <Form.Text className="text-danger">{errors.device_issue}</Form.Text>}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Additional Notes</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={data.device_notes}
                                            onChange={(e) => setData('device_notes', e.target.value)}
                                            placeholder="Any additional information about the device..."
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Device Images (Max 5)</Form.Label>
                                        <Form.Control
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="mb-2"
                                        />
                                        <div className="d-flex flex-wrap gap-2">
                                            {previewImages.map((img, index) => (
                                                <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                                                    <img 
                                                        src={img.preview} 
                                                        alt={`Device preview ${index}`}
                                                        className="img-thumbnail h-100 w-100 object-fit-cover"
                                                    />
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="position-absolute top-0 end-0 rounded-circle p-0"
                                                        style={{ width: '24px', height: '24px' }}
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </Form.Group>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h6 className="mb-0"><FiDollarSign className="me-2" /> Billing & Assignment</h6>
                                </Card.Header>
                                <Card.Body>
                                    {selectedService && (
                                        <Alert variant="info" className="mb-3">
                                            <strong>{selectedService.name}</strong>
                                            <div className="small mt-1">{selectedService.description}</div>
                                        </Alert>
                                    )}

                                    <Form.Group className="mb-3">
                                        <Form.Label>Diagnosis Fee</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.diagnosis_fee}
                                            onChange={(e) => setData('diagnosis_fee', parseFloat(e.target.value) || 0)}
                                            isInvalid={!!errors.diagnosis_fee}
                                        />
                                        {errors.diagnosis_fee && <Form.Text className="text-danger">{errors.diagnosis_fee}</Form.Text>}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Estimated Repair Cost</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.estimated_cost}
                                            onChange={(e) => setData('estimated_cost', parseFloat(e.target.value) || 0)}
                                            isInvalid={!!errors.estimated_cost}
                                        />
                                        {errors.estimated_cost && <Form.Text className="text-danger">{errors.estimated_cost}</Form.Text>}
                                    </Form.Group>

                                    <div className="bg-light p-3 mb-3 rounded">
                                        <div className="d-flex justify-content-between">
                                            <strong>Subtotal:</strong>
                                            <span>${calculateTotal().toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between small text-muted">
                                            <span>Tax:</span>
                                            <span>Calculated at checkout</span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-between fw-bold">
                                            <span>Estimated Total:</span>
                                            <span>${calculateTotal().toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Priority</Form.Label>
                                        <Form.Select
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value)}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Assign Technician</Form.Label>
                                        <Form.Select
                                            value={data.assigned_technician_id || ''}
                                            onChange={(e) => setData('assigned_technician_id', e.target.value ? parseInt(e.target.value) : null)}
                                        >
                                            <option value="">Auto-assign</option>
                                            {technicians.map(tech => (
                                                <option key={tech.id} value={tech.id}>
                                                    {tech.user.name} ({tech.specialization})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Expected Completion Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={data.expected_completion_date || ''}
                                            onChange={(e) => setData('expected_completion_date', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            label={
                                                <>
                                                    I accept the <a href="#" onClick={(e) => { e.preventDefault(); setShowCustomerModal(true); }}>terms and conditions</a> *
                                                </>
                                            }
                                            checked={data.terms_accepted}
                                            onChange={(e) => setData('terms_accepted', e.target.checked)}
                                            isInvalid={!!errors.terms_accepted}
                                        />
                                        {errors.terms_accepted && <Form.Text className="text-danger">{errors.terms_accepted}</Form.Text>}
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            <div className="d-grid gap-2">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={processing}
                                    className="mb-2"
                                >
                                    {processing ? 'Processing...' : 'Submit Service Request'}
                                </Button>
                                <Button variant="outline-secondary" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </form>

                {/* Terms and Conditions Modal */}
                <Modal show={showCustomerModal} onHide={() => setShowCustomerModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Terms and Conditions</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5>Service Agreement</h5>
                        <p>
                            By submitting this service request, you agree to the following terms:
                        </p>
                        <ul>
                            <li>A non-refundable diagnosis fee will be charged</li>
                            <li>Repair costs are estimates and may change after diagnosis</li>
                            <li>We are not responsible for data loss - please backup your device</li>
                            <li>Unclaimed devices will be disposed of after 30 days</li>
                            <li>Payment is due upon completion of service</li>
                        </ul>
                        <h5 className="mt-4">Warranty Information</h5>
                        <p>
                            Repairs come with a {selectedService?.warranty_days || 30}-day warranty on parts and labor.
                            Warranty does not cover physical damage or unrelated issues.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={() => {
                            setData('terms_accepted', true);
                            setShowCustomerModal(false);
                        }}>
                            I Accept
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </ErpLayout>
    );
}