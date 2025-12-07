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
    BiBriefcase,
    BiDollar,
    BiCheckCircle,
    BiCalendar,
    BiImage,
    BiIdCard,
    BiFile,
    BiArrowBack,
    BiChevronRight,
    BiChevronLeft,
    BiSave,
    BiEnvelope,
    BiPhone,
    BiLock,
    BiMap,
    BiCreditCard,
    BiCalendarAlt,
} from "react-icons/bi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useState, useCallback, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import xios from "@/Utils/axios";
import { useErrorToast } from "@/Hooks/useErrorToast";
import useData from "@/Hooks/useData";

const TABS = [
    {
        key: "personal",
        label: "Personal Details",
        icon: <BiUser />,
        color: "#4f46e5",
    },
    {
        key: "professional",
        label: "Professional",
        icon: <BiBriefcase />,
        color: "#059669",
    },
    {
        key: "financial",
        label: "Financial",
        icon: <BiDollar />,
        color: "#dc2626",
    },
    {
        key: "documents",
        label: "Documents",
        icon: <BiFile />,
        color: "#7c3aed",
    },
    {
        key: "status",
        label: "Status & Notes",
        icon: <BiCheckCircle />,
        color: "#f59e0b",
    },
];

const DEFAULT_EMPLOYEE_DATA = {
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    consfirm_password: "",
    gender: "male",
    date_of_birth: "",
    qualification: "",
    designation: "",
    salary_type: "",
    salary: "",
    blood_group: "",
    role: "",
    ending_date: "",
    opening_balance: "0",
    address: "",
    description: "",
    status: "active", // Changed from "Enable" to "active"
    profileImage: null,
    idCard: null,
    document: null,
};

const validationSchema = Yup.object({
    name: Yup.string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters"),
    email: Yup.string().email("Invalid email format").nullable(),
    phone: Yup.string()
        .required("Phone number is required")
        .matches(/^[0-9+\-\s()]{10,}$/, "Invalid phone number format"),
    status: Yup.string()
        .oneOf(
            ["active", "inactive"],
            "Status must be either active or inactive"
        )
        .required("Status is required"),
});

