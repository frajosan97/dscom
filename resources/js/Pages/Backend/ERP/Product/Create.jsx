import { Container, Row, Col, Card, Form, Button, Tab, Nav, Badge } from 'react-bootstrap';
import { Trash, Image as ImageIcon, BoxSeam, InfoCircle, CashCoin } from 'react-bootstrap-icons';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import xios from '@/Utils/axios';
import FileUpload from '@/Components/Settings/FileUpload';
import ErpLayout from '@/Layouts/ErpLayout';
import BasicInfoTab from '@/Components/Partials/Product/BasicInfo';
import PricingTab from '@/Components/Partials/Product/PricingInfo';
import PublishCard from '@/Components/Partials/Product/Publish';
import ProductTypeCard from '@/Components/Partials/Product/ProductType';
import ShippingCard from '@/Components/Partials/Product/Shipping';
import AttributesCard from '@/Components/Partials/Product/Attributes';
import SEOCard from '@/Components/Partials/Product/SEO';
import SpecificationsCard from '@/Components/Partials/Product/Specifications';
import InventoryTab from '@/Components/Partials/Product/InventoryInfo';
import MediaTab from '@/Components/Partials/Product/Media';
import useFilterOptions from '@/Hooks/useData';
import Swal from 'sweetalert2';

export default function ProductCreate({ attributes = [] }) {
    const { categories, brands, branches, taxes } = useFilterOptions();

    const { data, setData, errors } = useForm({
        branch_id: '',
        name: '',
        slug: '',
        short_description: '',
        description: '',
        meta_title: '',
        meta_description: '',
        category_id: '',
        brand_id: '',
        price: 0,
        agent_price: 0,
        wholesaler_price: 0,
        compare_price: 0,
        cost_per_item: 0,
        tax_id: '',
        tax_amount: 0,
        sku: '',
        barcode: '',
        quantity: 0,
        low_stock_threshold: 0,
        stock_status: 'in_stock',
        track_inventory: false,
        allow_backorders: false,
        is_digital: false,
        requires_shipping: true,
        weight: 0,
        weight_unit: 'kg',
        length: 0,
        width: 0,
        height: 0,
        dimension_unit: 'cm',
        is_featured: false,
        is_active: true,
        is_bestseller: false,
        is_new: false,
        new_until: '',
        has_variants: false,
        tags: [],
        specifications: {},
        custom_fields: {},
        related_products: [],
        images: [],
        variants: [],
        selected_attributes: [],
        selected_attribute_values: []
    });

    const [selectedTags, setSelectedTags] = useState([]);
    const [specificationKey, setSpecificationKey] = useState('');
    const [specificationValue, setSpecificationValue] = useState('');
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            // swal confirm
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, create it!'
            });

            if (!result.isConfirmed) {
                setProcessing(false);
                return;
            }

            // Data formulation
            const formData = new FormData();

            // Append all basic fields
            Object.keys(data).forEach(key => {
                if (key === 'images' || key === 'variants' || key === 'selected_attributes' ||
                    key === 'selected_attribute_values' || key === 'related_products') {
                    return; // Handle these separately
                }

                if (key === 'specifications') {
                    formData.append(key, JSON.stringify(data[key]));
                } else {
                    formData.append(key, data[key] === null ? '' : data[key]);
                }
            });

            // Handle images
            data.images.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });

            // Handle variants
            data.variants.forEach((variant, index) => {
                Object.keys(variant).forEach(key => {
                    formData.append(`variants[${index}][${key}]`, variant[key] === null ? '' : variant[key]);
                });
            });

            // Handle attributes
            data.selected_attributes.forEach((attribute, index) => {
                formData.append(`attributes[${index}][id]`, attribute.value);
                formData.append(`attributes[${index}][name]`, attribute.label);
            });

            // Handle attribute values
            data.selected_attribute_values.forEach((attributeValue, index) => {
                formData.append(`attribute_values[${index}][id]`, attributeValue.value);
                formData.append(`attribute_values[${index}][value]`, attributeValue.label);
            });

            // Handle related products
            data.related_products.forEach((product, index) => {
                formData.append(`related_products[${index}]`, product.id || product);
            });

            const response = await xios.post(
                route("product.store"),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.status === 200) {
                toast.success("Product created successfully");
                setProcessing(false);
                router.reload();
            }
        } catch (error) {
            setProcessing(false);
            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors;
                Object.values(errorMessages).forEach(messages => {
                    messages.forEach(message => {
                        toast.error(message);
                    });
                });
            } else {
                toast.error(error.response?.data?.error || "An error occurred while creating the product");
            }
        }
    };

    const handleTagChange = (selectedOptions) => {
        setSelectedTags(selectedOptions);
        setData('tags', selectedOptions.map(option => option.value));
    };

    const addSpecification = () => {
        if (specificationKey && specificationValue) {
            const newSpecs = { ...data.specifications, [specificationKey]: specificationValue };
            setData('specifications', newSpecs);
            setSpecificationKey('');
            setSpecificationValue('');
        }
    };

    const removeSpecification = (key) => {
        const newSpecs = { ...data.specifications };
        delete newSpecs[key];
        setData('specifications', newSpecs);
    };

    const renderStatusBadge = () => {
        if (!data.is_active) {
            return <Badge bg="secondary">Inactive</Badge>;
        }

        const badges = [];
        if (data.is_featured) badges.push(<Badge key="featured" bg="info" className="me-1">Featured</Badge>);
        if (data.is_bestseller) badges.push(<Badge key="bestseller" bg="warning" className="me-1">Bestseller</Badge>);
        if (data.is_new) badges.push(<Badge key="new" bg="success" className="me-1">New</Badge>);
        if (data.compare_price > data.price) badges.push(<Badge key="sale" bg="danger" className="me-1">Sale</Badge>);

        return badges.length ? badges : <Badge bg="primary">Active</Badge>;
    };

    const renderStockStatus = () => {
        if (data.stock_status === 'out_of_stock') {
            return <Badge bg="danger">Out of Stock</Badge>;
        }
        if (data.stock_status === 'low_stock') {
            return <Badge bg="warning">Low Stock</Badge>;
        }
        return <Badge bg="success">In Stock</Badge>;
    };

    const renderImages = () => {
        if (!data.images || data.images.length === 0) {
            return (
                <div className="border rounded p-4 text-center">
                    <ImageIcon size={48} className="text-muted mb-2" />
                    <p className="text-muted">No images uploaded</p>
                    <FileUpload
                        onChange={(files) => setData('images', [...data.images, ...files])}
                        accept="image/*"
                        multiple
                    />
                </div>
            );
        }

        return (
            <Row className="g-2">
                {data.images.map((image, index) => (
                    <Col xs={6} md={3} key={index}>
                        <Card className="h-100">
                            <Card.Img
                                variant="top"
                                src={URL.createObjectURL(image)}
                                style={{ height: '120px', objectFit: 'cover' }}
                            />
                            <Card.Body className="p-2">
                                <div className="d-flex justify-content-between">
                                    <Form.Check
                                        type="radio"
                                        name="defaultImage"
                                        label="Default"
                                        checked={image.is_default}
                                        onChange={() => setData('images', data.images.map((img, i) => ({
                                            ...img,
                                            is_default: i === index
                                        })))}
                                    />
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => setData('images', data.images.filter((_, i) => i !== index))}
                                    >
                                        <Trash size={14} />
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                <Col md={12}>
                    <div className="border p-2">
                        <FileUpload
                            onChange={(files) => setData('images', [...data.images, ...files])}
                            accept="image/*"
                            multiple
                            buttonText="Add Images"
                            buttonVariant="outline-primary"
                            buttonSize="sm"
                        />
                    </div>
                </Col>
            </Row>
        );
    };

    return (
        <ErpLayout>
            <Head title="Create New Product" />

            <Container fluid className="py-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0 d-inline-block">Create New Product</h2>
                    <div>
                        {renderStatusBadge()}
                        <Badge bg={data.is_digital ? 'info' : 'primary'} className="ms-2">
                            {data.is_digital ? 'Digital' : 'Physical'}
                        </Badge>
                    </div>
                </div>

                <hr className="dashed-hr mb-3" />

                <Form onSubmit={handleSubmit}>
                    <Row className="g-4">
                        <Col lg={8}>
                            <Card className="mb-4">
                                <Card.Header className="bg-white">
                                    <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                                        <Nav variant="tabs" className="mb-0">
                                            <Nav.Item>
                                                <Nav.Link eventKey="basic">
                                                    <InfoCircle className="me-1" /> Basic Info
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="pricing">
                                                    <CashCoin className="me-1" /> Pricing
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="inventory">
                                                    <BoxSeam className="me-1" /> Inventory
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="media">
                                                    <ImageIcon className="me-1" /> Media
                                                </Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </Tab.Container>
                                </Card.Header>
                                <Card.Body>
                                    <Tab.Container activeKey={activeTab}>
                                        <Tab.Content>
                                            <Tab.Pane eventKey="basic">
                                                <BasicInfoTab
                                                    data={data}
                                                    setData={setData}
                                                    errors={errors}
                                                    categories={categories}
                                                    brands={brands}
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="pricing">
                                                <PricingTab
                                                    data={data}
                                                    setData={setData}
                                                    errors={errors}
                                                    taxes={taxes}
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="inventory">
                                                <InventoryTab
                                                    data={data}
                                                    setData={setData}
                                                    errors={errors}
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="media">
                                                <MediaTab
                                                    renderImages={renderImages}
                                                />
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Tab.Container>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            <PublishCard
                                data={data}
                                setData={setData}
                                processing={processing}
                                renderStatusBadge={renderStatusBadge}
                                isCreate={true}
                            />

                            <ProductTypeCard
                                data={data}
                                setData={setData}
                            />

                            <ShippingCard
                                data={data}
                                setData={setData}
                                errors={errors}
                            />

                            {/* <AttributesCard
                                data={data}
                                setData={setData}
                                attributes={attributes}
                            /> */}

                            <SEOCard
                                data={data}
                                setData={setData}
                                errors={errors}
                                selectedTags={selectedTags}
                                handleTagChange={handleTagChange}
                                processing={processing}
                            />

                            {/* <SpecificationsCard
                                data={data}
                                specificationKey={specificationKey}
                                setSpecificationKey={setSpecificationKey}
                                specificationValue={specificationValue}
                                setSpecificationValue={setSpecificationValue}
                                addSpecification={addSpecification}
                                removeSpecification={removeSpecification}
                            /> */}
                        </Col>
                    </Row>
                </Form>
            </Container>
        </ErpLayout>
    );
}