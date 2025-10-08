import ErpLayout from "@/Layouts/ErpLayout";
import { Head } from "@inertiajs/react";
import {
    Button,
    Card,
    Col,
    Form,
    Row,
    Tab,
    Nav,
    Spinner,
    Badge,
    Image,
    Container,
} from "react-bootstrap";
import {
    BiUser,
    BiMap,
    BiMoney,
    BiCheckCircle,
    BiCalendar,
    BiImage,
    BiArrowBack,
    BiChevronRight,
    BiChevronLeft,
    BiSave,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import xios from "@/Utils/axios";
import { useErrorToast } from "@/Hooks/useErrorToast";

const TABS = [
    {
        key: "personal",
        label: "Personal Details",
        icon: <BiUser />,
        color: "#4f46e5",
    },
    { key: "address", label: "Address", icon: <BiMap />, color: "#059669" },
    {
        key: "financial",
        label: "Financial",
        icon: <BiMoney />,
        color: "#dc2626",
    },
    {
        key: "status",
        label: "Status & Notes",
        icon: <BiCheckCircle />,
        color: "#7c3aed",
    },
];

const DEFAULT_CUSTOMER_DATA = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    alternate_phone: "",
    date_of_birth: "",
    profile_image: null,
    address: "",
    city: "",
    state: "",
    country: "Kenya",
    postal_code: "",
    role: "customer",
    opening_balance: 0,
    balance: 0,
    is_active: true,
    description: "",
};

const validationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email"),
    phone: Yup.string().required("Phone number is required"),
    date_of_birth: Yup.date().nullable().required("Date of birth is required"),
});

