import { Head, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import {
    Row,
    Col,
    Card,
    Form,
    Button,
    Tab,
    Nav,
    Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";

import ErpLayout from "@/Layouts/ErpLayout";
import BasicInfoTab from "@/Components/Partials/Product/BasicInfo";
import PricingTab from "@/Components/Partials/Product/PricingInfo";
import ItemsTab from "@/Components/Partials/Product/Items";
import MediaTab from "@/Components/Partials/Product/Media";
import OthersTab from "@/Components/Partials/Product/Others";
import useFilterOptions from "@/Hooks/useData";
import Swal from "sweetalert2";
import xios from "@/Utils/axios";

const TABS = [
    { key: "basic", label: "Basic Info", icon: "bi-info-circle" },
    { key: "pricing", label: "Pricing", icon: "bi-tag" },
    { key: "items", label: "Items", icon: "bi-box-seam" },
    { key: "media", label: "Media", icon: "bi-collection-play" },
    { key: "other-info", label: "Other Info", icon: "bi-gear" },
];

const DEFAULT_PRODUCT_DATA = {
    category_id: "",
    brand_id: "",
    tax_id: "",
    name: "",
    slug: "",
    short_description: "",
    description: "",
    sku: "",
    product_type: "physical",
    sizes: [],
    colors: [],
    materials: [],
    variations: [],
    base_price: 0,
    agent_price: 0,
    wholesaler_price: 0,
    compare_price: 0,
    cost_per_item: 0,
    total_quantity: 0,
    low_stock_alert: 5,
    track_quantity: true,
    allow_backorders: false,
    stock_status: "in_stock",
    is_digital: false,
    requires_shipping: true,
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    is_featured: false,
    is_active: true,
    is_bestseller: false,
    is_new: false,
    new_until: "",
    meta_title: "",
    meta_description: "",
    images: [],
    items: [],
};

export default function ProductForm({ product = null }) {
    const { warehouses, categories, brands, taxes } = useFilterOptions();
    const isEdit = !!product;
    const [activeKey, setActiveKey] = useState("basic");

    const { data, setData, errors, processing } = useForm(
        isEdit ? { ...DEFAULT_PRODUCT_DATA, ...product } : DEFAULT_PRODUCT_DATA
    );

    const handleNext = () => {
        const currentIndex = TABS.findIndex((tab) => tab.key === activeKey);
        if (currentIndex < TABS.length - 1) {
            setActiveKey(TABS[currentIndex + 1].key);
        }
    };

    const handlePrevious = () => {
        const currentIndex = TABS.findIndex((tab) => tab.key === activeKey);
        if (currentIndex > 0) {
            setActiveKey(TABS[currentIndex - 1].key);
        }
    };

    const updateFormData = (key, value) => {
        setData(key, value);
    };

    const handleItemsUpdate = (items) => {
        setData("items", items);
        const totalQuantity = items.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
        );
        setData("total_quantity", totalQuantity);
    };

    const handleImagesUpdate = (images) => {
        setData("images", images);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!data.name || !data.category_id) {
            toast.error("Please fill in all required fields");
            return;
        }

        const result = await Swal.fire({
            title: isEdit ? "Update Product?" : "Create Product?",
            text: isEdit
                ? "This will update the existing product."
                : "This will create a new product in the system.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: isEdit ? "Yes, update it!" : "Yes, create it!",
        });

        if (!result.isConfirmed) return;

        const formData = new FormData();

        // Append all basic fields
        Object.keys(data).forEach((key) => {
            if (key === "images" || key === "items") return;

            const value = data[key];
            if (value === null || value === undefined) {
                formData.append(key, "");
            } else if (typeof value === "object") {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        });

        // Handle images
        if (data.images && data.images.length > 0) {
            data.images.forEach((image, index) => {
                // Check if it has a file property that's actually a File object
                if (image.file && image.file instanceof File) {
                    formData.append(`images[${index}]`, image.file);
                }
                // Check if it's a new image with blob URL (your case)
                else if (
                    image.isNew &&
                    image.image_path &&
                    image.image_path.startsWith("blob:")
                ) {
                    fetch(image.image_path)
                        .then((res) => res.blob())
                        .then((blob) => {
                            const file = new File(
                                [blob],
                                `image_${index}.jpg`,
                                { type: blob.type }
                            );
                            formData.append(`images[${index}]`, file);
                        });
                }
                // Handle existing images from database
                else if (image.id && !image.isNew) {
                    formData.append(`existing_images[${index}][id]`, image.id);
                    formData.append(
                        `existing_images[${index}][is_default]`,
                        image.is_default ? "1" : "0"
                    );
                }
            });
        }

        // Handle product items
        if (data.items && data.items.length > 0) {
            data.items.forEach((item, index) => {
                Object.keys(item).forEach((key) => {
                    const value = item[key];
                    if (value !== null && value !== undefined) {
                        formData.append(`items[${index}][${key}]`, value);
                    }
                });
            });
        }

        // Add method to form data
        formData.append("_method", isEdit ? "put" : "post");

        try {
            const url = isEdit
                ? route("product.update", product.id)
                : route("product.store");

            const response = await xios.post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                toast.success(response.data.message);
                router.visit(route("product.index"));
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "An error occurred";
            toast.error(errorMessage);
        }
    };

    const isFirstTab = activeKey === TABS[0].key;
    const isLastTab = activeKey === TABS[TABS.length - 1].key;

    return (
        <ErpLayout>
            <Head
                title={isEdit ? `Edit ${product.name}` : "Create New Product"}
            />

            <div className="container-fluid">
                <Form onSubmit={handleSubmit}>
                    <Tab.Container
                        activeKey={activeKey}
                        onSelect={setActiveKey}
                    >
                        <Row>
                            {/* Sidebar Navigation */}
                            <Col lg={3} xl={2} className="mb-4">
                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="p-3">
                                        <Nav
                                            variant="pills"
                                            className="flex-column"
                                        >
                                            {TABS.map(
                                                ({ key, label, icon }) => (
                                                    <Nav.Item
                                                        key={key}
                                                        className="mb-2"
                                                    >
                                                        <Nav.Link
                                                            eventKey={key}
                                                            className="d-flex align-items-center py-2 px-3 rounded"
                                                        >
                                                            <i
                                                                className={`${icon} me-2`}
                                                            ></i>
                                                            <span className="fw-medium">
                                                                {label}
                                                            </span>
                                                        </Nav.Link>
                                                    </Nav.Item>
                                                )
                                            )}
                                        </Nav>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Main Content */}
                            <Col lg={9} xl={10}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="p-4">
                                        <Tab.Content>
                                            <Tab.Pane eventKey="basic">
                                                <BasicInfoTab
                                                    data={data}
                                                    updateFormData={
                                                        updateFormData
                                                    }
                                                    errors={errors}
                                                    categories={categories}
                                                    brands={brands}
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="pricing">
                                                <PricingTab
                                                    data={data}
                                                    updateFormData={
                                                        updateFormData
                                                    }
                                                    errors={errors}
                                                    taxes={taxes}
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="items">
                                                <ItemsTab
                                                    data={data}
                                                    updateFormData={
                                                        updateFormData
                                                    }
                                                    handleItemsUpdate={
                                                        handleItemsUpdate
                                                    }
                                                    errors={errors}
                                                    warehouses={warehouses}
                                                    productType={
                                                        data.product_type
                                                    }
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="media">
                                                <MediaTab
                                                    data={data}
                                                    updateFormData={
                                                        updateFormData
                                                    }
                                                    handleImagesUpdate={
                                                        handleImagesUpdate
                                                    }
                                                    errors={errors}
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="other-info">
                                                <OthersTab
                                                    data={data}
                                                    updateFormData={
                                                        updateFormData
                                                    }
                                                    errors={errors}
                                                />
                                            </Tab.Pane>
                                        </Tab.Content>

                                        {/* Navigation Buttons */}
                                        <div className="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
                                            <Button
                                                variant="outline-secondary"
                                                onClick={handlePrevious}
                                                disabled={
                                                    isFirstTab || processing
                                                }
                                            >
                                                <i className="bi bi-chevron-left me-2"></i>
                                                Previous
                                            </Button>

                                            <div className="d-flex align-items-center">
                                                <span className="text-muted me-3">
                                                    Step{" "}
                                                    {TABS.findIndex(
                                                        (tab) =>
                                                            tab.key ===
                                                            activeKey
                                                    ) + 1}{" "}
                                                    of {TABS.length}
                                                </span>

                                                {isLastTab ? (
                                                    <Button
                                                        variant="primary"
                                                        type="submit"
                                                        disabled={processing}
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
                                                                <i className="bi bi-check-circle me-2"></i>
                                                                {isEdit
                                                                    ? "Update Product"
                                                                    : "Create Product"}
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        onClick={handleNext}
                                                    >
                                                        Next
                                                        <i className="bi bi-chevron-right ms-2"></i>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Container>
                </Form>
            </div>
        </ErpLayout>
    );
}
