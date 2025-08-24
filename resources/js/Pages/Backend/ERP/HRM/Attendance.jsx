import { Head } from "@inertiajs/react";
import { Tab, Tabs } from "react-bootstrap";
import { BiCalendarCheck } from "react-icons/bi";

import ErpLayout from "@/Layouts/ErpLayout";
import EmployeeAttendance from "@/Components/Partials/Employee/EmployeeAttendance";

export default function Attendance() {
    return (
        <ErpLayout>
            <Head title="Attendance Management" />

            <Tabs
                defaultActiveKey="register"
                className="users-tabs mb-3"
                id="attendance-tabs"
            >
                <Tab
                    eventKey="register"
                    title={
                        <>
                            <BiCalendarCheck size={16} className="me-1" />{" "}
                            Register
                        </>
                    }
                >
                    <EmployeeAttendance />
                </Tab>
            </Tabs>
        </ErpLayout>
    );
}
