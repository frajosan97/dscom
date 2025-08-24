import { Head } from "@inertiajs/react";
import { Tabs, Tab } from "react-bootstrap";

import ErpLayout from "@/Layouts/ErpLayout";
import { BiCalendarCheck } from "react-icons/bi";
import SalaryTable from "@/Components/Partials/Employee/SalaryTable";
import SalaryPayment from "@/Components/Partials/Employee/SalaryPayment";

export default function Salary() {
    return (
        <ErpLayout>
            <Head title="Salary Management" />

            <Tabs
                defaultActiveKey="salary"
                className="users-tabs mb-3"
                id="salary-tabs"
            >
                <Tab
                    eventKey="salary"
                    title={
                        <>
                            <BiCalendarCheck size={16} className="me-1" />{" "}
                            Salary
                        </>
                    }
                >
                    <SalaryTable />
                </Tab>
                <Tab
                    eventKey="pay"
                    title={
                        <>
                            <BiCalendarCheck size={16} className="me-1" /> Pay
                        </>
                    }
                >
                    <SalaryPayment />
                </Tab>
            </Tabs>
        </ErpLayout>
    );
}
