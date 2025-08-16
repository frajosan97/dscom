import ProductCard from "@/Components/Settings/ProductCard";
import SlickSlider from "@/Components/Settings/SlickSlider";
import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import { Breadcrumb, Card, Container } from "react-bootstrap";

export default function Category({ category }) {
    const bannerSettings = {
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 800,
        infinite: true,
        arrows: true,
        dots: false,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    arrows: false,
                    dots: false
                }
            }
        ]
    };

    const settings = {
        slidesToShow: 5,
        autoplay: true,
        autoplaySpeed: 6000,
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
        <AppLayout>
            <Head title={category.name.toUpperCase()} />

            <Container fluid className="py-4">
                <Breadcrumb className="mb-3">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ href: "/" }}>
                        Home
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active className="text-capitalize">
                        {category.name}
                    </Breadcrumb.Item>
                </Breadcrumb>

                <h5 className="display-title text-capitalize text-center mb-3">
                    {category.name}
                </h5>

                <Card className="border-0 rounded shadow-sm mb-3">
                    <Card.Body className="p-2">
                        <SlickSlider {...bannerSettings}>
                            <img
                                src={`/${category.image}`}
                                alt={category.name}
                                className="img-fluid w-100 rounded"
                                style={{ height: "300px", objectFit: "cover" }}
                            />
                        </SlickSlider>
                    </Card.Body>
                </Card>

                <div className="product-listing">
                    {/* foreach children */}
                    {category.children.map((child) => (
                        <Card key={child.id} className="border-0 rounded shadow-sm mb-3">
                            <Card.Header className="border-0 h6 fw-semibold text-capitalize">
                                {child.name}
                            </Card.Header>
                            <Card.Body className="p-2">
                                <SlickSlider {...settings}>
                                    {child.products.map((item) => (
                                        <ProductCard key={item.id} item={item} />
                                    ))}
                                </SlickSlider>
                            </Card.Body>
                        </Card>
                    ))}

                    {/* Others for this category */}
                    <Card className="border-0 rounded shadow-sm mb-3">
                        <Card.Header className="border-0 h6 fw-semibold text-capitalize">
                            More {category.name}
                        </Card.Header>
                        <Card.Body className="p-2">
                            <SlickSlider {...settings}>
                                {category.products.map((item) => (
                                    <ProductCard key={item.id} item={item} />
                                ))}
                            </SlickSlider>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </AppLayout>
    );
}