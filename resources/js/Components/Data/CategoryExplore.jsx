import React from "react";
import { Card, CardBody, CardImg, Container } from "react-bootstrap";
import { Link } from "@inertiajs/react";
import useFilterOptions from "@/Hooks/useData";
import SlickSlider from "../Settings/SlickSlider";

/**
 * Helper to duplicate items to meet the minimum slidesToShow count
 */
const autofillItems = (items, minCount) => {
    if (!items || items.length >= minCount) return items;
    const filled = [...items];
    let i = 0;
    while (filled.length < minCount) {
        filled.push({
            ...items[i % items.length],
            id: `${items[i % items.length].id}-${i}`,
        });
        i++;
    }
    return filled;
};

export default function CategoryExplore() {
    const { categories } = useFilterOptions();
    const slidesToShow = 5;

    if (!categories?.length) {
        return (
            <Container fluid className="py-4 text-center">
                <p>No categories available.</p>
            </Container>
        );
    }

    // Autofill categories if less than slidesToShow
    const displayedCategories = autofillItems(categories, slidesToShow);

    const sliderSettings = {
        slidesToShow,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 800,
        customSettings: {
            infinite: true,
            arrows: true,
            dots: false,
            pauseOnHover: true,
            responsive: [
                {
                    breakpoint: 992,
                    settings: { slidesToShow: Math.min(3, slidesToShow) },
                },
                {
                    breakpoint: 768,
                    settings: { slidesToShow: 2, arrows: false, dots: false },
                },
                {
                    breakpoint: 576,
                    settings: { slidesToShow: 1, arrows: false, dots: false },
                },
            ],
        },
    };

    return (
        <Container fluid className="py-4">
            <Card className="bg-transparent border-0 shadow-none">
                <Card.Body>
                    <SlickSlider {...sliderSettings}>
                        {displayedCategories.map((category) => (
                            <div className="px-1">
                                <Card
                                    key={category.id}
                                    as={Link}
                                    href={route("category.show", category.slug)}
                                    className="category-card d-flex flex-row text-decoration-none text-capitalize border-0 shadow-sm "
                                >
                                    <CardImg
                                        src={category.image}
                                        alt={category.name}
                                        className="w-50 rounded-end-0"
                                        style={{ objectFit: "cover" }}
                                    />
                                    <CardBody className="w-50">
                                        <Card.Title className="category-name text-truncate">
                                            {category.name}
                                        </Card.Title>
                                        <Card.Text className="category-count">
                                            {category.products_count} items
                                        </Card.Text>
                                        <Link className="action-link text-white text-nowrap text-truncate px-3">
                                            Explore
                                        </Link>
                                    </CardBody>
                                </Card>
                            </div>
                        ))}
                    </SlickSlider>
                </Card.Body>
            </Card>
        </Container>
    );
}
