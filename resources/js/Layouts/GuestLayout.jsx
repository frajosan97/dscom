// Updated GuestLayout.jsx
import { Container, Image } from "react-bootstrap";
import { Link } from "@inertiajs/react";
import '../../css/Auth.css';

export default function GuestLayout({ children }) {
    return (
        <div className="guest-layout-wrapper">
            <div className="guest-logo-container">
                <Link href="/">
                    <Image
                        src={'/storage/images/logos/logo-2.png'}
                        width={200}
                    />
                </Link>
            </div>

            <Container className="guest-content-container">
                {children}
            </Container>

            <div className="guest-footer">
                <p>
                    © {new Date().getFullYear()} DSCom Technologies. All rights
                    reserved.
                </p>
            </div>
        </div>
    );
}
