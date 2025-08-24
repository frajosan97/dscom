import { useState } from "react";
import { Badge, Nav, Offcanvas } from "react-bootstrap";
import {
    Grid,
    Home,
    Info,
    Mail,
    Truck,
    ShoppingCart,
    ChevronDown,
} from "react-feather";
import Categories from "../Data/Categories";
import NavBar from "../Pages/NavBar";
import { useCart } from "@/Context/CartContext";

export default function EcommerceHeader() {
    const [showCategories, setShowCategories] = useState(false);
    const { itemCount = 0 } = useCart();

    const ecommerceNavItems = {
        leftItems: [
            {
                type: "dropdown",
                variant: "outline-primary",
                className: "categories-btn",
                onClick: () => setShowCategories(true),
                children: (
                    <>
                        <Grid size={18} />
                        <span className="ms-2">Categories</span>
                        <span>
                            <ChevronDown size={16} className="ms-2" />
                        </span>
                    </>
                ),
            },
            {
                type: "link",
                icon: Home,
                text: "Home",
                href: "/",
                className: "mx-2 nav-link d-none d-lg-flex",
            },
            {
                type: "link",
                icon: Info,
                text: "About Us",
                href: "/about-us",
                className: "mx-2 nav-link d-none d-lg-flex",
            },
            {
                type: "link",
                icon: Mail,
                text: "Contact",
                href: "/contact-us",
                className: "mx-2 nav-link d-none d-lg-flex",
            },
        ],
        rightItems: [
            {
                type: "link",
                icon: Truck,
                text: "Track Order",
                href: "/track-order",
                className: "me-3 nav-link d-none d-md-flex",
            },
            {
                type: "button",
                variant: "outline-primary",
                className: "position-relative cart-btn",
                as: "a",
                href: "/cart",
                children: (
                    <>
                        <ShoppingCart size={18} />
                        <Badge
                            pill
                            bg="danger"
                            className="position-absolute top-0 start-100 translate-middle"
                        >
                            {itemCount}
                        </Badge>
                    </>
                ),
            },
        ],
    };

    return (
        <>
            <NavBar variant="ecommerce" NavItems={ecommerceNavItems} />

            {/* Categories Offcanvas Menu */}
            <Offcanvas
                show={showCategories}
                onHide={() => setShowCategories(false)}
                placement="start"
                className="categories-menu"
            >
                <Offcanvas.Header
                    closeButton
                    className="bg-gradient border-bottom"
                >
                    <Offcanvas.Title className="d-flex align-items-center">
                        <Grid size={20} className="me-2" />
                        All Categories
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <Nav className="flex-column">
                        <Categories />
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}
