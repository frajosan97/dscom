import { Card, Row, Col, Form } from "react-bootstrap";
import Select from "react-select";

const InitiaCheck = ({ initialCheckData, setInitialCheckData }) => {
    const statusItems = ["Display", "Back Panel", "Devices Status", "Hello"];
    const accessories = [
        "Sim Tray",
        "Back Panel",
        "Battery",
        "Sim",
        "Headset",
        "Cover",
        "Tes",
    ];

    const handleStatusChange = (field, value) => {
        setInitialCheckData((prev) => ({
            ...prev,
            status: { ...prev.status, [field]: value },
        }));
    };

    const handleAccessoryChange = (item) => {
        setInitialCheckData((prev) => ({
            ...prev,
            accessories: {
                ...prev.accessories,
                [item]: !prev.accessories?.[item],
            },
        }));
    };

    return (
        <>
            {/* Status Cards */}
            <Row className="mb-4 g-3">
                {statusItems.map((label, idx) => (
                    <Col md={3} key={idx}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <Card.Title className="fs-6 mb-3 text-capitalize">
                                    {label}
                                </Card.Title>
                                <div className="d-flex flex-column gap-1">
                                    <Form.Check
                                        type="radio"
                                        label="Working"
                                        name={`status-${idx}`}
                                        checked={
                                            initialCheckData?.status?.[
                                                label
                                            ] === "Working"
                                        }
                                        onChange={() =>
                                            handleStatusChange(label, "Working")
                                        }
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Not Working"
                                        name={`status-${idx}`}
                                        checked={
                                            initialCheckData?.status?.[
                                                label
                                            ] === "Not Working"
                                        }
                                        onChange={() =>
                                            handleStatusChange(
                                                label,
                                                "Not Working"
                                            )
                                        }
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Not Checked"
                                        name={`status-${idx}`}
                                        checked={
                                            !initialCheckData?.status?.[
                                                label
                                            ] ||
                                            initialCheckData?.status?.[
                                                label
                                            ] === "Not Checked"
                                        }
                                        onChange={() =>
                                            handleStatusChange(
                                                label,
                                                "Not Checked"
                                            )
                                        }
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Dropdowns */}
            <Row className="mb-4 g-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Physical Condition</Form.Label>
                        <Select
                            placeholder="Search Physical Conditions"
                            value={
                                initialCheckData?.physicalCondition
                                    ? {
                                          label: initialCheckData.physicalCondition,
                                          value: initialCheckData.physicalCondition,
                                      }
                                    : null
                            }
                            onChange={(selected) =>
                                setInitialCheckData((prev) => ({
                                    ...prev,
                                    physicalCondition: selected?.value || "",
                                }))
                            }
                            options={[
                                { value: "Good", label: "Good" },
                                { value: "Average", label: "Average" },
                                { value: "Poor", label: "Poor" },
                            ]}
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Risk Agreed By Customer</Form.Label>
                        <Select
                            placeholder="Search Risk Agreements"
                            value={
                                initialCheckData?.riskAgreement
                                    ? {
                                          label: initialCheckData.riskAgreement,
                                          value: initialCheckData.riskAgreement,
                                      }
                                    : null
                            }
                            onChange={(selected) =>
                                setInitialCheckData((prev) => ({
                                    ...prev,
                                    riskAgreement: selected?.value || "",
                                }))
                            }
                            options={[
                                {
                                    value: "Screen Replacement",
                                    label: "Screen Replacement",
                                },
                                { value: "Data Loss", label: "Data Loss" },
                                { value: "Other", label: "Other" },
                            ]}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {/* Accessories & Remarks */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white fw-bold">
                    Accessories
                    <div className="fw-normal small">Subtitle</div>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={8}>
                            <Form.Group className="d-flex flex-wrap gap-3">
                                {accessories.map((acc, i) => (
                                    <Form.Check
                                        key={i}
                                        type="checkbox"
                                        id={`acc-${i}`}
                                        label={acc}
                                        checked={
                                            !!initialCheckData?.accessories?.[
                                                acc
                                            ]
                                        }
                                        onChange={() =>
                                            handleAccessoryChange(acc)
                                        }
                                    />
                                ))}
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Other Remarks</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Other Remarks"
                                    value={initialCheckData?.remarks || ""}
                                    onChange={(e) =>
                                        setInitialCheckData((prev) => ({
                                            ...prev,
                                            remarks: e.target.value,
                                        }))
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
};

export default InitiaCheck;
