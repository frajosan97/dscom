import React, { useEffect, useState } from "react";
import SlickSlider from "@/Components/Settings/SlickSlider";
import ProductCard from "../Settings/ProductCard";
import { Spinner, Alert } from "react-bootstrap";
import useFilterOptions from "@/Hooks/useData";

export default function ProductsList({
    categoryName = null,
    brandId = null,
    withBanner = false,
}) {
    const { products, isLoading, error: filterError } = useFilterOptions();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        if (!isLoading && products) {
            try {
                let result = [...products];

                // Filter by category if provided
                if (categoryName) {
                    result = result.filter(
                        (item) =>
                            item.category?.slug.toLowerCase() ===
                            categoryName.toLowerCase()
                    );
                }

                // Filter by brand if provided
                if (brandId) {
                    result = result.filter((item) => item.brand_id == brandId);
                }

                setFilteredProducts(result);
            } catch (error) {
                setLocalError("Error filtering products");
                console.error(error);
            }
        }
    }, [products, isLoading, categoryName, brandId]);

    if (isLoading) {
        return (
            <div className="text-center py-4">
                <Spinner animation="border" role="status" variant="primary" />
                <p className="mt-2">Loading products...</p>
            </div>
        );
    }

    if (filterError || localError) {
        return (
            <Alert variant="danger" className="text-center">
                {filterError || localError}
            </Alert>
        );
    }

    const displayProducts =
        brandId || categoryName ? filteredProducts : products;

    const settings = {
        slidesToShow: withBanner ? 4 : 5,
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
                        dots: false,
                    },
                },
            ],
        },
    };

    return (
        <>
            {displayProducts?.length > 0 ? (
                <SlickSlider {...settings}>
                    {displayProducts.map((item) => (
                        <ProductCard key={item.id} item={item} />
                    ))}
                </SlickSlider>
            ) : (
                <Alert variant="info" className="text-center">
                    {categoryName
                        ? `No products found${
                              brandId ? " for this brand" : ""
                          } in ${categoryName}`
                        : "No products available"}
                </Alert>
            )}
        </>
    );
}