export default function CustomerForm({ customer = null }) {
    const { showErrorToast } = useErrorToast();
    const isEdit = !!customer;
    const [activeKey, setActiveKey] = useState("personal");
    const [loading, setLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(
        customer?.passport_photo_url || null
    );

    const formik = useFormik({
        initialValues: isEdit
            ? { ...DEFAULT_CUSTOMER_DATA, ...customer }
            : DEFAULT_CUSTOMER_DATA,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const result = await Swal.fire({
                    title: isEdit ? "Update Customer?" : "Create Customer?",
                    text: isEdit
                        ? "This will update the existing customer record."
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

                if (!result.isConfirmed) return;

                setLoading(true);

                const formData = new FormData();
                for (const key in values) {
                    formData.append(key, values[key]);
                }

                const url = isEdit
                    ? route("customers.update", customer.id)
                    : route("customers.store");

                const method = isEdit ? "post" : "post";
                if (isEdit) formData.append("_method", "PUT");

                const response = await xios[method](url, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                toast.success(
                    isEdit
                        ? "Customer updated successfully!"
                        : "Customer created successfully!"
                );

                window.location.href = route("customers.index");
            } catch (err) {
                showErrorToast(err);
            } finally {
                setLoading(false);
            }
        },
    });

    const handlePhotoChange = (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            formik.setFieldValue("profile_image", file);
            setPhotoPreview(URL.createObjectURL(file));
        }
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

    const renderStatusBadge = useCallback(
        () =>
            formik.values.is_active ? (
                <Badge bg="success" className="fs-6 px-3 py-2">
                    <BiCheckCircle className="me-1" />
                    Active
                </Badge>
            ) : (
                <Badge bg="secondary" className="fs-6 px-3 py-2">
                    Inactive
                </Badge>
            ),
        [formik.values.is_active]
    );

    const currentTab = TABS.find((tab) => tab.key === activeKey);

    return (
        <ErpLayout>
            <Head title={isEdit ? "Edit Customer" : "Create Customer"} />

            <Container fluid className="py-4">
                <Form
                    onSubmit={formik.handleSubmit}
                    encType="multipart/form-data"
                >
                    <Tab.Container
                        activeKey={activeKey}
                        onSelect={setActiveKey}
                    >
                        <Row className="g-4">
                            {/* Sidebar Navigation */}
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
                                                }) => (
                                                    <Nav.Item key={key}>
                                                        <Nav.Link
                                                            eventKey={key}
                                                            className="d-flex align-items-center py-3 px-3 rounded-3 border-0"
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
                                                                        ? "600"
                                                                        : "400",
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
                                                                    width: "40px",
                                                                    height: "40px",
                                                                    backgroundColor:
                                                                        activeKey ===
                                                                        key
                                                                            ? color
                                                                            : "#f3f4f6",
                                                                    color:
                                                                        activeKey ===
                                                                        key
                                                                            ? "white"
                                                                            : "#9ca3af",
                                                                }}
                                                            >
                                                                {icon}
                                                            </div>
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    {label}
                                                                </div>
                                                                <small className="opacity-75">
                                                                    {key ===
                                                                        "personal" &&
                                                                        "Basic information"}
                                                                    {key ===
                                                                        "address" &&
                                                                        "Location details"}
                                                                    {key ===
                                                                        "financial" &&
                                                                        "Payment & balance"}
                                                                    {key ===
                                                                        "status" &&
                                                                        "Status & notes"}
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

                            {/* Main Content */}
                            <Col lg={9}>
                                <Card className="shadow-sm border-0">
                                    <Card.Body>
                                        <Tab.Content>
                                            {/* PERSONAL DETAILS */}
                                            <Tab.Pane eventKey="personal">
                                                <Row className="g-4">
                                                    <Col md={4} lg={3}>
                                                        <Card className="border-0 bg-light">
                                                            <Card.Body className="text-center p-4">
                                                                <div className="mb-3">
                                                                    {photoPreview ? (
                                                                        <Image
                                                                            src={
                                                                                photoPreview
                                                                            }
                                                                            roundedCircle
                                                                            fluid
                                                                            className="border shadow-sm"
                                                                            style={{
                                                                                width: 140,
                                                                                height: 140,
                                                                                objectFit:
                                                                                    "cover",
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className="border rounded-circle d-flex justify-content-center align-items-center bg-white mx-auto"
                                                                            style={{
                                                                                width: 140,
                                                                                height: 140,
                                                                            }}
                                                                        >
                                                                            <BiImage
                                                                                size={
                                                                                    50
                                                                                }
                                                                                className="text-muted"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Form.Group>
                                                                    <Form.Label
                                                                        className="btn btn-outline-primary btn-sm w-100 cursor-pointer mb-0"
                                                                        htmlFor="profile_image"
                                                                    >
                                                                        <BiImage className="me-2" />
                                                                        {photoPreview
                                                                            ? "Change Photo"
                                                                            : "Upload Photo"}
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="file"
                                                                        id="profile_image"
                                                                        name="profile_image"
                                                                        accept="image/*"
                                                                        onChange={
                                                                            handlePhotoChange
                                                                        }
                                                                        className="d-none"
                                                                    />
                                                                </Form.Group>
                                                                <div className="small text-muted mt-2">
                                                                    JPG, PNG or
                                                                    GIF. Max
                                                                    2MB.
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col md={8} lg={9}>
                                                        <Row className="g-3">
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        First
                                                                        Name *
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        name="first_name"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .first_name
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        isInvalid={
                                                                            formik
                                                                                .touched
                                                                                .first_name &&
                                                                            !!formik
                                                                                .errors
                                                                                .first_name
                                                                        }
                                                                        placeholder="Enter first name"
                                                                        className="py-2"
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .first_name
                                                                        }
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        Last
                                                                        Name *
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        name="last_name"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .last_name
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        isInvalid={
                                                                            formik
                                                                                .touched
                                                                                .last_name &&
                                                                            !!formik
                                                                                .errors
                                                                                .last_name
                                                                        }
                                                                        placeholder="Enter last name"
                                                                        className="py-2"
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .last_name
                                                                        }
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>

                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        Email
                                                                        Address
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="email"
                                                                        name="email"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .email
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        isInvalid={
                                                                            formik
                                                                                .touched
                                                                                .email &&
                                                                            !!formik
                                                                                .errors
                                                                                .email
                                                                        }
                                                                        placeholder="customer@example.com"
                                                                        className="py-2"
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .email
                                                                        }
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        Phone
                                                                        Number *
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        name="phone"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .phone
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        isInvalid={
                                                                            formik
                                                                                .touched
                                                                                .phone &&
                                                                            !!formik
                                                                                .errors
                                                                                .phone
                                                                        }
                                                                        placeholder="+254 XXX XXX XXX"
                                                                        className="py-2"
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .phone
                                                                        }
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>

                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        Alternate
                                                                        Phone
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        name="alternate_phone"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .alternate_phone
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        placeholder="Optional phone number"
                                                                        className="py-2"
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        Date of
                                                                        Birth *
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="date"
                                                                        name="date_of_birth"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .date_of_birth
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        isInvalid={
                                                                            formik
                                                                                .touched
                                                                                .date_of_birth &&
                                                                            !!formik
                                                                                .errors
                                                                                .date_of_birth
                                                                        }
                                                                        className="py-2"
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .date_of_birth
                                                                        }
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </Tab.Pane>

                                            {/* ADDRESS */}
                                            <Tab.Pane eventKey="address">
                                                <Row className="g-4">
                                                    <Col md={12}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Street Address
                                                            </Form.Label>
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={3}
                                                                name="address"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .address
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                placeholder="Enter complete street address"
                                                                className="py-2"
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                City
                                                            </Form.Label>
                                                            <Form.Control
                                                                name="city"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .city
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                placeholder="Enter city"
                                                                className="py-2"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                State/Region
                                                            </Form.Label>
                                                            <Form.Control
                                                                name="state"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .state
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                placeholder="Enter state or region"
                                                                className="py-2"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Postal Code
                                                            </Form.Label>
                                                            <Form.Control
                                                                name="postal_code"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .postal_code
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                placeholder="Postal code"
                                                                className="py-2"
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Country
                                                            </Form.Label>
                                                            <Form.Control
                                                                name="country"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .country
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                placeholder="Country"
                                                                className="py-2"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Customer Type
                                                            </Form.Label>
                                                            <Form.Select
                                                                name="role"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .role
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                className="py-2"
                                                            >
                                                                <option value="customer">
                                                                    Customer
                                                                </option>
                                                                <option value="supplier">
                                                                    Supplier
                                                                </option>
                                                                <option value="agent">
                                                                    Agent
                                                                </option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </Tab.Pane>

                                            {/* FINANCIAL */}
                                            <Tab.Pane eventKey="financial">
                                                <Row className="g-4">
                                                    <Col lg={8}>
                                                        <Row className="g-4">
                                                            <Col md={6}>
                                                                <Card className="border-0 bg-light h-100">
                                                                    <Card.Body className="p-4">
                                                                        <div className="d-flex align-items-center mb-3">
                                                                            <div
                                                                                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                                                style={{
                                                                                    width: "48px",
                                                                                    height: "48px",
                                                                                    backgroundColor:
                                                                                        "#dc2626",
                                                                                    color: "white",
                                                                                }}
                                                                            >
                                                                                <BiMoney
                                                                                    size={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <h6 className="fw-bold mb-0">
                                                                                    Opening
                                                                                    Balance
                                                                                </h6>
                                                                                <small className="text-muted">
                                                                                    Initial
                                                                                    account
                                                                                    balance
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                        <Form.Group>
                                                                            <Form.Control
                                                                                type="number"
                                                                                name="opening_balance"
                                                                                value={
                                                                                    formik
                                                                                        .values
                                                                                        .opening_balance
                                                                                }
                                                                                onChange={
                                                                                    formik.handleChange
                                                                                }
                                                                                placeholder="0.00"
                                                                                className="py-2 border-0 bg-white shadow-sm"
                                                                            />
                                                                        </Form.Group>
                                                                    </Card.Body>
                                                                </Card>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Card className="border-0 bg-light h-100">
                                                                    <Card.Body className="p-4">
                                                                        <div className="d-flex align-items-center mb-3">
                                                                            <div
                                                                                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                                                style={{
                                                                                    width: "48px",
                                                                                    height: "48px",
                                                                                    backgroundColor:
                                                                                        "#059669",
                                                                                    color: "white",
                                                                                }}
                                                                            >
                                                                                <BiMoney
                                                                                    size={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <h6 className="fw-bold mb-0">
                                                                                    Current
                                                                                    Balance
                                                                                </h6>
                                                                                <small className="text-muted">
                                                                                    Updated
                                                                                    balance
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                        <Form.Group>
                                                                            <Form.Control
                                                                                type="number"
                                                                                name="balance"
                                                                                value={
                                                                                    formik
                                                                                        .values
                                                                                        .balance
                                                                                }
                                                                                onChange={
                                                                                    formik.handleChange
                                                                                }
                                                                                placeholder="0.00"
                                                                                className="py-2 border-0 bg-white shadow-sm"
                                                                            />
                                                                        </Form.Group>
                                                                    </Card.Body>
                                                                </Card>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                    <Col lg={4}>
                                                        <Card className="border-0 bg-warning bg-opacity-10 h-100">
                                                            <Card.Body className="p-4">
                                                                <h6 className="fw-bold text-warning mb-3">
                                                                    <BiMoney className="me-2" />
                                                                    Financial
                                                                    Information
                                                                </h6>
                                                                <p className="small text-muted mb-0">
                                                                    Set the
                                                                    initial and
                                                                    current
                                                                    balance for
                                                                    this
                                                                    customer.
                                                                    These values
                                                                    will be used
                                                                    for
                                                                    accounting
                                                                    and
                                                                    reporting
                                                                    purposes.
                                                                </p>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </Tab.Pane>

                                            {/* STATUS */}
                                            <Tab.Pane eventKey="status">
                                                <Row className="g-4">
                                                    <Col lg={8}>
                                                        <Card className="border-0 bg-light">
                                                            <Card.Body className="p-4">
                                                                <h6 className="fw-bold mb-3">
                                                                    Customer
                                                                    Status
                                                                </h6>
                                                                <div className="d-flex align-items-center justify-content-between p-3 bg-white rounded-3">
                                                                    <div>
                                                                        <div className="fw-semibold">
                                                                            Account
                                                                            Status
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            {formik
                                                                                .values
                                                                                .is_active
                                                                                ? "This customer is active and can transact"
                                                                                : "This customer is inactive and cannot transact"}
                                                                        </small>
                                                                    </div>
                                                                    <Form.Check
                                                                        type="switch"
                                                                        id="is_active"
                                                                        name="is_active"
                                                                        checked={
                                                                            formik
                                                                                .values
                                                                                .is_active
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        style={{
                                                                            transform:
                                                                                "scale(1.2)",
                                                                        }}
                                                                    />
                                                                </div>
                                                            </Card.Body>
                                                        </Card>

                                                        <Card className="border-0 bg-light mt-4">
                                                            <Card.Body className="p-4">
                                                                <h6 className="fw-bold mb-3">
                                                                    Additional
                                                                    Notes
                                                                </h6>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        Description
                                                                        / Notes
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        as="textarea"
                                                                        rows={4}
                                                                        name="description"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .description
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        placeholder="Enter any additional notes or description about this customer..."
                                                                        className="py-2"
                                                                    />
                                                                    <Form.Text className="text-muted">
                                                                        Add any
                                                                        important
                                                                        information
                                                                        that
                                                                        might be
                                                                        useful
                                                                        for your
                                                                        team.
                                                                    </Form.Text>
                                                                </Form.Group>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col lg={4}>
                                                        <Card className="border-0 bg-primary bg-opacity-10">
                                                            <Card.Body className="p-4">
                                                                <h6 className="fw-bold text-primary mb-3">
                                                                    <BiCheckCircle className="me-2" />
                                                                    Status
                                                                    Overview
                                                                </h6>
                                                                <div className="mb-3">
                                                                    <div className="small text-muted mb-1">
                                                                        Current
                                                                        Status
                                                                    </div>
                                                                    {renderStatusBadge()}
                                                                </div>
                                                                <p className="small text-muted mb-0">
                                                                    Active
                                                                    customers
                                                                    can place
                                                                    orders and
                                                                    transact
                                                                    with your
                                                                    business.
                                                                    Inactive
                                                                    customers
                                                                    will be
                                                                    hidden from
                                                                    most
                                                                    operations
                                                                    but their
                                                                    data is
                                                                    preserved.
                                                                </p>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Card.Body>

                                    {/* Navigation Footer */}
                                    <Card.Footer className="bg-light border-0 py-4">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <Button
                                                variant="outline-secondary"
                                                onClick={handlePrevious}
                                                disabled={isFirstTab || loading}
                                                className="px-4 py-2 d-flex align-items-center"
                                            >
                                                <BiChevronLeft
                                                    className="me-2"
                                                    size={18}
                                                />
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
                                                        variant="primary"
                                                        type="submit"
                                                        disabled={loading}
                                                        className="px-4 py-2 d-flex align-items-center"
                                                    >
                                                        {loading ? (
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
                                                                <BiSave
                                                                    className="me-2"
                                                                    size={18}
                                                                />
                                                                {isEdit
                                                                    ? "Update Customer"
                                                                    : "Create Customer"}
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        onClick={handleNext}
                                                        className="px-4 py-2 d-flex align-items-center"
                                                    >
                                                        Next
                                                        <BiChevronRight
                                                            className="ms-2"
                                                            size={18}
                                                        />
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
