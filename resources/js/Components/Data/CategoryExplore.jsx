import { Button, Card, CardBody, CardImg, Container } from "react-bootstrap";
import useFilterOptions from "@/Hooks/useData";
import { Link } from "@inertiajs/react";
import SlickSlider from "../Settings/SlickSlider";

export default function CategoryExplore() {
    const { categories } = useFilterOptions();

    const settings = {
        slidesToShow: 5,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 800,
        customSettings: {
            infinite: true,
            arrows: true,
            dots: true,
            pauseOnHover: true,
            responsive: [
                {
                    breakpoint: 768,
                    slidesToShow: 2,
                    settings: {
                        arrows: false,
                        dots: false
                    }
                }
            ]
        },
    };

    return (
        <Container fluid className=" py-4">
            <Card className="bg-transparent border-0 shadow-none">
                <Card.Header className="bg-transparent border-0 text-center">
                    <h2 className="section-title">Explore by Categories</h2>
                    <p className="section-subtitle">Discover products in our popular categories</p>
                </Card.Header>
                <Card.Body>
                    <SlickSlider {...settings}>
                        {categories.map((category) => (
                            <Card
                                className="category-card d-flex flex-row m-2 text-decoration-none text-capitalize"
                                as={Link}
                                href={route('category.show', category.slug)}
                                key={category.id}
                            >
                                <CardImg
                                    src={category.image}
                                    alt={category.name}
                                    className="w-50 rounded-end-0"
                                    style={{ objectFit: 'cover' }}
                                />
                                <CardBody className="w-50">
                                    <Card.Title className="category-name text-truncate">
                                        {category.name}
                                    </Card.Title>
                                    <Card.Text className="category-count">
                                        {category.products_count} items
                                    </Card.Text>
                                    <Link className="action-link text-white px-3">
                                        Explore
                                    </Link>
                                </CardBody>
                            </Card>
                        ))}
                    </SlickSlider>
                </Card.Body>
            </Card>
        </Container>
    );
}
