import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner, Button } from "react-bootstrap";
import { ArrowRight } from "react-feather";
import SlickSlider from "../Settings/SlickSlider";

export default function Slider({ sliderName = "hero" }) {
    const [slider, setSlider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sliderName) return;

        const controller = new AbortController();

        const fetchSlider = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    route("api.slider", sliderName),
                    {
                        signal: controller.signal,
                    }
                );

                setSlider(response.data);
                setError(null);
            } catch (err) {
                if (!axios.isCancel(err)) {
                    setError(
                        err?.response?.data?.message || "Failed to load slider."
                    );
                    setSlider(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSlider();

        return () => controller.abort();
    }, [sliderName]);

    const renderStatusContainer = (content) => (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "300px", width: "100%" }}
        >
            <div className="text-center">{content}</div>
        </div>
    );

    if (loading) {
        return renderStatusContainer(
            <>
                <Spinner animation="border" role="status" variant="primary" />
                <p>Loading Slider...</p>
            </>
        );
    }

    if (error) {
        return renderStatusContainer(<p className="text-danger">{error}</p>);
    }

    if (!slider?.items?.length) {
        return renderStatusContainer(<p>No active slider found!</p>);
    }

    const settings = {
        slidesToShow: 1,
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
                    settings: {
                        arrows: false,
                        dots: false,
                    },
                },
            ],
        },
    };

    return (
        <SlickSlider key={slider.id || sliderName} {...settings}>
            {slider.items.map((item) => {
                const buttonVariant =
                    item.textContrast === "dark" ? "dark" : "light";

                return (
                    <div
                        key={item.id}
                        className="slider-item"
                        style={{ background: item.bgGradient }}
                    >
                        <div
                            className={`slider-content d-flex flex-column flex-md-row align-items-center justify-content-center h-100 p-5 ${
                                item.imagePosition === "right"
                                    ? "flex-md-row-reverse"
                                    : ""
                            }`}
                        >
                            <div className="slider-text text-center text-md-start mb-4 mb-md-0">
                                {item.title && (
                                    <h1 className="slider-title display-5 fw-bold">
                                        {item.title}
                                    </h1>
                                )}
                                {item.subtitle && (
                                    <h2 className="slider-subtitle h4 text-muted mb-3">
                                        {item.subtitle}
                                    </h2>
                                )}
                                {item.description && (
                                    <p className="slider-description lead mb-4">
                                        {item.description}
                                    </p>
                                )}
                                <div className="button-group">
                                    {item.button_text && (
                                        <Button
                                            variant={buttonVariant}
                                            className="slider-button btn-lg"
                                        >
                                            {item.button_text}{" "}
                                            <ArrowRight
                                                className="ms-2"
                                                size={20}
                                            />
                                        </Button>
                                    )}
                                    {item.secondary_button_text && (
                                        <Button
                                            variant={buttonVariant}
                                            className="slider-button btn-lg ms-2"
                                        >
                                            {item.secondary_button_text}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {item.image && (
                                <div className="slider-image-wrapper ms-md-4 flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.title || "Slider image"}
                                        className="slider-image img-fluid rounded shadow-lg"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </SlickSlider>
    );
}
