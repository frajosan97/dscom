import ErpLayout from "@/Layouts/ErpLayout";
import { Head, usePage } from "@inertiajs/react";
import { Col, Container, Row } from "react-bootstrap";

const FinanceDashboard = () => {
    const { auth } = usePage().props;

    return (
        <ErpLayout>
            <Head title="Dashboard" />

        </ErpLayout>
    );
};

export default FinanceDashboard;
