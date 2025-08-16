import EcommerceHeader from "@/Components/NavItems/EcommerceHeader";
import Footer from "@/Components/Pages/Footer";
import TopHead from "@/Components/Pages/TopHead";
import { Container } from "react-bootstrap";
import { ToastContainer } from "react-toastify";

export default function AppLayout({ children }) {
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
            />

            <TopHead />

            <EcommerceHeader />

            <Container fluid className="p-0">
                {children}
            </Container>

            <Footer />
        </>
    );
}