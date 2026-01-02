import ErpLayout from "@/Layouts/ErpLayout";
import { Head, router } from "@inertiajs/react";
import {
    Button,
    Card,
    Col,
    Form,
    Row,
    Tab,
    Nav,
    Spinner,
    Container,
} from "react-bootstrap";
import {
    BiInfoCircle,
    BiTag,
    BiCog,
    BiChevronRight,
    BiChevronLeft,
    BiSave,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useState, useCallback, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import xios from "@/Utils/axios";
import { useErrorToast } from "@/Hooks/useErrorToast";
import useFilterOptions from "@/Hooks/useData";
import BasicInfoTab from "@/Components/Partials/Product/BasicInfo";
import PricingTab from "@/Components/Partials/Product/PricingInfo";
import ItemsTab from "@/Components/Partials/Product/Items";
import MediaTab from "@/Components/Partials/Product/Media";
import OthersTab from "@/Components/Partials/Product/Others";
import { BsCollectionPlay, BsFillBoxSeamFill } from "react-icons/bs";

const TABS = [
    {
        key: "basic",
        label: "Basic Info",
        icon: <BiInfoCircle />,
        color: "#4f46e5",
        description: "Product basic information",
    },
    {
        key: "pricing",
        label: "Pricing",
        icon: <BiTag />,
        color: "#059669",
        description: "Pricing and cost details",
    },
    {
        key: "items",
        label: "Items",
        icon: <BsFillBoxSeamFill />,
        color: "#dc2626",
        description: "Inventory and stock management",
    },
    {
        key: "media",
        label: "Media",
        icon: <BsCollectionPlay />,
        color: "#7c3aed",
        description: "Images and media files",
    },
    {
        key: "other-info",
        label: "Other Info",
        icon: <BiCog />,
        color: "#f59e0b",
        description: "Additional product information",
    },
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

const validationSchema = Yup.object({
    name: Yup.string()
        .required("Product name is required")
        .min(3, "Product name must be at least 3 characters"),
    category_id: Yup.string().required("Category is required"),
    sku: Yup.string().nullable(),
    base_price: Yup.number()
        .min(0, "Base price cannot be negative")
        .required("Base price is required"),
    total_quantity: Yup.number()
        .min(0, "Quantity cannot be negative")
        .integer("Quantity must be a whole number"),
    is_active: Yup.boolean(),
});

export default function ProductForm({ product = null, categories = [] }) {
    const { showErrorToast } = useErrorToast();
    const { warehouses, brands, taxes } = useFilterOptions();
    const isEdit = !!product;
    const [activeKey, setActiveKey] = useState("basic");
    const [loading, setLoading] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);
    const formRef = useRef(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);

    // Initialize formik
    const formik = useFormik({
        initialValues: isEdit
            ? {
                  ...DEFAULT_PRODUCT_DATA,
                  ...product,
                  images: product.images || [],
                  items: product.items || [],
                  variations: product.variations || [],
                  sizes: product.sizes || [],
                  colors: product.colors || [],
                  materials: product.materials || [],
              }
            : DEFAULT_PRODUCT_DATA,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (isFormSubmitting) return;

            try {
                setIsFormSubmitting(true);
                const result = await Swal.fire({
                    title: isEdit ? "Update Product?" : "Create Product?",
                    text: isEdit
                        ? "This will update the existing product record."
                        : "You won't be able to revert this action!",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: "#4f46e5",
                    cancelButtonColor: "#6b7280",
                    confirmButtonText: isEdit
                        ? "Yes, update it!"
                        : "Yes, create it!",
                    cancelButtonText: "Cancel",
                    reverseButtons: true,
                });

                if (!result.isConfirmed) {
                    setIsFormSubmitting(false);
                    return;
                }

                setLoading(true);

                const formData = new FormData();

                // Append all fields
                for (const key in values) {
                    if (values[key] !== null && values[key] !== undefined) {
                        // Handle arrays and objects
                        if (
                            Array.isArray(values[key]) ||
                            typeof values[key] === "object"
                        ) {
                            // Skip images array for now (handled separately)
                            if (key === "images") continue;
                            formData.append(key, JSON.stringify(values[key]));
                        } else {
                            formData.append(key, values[key]);
                        }
                    }
                }

                // Handle images
                if (values.images && values.images.length > 0) {
                    values.images.forEach((image, index) => {
                        if (image instanceof File) {
                            formData.append(`images[${index}]`, image);
                        } else if (image.file) {
                            formData.append(`images[${index}]`, image.file);
                        } else if (image.id && image.isNew !== true) {
                            // Existing image
                            formData.append(
                                `existing_images[${index}][id]`,
                                image.id
                            );
                            formData.append(
                                `existing_images[${index}][is_default]`,
                                image.is_default ? "1" : "0"
                            );
                        }
                    });
                }

                // Handle product items
                if (values.items && values.items.length > 0) {
                    values.items.forEach((item, index) => {
                        Object.keys(item).forEach((key) => {
                            const value = item[key];
                            if (value !== null && value !== undefined) {
                                formData.append(
                                    `items[${index}][${key}]`,
                                    value
                                );
                            }
                        });
                    });
                }

                const url = isEdit
                    ? route("product.update", product.id)
                    : route("product.store");

                const method = "post";
                if (isEdit) formData.append("_method", "PUT");

                const response = await xios[method](url, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                toast.success(
                    isEdit
                        ? "Product updated successfully!"
                        : "Product created successfully!"
                );

                setTimeout(() => {
                    window.location.href = route("product.index");
                }, 1500);
            } catch (err) {
                showErrorToast(err);
                setIsFormSubmitting(false);
            } finally {
                setLoading(false);
            }
        },
    });

    // Initialize previews when component mounts or product data changes
    useEffect(() => {
        if (isEdit && product && product.images) {
            const previews = product.images.map((img) => ({
                id: img.id,
                url: img.image_path,
                is_default: img.is_default,
                isNew: false,
            }));
            setImagePreviews(previews);
        }
    }, [product, isEdit]);

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => {
                if (
                    preview.url &&
                    preview.url.startsWith("blob:") &&
                    preview.isNew
                ) {
                    URL.revokeObjectURL(preview.url);
                }
            });
        };
    }, [imagePreviews]);

    const handleImagesUpdate = (images) => {
        formik.setFieldValue("images", images);
        setImagePreviews(images);
    };

    const handleItemsUpdate = (items) => {
        formik.setFieldValue("items", items);
        const totalQuantity = items.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
        );
        formik.setFieldValue("total_quantity", totalQuantity);
    };

    const updateFormData = (key, value) => {
        formik.setFieldValue(key, value);
    };

    const isFirstTab = activeKey === TABS[0].key;
    const isLastTab = activeKey === TABS[TABS.length - 1].key;

    const handleNext = useCallback(() => {
        const index = TABS.findIndex((t) => t.key === activeKey);
        if (index < TABS.length - 1) setActiveKey(TABS[index + 1].key);
    }, [activeKey]);

    const handlePrevious = useCallback(() => {
        const index = TABS.findIndex((t) => t.key === activeKey);
        if (index > 0) setActiveKey(TABS[index - 1].key);
    }, [activeKey]);

    const handleTabSelect = (key) => {
        if (key !== activeKey) {
            setActiveKey(key);
        }
    };

    return (
        <ErpLayout>
            <Head title={isEdit ? "Edit Product" : "Create Product"} />

            <Container fluid>
                <Form
                    ref={formRef}
                    onSubmit={formik.handleSubmit}
                    encType="multipart/form-data"
                >
                    <Tab.Container
                        activeKey={activeKey}
                        onSelect={(k) => setActiveKey(k)}
                    >
                        <Row className="g-4">
                            {/* Sidebar */}
                            <Col lg={3}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Body>
                                        <Nav
                                            variant="pills"
                                            className="flex-column gap-2"
                                        >
                                            {TABS.map(
                                                ({
                                                    key,
                                                    label,
                                                    icon,
                                                    color,
                                                    description,
                                                }) => (
                                                    <Nav.Item key={key}>
                                                        <Nav.Link
                                                            eventKey={key}
                                                            className="d-flex align-items-center py-3 px-3 rounded-3"
                                                            style={{
                                                                backgroundColor:
                                                                    activeKey ===
                                                                    key
                                                                        ? `${color}15`
                                                                        : "transparent",
                                                                color:
                                                                    activeKey ===
                                                                    key
                                                                        ? color
                                                                        : "#6b7280",
                                                                fontWeight:
                                                                    activeKey ===
                                                                    key
                                                                        ? 600
                                                                        : 400,
                                                                borderLeft:
                                                                    activeKey ===
                                                                    key
                                                                        ? `4px solid ${color}`
                                                                        : "4px solid transparent",
                                                            }}
                                                        >
                                                            <div
                                                                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                                style={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    backgroundColor:
                                                                        activeKey ===
                                                                        key
                                                                            ? color
                                                                            : "#f3f4f6",
                                                                    color:
                                                                        activeKey ===
                                                                        key
                                                                            ? "#fff"
                                                                            : "#9ca3af",
                                                                }}
                                                            >
                                                                {icon}
                                                            </div>

                                                            <div>
                                                                <div className="fw-semibold">
                                                                    {label}
                                                                </div>
                                                                <small className="text-muted">
                                                                    {
                                                                        description
                                                                    }
                                                                </small>
                                                            </div>
                                                        </Nav.Link>
                                                    </Nav.Item>
                                                )
                                            )}
                                        </Nav>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Content */}
                            <Col lg={9}>
                                <Card className="shadow-sm border-0">
                                    <Card.Body>
                                        <Tab.Content>
                                            <Tab.Pane eventKey="basic">
                                                <BasicInfoTab
                                                    formik={formik}
                                                    categories={categories}
                                                    brands={brands}
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="pricing">
                                                <PricingTab
                                                    formik={formik}
                                                    taxes={taxes}
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="items">
                                                <ItemsTab
                                                    formik={formik}
                                                    handleItemsUpdate={
                                                        handleItemsUpdate
                                                    }
                                                    warehouses={warehouses}
                                                    productType={
                                                        formik.values
                                                            .product_type
                                                    }
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="media">
                                                <MediaTab
                                                    formik={formik}
                                                    handleImagesUpdate={
                                                        handleImagesUpdate
                                                    }
                                                    imagePreviews={
                                                        imagePreviews
                                                    }
                                                    setImagePreviews={
                                                        setImagePreviews
                                                    }
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="other-info">
                                                <OthersTab formik={formik} />
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Card.Body>

                                    {/* Footer */}
                                    <Card.Footer className="bg-light border-0 py-4">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <Button
                                                type="button"
                                                variant="outline-secondary"
                                                disabled={isFirstTab || loading}
                                                onClick={handlePrevious}
                                                className="d-flex align-items-center px-4"
                                            >
                                                <BiChevronLeft className="me-2" />
                                                Previous
                                            </Button>

                                            <div className="d-flex align-items-center">
                                                <span className="text-muted me-3 small">
                                                    Step{" "}
                                                    {TABS.findIndex(
                                                        (t) =>
                                                            t.key === activeKey
                                                    ) + 1}{" "}
                                                    of {TABS.length}
                                                </span>

                                                {isLastTab ? (
                                                    <Button
                                                        type="submit"
                                                        variant="primary"
                                                        disabled={loading}
                                                        className="d-flex align-items-center px-4"
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <Spinner
                                                                    size="sm"
                                                                    className="me-2"
                                                                />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <BiSave className="me-2" />
                                                                {isEdit
                                                                    ? "Update Product"
                                                                    : "Create Product"}
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        onClick={handleNext}
                                                        className="d-flex align-items-center px-4"
                                                    >
                                                        Next
                                                        <BiChevronRight className="ms-2" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Container>
                </Form>
            </Container>
        </ErpLayout>
    );
}
