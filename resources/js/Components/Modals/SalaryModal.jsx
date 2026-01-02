// SalaryModal.jsx
import React, { useState, useEffect } from "react";
import {
    Modal,
    Form,
    Button,
    Row,
    Col,
    Card,
    InputGroup,
} from "react-bootstrap";
import {
    BiPlus,
    BiX,
    BiCalculator,
    BiDollar,
    BiCalendar,
} from "react-icons/bi";

// Helper function to get days in month
const getDaysInMonth = (month, year) => {
    const monthIndex = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ].indexOf(month);

    if (monthIndex === -1) return 31; // Default fallback

    // Create date for next month and subtract one day
    return new Date(year, monthIndex + 1, 0).getDate();
};

// Helper function for number formatting
const formatNumber = (value, decimals = 2) => {
    return parseFloat(value || 0).toFixed(decimals);
};

// Helper function to parse and validate number input
const parseNumber = (
    value,
    defaultValue = 0,
    min = -Infinity,
    max = Infinity
) => {
    const num = parseFloat(value);
    if (isNaN(num)) return defaultValue;
    return Math.max(min, Math.min(max, num));
};

// Helper function to parse and validate integer input
const parseInteger = (value, defaultValue = 0, min = 0, max = 31) => {
    const int = parseInt(value);
    if (isNaN(int)) return defaultValue;
    return Math.max(min, Math.min(max, int));
};

// Dynamic Field Component
const DynamicField = ({ field, index, onUpdate, onRemove }) => (
    <div className="d-flex align-items-center mb-2">
        <Form.Control
            type="text"
            placeholder="Description"
            value={field.description}
            onChange={(e) => onUpdate(index, "description", e.target.value)}
            className="me-2 flex-grow-1"
            size="sm"
        />
        <InputGroup size="sm" className="me-2" style={{ width: "150px" }}>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control
                type="number"
                placeholder="Amount"
                value={field.amount === 0 ? "" : field.amount}
                onChange={(e) =>
                    onUpdate(index, "amount", parseNumber(e.target.value, 0, 0))
                }
                step="0.01"
                min="0"
                onBlur={(e) => {
                    if (e.target.value === "") {
                        onUpdate(index, "amount", 0);
                    }
                }}
            />
        </InputGroup>
        <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onRemove(index)}
            className="flex-shrink-0"
        >
            <BiX />
        </Button>
    </div>
);

// Dynamic Field Section Component
const DynamicFieldSection = ({
    title,
    fields,
    fieldType,
    onAdd,
    onUpdate,
    onRemove,
    color = "primary",
}) => (
    <Card className={`border-${color} h-100`}>
        <Card.Header
            className={`bg-${color} text-white d-flex justify-content-between align-items-center py-2`}
        >
            <h6 className="mb-0">{title}</h6>
            <Button
                variant="light"
                size="sm"
                onClick={() => onAdd(fieldType)}
                className="px-2 py-1"
            >
                <BiPlus size={14} />
            </Button>
        </Card.Header>
        <Card.Body
            className="p-3"
            style={{ maxHeight: "300px", overflowY: "auto" }}
        >
            {fields.length === 0 ? (
                <div className="text-center text-muted py-3">
                    <small>No {title.toLowerCase()} added yet</small>
                </div>
            ) : (
                fields.map((field, index) => (
                    <DynamicField
                        key={index}
                        field={field}
                        index={index}
                        onUpdate={(idx, field, value) =>
                            onUpdate(fieldType, idx, field, value)
                        }
                        onRemove={(idx) => onRemove(fieldType, idx)}
                    />
                ))
            )}
        </Card.Body>
    </Card>
);

