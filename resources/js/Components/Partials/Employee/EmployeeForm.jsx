import { router } from "@inertiajs/react";
import {
    Form,
    Row,
    Col,
    ButtonGroup,
    Button,
    Card,
    InputGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "@inertiajs/react";
import { useState, useCallback, useEffect } from "react";
import xios from "@/Utils/axios";
import * as yup from "yup";
import useData from "@/Hooks/useData";

// Yup validation schema
const employeeSchema = yup.object().shape({
    name: yup
        .string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email format").nullable(),
    phone: yup
        .string()
        .required("Phone number is required")
        .matches(/^[0-9+\-\s()]{10,}$/, "Invalid phone number format"),
    qualification: yup.string().nullable(),
    designation: yup.string().nullable(),
    role: yup.string().required("Role is required"),
    address: yup.string().nullable(),
    description: yup.string().nullable(),
    status: yup.string().oneOf(["Enable", "Disable"], "Invalid status"),
});

export default function EmployeeForm({ employee = null, onSuccess }) {
    const { roles } = useData();

    const { data, setData, errors } = useForm({
        name: employee?.name || "",
        email: employee?.email || "",
        phone: employee?.phone || "",
        username: employee?.username || "",
        password: "",
        consfirm_password: "",
        gender: employee?.gender || "Male",
        age: employee?.age || "",
        qualification: employee?.qualification || "",
        designation: employee?.designation || "",
        salaryType: employee?.salaryType || "",
        salary: employee?.salary || "",
        bloodGroup: employee?.bloodGroup || "",
        role: employee?.role || "",
        endingDate: employee?.endingDate || "16/08/2026",
        openingBalance: employee?.openingBalance || "0",
        address: employee?.address || "",
        description: employee?.description || "",
        status: employee?.status || "Enable",
        profileImage: null,
        idCard: null,
        document: null,
        _method: employee ? "PUT" : "POST",
    });

    const [processing, setProcessing] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    }, []);

    const handleChange = useCallback(
        (e) => {
            const { name, value, type, files } = e.target;

            // Handle numeric fields
            let processedValue = value;
            if (["age", "salary", "openingBalance"].includes(name)) {
                processedValue = value === "" ? "" : Number(value);
            }

            setData(name, type === "file" ? files[0] : processedValue);

            // Clear validation error when user starts typing
            if (validationErrors[name]) {
                setValidationErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [setData, validationErrors]
    );

    // Validate form using Yup
    const validateForm = useCallback(async () => {
        try {
            await employeeSchema.validate(data, { abortEarly: false });
            setValidationErrors({});
            return true;
        } catch (err) {
            const newErrors = {};
            err.inner.forEach((error) => {
                newErrors[error.path] = error.message;
            });
            setValidationErrors(newErrors);
            return false;
        }
    }, [data]);

    useEffect(() => {
        if (Object.keys(touched).length > 0) {
            validateForm();
        }
    }, [data, touched, validateForm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched(
            Object.keys(data).reduce(
                (acc, key) => ({ ...acc, [key]: true }),
                {}
            )
        );

        const isValid = await validateForm();
        if (!isValid) {
            toast.error("Please fix the validation errors");
            return;
        }

        setProcessing(true);

        try {
            const formData = new FormData();
            Object.keys(data).forEach((key) => {
                if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });

            const postUrl = employee
                ? route("employee.update", employee.id)
                : route("employee.store");

            const response = await xios.post(postUrl, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                toast.success(response.data.message);
                router.visit(route("employee.index"));
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while creating the employee"
            );
            console.error("Employee creation error:", error);
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = useCallback(() => {
        if (onSuccess) {
            onSuccess();
        } else {
            router.visit(route("employee.index"));
        }
    }, [onSuccess]);

    // Form field configuration for consistent styling
    const formControlProps = {
        size: "sm",
        className: "rounded-0",
    };

    const getFieldError = (fieldName) => {
        return validationErrors[fieldName] || errors[fieldName];
    };

    const isFieldInvalid = (fieldName) => {
        return touched[fieldName] && !!getFieldError(fieldName);
    };

    return (
        <Form
            id="userForm"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
        >
            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">
                        {employee ? "Update Employee" : "New Employee"}
                    </h6>
                    <ButtonGroup className="gap-2">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="rounded-0"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            className="rounded-0"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? "Processing..." : "Save"}
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body>
                    <Row>
                        {/* Personal Information Section */}
                        <Col md={12}>
                            <h6 className="mb-2 fw-semibold bg-light p-1 text-muted">
                                Personal Information
                            </h6>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="name">
                                <Form.Label className="small fw-semibold">
                                    Name*
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="John Doe"
                                    required
                                    isInvalid={isFieldInvalid("name")}
                                />
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("name")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="email">
                                <Form.Label className="small fw-semibold">
                                    Email
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="john.doe@example.com"
                                    isInvalid={isFieldInvalid("email")}
                                />
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("email")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="phone">
                                <Form.Label className="small fw-semibold">
                                    Phone*
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="tel"
                                    name="phone"
                                    value={data.phone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="+1-555-0123"
                                    required
                                    isInvalid={isFieldInvalid("phone")}
                                />
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("phone")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="username">
                                <Form.Label className="small fw-semibold">
                                    Username
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="johndoe123"
                                    isInvalid={isFieldInvalid("username")}
                                />
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("username")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {data.username && (
                            <>
                                <Col md={2} className="mb-2">
                                    <Form.Group controlId="password">
                                        <Form.Label className="small fw-semibold">
                                            Password
                                        </Form.Label>
                                        <Form.Control
                                            {...formControlProps}
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="••••••"
                                            isInvalid={isFieldInvalid(
                                                "password"
                                            )}
                                        />
                                        <Form.Control.Feedback
                                            type="invalid"
                                            className="small"
                                        >
                                            {getFieldError("password")}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={2} className="mb-2">
                                    <Form.Group controlId="consfirm_password">
                                        <Form.Label className="small fw-semibold">
                                            Confirm Password
                                        </Form.Label>
                                        <Form.Control
                                            {...formControlProps}
                                            type="password"
                                            name="consfirm_password"
                                            value={data.consfirm_password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="••••••"
                                            isInvalid={isFieldInvalid(
                                                "consfirm_password"
                                            )}
                                        />
                                        <Form.Control.Feedback
                                            type="invalid"
                                            className="small"
                                        >
                                            {getFieldError("consfirm_password")}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </>
                        )}

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="gender">
                                <Form.Label className="small fw-semibold">
                                    Gender
                                </Form.Label>
                                <Form.Select
                                    {...formControlProps}
                                    name="gender"
                                    value={data.gender}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={isFieldInvalid("gender")}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="age">
                                <Form.Label className="small fw-semibold">
                                    Age
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="number"
                                    name="age"
                                    value={data.age}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="30"
                                    min="18"
                                    max="70"
                                    isInvalid={isFieldInvalid("age")}
                                />
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("age")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Professional Information Section */}
                        <Col md={12} className="mt-3">
                            <h6 className="mb-2 fw-semibold bg-light p-1 text-muted">
                                Professional Information
                            </h6>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="qualification">
                                <Form.Label className="small fw-semibold">
                                    Qualification
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="text"
                                    name="qualification"
                                    value={data.qualification}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Bachelor's Degree"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="designation">
                                <Form.Label className="small fw-semibold">
                                    Designation
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="text"
                                    name="designation"
                                    value={data.designation}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Software Engineer"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="salaryType">
                                <Form.Label className="small fw-semibold">
                                    Salary Type
                                </Form.Label>
                                <Form.Select
                                    {...formControlProps}
                                    name="salaryType"
                                    value={data.salaryType}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={isFieldInvalid("salaryType")}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Daily">Daily</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="salary">
                                <Form.Label className="small fw-semibold">
                                    Salary
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="number"
                                    name="salary"
                                    value={data.salary}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="50000"
                                    step="0.01"
                                    min="0"
                                    isInvalid={isFieldInvalid("salary")}
                                />
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("salary")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="bloodGroup">
                                <Form.Label className="small fw-semibold">
                                    Blood Group
                                </Form.Label>
                                <Form.Select
                                    {...formControlProps}
                                    name="bloodGroup"
                                    value={data.bloodGroup}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={isFieldInvalid("bloodGroup")}
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="role">
                                <Form.Label className="small fw-semibold">
                                    Role*
                                </Form.Label>
                                <Form.Select
                                    {...formControlProps}
                                    name="role"
                                    value={data.role}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    isInvalid={isFieldInvalid("role")}
                                >
                                    <option value="">Select Role</option>
                                    {roles?.map((role) => (
                                        <option
                                            key={role.name}
                                            value={role.name}
                                            className="text-capitalize"
                                        >
                                            {role.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("role")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Additional Information Section */}
                        <Col md={12} className="mt-3">
                            <h6 className="mb-2 fw-semibold bg-light p-1 text-muted">
                                Additional Information
                            </h6>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="endingDate">
                                <Form.Label className="small fw-semibold">
                                    Ending Date
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="date"
                                    name="endingDate"
                                    value={data.endingDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={isFieldInvalid("endingDate")}
                                />
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("endingDate")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={2} className="mb-2">
                            <Form.Group controlId="openingBalance">
                                <Form.Label className="small fw-semibold">
                                    Opening Balance
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="number"
                                    name="openingBalance"
                                    value={data.openingBalance}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    isInvalid={isFieldInvalid("openingBalance")}
                                />
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("openingBalance")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={4} className="mb-2">
                            <Form.Group controlId="address">
                                <Form.Label className="small fw-semibold">
                                    Address
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    as="textarea"
                                    rows={1}
                                    name="address"
                                    value={data.address}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="123 Main St, City, State, ZIP Code"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4} className="mb-2">
                            <Form.Group controlId="description">
                                <Form.Label className="small fw-semibold">
                                    Description
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    as="textarea"
                                    rows={1}
                                    name="description"
                                    value={data.description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Additional information about the employee"
                                />
                            </Form.Group>
                        </Col>

                        {/* Status and Files Section */}
                        <Col md={12} className="mt-3">
                            <h6 className="mb-2 fw-semibold bg-light p-1 text-muted">
                                Status & Documents
                            </h6>
                        </Col>

                        <Col md={3} className="mb-2">
                            <Form.Group controlId="profileImage">
                                <Form.Label className="small fw-semibold">
                                    Profile Image
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="file"
                                    name="profileImage"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    accept="image/jpeg,image/png,image/gif"
                                    isInvalid={isFieldInvalid("profileImage")}
                                />
                                <Form.Text className="text-muted small">
                                    Max 5MB (JPEG, PNG, GIF)
                                </Form.Text>
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("profileImage")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={3} className="mb-2">
                            <Form.Group controlId="idCard">
                                <Form.Label className="small fw-semibold">
                                    ID Card
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="file"
                                    name="idCard"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={isFieldInvalid("idCard")}
                                />
                                <Form.Text className="text-muted small">
                                    Max 10MB
                                </Form.Text>
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("idCard")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={3} className="mb-2">
                            <Form.Group controlId="document">
                                <Form.Label className="small fw-semibold">
                                    Document
                                </Form.Label>
                                <Form.Control
                                    {...formControlProps}
                                    type="file"
                                    name="document"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={isFieldInvalid("document")}
                                />
                                <Form.Text className="text-muted small">
                                    Max 10MB
                                </Form.Text>
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="small"
                                >
                                    {getFieldError("document")}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={3} className="mb-2">
                            <Form.Label className="small fw-semibold">
                                Status
                            </Form.Label>
                            <InputGroup {...formControlProps}>
                                <Form.Check
                                    inline
                                    type="radio"
                                    label="Enable"
                                    name="status"
                                    id="enable"
                                    value="Enable"
                                    checked={data.status === "Enable"}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="small"
                                />
                                <Form.Check
                                    inline
                                    type="radio"
                                    label="Disable"
                                    name="status"
                                    id="disable"
                                    value="Disable"
                                    checked={data.status === "Disable"}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="small"
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Form>
    );
}
