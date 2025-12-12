import {
    Button,
    Container,
    Form,
    Navbar,
    Dropdown,
    InputGroup,
    FormControl,
    Col,
} from "react-bootstrap";
import {
    Search,
    ChevronDown,
    LogOut,
    User as UserIcon,
    Phone,
} from "react-feather";
import { router, usePage } from "@inertiajs/react";
import ApplicationLogo from "./ApplicationLogo";
import GoogleTranslate from "../Settings/GoogleTranslate";

export default function TopHead() {
    const { auth, systemMode } = usePage().props;

    return (
        <Navbar
            variant="light"
            expand="lg"
            className="top-header border-bottom py-2"
        >
            <Container fluid>
                {/* Left Section - Logo & Collapse Button */}
                <div className="d-flex align-items-center">
                    <Navbar.Brand href="/" className="me-3 me-lg-4">
                        <ApplicationLogo className="erp-logo" />
                    </Navbar.Brand>
                </div>

                {/* Search Column */}
                <Col className="px-0">
                    <Form>
                        <InputGroup className="custom-search-group">
                            <div className="search-category-selector">
                                <span className="selected-category">All</span>
                                <ChevronDown size={16} />
                            </div>
                            <FormControl
                                placeholder="Search for products, brands, and more..."
                                aria-label="Search"
                                className="search-input"
                            />
                            <Button
                                variant="transparent"
                                className="search-button rounded-end"
                            >
                                <Search size={18} />
                            </Button>
                        </InputGroup>
                    </Form>
                </Col>

                {/* Right Section - Actions */}
                <div className="d-flex align-items-center ms-auto">
                    <GoogleTranslate />
                    {systemMode === "erp" ? (
                        <>
                            <UserProfileDropdown user={auth?.user} />
                        </>
                    ) : (
                        <ContactSupport />
                    )}
                </div>
            </Container>
        </Navbar>
    );
}

const UserProfileDropdown = ({ user }) => (
    <Dropdown align="end" className="ms-2 contact-info ">
        <Dropdown.Toggle
            variant="transparent"
            className="erp-user-dropdown border-0 px-2 py-1"
        >
            <div className="d-flex align-items-center">
                <div
                    className="erp-avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{ width: "32px", height: "32px" }}
                >
                    <UserIcon size={16} />
                </div>
                <div className="d-none d-lg-inline small fw-medium text-start">
                    <div className="small text-muted">{user?.first_name}</div>
                    <div
                        className="fw-semibold text-truncate"
                        style={{ maxWidth: "100px" }}
                    >
                        {user?.email}
                    </div>
                </div>
                <ChevronDown size={16} className="ms-1" />
            </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-end shadow-sm border-0 mt-2 w-100">
            <Dropdown.Item className="d-flex align-items-center py-2">
                <UserIcon size={16} className="me-2 text-muted" />
                My Profile
            </Dropdown.Item>
            <Dropdown.Item
                className="d-flex align-items-center py-2 text-danger"
                onClick={() => router.post(route("logout"))}
            >
                <LogOut size={16} className="me-2" />
                Logout
            </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
);

const ContactSupport = () => (
    <a
        href="tel:+243827306680"
        className="d-none d-lg-flex align-items-center contact-info text-decoration-none"
    >
        <div className="contact-icon">
            <Phone size={18} />
        </div>
        <div className="ms-2">
            <div className="small text-muted">24/7 Support</div>
            <div className="fw-semibold">+243 (827) 306-680</div>
        </div>
    </a>
);
