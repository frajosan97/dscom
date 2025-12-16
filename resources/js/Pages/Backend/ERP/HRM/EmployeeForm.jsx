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
    Container,
} from "react-bootstrap";
import {
    BiUser,
    BiBriefcase,
    BiDollar,
    BiCheckCircle,
    BiFile,
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
import useData from "@/Hooks/useData";
import PersonalDetailsTab from "@/Components/Partials/Employee/PersonalDetailsTab";
import ProfessionalTab from "@/Components/Partials/Employee/ProfessionalTab";
import FinancialTab from "@/Components/Partials/Employee/FinancialTab";
import DocumentsTab from "@/Components/Partials/Employee/DocumentsTab";
import StatusTab from "@/Components/Partials/Employee/StatusTab";

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
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirm_password: "",
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
    status: "active",
    profileImage: null,
    idCard: null,
    document: null,
};

const validationSchema = Yup.object({
    first_name: Yup.string()
        .required("First name is required")
        .min(2, "First name must be at least 2 characters"),
    last_name: Yup.string()
        .required("Last name is required")
        .min(2, "Last name must be at least 2 characters"),
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
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .nullable(),
    confirm_password: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .nullable(),
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
    const formRef = useRef(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);

    // Initialize formik
    const formik = useFormik({
        initialValues: isEdit
            ? {
                  ...DEFAULT_EMPLOYEE_DATA,
                  first_name:
                      employee.first_name ||
                      (employee.name ? employee.name.split(" ")[0] : ""),
                  last_name:
                      employee.last_name ||
                      (employee.name
                          ? employee.name.split(" ").slice(1).join(" ")
                          : ""),
                  email: employee.email || "",
                  phone: employee.phone || "",
                  username: employee.username || "",
                  gender: employee.gender || "male",
                  date_of_birth: employee.date_of_birth || "",
                  qualification: employee.qualification || "",
                  designation: employee.designation || "",
                  salary_type: employee.salary_type || "",
                  salary: employee.salary || "",
                  blood_group: employee.blood_group || "",
                  role: employee.role || "",
                  ending_date: employee.ending_date || "",
                  opening_balance: employee.opening_balance || "0",
                  address: employee.address || "",
                  description: employee.description || "",
                  status:
                      employee.status === "Enable"
                          ? "active"
                          : employee.status === "Disable"
                          ? "inactive"
                          : employee.status || "active",
              }
            : DEFAULT_EMPLOYEE_DATA,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (isFormSubmitting) return;

            try {
                setIsFormSubmitting(true);
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

                if (!result.isConfirmed) {
                    setIsFormSubmitting(false);
                    return;
                }

                setLoading(true);

                const formData = new FormData();
                for (const key in values) {
                    if (values[key] !== null && values[key] !== undefined) {
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

                setTimeout(() => {
                    window.location.href = route("employee.index");
                }, 1500);
            } catch (err) {
                showErrorToast(err);
                setIsFormSubmitting(false);
            } finally {
                setLoading(false);
            }
        },
    });

    // Initialize previews when component mounts or employee data changes
    useEffect(() => {
        if (isEdit && employee) {
            if (employee.profile_image_url) {
                setPhotoPreview(employee.profile_image_url);
            }

            if (employee.id_card_url) {
                setIdCardPreview(employee.id_card_url);
            }
            if (employee.document_url) {
                setDocumentPreview(employee.document_url);
            }
        }
    }, [employee, isEdit]);

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (photoPreview && photoPreview.startsWith("blob:")) {
                URL.revokeObjectURL(photoPreview);
            }
            if (idCardPreview && idCardPreview.startsWith("blob:")) {
                URL.revokeObjectURL(idCardPreview);
            }
            if (documentPreview && documentPreview.startsWith("blob:")) {
                URL.revokeObjectURL(documentPreview);
            }
        };
    }, [photoPreview, idCardPreview, documentPreview]);

    const handlePhotoChange = (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            formik.setFieldValue("profileImage", file);
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

    const handleTabSelect = (key) => {
        if (key !== activeKey) {
            setActiveKey(key);
        }
    };

    return (
        <ErpLayout>
            <Head title={isEdit ? "Edit Employee" : "Create Employee"} />

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

                            {/* Content */}
                            <Col lg={9}>
                                <Card className="shadow-sm border-0">
                                    <Card.Body>
                                        <Tab.Content>
                                            <Tab.Pane eventKey="personal">
                                                <PersonalDetailsTab
                                                    formik={formik}
                                                    photoPreview={photoPreview}
                                                    handlePhotoChange={
                                                        handlePhotoChange
                                                    }
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="professional">
                                                <ProfessionalTab
                                                    formik={formik}
                                                    roles={roles}
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="financial">
                                                <FinancialTab formik={formik} />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="documents">
                                                <DocumentsTab
                                                    formik={formik}
                                                    idCardPreview={
                                                        idCardPreview
                                                    }
                                                    documentPreview={
                                                        documentPreview
                                                    }
                                                    handleFileChange={
                                                        handleFileChange
                                                    }
                                                    setIdCardPreview={
                                                        setIdCardPreview
                                                    }
                                                    setDocumentPreview={
                                                        setDocumentPreview
                                                    }
                                                />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="status">
                                                <StatusTab
                                                    formik={formik}
                                                    isEdit={isEdit}
                                                    employee={employee}
                                                />
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
                                                                    ? "Update Employee"
                                                                    : "Create Employee"}
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
