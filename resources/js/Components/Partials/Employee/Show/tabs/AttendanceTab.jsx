import StatusBadge from "@/Components/ui/StatusBadge";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { Clock, Calendar, FileEarmarkText } from "react-bootstrap-icons";

export default function AttendanceTab({ employee }) {
    const recentAttendance = employee.attendance?.slice(-10) || [];
    const todayAttendance = employee.attendance?.find(
        (a) => new Date(a.date).toDateString() === new Date().toDateString()
    );

    const formatTime = (time) => {
        if (!time) return "—";
        return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div>
            {/* Today's Attendance */}
            {todayAttendance && (
                <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="fw-semibold mb-1">
                                    Today's Attendance
                                </h6>
                                <div className="d-flex align-items-center gap-3">
                                    <div>
                                        <small className="text-muted">
                                            Check-in
                                        </small>
                                        <div className="fw-bold">
                                            {formatTime(
                                                todayAttendance.check_in
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <small className="text-muted">
                                            Check-out
                                        </small>
                                        <div className="fw-bold">
                                            {formatTime(
                                                todayAttendance.check_out
                                            ) || "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <small className="text-muted">
                                            Hours
                                        </small>
                                        <div className="fw-bold">
                                            {todayAttendance.hours_worked ||
                                                "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <StatusBadge
                                            status={todayAttendance.status}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline-primary" size="sm">
                                <Clock className="me-2" /> Log Time
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-semibold mb-0">Attendance Record</h6>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                        <Calendar className="me-2" /> View Calendar
                    </Button>
                    <Button variant="outline-success" size="sm">
                        <FileEarmarkText className="me-2" /> Export
                    </Button>
                </div>
            </div>

            {recentAttendance.length > 0 ? (
                <>
                    <div className="table-responsive rounded border mb-4">
                        <Table hover className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Date</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Hours Worked</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAttendance.map((record) => (
                                    <tr key={record.id}>
                                        <td>
                                            {new Date(
                                                record.date
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td>{formatTime(record.check_in)}</td>
                                        <td>
                                            {formatTime(record.check_out) ||
                                                "—"}
                                        </td>
                                        <td>{record.hours_worked || "—"}</td>
                                        <td>
                                            <StatusBadge
                                                status={record.status}
                                            />
                                        </td>
                                        <td
                                            className="text-truncate"
                                            style={{ maxWidth: "150px" }}
                                        >
                                            {record.notes || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Showing last {recentAttendance.length} records
                        </small>
                        <Button variant="outline-secondary" size="sm">
                            View Full History
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center py-5 bg-light rounded">
                    <Clock size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">
                        No attendance records available.
                    </h5>
                </div>
            )}
        </div>
    );
}