// Summary Card Component
const SummaryCard = ({
    title,
    amount,
    color = "primary",
    prefix = "$",
    size = "h5",
}) => (
    <div className={`text-center p-3 border rounded border-${color} bg-white`}>
        <small className="text-muted d-block">{title}</small>
        <div className={`text-${color} mb-0 ${size === "h5" ? "h5" : "h4"}`}>
            {prefix}
            {amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </div>
    </div>
);

const SalaryModal = ({
    show,
    onHide,
    onSubmit,
    formData,
    setFormData,
    selectedSalary,
    employees,
    months,
    years,
}) => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Calculate all values
    const calculateSummary = () => {
        const basic = parseFloat(formData.basic_salary) || 0;
        const dailyRate = parseFloat(formData.daily_rate) || 0;
        const daysPresent = parseInt(formData.days_present) || 0;

        // Real Salary
        const realSalary = dailyRate * daysPresent;

        // Total Allowances
        const allowancesTotal = formData.allowances.reduce(
            (sum, item) => sum + (parseFloat(item.amount) || 0),
            0
        );
        const bonusTotal = parseFloat(formData.bonus) || 0;
        const qualityBonusTotal = parseFloat(formData.quality_bonus) || 0;
        const overtimeTotal =
            (parseFloat(formData.overtime_hours) || 0) *
            (parseFloat(formData.overtime_rate) || 0);
        const regularizationTotal = parseFloat(formData.regularization) || 0;
        const otherAllowancesTotal = formData.other_allowances.reduce(
            (sum, item) => sum + (parseFloat(item.amount) || 0),
            0
        );

        const totalAllowances =
            allowancesTotal +
            bonusTotal +
            qualityBonusTotal +
            overtimeTotal +
            regularizationTotal +
            otherAllowancesTotal;

        // Gross Salary
        const grossSalary = realSalary + totalAllowances;

        // Total Deductions
        const deductionsTotal = formData.deductions.reduce(
            (sum, item) => sum + (parseFloat(item.amount) || 0),
            0
        );
        const transportDeduction =
            parseFloat(formData.transport_deduction) || 0;
        const advanceSalary = parseFloat(formData.advance_salary) || 0;
        const daysDeduction = dailyRate * (parseInt(formData.days_absent) || 0);
        const disciplinaryDeductionsTotal =
            formData.disciplinary_deductions.reduce(
                (sum, item) => sum + (parseFloat(item.amount) || 0),
                0
            );
        const productLoss = parseFloat(formData.product_loss) || 0;
        const otherDeductionsTotal = formData.other_deductions.reduce(
            (sum, item) => sum + (parseFloat(item.amount) || 0),
            0
        );

        const totalDeductions =
            deductionsTotal +
            transportDeduction +
            advanceSalary +
            daysDeduction +
            disciplinaryDeductionsTotal +
            productLoss +
            otherDeductionsTotal;

        // Net Salary
        const netSalary = Math.max(0, grossSalary - totalDeductions);

        // Currency Conversion
        const exchangeRate = parseFloat(formData.exchange_rate) || 1;
        const netInUsd =
            formData.currency === "CDF" ? netSalary / exchangeRate : netSalary;
        const netInCdf =
            formData.currency === "USD" ? netSalary * exchangeRate : netSalary;

        return {
            real_salary: realSalary,
            gross_salary: grossSalary,
            net_salary: netSalary,
            net_in_usd: netInUsd,
            net_in_cdf: netInCdf,
            total_allowances: totalAllowances,
            total_deductions: totalDeductions,
            days_deduction: daysDeduction,
        };
    };

    const summary = calculateSummary();

    // Handle input changes with validation
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        let processedValue = value;

        if (type === "number") {
            processedValue = parseNumber(value, 0);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));
    };

    // Handle month/year change to update total days
    useEffect(() => {
        if (formData.month && formData.year) {
            const daysInMonth = getDaysInMonth(formData.month, formData.year);

            setFormData((prev) => {
                const currentTotalDays = parseInt(prev.total_days) || 26;
                const currentDaysPresent = parseInt(prev.days_present) || 0;

                // If changing to a month with different days, adjust days present
                const newDaysPresent = Math.min(
                    currentDaysPresent,
                    daysInMonth
                );

                return {
                    ...prev,
                    total_days: daysInMonth,
                    days_present: newDaysPresent,
                    days_absent: daysInMonth - newDaysPresent,
                };
            });
        }
    }, [formData.month, formData.year]);

    // Handle employee selection
    const handleEmployeeSelect = (employeeId) => {
        const employee = employees.find((e) => e.id === parseInt(employeeId));
        if (employee) {
            setSelectedEmployee(employee);

            // Calculate total days in the selected month
            const daysInMonth =
                formData.month && formData.year
                    ? getDaysInMonth(formData.month, formData.year)
                    : 26; // Default fallback

            // Calculate daily rate based on total days in the month
            const dailyRate =
                employee.salary && daysInMonth > 0
                    ? Math.round((employee.salary / daysInMonth) * 100) / 100
                    : 0;

            setFormData((prev) => ({
                ...prev,
                employee_id: employeeId,
                employee_code: employee.code || `EMP-${employeeId}`,
                basic_salary: employee.salary || 0,
                daily_rate: dailyRate,
                daily_transport_rate: 8.27,
                total_days: daysInMonth, // Ensure total_days is set
            }));
        }
    };

    // Dynamic field handlers
    const addDynamicField = (fieldType) => {
        const newField = { description: "", amount: 0 };
        setFormData((prev) => ({
            ...prev,
            [fieldType]: [...prev[fieldType], newField],
        }));
    };

    const updateDynamicField = (fieldType, index, field, value) => {
        setFormData((prev) => {
            const updatedFields = [...prev[fieldType]];
            updatedFields[index] = { ...updatedFields[index], [field]: value };
            return { ...prev, [fieldType]: updatedFields };
        });
    };

    const removeDynamicField = (fieldType, index) => {
        setFormData((prev) => ({
            ...prev,
            [fieldType]: prev[fieldType].filter((_, i) => i !== index),
        }));
    };

    // Attendance calculation with proper validation
    const updateAttendance = (field, value) => {
        const totalDays =
            parseInt(formData.total_days) ||
            getDaysInMonth(formData.month, formData.year);

        if (field === "total_days") {
            const newTotalDays = parseInteger(value, totalDays, 1, 31);
            const currentDaysPresent = parseInt(formData.days_present) || 0;

            setFormData((prev) => ({
                ...prev,
                total_days: newTotalDays,
                days_present: Math.min(currentDaysPresent, newTotalDays),
                days_absent:
                    newTotalDays - Math.min(currentDaysPresent, newTotalDays),
            }));

            // Update daily rate when total days changes
            if (formData.basic_salary && newTotalDays > 0) {
                const newDailyRate =
                    Math.round((formData.basic_salary / newTotalDays) * 100) /
                    100;
                setFormData((prev) => ({
                    ...prev,
                    daily_rate: newDailyRate,
                }));
            }
        } else if (field === "days_present") {
            const newDaysPresent = parseInteger(value, 0, 0, totalDays);

            setFormData((prev) => ({
                ...prev,
                days_present: newDaysPresent,
                days_absent: totalDays - newDaysPresent,
            }));
        }
    };

    // Update daily rate when basic salary changes
    useEffect(() => {
        if (
            formData.basic_salary &&
            formData.total_days &&
            formData.total_days > 0
        ) {
            const newDailyRate =
                Math.round(
                    (formData.basic_salary / formData.total_days) * 100
                ) / 100;
            // Only update if the calculated value is different from current
            if (Math.abs(newDailyRate - (formData.daily_rate || 0)) > 0.01) {
                setFormData((prev) => ({
                    ...prev,
                    daily_rate: newDailyRate,
                }));
            }
        }
    }, [formData.basic_salary, formData.total_days]);

    // Initialize form with default total days
    useEffect(() => {
        if (show && !formData.total_days && formData.month && formData.year) {
            const daysInMonth = getDaysInMonth(formData.month, formData.year);
            setFormData((prev) => ({
                ...prev,
                total_days: daysInMonth,
                days_present: prev.days_present || 0,
                days_absent: daysInMonth - (prev.days_present || 0),
            }));
        }
    }, [show, formData.month, formData.year]);

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="xl"
            centered
            dialogClassName="modal-fullscreen-lg-down"
        >
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <BiCalculator className="me-2" />
                    {selectedSalary
                        ? "Edit Payroll Record"
                        : "Create New Payroll"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body
                className="p-0"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="p-4">
                        {/* Header Info */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">
                                        <BiDollar className="me-1" />
                                        Select Employee *
                                    </Form.Label>
                                    <Form.Select
                                        name="employee_id"
                                        value={formData.employee_id}
                                        onChange={(e) =>
                                            handleEmployeeSelect(e.target.value)
                                        }
                                        required
                                        className="border-primary"
                                    >
                                        <option value="">
                                            Choose employee...
                                        </option>
                                        {employees.map((employee) => (
                                            <option
                                                key={employee.id}
                                                value={employee.id}
                                            >
                                                {employee.name} -{" "}
                                                {employee.code ||
                                                    `EMP-${employee.id}`}
                                                {employee.salary &&
                                                    ` ($${employee.salary.toLocaleString()})`}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">
                                        Employee Code
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="employee_code"
                                        value={formData.employee_code}
                                        readOnly
                                        className="bg-light"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Period and Basic Info */}
                        <Card className="mb-4">
                            <Card.Header className="bg-light">
                                <h6 className="mb-0">
                                    Period & Basic Information
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <Row className="g-3">
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Month *</Form.Label>
                                            <Form.Select
                                                name="month"
                                                value={formData.month}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                {months.map((month) => (
                                                    <option
                                                        key={month}
                                                        value={month}
                                                    >
                                                        {month}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Year *</Form.Label>
                                            <Form.Select
                                                name="year"
                                                value={formData.year}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                {years.map((year) => (
                                                    <option
                                                        key={year}
                                                        value={year}
                                                    >
                                                        {year}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Currency</Form.Label>
                                            <Form.Select
                                                name="currency"
                                                value={formData.currency}
                                                onChange={handleInputChange}
                                            >
                                                <option value="USD">
                                                    USD ($)
                                                </option>
                                                <option value="CDF">
                                                    CDF (FC)
                                                </option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Status</Form.Label>
                                            <Form.Select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="pending">
                                                    Pending
                                                </option>
                                                <option value="processing">
                                                    Processing
                                                </option>
                                                <option value="paid">
                                                    Paid
                                                </option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Salary and Attendance */}
                        <Row className="mb-4">
                            <Col md={8}>
                                <Card className="h-100">
                                    <Card.Header className="bg-light">
                                        <h6 className="mb-0">
                                            Salary Calculation
                                        </h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>
                                                        Basic Salary
                                                    </Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>
                                                            $
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            name="basic_salary"
                                                            value={
                                                                formData.basic_salary ===
                                                                0
                                                                    ? ""
                                                                    : formData.basic_salary
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.01"
                                                            min="0"
                                                            onBlur={(e) => {
                                                                if (
                                                                    e.target
                                                                        .value ===
                                                                    ""
                                                                ) {
                                                                    setFormData(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            basic_salary: 0,
                                                                        })
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </InputGroup>
                                                    <Form.Text className="text-muted">
                                                        Monthly salary divided
                                                        by{" "}
                                                        {formData.total_days ||
                                                            "total"}{" "}
                                                        days
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>
                                                        Daily Rate
                                                    </Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>
                                                            $
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            name="daily_rate"
                                                            value={
                                                                formData.daily_rate ===
                                                                0
                                                                    ? ""
                                                                    : formData.daily_rate
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            step="0.01"
                                                            min="0"
                                                            onBlur={(e) => {
                                                                if (
                                                                    e.target
                                                                        .value ===
                                                                    ""
                                                                ) {
                                                                    setFormData(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            daily_rate: 0,
                                                                        })
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </InputGroup>
                                                    <Form.Text className="text-muted">
                                                        $
                                                        {formData.basic_salary ||
                                                            0}{" "}
                                                        ÷{" "}
                                                        {formData.total_days ||
                                                            "--"}{" "}
                                                        days = $
                                                        {formData.daily_rate ||
                                                            0}{" "}
                                                        per day
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="h-100">
                                    <Card.Header className="bg-light">
                                        <h6 className="mb-0">
                                            <BiCalendar className="me-1" />
                                            Attendance
                                        </h6>
                                        <small className="text-muted">
                                            Total days:{" "}
                                            {getDaysInMonth(
                                                formData.month,
                                                formData.year
                                            )}{" "}
                                            days this month
                                        </small>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="g-2">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>
                                                        Total Days
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={
                                                            formData.total_days
                                                        }
                                                        onChange={(e) =>
                                                            updateAttendance(
                                                                "total_days",
                                                                e.target.value
                                                            )
                                                        }
                                                        min="1"
                                                        max="31"
                                                        onBlur={(e) => {
                                                            if (
                                                                !e.target
                                                                    .value ||
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) < 1
                                                            ) {
                                                                const daysInMonth =
                                                                    getDaysInMonth(
                                                                        formData.month,
                                                                        formData.year
                                                                    );
                                                                setFormData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        total_days:
                                                                            daysInMonth,
                                                                        days_absent:
                                                                            daysInMonth -
                                                                            (prev.days_present ||
                                                                                0),
                                                                    })
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Form.Text className="text-muted">
                                                        Working days in month
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>
                                                        Present
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={
                                                            formData.days_present
                                                        }
                                                        onChange={(e) =>
                                                            updateAttendance(
                                                                "days_present",
                                                                e.target.value
                                                            )
                                                        }
                                                        min="0"
                                                        max={
                                                            formData.total_days ||
                                                            getDaysInMonth(
                                                                formData.month,
                                                                formData.year
                                                            )
                                                        }
                                                        onBlur={(e) => {
                                                            if (
                                                                !e.target
                                                                    .value ||
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) < 0
                                                            ) {
                                                                setFormData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        days_present: 0,
                                                                        days_absent:
                                                                            prev.total_days ||
                                                                            getDaysInMonth(
                                                                                formData.month,
                                                                                formData.year
                                                                            ),
                                                                    })
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>
                                                        Absent
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={
                                                            formData.days_absent
                                                        }
                                                        readOnly
                                                        className="bg-light"
                                                    />
                                                    <Form.Text className="text-muted">
                                                        Daily rate deduction: $
                                                        {(formData.daily_rate ||
                                                            0) *
                                                            (formData.days_absent ||
                                                                0)}
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Allowances and Deductions */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <DynamicFieldSection
                                    title="Allowances"
                                    fields={formData.allowances}
                                    fieldType="allowances"
                                    onAdd={addDynamicField}
                                    onUpdate={updateDynamicField}
                                    onRemove={removeDynamicField}
                                    color="success"
                                />
                            </Col>
                            <Col md={6}>
                                <DynamicFieldSection
                                    title="Deductions"
                                    fields={formData.deductions}
                                    fieldType="deductions"
                                    onAdd={addDynamicField}
                                    onUpdate={updateDynamicField}
                                    onRemove={removeDynamicField}
                                    color="danger"
                                />
                            </Col>
                        </Row>

                        {/* Summary Section */}
                        <Card className="mb-4 border-primary">
                            <Card.Header className="bg-primary text-white">
                                <h6 className="mb-0">Salary Summary</h6>
                            </Card.Header>
                            <Card.Body>
                                <Row className="g-3">
                                    <Col md={3}>
                                        <SummaryCard
                                            title="Real Salary"
                                            amount={summary.real_salary}
                                            color="info"
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <SummaryCard
                                            title="Total Allowances"
                                            amount={summary.total_allowances}
                                            color="success"
                                            prefix="+$"
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <SummaryCard
                                            title="Total Deductions"
                                            amount={summary.total_deductions}
                                            color="danger"
                                            prefix="-$"
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-center p-3 border rounded border-primary bg-white">
                                            <small className="text-muted d-block">
                                                Net Salary
                                            </small>
                                            <h4 className="text-primary mb-1">
                                                $
                                                {summary.net_salary.toLocaleString(
                                                    undefined,
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </h4>
                                            <small className="text-muted">
                                                CDF:{" "}
                                                {summary.net_in_cdf.toLocaleString()}
                                            </small>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <Card.Header className="bg-light">
                                <h6 className="mb-0">Additional Information</h6>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Notes</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                placeholder="Additional notes or comments..."
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </div>
                </Form>
            </Modal.Body>

            <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    type="submit"
                    onClick={() => onSubmit()}
                >
                    {selectedSalary ? "Update Payroll" : "Save Payroll"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SalaryModal;
