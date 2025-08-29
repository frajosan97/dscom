import useData from "@/Hooks/useData";
import { useMemo } from "react";
import { Card, Row, Col, Form } from "react-bootstrap";
import Select from "react-select";

const JobDetails = ({ jobDetailsData, setJobDetailsData, errors = {} }) => {
    const { services } = useData();

    /** Helper: update job details state */
    const handleChange = (field, value) => {
        setJobDetailsData((prev) => ({ ...prev, [field]: value }));
    };

    /** Complaint options */
    const complaintOptions = services?.map((service) => ({
        value: service.id,
        label: service.name,
    }));

    /** Current selected complaint for react-select */
    const currentComplaintValue = useMemo(() => {
        if (!jobDetailsData?.repair_service_id) return null;

        const option = complaintOptions.find(
            (opt) => opt.value === jobDetailsData.repair_service_id
        );

        return (
            option || {
                value: jobDetailsData.repair_service_id,
                label: "Name"
                // label:
                //     jobDetailsData.repair_service_id.charAt(0).toUpperCase() +
                //     jobDetailsData.repair_service_id.slice(1),
            }
        );
    }, [jobDetailsData?.repair_service_id, complaintOptions]);

    return (
        <>
            {/* Job Information */}
            <Card className="border-0 rounded-0 shadow-sm mb-3">
                <Card.Header className="bg-transparent fw-semibold">
                    Job Information
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        {/* Job Number */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label htmlFor="orderNumber">
                                    Job Number
                                </Form.Label>
                                <Form.Control
                                    id="orderNumber"
                                    type="text"
                                    value={jobDetailsData?.order_number || ""}
                                    placeholder="Auto-generated"
                                    disabled
                                    className="bg-light"
                                />
                            </Form.Group>
                        </Col>

                        {/* Entry Date */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label htmlFor="entryDate">
                                    Entry Date{" "}
                                    <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    id="entryDate"
                                    type="date"
                                    value={jobDetailsData?.entry_date || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "entry_date",
                                            e.target.value
                                        )
                                    }
                                    isInvalid={!!errors.entry_date}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.entry_date}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Warranty */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Warranty Status</Form.Label>
                                <div>
                                    {[
                                        { value: "out", label: "Out Warranty" },
                                        { value: "on", label: "On Warranty" },
                                    ].map((status) => (
                                        <Form.Check
                                            key={status.value}
                                            inline
                                            type="radio"
                                            id={`warranty-${status.value}`}
                                            label={status.label}
                                            name="warranty"
                                            value={status.value}
                                            checked={
                                                jobDetailsData?.warranty ===
                                                status.value
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "warranty",
                                                    e.target.value
                                                )
                                            }
                                            className="fw-medium"
                                        />
                                    ))}
                                </div>
                                {errors.warranty && (
                                    <div className="invalid-feedback d-block">
                                        {errors.warranty}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Customer + Device Information */}
            <Row>
                {/* Device Information */}
                <Col md={6}>
                    <Card className="border-0 rounded-0 shadow-sm mb-3">
                        <Card.Header className="bg-transparent fw-semibold">
                            Device Information
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                {/* Company */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label htmlFor="company">
                                            Company{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Control
                                            id="company"
                                            value={
                                                jobDetailsData?.company || ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "company",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Search Company"
                                            isInvalid={!!errors.company}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.company}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                {/* brand */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label htmlFor="brand">
                                            brand{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Control
                                            id="brand"
                                            value={jobDetailsData?.brand || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "brand",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Select brand"
                                            isInvalid={!!errors.brand}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.brand}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                {/* Model */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label htmlFor="model">
                                            Model{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Control
                                            id="model"
                                            value={jobDetailsData?.model || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "model",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Select Model"
                                            isInvalid={!!errors.model}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.model}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                {/* Color */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label htmlFor="color">
                                            Color
                                        </Form.Label>
                                        <Form.Control
                                            id="color"
                                            value={jobDetailsData?.color || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "color",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Device Color"
                                        />
                                    </Form.Group>
                                </Col>

                                {/* IMEI / Serial */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label htmlFor="imeiSerial">
                                            IMEI/Serial{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Control
                                            id="imeiSerial"
                                            value={jobDetailsData?.serial || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "serial",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="IMEI / Serial"
                                            isInvalid={!!errors.serial}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.serial}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                {/* Device Password */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label htmlFor="devicePassword">
                                            Device Password{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Control
                                            id="devicePassword"
                                            type="text"
                                            value={
                                                jobDetailsData?.password || ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Device Password"
                                            isInvalid={!!errors.password}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.password}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                {/* Provider Information */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label htmlFor="providerInfo">
                                            Provider Information
                                        </Form.Label>
                                        <Form.Control
                                            id="providerInfo"
                                            as="textarea"
                                            rows={1}
                                            value={
                                                jobDetailsData?.provider || ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "provider",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Provider Information"
                                        />
                                    </Form.Group>
                                </Col>

                                {/* specs */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label htmlFor="specsInfo">
                                            Device Specifications
                                        </Form.Label>
                                        <Form.Control
                                            id="specsInfo"
                                            as="textarea"
                                            rows={1}
                                            value={jobDetailsData?.specs || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "specs",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Device Specifications"
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Issue Identified */}
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label htmlFor="issueDescription">
                                            Issue Identified
                                        </Form.Label>
                                        <Form.Control
                                            id="issueDescription"
                                            as="textarea"
                                            rows={1}
                                            value={jobDetailsData?.issue || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "issue",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Issue Identified"
                                        />
                                    </Form.Group>
                                </Col>

                                {/* remarks */}
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label htmlFor="remarksDescription">
                                            Remarks
                                        </Form.Label>
                                        <Form.Control
                                            id="remarksDescription"
                                            as="textarea"
                                            rows={1}
                                            value={
                                                jobDetailsData?.remarks || ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "remarks",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Remarks"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Complaint Details */}
                <Col md={6}>
                    <Card className="border-0 rounded-0 shadow-sm mb-3">
                        <Card.Header className="bg-transparent fw-semibold">
                            Complaint Details
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                {/* Service Complaint */}
                                <Col md={12} className="mb-3">
                                    <Form.Group>
                                        <Form.Label htmlFor="complaint">
                                            Service Complaint{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Form.Label>
                                        <Select
                                            inputId="complaint"
                                            options={complaintOptions}
                                            value={currentComplaintValue}
                                            onChange={(selectedOption) =>
                                                handleChange(
                                                    "complaint",
                                                    selectedOption?.value || ""
                                                )
                                            }
                                            placeholder="Select complaint"
                                            isClearable
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor:
                                                        errors.complaint
                                                            ? "#dc3545"
                                                            : base.borderColor,
                                                    "&:hover": {
                                                        borderColor:
                                                            errors.complaint
                                                                ? "#dc3545"
                                                                : base.borderColor,
                                                    },
                                                }),
                                            }}
                                        />
                                        {errors.complaint && (
                                            <div className="invalid-feedback d-block">
                                                {errors.complaint}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>

                                {/* Remarks */}
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label htmlFor="remarks">
                                            Other Remarks
                                        </Form.Label>
                                        <Form.Control
                                            id="remarks"
                                            as="textarea"
                                            rows={3}
                                            value={
                                                jobDetailsData?.remarks || ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "remarks",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Other Remarks"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default JobDetails;
