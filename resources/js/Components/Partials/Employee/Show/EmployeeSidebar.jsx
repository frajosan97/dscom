import { Card, ListGroup, Button } from "react-bootstrap";
import {
    Envelope,
    Telephone,
    Building,
    People,
    Phone,
    Chat,
    Clock,
    FileEarmarkText,
} from "react-bootstrap-icons";
import SectionTitle from "@/Components/ui/SectionTitle";
import ContactItem from "@/Components/ui/ContactItem";
import InfoRow from "@/Components/ui/InfoRow";

export default function EmployeeSidebar({
    employee,
    employeeStats,
    onCall,
    onSms,
    employmentStatus,
}) {
    return (
        <Card className="border-0 shadow-lg h-100">
            <Card.Body className="p-4">
                {/* Employee Information */}
                <SectionTitle icon="👤" title="Employee Information" />
                <ListGroup variant="flush" className="mb-4">
                    <ContactItem
                        icon={<Envelope />}
                        label="Work Email"
                        value={employee.email}
                        fallback="Not provided"
                        action={`mailto:${employee.email}`}
                    />
                    <ContactItem
                        icon={<Telephone />}
                        label="Work Phone"
                        value={employee.phone ?? employee.alternate_phone}
                        fallback="Not provided"
                    />
                    <ContactItem
                        icon={<Building />}
                        label="Department"
                        value={employee.department}
                    />
                    <ContactItem
                        icon={<People />}
                        label="Manager"
                        value={employee.manager?.name}
                        fallback="Not assigned"
                    />
                </ListGroup>

                {/* Salary & Finance Summary */}
                <SectionTitle icon="💰" title="Salary & Finance" />
                <div className="mb-4">
                    <InfoRow
                        label="Current Salary"
                        value={`$${(
                            employee.current_salary || 0
                        ).toLocaleString()}`}
                        isCurrency
                    />
                    <InfoRow
                        label="Salary Frequency"
                        value={employee.salary_frequency || "Monthly"}
                    />
                    <InfoRow
                        label="Commission Rate"
                        value={
                            employee.commission_rate
                                ? `${employee.commission_rate}%`
                                : "N/A"
                        }
                    />
                </div>

                {/* Quick Actions */}
                <SectionTitle icon="⚡" title="Quick Actions" />
                <div className="d-grid gap-2">
                    <Button
                        variant="outline-primary"
                        className="d-flex align-items-center justify-content-center gap-2 py-2"
                        onClick={onCall}
                    >
                        <Phone />
                        <span>Make a Call</span>
                    </Button>
                    <Button
                        variant="outline-success"
                        className="d-flex align-items-center justify-content-center gap-2 py-2"
                        onClick={onSms}
                    >
                        <Chat />
                        <span>Send Message</span>
                    </Button>
                    {/* <Button
                        variant="outline-warning"
                        className="d-flex align-items-center justify-content-center gap-2 py-2"
                        onClick={() => console.log("Request time off")}
                    >
                        <Clock />
                        <span>Request Time Off</span>
                    </Button>
                    <Button
                        variant="outline-info"
                        className="d-flex align-items-center justify-content-center gap-2 py-2"
                        onClick={() => console.log("View payslip")}
                    >
                        <FileEarmarkText />
                        <span>View Payslip</span>
                    </Button> */}
                </div>
            </Card.Body>
        </Card>
    );
}
