import { formatDate } from "@/Utils/helpers";
import { Card, Row, Col, Badge, Accordion, Image } from "react-bootstrap";

const JobEntryInfo = ({ order }) => {
    console.log(order);

    return (
        <Row className="g-2">
            {/* Job Brief */}
            <Col md={3}>
                <Card className="border-0 rounded-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        Job Brief
                    </Card.Header>
                    <Card.Body>
                        <p>
                            <strong>Job No:</strong> {order?.order_number}
                        </p>
                        <p>
                            <strong>Entry Date:</strong>{" "}
                            {formatDate(order?.created_at)}
                        </p>
                        <p>
                            <strong>Re-entry Job No:</strong> {order?.id}
                        </p>
                        <p>
                            <strong>Entering Staff:</strong>{" "}
                            {order?.creator?.full_name ||
                                order?.creator?.name ||
                                "N/A"}
                        </p>
                        <p>
                            <strong>Due Date:</strong>{" "}
                            {formatDate(order?.completion_date)}
                        </p>
                        <p>
                            <strong>Entry Warranty:</strong>{" "}
                            <Badge
                                bg={
                                    order?.custom_fields?.warranty_status ===
                                    "on"
                                        ? "success"
                                        : "danger"
                                }
                            >
                                {order?.custom_fields?.warranty_status || "off"}
                            </Badge>
                        </p>
                    </Card.Body>
                </Card>
            </Col>

            {/* Customer Details */}
            <Col md={3}>
                <Card className="border-0 rounded-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        Customer Details
                    </Card.Header>
                    <Card.Body>
                        <p>
                            <strong>Name:</strong>{" "}
                            {order?.customer?.full_name ||
                                order?.customer?.name ||
                                "N/A"}
                        </p>
                        <p>
                            <strong>Phone Number:</strong>{" "}
                            {order?.customer?.phone || "N/A"}
                        </p>
                        <p>
                            <strong>Place:</strong>{" "}
                            {order?.customer?.country || "N/A"}
                        </p>
                        <p>
                            <strong>Address:</strong>{" "}
                            {order?.customer?.address || "N/A"}
                        </p>
                        <p>
                            <strong>Account Id:</strong>{" "}
                            {order?.customer?.id || "N/A"}
                        </p>
                    </Card.Body>
                </Card>
            </Col>

            {/* Device Information */}
            <Col md={3}>
                <Card className="border-0 rounded-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        Device Information
                    </Card.Header>
                    <Card.Body>
                        {order?.device_metadata &&
                            Object.entries(order.device_metadata).map(
                                ([key, value], index) => (
                                    <p key={index}>
                                        <strong>{key}:</strong> {value}
                                    </p>
                                )
                            )}
                    </Card.Body>
                </Card>
            </Col>

            {/* Technician Details */}
            <Col md={3}>
                <Card className="border-0 rounded-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        Technician Details
                    </Card.Header>
                    <Card.Body>
                        <p>
                            <strong>Technician:</strong>{" "}
                            {order?.technician?.full_name ||
                                order?.technician?.name ||
                                "Not Assigned"}
                        </p>
                        <p>
                            <strong>Phone Number:</strong>{" "}
                            {order?.technician?.phone || "Not Assigned"}
                        </p>
                        <p>
                            <strong>Address:</strong>{" "}
                            {order?.technician?.address || "Not Assigned"}
                        </p>
                        <p>
                            <strong>Photo:</strong>{" "}
                            {order?.technician?.profile_image ? (
                                <Image
                                    src={order.technician.profile_image}
                                    alt="Technician"
                                    width={50}
                                    height={50}
                                />
                            ) : (
                                "Not Assigned"
                            )}
                        </p>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={4}>
                <Card className="border-0 rounded-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        Complaint Details
                    </Card.Header>
                    <Card.Body>
                        <p>
                            <strong>Complaints:</strong>{" "}
                            {order?.complaint?.complaint ||
                                "No complaints recorded"}
                        </p>
                        <p>
                            <strong>Other Remarks:</strong>{" "}
                            {order?.complaint?.remarks || "No remarks"}
                        </p>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={4}>
                <Card className="border-0 rounded-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        Initial Checks Information
                    </Card.Header>
                    <Card.Body>
                        {order?.initial_check_metadata &&
                            Object.entries(order.initial_check_metadata).map(
                                ([key, value], index) => (
                                    <div key={index}>
                                        <strong>{key}:</strong>{" "}
                                        {typeof value === "object" &&
                                        value !== null ? (
                                            <ul className="ms-3">
                                                {Object.entries(value).map(
                                                    (
                                                        [subKey, subValue],
                                                        subIndex
                                                    ) => (
                                                        <li key={subIndex}>
                                                            {subKey}:{" "}
                                                            {String(subValue)}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <span>{String(value)}</span>
                                        )}
                                    </div>
                                )
                            )}
                    </Card.Body>
                </Card>
            </Col>

            <Col md={4}>
                <Card className="border-0 rounded-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        Physical Conditions
                    </Card.Header>
                    <Card.Body>
                        {order?.physicalConditions ? (
                            <>
                                <p>
                                    <strong>Screen Condition:</strong>{" "}
                                    {order.physicalConditions
                                        .screen_condition || "N/A"}
                                </p>
                                <p>
                                    <strong>Body Condition:</strong>{" "}
                                    {order.physicalConditions.body_condition ||
                                        "N/A"}
                                </p>
                                <p>
                                    <strong>Accessories Included:</strong>{" "}
                                    {order.physicalConditions
                                        .accessories_included || "None"}
                                </p>
                            </>
                        ) : (
                            <p>No Data</p>
                        )}
                    </Card.Body>
                </Card>
            </Col>

            <Col md={4}>
                <Card className="border-0 rounded-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        Risk Agreed By Customer
                    </Card.Header>
                    <Card.Body>
                        {order?.riskAgreements ? (
                            <>
                                <p>
                                    <strong>Data Loss:</strong>{" "}
                                    {order.riskAgreements.data_loss_accepted
                                        ? "Accepted"
                                        : "Not Accepted"}
                                </p>
                                <p>
                                    <strong>Further Damage:</strong>{" "}
                                    {order.riskAgreements
                                        .further_damage_accepted
                                        ? "Accepted"
                                        : "Not Accepted"}
                                </p>
                                <p>
                                    <strong>Signed Date:</strong>{" "}
                                    {formatDate(order.riskAgreements.signed_at)}
                                </p>
                            </>
                        ) : (
                            <p>No Data</p>
                        )}
                    </Card.Body>
                </Card>
            </Col>

            <Col md={4}>
                <Card className="border-0 rounded-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        Accessories
                    </Card.Header>
                    <Card.Body>
                        {order?.accessories && order.accessories.length > 0 ? (
                            order.accessories.map((accessory) => (
                                <p key={accessory.id}>
                                    <strong>{accessory.name}:</strong>{" "}
                                    {accessory.quantity}{" "}
                                    {accessory.condition &&
                                        `(${accessory.condition})`}
                                </p>
                            ))
                        ) : (
                            <p>No Data</p>
                        )}
                    </Card.Body>
                </Card>
            </Col>

            <Col md={4}>
                <Card className="border-0 rounded-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        Payment Info
                    </Card.Header>
                    <Card.Body>
                        <p>
                            <strong>Estimated Cost:</strong>{" "}
                            {order?.estimated_cost
                                ? `$${order.estimated_cost}`
                                : "N/A"}
                        </p>
                        <p>
                            <strong>Final Cost:</strong>{" "}
                            {order?.final_cost ? `$${order.final_cost}` : "N/A"}
                        </p>
                        <p>
                            <strong>Amount Paid:</strong>{" "}
                            {order?.amount_paid
                                ? `$${order.amount_paid}`
                                : "N/A"}
                        </p>
                        <p>
                            <strong>Balance Due:</strong>{" "}
                            {order?.balance_due
                                ? `$${order.balance_due}`
                                : "N/A"}
                        </p>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={12}>
                <Card className="border-0 rounded-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        Transaction Details
                    </Card.Header>
                    <Card.Body>
                        {order?.payments && order.payments.length > 0 ? (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>
                                                {formatDate(
                                                    payment.payment_date
                                                )}
                                            </td>
                                            <td>${payment.amount}</td>
                                            <td>{payment.payment_method}</td>
                                            <td>{payment.payment_type}</td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        payment.status ===
                                                        "completed"
                                                            ? "success"
                                                            : payment.status ===
                                                              "pending"
                                                            ? "warning"
                                                            : payment.status ===
                                                              "failed"
                                                            ? "danger"
                                                            : "secondary"
                                                    }
                                                >
                                                    {payment.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No payment records found</p>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default JobEntryInfo;
