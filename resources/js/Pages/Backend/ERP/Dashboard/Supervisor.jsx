import ErpLayout from "@/Layouts/ErpLayout";
import { Head, usePage } from "@inertiajs/react";
import { Col, Container, Row } from "react-bootstrap";

const SupervisorDashboard = () => {
    const { auth } = usePage().props;

    return (
        <ErpLayout>
            <Head title="Admin Dashboard" />

        </ErpLayout>
    );
};

export default SupervisorDashboard;
