import React, { useEffect, useState } from "react";
import { Spinner, Alert } from "react-bootstrap";
import SlickSlider from "@/Components/Settings/SlickSlider";
import ProductCard from "../Settings/ProductCard";
import useFilterOptions from "@/Hooks/useData";

/**
 * Autofill items to reach minimum count for slidesToShow
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

    if (!displayProducts?.length) {
        return (
            <Alert variant="info" className="text-center">
                {categoryName
                    ? `No products found${
                          brandId ? " for this brand" : ""
                      } in ${categoryName}`
                    : "No products available"}
            </Alert>
        );
    }

    const slidesToShow = withBanner ? 4 : 5;
    const sliderSettings = {
        slidesToShow,
        autoplay: true,
        autoplaySpeed: 6000,
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

    // Autofill products if not enough to fill slides
    const displayedProducts = autofillItems(displayProducts, slidesToShow);

    return (
        <SlickSlider {...sliderSettings}>
            {displayedProducts.map((item) => (
                <div className="px-1">
                    <ProductCard key={item.id} item={item} />
                </div>
            ))}
        </SlickSlider>
    );
}
