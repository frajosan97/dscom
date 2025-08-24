import ErpLayout from "@/Layouts/ErpLayout";
import { Head, usePage } from "@inertiajs/react";
import { Col, Container, Row } from "react-bootstrap";

const ReceptionistDashboard = () => {
    const { auth } = usePage().props;

    return (
        <ErpLayout>
            <Head title="Admin Dashboard" />

        </ErpLayout>
    );
};

export default ReceptionistDashboard;
