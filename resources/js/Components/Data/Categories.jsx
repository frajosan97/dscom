import { useState } from "react";
import { Badge, ListGroup } from "react-bootstrap";
import useFilterOptions from "@/Hooks/useData";
import { Link } from "@inertiajs/react";
import "../../../css/Categories.css";

export default function Categories() {
    const { categories } = useFilterOptions();
    const [activeCategory, setActiveCategory] = useState(null);

    const handleMouseEnter = (id) => setActiveCategory(id);
    const handleMouseLeave = () => setActiveCategory(null);

    const renderSubmenu = (children) => (
        <div className="submenu">
            <ListGroup variant="flush">
                {children.map((child) => (
                    <ListGroup.Item
                        key={child.id}
                        className="submenu-item"
                        as="a"
                        href={route("category.show", child.slug)}
                    >
                        <span className="me-2">{child.icon || "📁"}</span>
                        {child.name}
                        <Badge
                            bg="light"
                            text="dark"
                            pill
                            className="float-end"
                        >
                            {child.products_count}
                        </Badge>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );

    return (
        <div className="categories-container">
            <ListGroup variant="flush" className="main-menu text-capitalize">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="category-wrapper"
                        onMouseEnter={() => handleMouseEnter(category.id)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <ListGroup.Item
                            action
                            className="category-item text-capitalize"
                            as={Link}
                            href={route("category.show", category.slug)}
                        >
                            <span>
                                <span className="me-2">
                                    {category.icon || "📁"}
                                </span>
                                {category.name}
                            </span>
                            <Badge
                                bg="light"
                                text="dark"
                                pill
                                className="float-end"
                            >
                                {category.products_count}
                            </Badge>
                        </ListGroup.Item>

                        {Array.isArray(category.children) &&
                            category.children.length > 0 &&
                            activeCategory === category.id &&
                            renderSubmenu(category.children)}
                    </div>
                ))}
            </ListGroup>
        </div>
    );
}
