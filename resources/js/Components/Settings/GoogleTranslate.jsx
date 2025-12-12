import React, { useEffect } from "react";

const GoogleTranslate = () => {
    // Force Google Translate French cookie BEFORE widget loads
    const setDefaultFrench = () => {
        document.cookie = "googtrans=/en/fr;path=/;";
        document.cookie = "googtrans=/en/fr;path=/;domain=" + window.location.hostname + ";";
    };

    useEffect(() => {
        // Set the cookie immediately
        setDefaultFrench();

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src =
            "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    includedLanguages: "en,fr",
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                },
                "google_translate_element"
            );
        };
    }, []);

    return <div id="google_translate_element"></div>;
};

export default GoogleTranslate;
