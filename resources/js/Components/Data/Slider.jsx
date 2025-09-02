import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import axios from "axios";
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

    const sliderSettings = {
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
        <SlickSlider key={slider.id || sliderName} {...sliderSettings}>
            {slider.items.map((item) => (
                <div key={item.id}>
                    <img
                        src={item.image}
                        className="img-fluid w-100"
                        alt={item.title || "Slider Image"}
                    />
                    {item.title && (
                        <h5 className="text-center mt-2">{item.title}</h5>
                    )}
                </div>
            ))}
        </SlickSlider>
    );
}
