import { Button, Container, Form, Navbar, Dropdown, Badge, InputGroup, FormControl, Col } from "react-bootstrap";
import { Search, Bell, Grid, ChevronDown, Maximize2, LogOut, User as UserIcon, Lock, Users, Phone } from "react-feather";
import { router, usePage } from "@inertiajs/react";
import ApplicationLogo from "./ApplicationLogo";

export default function TopHead() {
    const { auth, systemMode } = usePage().props;

    return (
        <Navbar variant="light" expand="lg" className="top-header border-bottom py-2">
            <Container fluid>
                {/* Left Section - Logo & Collapse Button */}
                <div className="d-flex align-items-center">
                    <Navbar.Brand href="/" className="me-3 me-lg-4">
                        <ApplicationLogo className="erp-logo" />
                    </Navbar.Brand>

                    <Button
                        variant="link"
                        className="p-1 me-2 text-muted hover-primary"
                        title="Fullscreen"
                    >
                        <Maximize2 size={18} />
                    </Button>
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
                            <Button variant="transparent" className="search-button rounded-end">
                                <Search size={18} />
                            </Button>
                        </InputGroup>
                    </Form>
                </Col>

                {/* Right Section - Actions */}
                <div className="d-flex align-items-center ms-auto">
                    {systemMode === 'erp' ? (
                        <>
                            <QuickActionsDropdown />
                            <NotificationsDropdown />
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

const QuickActionsDropdown = () => (
    <Dropdown align="end" className="mx-1">
        <Dropdown.Toggle variant="link" className="p-1 text-muted hover-primary">
            <Grid size={20} />
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-end shadow border-0 mt-2">
            <Dropdown.Header className="small text-muted">Quick Actions</Dropdown.Header>
            <Dropdown.Item className="d-flex align-items-center py-2" href={route('sales.create')}>
                <span className="me-2">➕</span> New Sale
            </Dropdown.Item>
            <Dropdown.Item className="d-flex align-items-center py-2">
                <span className="me-2">📦</span> Inventory Check
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item className="d-flex align-items-center py-2">
                <span className="me-2">📊</span> Generate Report
            </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
);

const NotificationsDropdown = () => (
    <Dropdown align="end" className="mx-1">
        <Dropdown.Toggle variant="link" className="p-1 text-muted hover-primary position-relative">
            <Bell size={20} />
            <Badge
                pill
                bg="danger"
                className="position-absolute top-0 start-100 translate-middle"
                style={{ fontSize: '10px', padding: '3px 5px' }}
            >
                3
            </Badge>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-end shadow border-0 mt-2" style={{ minWidth: '320px' }}>
            <Dropdown.Header className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">Notifications</span>
                <Button variant="link" size="sm" className="p-0 text-primary">Mark all as read</Button>
            </Dropdown.Header>
            <Dropdown.Item className="py-2 border-bottom">
                <div className="d-flex">
                    <div className="flex-shrink-0 me-2 text-success">🔔</div>
                    <div className="flex-grow-1 small">
                        <div>New order received #ORD-1024</div>
                        <div className="text-muted">2 minutes ago</div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item className="py-2 border-bottom">
                <div className="d-flex">
                    <div className="flex-shrink-0 me-2 text-warning">⚠️</div>
                    <div className="flex-grow-1 small">
                        <div>Low stock alert: Product XYZ</div>
                        <div className="text-muted">1 hour ago</div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item className="text-center small py-2 text-primary">
                View all notifications
            </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
);

const UserProfileDropdown = ({ user }) => (
    <Dropdown align="end" className="ms-2 contact-info ">
        <Dropdown.Toggle variant="transparent" className="erp-user-dropdown border-0 px-2 py-1">
            <div className="d-flex align-items-center">
                <div className="erp-avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                    <UserIcon size={16} />
                </div>
                <div className="d-none d-lg-inline small fw-medium text-start">
                    <div className="small text-muted">{user?.first_name}</div>
                    <div className="fw-semibold text-truncate" style={{ maxWidth: "100px" }}>{user?.email}</div>
                </div>
                <ChevronDown size={16} className="ms-1" />
            </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-end shadow border-0 mt-2">
            <Dropdown.Item className="d-flex align-items-center py-2"
                href={route('employee.show', user?.id)}
            >
                <UserIcon size={16} className="me-2 text-muted" />
                My Profile
            </Dropdown.Item>
            <Dropdown.Item className="d-flex align-items-center py-2">
                <Lock size={16} className="me-2 text-muted" />
                Account Settings
            </Dropdown.Item>
            <Dropdown.Item className="d-flex align-items-center py-2">
                <Users size={16} className="me-2 text-muted" />
                Team Members
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item className="d-flex align-items-center py-2 text-danger"
                onClick={() => router.post(route('logout'))}
            >
                <LogOut size={16} className="me-2" />
                Logout
            </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
);

const ContactSupport = () => (
    <a href="tel:+243894779059" className="d-none d-lg-flex align-items-center contact-info text-decoration-none">
        <div className="contact-icon">
            <Phone size={18} />
        </div>
        <div className="ms-2">
            <div className="small text-muted">24/7 Support</div>
            <div className="fw-semibold">+243 (894) 779-059</div>
        </div>
    </a>
);