import { Container, Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import { ChevronDown } from "react-feather";

export default function NavBar({ variant = 'ecommerce', NavItems }) {
    return (
        <Navbar variant="light" expand="lg" className="sticky-top py-3">
            <Container fluid>
                {variant === 'ecommerce' ? (
                    <>
                        {/* Left Links Section */}
                        <div className="d-flex align-items-center">
                            {NavItems.leftItems.map((item, index) => (
                                <NavItem key={index} item={item} />
                            ))}
                        </div>

                        {/* Right Links Section */}
                        <Nav className="ms-auto">
                            {NavItems.rightItems.map((item, index) => (
                                <NavItem key={index} item={item} />
                            ))}
                        </Nav>
                    </>
                ) : (
                    <>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="mx-auto">
                                {NavItems.map((item, index) => (
                                    <NavItem key={index} item={item} variant={variant} />
                                ))}
                            </Nav>
                        </Navbar.Collapse>
                    </>
                )}
            </Container>
        </Navbar>
    );
}

function NavItem({ item, variant = 'ecommerce' }) {
    if (variant === 'erp' && item.children) {
        return (
            <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link} className="text-dark">
                    <i className={`${item.icon} me-2`}></i>
                    {item.label}
                    <ChevronDown size={14} className="ms-1" />
                </Dropdown.Toggle>
                <Dropdown.Menu className="py-0 border-0 shadow-sm">
                    {item.children.map((child, idx) => (
                        <NavItem key={idx} item={child} variant={variant} />
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    if (variant === 'erp') {
        return (
            <Dropdown.Item
                href={item.path}
                className="py-2 px-3"
            >
                <i className={`${item.icon} me-2`}></i>
                {item.label}
            </Dropdown.Item>
        );
    }

    // E-commerce items
    if (item.type === "link") {
        return (
            <Nav.Link
                href={item.href}
                className={item.className}
            >
                {item.icon && <item.icon size={18} className="me-1" />}
                {item.text}
            </Nav.Link>
        );
    }

    if (item.type === "button") {
        return (
            <Button
                variant={item.variant}
                className={item.className}
                as={item.as}
                href={item.href}
                onClick={item.onClick}
            >
                {item.children}
            </Button>
        );
    }

    if (item.type === "dropdown") {
        return (
            <Button
                variant={item.variant}
                className={item.className}
                onClick={item.onClick}
            >
                {item.children}
            </Button>
        );
    }

    return null;
}