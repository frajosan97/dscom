import { Trash } from "react-bootstrap-icons";
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Row,
    Col,
    Card,
    Form,
    Button,
    Tab,
    Nav,
    Badge,
    Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";

import ErpLayout from "@/Layouts/ErpLayout";
import BasicInfoTab from "@/Components/Partials/Product/BasicInfo";
import PricingTab from "@/Components/Partials/Product/PricingInfo";
import InventoryTab from "@/Components/Partials/Product/InventoryInfo";
import MediaTab from "@/Components/Partials/Product/Media";
import OthersTab from "@/Components/Partials/Product/Others";

import useFilterOptions from "@/Hooks/useData";
import Swal from "sweetalert2";
import FileUpload from "@/Components/Settings/FileUpload";
import xios from "@/Utils/axios";

// Constants
const TABS = [
    { key: "basic", label: "Basic Info", icon: "bi-info-circle" },
    { key: "pricing", label: "Pricing", icon: "bi-tag" },
    { key: "inventory", label: "Inventory", icon: "bi-box-seam" },
    { key: "media", label: "Media", icon: "bi-collection-play" },
    { key: "other-info", label: "Other Info", icon: "bi-info-circle" },
];

const DEFAULT_PRODUCT_DATA = {
    branch_id: "",
    name: "",
    slug: "",
    short_description: "",
    description: "",
    meta_title: "",
    meta_description: "",
    category_id: "",
    brand_id: "",
    price: 0,
    agent_price: 0,
    wholesaler_price: 0,
    compare_price: 0,
    cost_per_item: 0,
    tax_id: "",
    tax_amount: 0,
    sku: "",
    barcode: "",
    quantity: 0,
    low_stock_threshold: 0,
    stock_status: "in_stock",
    track_inventory: false,
    allow_backorders: false,
    is_digital: false,
    requires_shipping: true,
    weight: 0,
    weight_unit: "kg",
    length: 0,
    width: 0,
    height: 0,
    dimension_unit: "cm",
    is_featured: false,
    is_active: true,
    is_bestseller: false,
    is_new: false,
    new_until: "",
    has_variants: false,
    tags: [],
    specifications: {},
    custom_fields: {},
    related_products: [],
    images: [],
    variants: [],
    selected_attributes: [],
    selected_attribute_values: [],
};

