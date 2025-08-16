import { usePage } from "@inertiajs/react";
import { Container } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErpHeader from "@/Components/NavItems/ErpHeader";
import TopHead from "@/Components/Pages/TopHead";
import Footer from "@/Components/Pages/Footer";

export default function ErpLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="erp-layout">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
            />

            <TopHead />

            <ErpHeader />

            <Container fluid className="erp-main py-4">
                {children}
            </Container>

            <Footer />
        </div>
    );
}