export default function EmployeeForm({ employee = null }) {
    const { showErrorToast } = useErrorToast();
    const { roles } = useData();
    const isEdit = !!employee;
    const [activeKey, setActiveKey] = useState("personal");
    const [loading, setLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [idCardPreview, setIdCardPreview] = useState(null);
    const [documentPreview, setDocumentPreview] = useState(null);

    // Initialize formik
    const formik = useFormik({
        initialValues: isEdit
            ? {
                  ...DEFAULT_EMPLOYEE_DATA,
                  ...employee,
                  // Map old status values to new ones if needed
                  status:
                      employee.status === "Enable"
                          ? "active"
                          : employee.status === "Disable"
                          ? "inactive"
                          : employee.status,
              }
            : DEFAULT_EMPLOYEE_DATA,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const result = await Swal.fire({
                    title: isEdit ? "Update Employee?" : "Create Employee?",
                    text: isEdit
                        ? "This will update the existing employee record."
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
                    if (values[key] !== null && values[key] !== undefined) {
                        // Only append profileImage if it's a new file, not the URL string
                        if (
                            key === "profileImage" &&
                            typeof values[key] === "string"
                        ) {
                            continue;
                        }
                        formData.append(key, values[key]);
                    }
                }

                const url = isEdit
                    ? route("employee.update", employee.id)
                    : route("employee.store");

                const method = "post";
                if (isEdit) formData.append("_method", "PUT");

                const response = await xios[method](url, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                toast.success(
                    isEdit
                        ? "Employee updated successfully!"
                        : "Employee created successfully!"
                );

                window.location.href = route("employee.index");
            } catch (err) {
                showErrorToast(err);
            } finally {
                setLoading(false);
            }
        },
    });

    // Initialize previews when component mounts or employee data changes
    useEffect(() => {
        if (isEdit && employee) {
            // Set photo preview from employee data
            if (employee.profile_image_url) {
                setPhotoPreview(employee.profile_image_url);
            }

            // Set other document previews if they exist
            if (employee.id_card_url) {
                setIdCardPreview(employee.id_card_url);
            }
            if (employee.document_url) {
                setDocumentPreview(employee.document_url);
            }

            // Ensure status is either active or inactive
            if (
                employee.status &&
                !["active", "inactive"].includes(employee.status)
            ) {
                formik.setFieldValue(
                    "status",
                    employee.status === "Enable" ? "active" : "inactive"
                );
            }
        }
    }, [employee, isEdit]);

    const handlePhotoChange = (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            formik.setFieldValue("profileImage", file);
            // Create object URL for preview
            const previewUrl = URL.createObjectURL(file);
            setPhotoPreview(previewUrl);
        }
    };

    const handleFileChange = (fieldName, previewSetter) => (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            formik.setFieldValue(fieldName, file);
            if (previewSetter) {
                const previewUrl = URL.createObjectURL(file);
                previewSetter(previewUrl);
            }
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
            formik.values.status === "active" ? (
                <Badge bg="success" className="fs-6 px-3 py-2">
                    <BiCheckCircle className="me-1" />
                    Active
                </Badge>
            ) : (
                <Badge bg="secondary" className="fs-6 px-3 py-2">
                    Inactive
                </Badge>
            ),
        [formik.values.status]
    );

    const currentTab = TABS.find((tab) => tab.key === activeKey);

    return (
        <ErpLayout>
            <Head title={isEdit ? "Edit Employee" : "Create Employee"} />

            <Container fluid>
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
                                                                        "Personal information"}
                                                                    {key ===
                                                                        "professional" &&
                                                                        "Job & qualifications"}
                                                                    {key ===
                                                                        "financial" &&
                                                                        "Salary & compensation"}
                                                                    {key ===
                                                                        "documents" &&
                                                                        "Files & documents"}
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
                                                                        htmlFor="profileImage"
                                                                    >
                                                                        <BiImage className="me-2" />
                                                                        {photoPreview
                                                                            ? "Change Photo"
                                                                            : "Upload Photo"}
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="file"
                                                                        id="profileImage"
                                                                        name="profileImage"
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
                                                                        Full
                                                                        Name *
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        name="name"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .name
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        onBlur={
                                                                            formik.handleBlur
                                                                        }
                                                                        isInvalid={
                                                                            formik
                                                                                .touched
                                                                                .name &&
                                                                            !!formik
                                                                                .errors
                                                                                .name
                                                                        }
                                                                        placeholder="Enter full name"
                                                                        className="py-2"
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .name
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
                                                                        onBlur={
                                                                            formik.handleBlur
                                                                        }
                                                                        isInvalid={
                                                                            formik
                                                                                .touched
                                                                                .email &&
                                                                            !!formik
                                                                                .errors
                                                                                .email
                                                                        }
                                                                        placeholder="employee@example.com"
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
                                                                        onBlur={
                                                                            formik.handleBlur
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
                                                                        Gender
                                                                    </Form.Label>
                                                                    <Form.Select
                                                                        name="gender"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .gender
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        className="py-2"
                                                                    >
                                                                        <option value="male">
                                                                            Male
                                                                        </option>
                                                                        <option value="female">
                                                                            Female
                                                                        </option>
                                                                        <option value="other">
                                                                            Other
                                                                        </option>
                                                                    </Form.Select>
                                                                </Form.Group>
                                                            </Col>

                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        Date of
                                                                        Birth
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="date"
                                                                        name="date_of_birth"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .date_of_birth
                                                                                ? new Date(
                                                                                      formik.values.date_of_birth
                                                                                  )
                                                                                      .toISOString()
                                                                                      .slice(
                                                                                          0,
                                                                                          10
                                                                                      )
                                                                                : ""
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        onBlur={
                                                                            formik.handleBlur
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

                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        Blood
                                                                        Group
                                                                    </Form.Label>
                                                                    <Form.Select
                                                                        name="blood_group"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .blood_group
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        className="py-2"
                                                                    >
                                                                        <option value="">
                                                                            Select
                                                                            Blood
                                                                            Group
                                                                        </option>
                                                                        <option value="A+">
                                                                            A+
                                                                        </option>
                                                                        <option value="A-">
                                                                            A-
                                                                        </option>
                                                                        <option value="B+">
                                                                            B+
                                                                        </option>
                                                                        <option value="B-">
                                                                            B-
                                                                        </option>
                                                                        <option value="AB+">
                                                                            AB+
                                                                        </option>
                                                                        <option value="AB-">
                                                                            AB-
                                                                        </option>
                                                                        <option value="O+">
                                                                            O+
                                                                        </option>
                                                                        <option value="O-">
                                                                            O-
                                                                        </option>
                                                                    </Form.Select>
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>

                                                {/* Credentials Section */}
                                                <Row className="mt-4">
                                                    <Col md={12}>
                                                        <Card className="border-0 bg-light">
                                                            <Card.Body className="p-4">
                                                                <h6 className="fw-bold mb-3 d-flex align-items-center">
                                                                    <BiLock className="me-2" />
                                                                    Login
                                                                    Credentials
                                                                </h6>
                                                                <Row className="g-3">
                                                                    <Col md={4}>
                                                                        <Form.Group>
                                                                            <Form.Label className="fw-semibold">
                                                                                Username
                                                                            </Form.Label>
                                                                            <Form.Control
                                                                                name="username"
                                                                                value={
                                                                                    formik
                                                                                        .values
                                                                                        .username
                                                                                }
                                                                                onChange={
                                                                                    formik.handleChange
                                                                                }
                                                                                onBlur={
                                                                                    formik.handleBlur
                                                                                }
                                                                                placeholder="username"
                                                                                className="py-2"
                                                                            />
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md={4}>
                                                                        <Form.Group>
                                                                            <Form.Label className="fw-semibold">
                                                                                Password
                                                                            </Form.Label>
                                                                            <Form.Control
                                                                                type="password"
                                                                                name="password"
                                                                                value={
                                                                                    formik
                                                                                        .values
                                                                                        .password
                                                                                }
                                                                                onChange={
                                                                                    formik.handleChange
                                                                                }
                                                                                onBlur={
                                                                                    formik.handleBlur
                                                                                }
                                                                                isInvalid={
                                                                                    formik
                                                                                        .touched
                                                                                        .password &&
                                                                                    !!formik
                                                                                        .errors
                                                                                        .password
                                                                                }
                                                                                placeholder="••••••"
                                                                                className="py-2"
                                                                            />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .password
                                                                                }
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md={4}>
                                                                        <Form.Group>
                                                                            <Form.Label className="fw-semibold">
                                                                                Confirm
                                                                                Password
                                                                            </Form.Label>
                                                                            <Form.Control
                                                                                type="password"
                                                                                name="consfirm_password"
                                                                                value={
                                                                                    formik
                                                                                        .values
                                                                                        .consfirm_password
                                                                                }
                                                                                onChange={
                                                                                    formik.handleChange
                                                                                }
                                                                                onBlur={
                                                                                    formik.handleBlur
                                                                                }
                                                                                isInvalid={
                                                                                    formik
                                                                                        .touched
                                                                                        .consfirm_password &&
                                                                                    !!formik
                                                                                        .errors
                                                                                        .consfirm_password
                                                                                }
                                                                                placeholder="••••••"
                                                                                className="py-2"
                                                                            />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .consfirm_password
                                                                                }
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    </Col>
                                                                </Row>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </Tab.Pane>

                                            {/* PROFESSIONAL */}
                                            <Tab.Pane eventKey="professional">
                                                <Row className="g-4">
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Role *
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
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                isInvalid={
                                                                    formik
                                                                        .touched
                                                                        .role &&
                                                                    !!formik
                                                                        .errors
                                                                        .role
                                                                }
                                                                className="py-2"
                                                            >
                                                                <option value="">
                                                                    Select Role
                                                                </option>
                                                                {roles?.map(
                                                                    (role) => (
                                                                        <option
                                                                            key={
                                                                                role.name
                                                                            }
                                                                            value={
                                                                                role.name
                                                                            }
                                                                        >
                                                                            {
                                                                                role.name
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </Form.Select>
                                                            <Form.Control.Feedback type="invalid">
                                                                {
                                                                    formik
                                                                        .errors
                                                                        .role
                                                                }
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Designation
                                                            </Form.Label>
                                                            <Form.Control
                                                                name="designation"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .designation
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                placeholder="e.g., Software Engineer"
                                                                className="py-2"
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Qualification
                                                            </Form.Label>
                                                            <Form.Control
                                                                name="qualification"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .qualification
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                placeholder="e.g., Bachelor's Degree"
                                                                className="py-2"
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Contract End
                                                                Date
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="date"
                                                                name="ending_date"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .ending_date
                                                                        ? new Date(
                                                                              formik.values.ending_date
                                                                          )
                                                                              .toISOString()
                                                                              .slice(
                                                                                  0,
                                                                                  10
                                                                              )
                                                                        : ""
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                className="py-2"
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={12}>
                                                        <Card className="border-0 bg-light mt-2">
                                                            <Card.Body className="p-4">
                                                                <h6 className="fw-bold mb-3">
                                                                    Address
                                                                    Information
                                                                </h6>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        Address
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
                                                                        placeholder="Enter complete address"
                                                                        className="py-2"
                                                                    />
                                                                </Form.Group>
                                                            </Card.Body>
                                                        </Card>
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
                                                                                <BiDollar
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
                                                                                onBlur={
                                                                                    formik.handleBlur
                                                                                }
                                                                                placeholder="0.00"
                                                                                className="py-2 border-0 bg-white shadow-sm"
                                                                                step="0.01"
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
                                                                                <BiDollar
                                                                                    size={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <h6 className="fw-bold mb-0">
                                                                                    Salary
                                                                                    Type
                                                                                </h6>
                                                                                <small className="text-muted">
                                                                                    Payment
                                                                                    frequency
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                        <Form.Group>
                                                                            <Form.Select
                                                                                name="salary_type"
                                                                                value={
                                                                                    formik
                                                                                        .values
                                                                                        .salary_type
                                                                                }
                                                                                onChange={
                                                                                    formik.handleChange
                                                                                }
                                                                                className="py-2 border-0 bg-white shadow-sm"
                                                                            >
                                                                                <option value="">
                                                                                    Select
                                                                                    Type
                                                                                </option>
                                                                                <option value="monthly">
                                                                                    Monthly
                                                                                </option>
                                                                                <option value="weekly">
                                                                                    Weekly
                                                                                </option>
                                                                                <option value="daily">
                                                                                    Daily
                                                                                </option>
                                                                            </Form.Select>
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
                                                                    <BiDollar className="me-2" />
                                                                    Financial
                                                                    Information
                                                                </h6>
                                                                <p className="small text-muted mb-0">
                                                                    Set the
                                                                    salary type
                                                                    and opening
                                                                    balance for
                                                                    this
                                                                    employee.
                                                                    These values
                                                                    will be used
                                                                    for payroll
                                                                    and
                                                                    accounting
                                                                    purposes.
                                                                </p>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>

                                                    <Col md={12}>
                                                        <Card className="border-0 bg-light mt-4">
                                                            <Card.Body className="p-4">
                                                                <div className="d-flex align-items-center mb-3">
                                                                    <div
                                                                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                                        style={{
                                                                            width: "48px",
                                                                            height: "48px",
                                                                            backgroundColor:
                                                                                "#7c3aed",
                                                                            color: "white",
                                                                        }}
                                                                    >
                                                                        <BiCreditCard
                                                                            size={
                                                                                20
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <h6 className="fw-bold mb-0">
                                                                            Monthly
                                                                            Salary
                                                                        </h6>
                                                                        <small className="text-muted">
                                                                            Gross
                                                                            salary
                                                                            amount
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="number"
                                                                        name="salary"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .salary
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        onBlur={
                                                                            formik.handleBlur
                                                                        }
                                                                        isInvalid={
                                                                            formik
                                                                                .touched
                                                                                .salary &&
                                                                            !!formik
                                                                                .errors
                                                                                .salary
                                                                        }
                                                                        placeholder="0.00"
                                                                        className="py-2 border-0 bg-white shadow-sm"
                                                                        step="0.01"
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .salary
                                                                        }
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </Tab.Pane>

                                            {/* DOCUMENTS */}
                                            <Tab.Pane eventKey="documents">
                                                <Row className="g-4">
                                                    <Col md={12}>
                                                        <Card className="border-0 bg-light">
                                                            <Card.Body className="p-4">
                                                                <h6 className="fw-bold mb-3">
                                                                    Employee
                                                                    Documents
                                                                </h6>
                                                                <Row className="g-4">
                                                                    <Col md={4}>
                                                                        <Card className="border-0 bg-white shadow-sm h-100">
                                                                            <Card.Body className="text-center p-4">
                                                                                <div className="mb-3">
                                                                                    {idCardPreview ? (
                                                                                        <div className="position-relative">
                                                                                            <Image
                                                                                                src={
                                                                                                    idCardPreview
                                                                                                }
                                                                                                fluid
                                                                                                className="border rounded"
                                                                                                style={{
                                                                                                    width: "100%",
                                                                                                    height: 120,
                                                                                                    objectFit:
                                                                                                        "cover",
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div
                                                                                            className="rounded-circle d-flex justify-content-center align-items-center bg-light mx-auto"
                                                                                            style={{
                                                                                                width: 80,
                                                                                                height: 80,
                                                                                            }}
                                                                                        >
                                                                                            <BiIdCard
                                                                                                size={
                                                                                                    40
                                                                                                }
                                                                                                className="text-primary"
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <h6 className="fw-bold">
                                                                                    ID
                                                                                    Card
                                                                                </h6>
                                                                                <p className="small text-muted mb-3">
                                                                                    Upload
                                                                                    employee's
                                                                                    identification
                                                                                    card
                                                                                </p>
                                                                                <Form.Group>
                                                                                    <Form.Label
                                                                                        className="btn btn-outline-primary btn-sm w-100 cursor-pointer mb-0"
                                                                                        htmlFor="idCard"
                                                                                    >
                                                                                        <BiIdCard className="me-2" />
                                                                                        {idCardPreview
                                                                                            ? "Change ID Card"
                                                                                            : "Upload ID Card"}
                                                                                    </Form.Label>
                                                                                    <Form.Control
                                                                                        type="file"
                                                                                        id="idCard"
                                                                                        name="idCard"
                                                                                        accept="image/*,.pdf,.doc,.docx"
                                                                                        onChange={handleFileChange(
                                                                                            "idCard",
                                                                                            setIdCardPreview
                                                                                        )}
                                                                                        className="d-none"
                                                                                    />
                                                                                </Form.Group>
                                                                                <div className="small text-muted mt-2">
                                                                                    PDF,
                                                                                    Images,
                                                                                    Docs.
                                                                                    Max
                                                                                    10MB
                                                                                </div>
                                                                            </Card.Body>
                                                                        </Card>
                                                                    </Col>

                                                                    <Col md={4}>
                                                                        <Card className="border-0 bg-white shadow-sm h-100">
                                                                            <Card.Body className="text-center p-4">
                                                                                <div className="mb-3">
                                                                                    {documentPreview ? (
                                                                                        <div className="position-relative">
                                                                                            <div
                                                                                                className="border rounded d-flex justify-content-center align-items-center bg-light"
                                                                                                style={{
                                                                                                    width: "100%",
                                                                                                    height: 120,
                                                                                                }}
                                                                                            >
                                                                                                <BiFile
                                                                                                    size={
                                                                                                        40
                                                                                                    }
                                                                                                    className="text-success"
                                                                                                />
                                                                                                <span className="ms-2">
                                                                                                    Document
                                                                                                    Uploaded
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div
                                                                                            className="rounded-circle d-flex justify-content-center align-items-center bg-light mx-auto"
                                                                                            style={{
                                                                                                width: 80,
                                                                                                height: 80,
                                                                                            }}
                                                                                        >
                                                                                            <BiFile
                                                                                                size={
                                                                                                    40
                                                                                                }
                                                                                                className="text-success"
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <h6 className="fw-bold">
                                                                                    Other
                                                                                    Documents
                                                                                </h6>
                                                                                <p className="small text-muted mb-3">
                                                                                    Upload
                                                                                    certificates,
                                                                                    contracts,
                                                                                    etc.
                                                                                </p>
                                                                                <Form.Group>
                                                                                    <Form.Label
                                                                                        className="btn btn-outline-success btn-sm w-100 cursor-pointer mb-0"
                                                                                        htmlFor="document"
                                                                                    >
                                                                                        <BiFile className="me-2" />
                                                                                        {documentPreview
                                                                                            ? "Change Documents"
                                                                                            : "Upload Documents"}
                                                                                    </Form.Label>
                                                                                    <Form.Control
                                                                                        type="file"
                                                                                        id="document"
                                                                                        name="document"
                                                                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                                                                        onChange={handleFileChange(
                                                                                            "document",
                                                                                            setDocumentPreview
                                                                                        )}
                                                                                        className="d-none"
                                                                                    />
                                                                                </Form.Group>
                                                                                <div className="small text-muted mt-2">
                                                                                    PDF,
                                                                                    Word,
                                                                                    Excel.
                                                                                    Max
                                                                                    10MB
                                                                                </div>
                                                                            </Card.Body>
                                                                        </Card>
                                                                    </Col>

                                                                    <Col md={4}>
                                                                        <Card className="border-0 bg-info bg-opacity-10 h-100">
                                                                            <Card.Body className="p-4">
                                                                                <h6 className="fw-bold text-info mb-3">
                                                                                    <BiFile className="me-2" />
                                                                                    Document
                                                                                    Information
                                                                                </h6>
                                                                                <p className="small text-muted mb-0">
                                                                                    Upload
                                                                                    important
                                                                                    documents
                                                                                    for
                                                                                    record
                                                                                    keeping.
                                                                                    ID
                                                                                    cards,
                                                                                    certificates,
                                                                                    contracts,
                                                                                    and
                                                                                    other
                                                                                    relevant
                                                                                    documents
                                                                                    should
                                                                                    be
                                                                                    uploaded
                                                                                    here
                                                                                    for
                                                                                    compliance
                                                                                    and
                                                                                    reference.
                                                                                </p>
                                                                            </Card.Body>
                                                                        </Card>
                                                                    </Col>
                                                                </Row>
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
                                                                    Employee
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
                                                                                .status ===
                                                                            "active"
                                                                                ? "This employee is active and can access the system"
                                                                                : "This employee is inactive and cannot access the system"}
                                                                        </small>
                                                                    </div>
                                                                    <div className="d-flex gap-2">
                                                                        <Button
                                                                            variant={
                                                                                formik
                                                                                    .values
                                                                                    .status ===
                                                                                "active"
                                                                                    ? "success"
                                                                                    : "outline-success"
                                                                            }
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                formik.setFieldValue(
                                                                                    "status",
                                                                                    "active"
                                                                                )
                                                                            }
                                                                            className="px-3"
                                                                        >
                                                                            Active
                                                                        </Button>
                                                                        <Button
                                                                            variant={
                                                                                formik
                                                                                    .values
                                                                                    .status ===
                                                                                "inactive"
                                                                                    ? "secondary"
                                                                                    : "outline-secondary"
                                                                            }
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                formik.setFieldValue(
                                                                                    "status",
                                                                                    "inactive"
                                                                                )
                                                                            }
                                                                            className="px-3"
                                                                        >
                                                                            Inactive
                                                                        </Button>
                                                                    </div>
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
                                                                        placeholder="Enter any additional notes or description about this employee..."
                                                                        className="py-2"
                                                                    />
                                                                    <Form.Text className="text-muted">
                                                                        Add any
                                                                        important
                                                                        information
                                                                        that
                                                                        might be
                                                                        useful
                                                                        for HR
                                                                        or
                                                                        management.
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
                                                                    employees
                                                                    can access
                                                                    the system
                                                                    and perform
                                                                    their
                                                                    duties.
                                                                    Inactive
                                                                    employees
                                                                    will be
                                                                    blocked from
                                                                    system
                                                                    access but
                                                                    their data
                                                                    is preserved
                                                                    for record
                                                                    keeping.
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
                                                                    ? "Update Employee"
                                                                    : "Create Employee"}
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