export default function ProductForm({ product = null }) {
    const { categories, brands, branches, taxes } = useFilterOptions();
    const isEdit = !!product;

    const { data, setData, errors, setErrors, processing } = useForm(
        isEdit ? { ...DEFAULT_PRODUCT_DATA, ...product } : DEFAULT_PRODUCT_DATA
    );

    const [selectedTags, setSelectedTags] = useState([]);
    const [activeKey, setActiveKey] = useState("basic");

    // Populate form with existing product data when editing
    useEffect(() => {
        if (isEdit && product) {
            Object.keys(product).forEach((key) => {
                if (product[key] !== null && product[key] !== undefined) {
                    setData(key, product[key]);
                }
            });

            // Set selected tags if they exist
            if (product.tags?.length) {
                setSelectedTags(
                    product.tags.map((tag) => ({ value: tag, label: tag }))
                );
            }
        }
    }, [isEdit, product, setData]);

    // Navigation handlers
    const handleNext = useCallback(() => {
        const currentIndex = TABS.findIndex((tab) => tab.key === activeKey);
        if (currentIndex < TABS.length - 1) {
            setActiveKey(TABS[currentIndex + 1].key);
        }
    }, [activeKey]);

    const handlePrevious = useCallback(() => {
        const currentIndex = TABS.findIndex((tab) => tab.key === activeKey);
        if (currentIndex > 0) {
            setActiveKey(TABS[currentIndex - 1].key);
        }
    }, [activeKey]);

    // Status badge renderer
    const renderStatusBadge = useCallback(() => {
        if (!data.is_active) {
            return <Badge bg="secondary">Inactive</Badge>;
        }

        const badges = [];
        if (data.is_featured)
            badges.push(
                <Badge key="featured" bg="info" className="me-1">
                    Featured
                </Badge>
            );
        if (data.is_bestseller)
            badges.push(
                <Badge key="bestseller" bg="warning" className="me-1">
                    Bestseller
                </Badge>
            );
        if (data.is_new)
            badges.push(
                <Badge key="new" bg="success" className="me-1">
                    New
                </Badge>
            );
        if (data.compare_price > data.price)
            badges.push(
                <Badge key="sale" bg="danger" className="me-1">
                    Sale
                </Badge>
            );

        return badges.length ? badges : <Badge bg="primary">Active</Badge>;
    }, [data]);

    // Images renderer
    const renderImages = useCallback(() => {
        if (!data.images?.length) {
            return (
                <Row className="g-2">
                    <Col md={12}>
                        <FileUpload
                            onChange={(files) =>
                                setData("images", [...data.images, ...files])
                            }
                            accept="image/*"
                            maxFiles={6}
                            multiple
                        />
                    </Col>
                </Row>
            );
        }

        return (
            <Row className="g-2">
                {data.images.map((image, index) => (
                    <Col xs={6} md={2} key={image.id || index}>
                        <Card className="h-100">
                            <Card.Img
                                variant="top"
                                src={
                                    `/storage/${image.image_path}` ||
                                    URL.createObjectURL(image)
                                }
                                style={{ height: "120px", objectFit: "cover" }}
                                alt={`Product image ${index + 1}`}
                            />
                            <Card.Body className="p-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Form.Check
                                        type="radio"
                                        name="defaultImage"
                                        label="Default"
                                        checked={image.is_default}
                                        onChange={() =>
                                            setData(
                                                "images",
                                                data.images.map((img, i) => ({
                                                    ...img,
                                                    is_default: i === index,
                                                }))
                                            )
                                        }
                                        className="mb-0"
                                    />
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() =>
                                            setData(
                                                "images",
                                                data.images.filter(
                                                    (_, i) => i !== index
                                                )
                                            )
                                        }
                                        aria-label="Delete image"
                                    >
                                        <Trash size={14} />
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                <Col md={12}>
                    <FileUpload
                        onChange={(files) =>
                            setData("images", [...data.images, ...files])
                        }
                        accept="image/*"
                        multiple
                        buttonText="Add Images"
                        buttonVariant="outline-primary"
                        buttonSize="sm"
                    />
                </Col>
            </Row>
        );
    }, [data.images, setData]);

    const handleTagChange = useCallback(
        (selectedOptions) => {
            setSelectedTags(selectedOptions);
            setData(
                "tags",
                selectedOptions.map((option) => option.value)
            );
        },
        [setData]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // SweetAlert confirmation
            const result = await Swal.fire({
                title: isEdit ? "Update Product?" : "Create Product?",
                text: isEdit
                    ? "This will update the existing product."
                    : "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: isEdit
                    ? "Yes, update it!"
                    : "Yes, create it!",
            });

            if (!result.isConfirmed) return;

            // Data formulation
            const formData = new FormData();

            // Append all basic fields
            Object.keys(data).forEach((key) => {
                if (
                    [
                        "images",
                        "variants",
                        "selected_attributes",
                        "selected_attribute_values",
                        "related_products",
                    ].includes(key)
                ) {
                    return; // Handle these separately
                }

                if (key === "specifications") {
                    formData.append(key, JSON.stringify(data[key] || {}));
                } else {
                    formData.append(key, data[key] === null ? "" : data[key]);
                }
            });

            // Handle images
            const images = data.images || [];
            images.forEach((file, index) => {
                if (file instanceof File) {
                    formData.append(`images[${index}]`, file);
                } else if (file?.id) {
                    // Existing image with ID
                    formData.append(`existing_images[${index}][id]`, file.id);
                    formData.append(
                        `existing_images[${index}][is_default]`,
                        file.is_default || false
                    );
                }
            });

            // Handle variants
            const variants = data.variants || [];
            variants.forEach((variant, index) => {
                Object.keys(variant).forEach((key) => {
                    formData.append(
                        `variants[${index}][${key}]`,
                        variant[key] === null ? "" : variant[key]
                    );
                });
            });

            // Handle attributes
            const attributes = data.selected_attributes || [];
            attributes.forEach((attribute, index) => {
                formData.append(`attributes[${index}][id]`, attribute.value);
                formData.append(`attributes[${index}][name]`, attribute.label);
            });

            // Handle attribute values
            const attributeValues = data.selected_attribute_values || [];
            attributeValues.forEach((attributeValue, index) => {
                formData.append(
                    `attribute_values[${index}][id]`,
                    attributeValue.value
                );
                formData.append(
                    `attribute_values[${index}][value]`,
                    attributeValue.label
                );
            });

            // Handle related products
            const relatedProducts = data.related_products || [];
            relatedProducts.forEach((product, index) => {
                formData.append(
                    `related_products[${index}]`,
                    product.id || product
                );
            });

            formData.append("_method", isEdit ? "PUT" : "POST");

            const postUrl = isEdit
                ? route("product.update", product.id)
                : route("product.store");

            const response = await xios.post(postUrl, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                toast.success(response.data.message);
                router.visit(route("product.index"));
            }
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.error ||
                    error.response?.data?.message ||
                    error.message ||
                    `An error occurred while ${
                        isEdit ? "updating" : "creating"
                    } the product`
            );
        }
    };

    const isFirstTab = activeKey === TABS[0].key;
    const isLastTab = activeKey === TABS[TABS.length - 1].key;

    return (
        <ErpLayout>
            <Head title={isEdit ? "Edit Product" : "Create New Product"} />

            <Form onSubmit={handleSubmit}>
                <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
                    <Row>
                        {/* Sidebar Nav */}
                        <Col sm={3} md={2} className="border-end">
                            <Nav variant="pills" className="flex-column">
                                {TABS.map(({ key, label, icon }) => (
                                    <Nav.Item key={key}>
                                        <Nav.Link
                                            eventKey={key}
                                            className="d-flex align-items-center"
                                        >
                                            <i className={`${icon} me-2`}></i>
                                            <span className="d-none d-md-inline">
                                                {label}
                                            </span>
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </Col>

                        {/* Tab Content */}
                        <Col sm={9} md={10}>
                            <Tab.Content>
                                <Tab.Pane eventKey="basic">
                                    <BasicInfoTab
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        setErrors={setErrors}
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
                                    <MediaTab renderImages={renderImages} />
                                </Tab.Pane>

                                <Tab.Pane eventKey="other-info">
                                    <OthersTab
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        selectedTags={selectedTags}
                                        handleTagChange={handleTagChange}
                                        renderStatusBadge={renderStatusBadge}
                                    />
                                </Tab.Pane>
                            </Tab.Content>

                            {/* Navigation Buttons */}
                            <div className="d-flex justify-content-between mt-4 bg-light border-top py-3">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handlePrevious}
                                    disabled={isFirstTab || processing}
                                    className="d-flex align-items-center"
                                >
                                    <i className="bi bi-chevron-left me-1"></i>
                                    Previous
                                </Button>

                                {isLastTab ? (
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={processing}
                                        className="d-flex align-items-center"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner
                                                    animation="border"
                                                    size="sm"
                                                    className="me-2"
                                                />
                                                {isEdit
                                                    ? "Updating..."
                                                    : "Creating..."}
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-1"></i>
                                                {isEdit
                                                    ? "Update Product"
                                                    : "Create Product"}
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        type="button"
                                        onClick={handleNext}
                                        className="d-flex align-items-center"
                                    >
                                        Next
                                        <i className="bi bi-chevron-right ms-1"></i>
                                    </Button>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Tab.Container>
            </Form>
        </ErpLayout>
    );
}
