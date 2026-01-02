import { Row, Col, Card, Badge } from "react-bootstrap";
import {
    Person,
    GeoAlt,
    Activity,
    Building,
    CashCoin,
    Wallet,
} from "react-bootstrap-icons";
import { formatDate, calculateAge } from "@/Utils/helpers";
import SectionTitle from "@/Components/ui/SectionTitle";
import InfoCard from "@/Components/ui/InfoCard";

export default function OverviewTab({ employee, employeeStats }) {
    const age = employee.date_of_birth
        ? calculateAge(employee.date_of_birth)
        : null;

    return (
        <Row className="g-4">
            <Col md={6}>
                <InfoCard
                    title="Personal Details"
                    icon={<Person />}
                    items={[
                        {
                            label: "Full Name",
                            value: `${employee.first_name} ${employee.last_name}`,
                        },
                        {
                            label: "Date of Birth",
                            value: employee.date_of_birth ? (
                                <div>
                                    <h6 className="m-0 fw-semibold">
                                        {formatDate(employee.date_of_birth)}
                                    </h6>
                                    <small className="text-muted">
                                        {age} old
                                    </small>
                                </div>
                            ) : (
                                "Not provided"
                            ),
                        },
                        { label: "Gender", value: employee.gender || "N/A" },
                    ]}
                />
            </Col>

            <Col md={6}>
                <InfoCard
                    title="Contact & Address"
                    icon={<GeoAlt />}
                    items={[
                        {
                            label: "Personal Email",
                            value: employee.email || "Not provided",
                        },
                        {
                            label: "Personal Phone",
                            value: employee.phone || "Not provided",
                        },
                        {
                            label: "Emergency Phone",
                            value: employee.alternate_phone || "Not provided",
                        },
                        {
                            label: "Address",
                            value: employee.address || "Not provided",
                        },
                    ]}
                />
            </Col>

            <Col md={12}>
                <Card className="border-0 bg-light">
                    <Card.Body>
                        <SectionTitle
                            icon={<Activity />}
                            title="Work & Financial Summary"
                        />
                        <Row className="g-3">
                            <Col md={3}>
                                <div className="text-center p-3 bg-white rounded">
                                    <div className="text-primary mb-2">
                                        <Building size={24} />
                                    </div>
                                    <h5 className="fw-bold">
                                        {employee.department || "N/A"}
                                    </h5>
                                    <p className="text-muted mb-0">
                                        Department
                                    </p>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="text-center p-3 bg-white rounded">
                                    <div className="text-success mb-2">
                                        <CashCoin size={24} />
                                    </div>
                                    <h5 className="fw-bold">
                                        $
                                        {employeeStats.totalSales.toLocaleString()}
                                    </h5>
                                    <p className="text-muted mb-0">
                                        Total Sales
                                    </p>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="text-center p-3 bg-white rounded">
                                    <div className="text-info mb-2">
                                        <Wallet size={24} />
                                    </div>
                                    <h5 className="fw-bold">
                                        $
                                        {employeeStats.currentSalary.toLocaleString()}
                                    </h5>
                                    <p className="text-muted mb-0">
                                        Monthly Salary
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}
