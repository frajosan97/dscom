import React, { useEffect, useRef } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.min.js';

export default function SlickSlider({
    children,
    slidesToShow = 3,
    slidesToScroll = 1,
    autoplay = false,
    autoplaySpeed = 3000,
    dots = false,
    arrows = true,
    infinite = true,
    speed = 300,
    responsive = null,
    className = '',
    ...props
}) {

    const sliderRef = useRef(null);

    useEffect(() => {
        if (sliderRef.current) {
            $(sliderRef.current).slick({
                slidesToShow,
                slidesToScroll,
                autoplay,
                autoplaySpeed,
                dots,
                arrows,
                infinite,
                speed,
                responsive,
                ...props
            });
        }

        return () => {
            if (sliderRef.current) {
                $(sliderRef.current).slick('unslick');
            }
        };
    }, [
        slidesToShow,
        slidesToScroll,
        autoplay,
        autoplaySpeed,
        dots,
        arrows,
        infinite,
        speed,
        responsive,
        props
    ]);

    return (
        <div className={`slick-slider ${className}`} ref={sliderRef}>
            {React.Children.map(children, (child, index) => (
                <div key={index} className="slick-slide">
                    {child}
                </div>
            ))}
        </div>
    );
}