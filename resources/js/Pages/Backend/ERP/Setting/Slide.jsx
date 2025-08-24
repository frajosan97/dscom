import { Head, router } from "@inertiajs/react";
import { useCallback, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { BiSliderAlt } from "react-icons/bi";
import { FiSliders } from "react-icons/fi";

import ErpLayout from "@/Layouts/ErpLayout";
import SlidesTable from "@/Components/Partials/Slides/SlidesTable";
import SliderItems from "@/Components/Partials/Slides/SlidesItems";

export default function Employee() {
    const [activeTab, setActiveTab] = useState("sliders");
    const [sliderShowData, setSliderShowData] = useState(null);
    const [isSliderShowEnable, setIsSliderShowEnable] = useState(false);

    const handleTabSelect = useCallback((key) => {
        setActiveTab(key);
        if (key !== "slider-items") {
            setIsSliderShowEnable(false);
            setSliderShowData(null);
        }
    }, []);

    const hadleShowSlider = useCallback((data) => {
        setActiveTab("slider-items");
        setIsSliderShowEnable(true);
        setSliderShowData(data);
    }, []);

    const handleSuccess = useCallback(() => {
        setActiveTab("sliders");
        router.reload();
    }, []);

    return (
        <ErpLayout>
            <Head title="Slides Management" />

            <Tabs
                activeKey={activeTab}
                onSelect={handleTabSelect}
                className="users-tabs mb-3"
                id="slides-management-tabs"
            >
                <Tab
                    eventKey="sliders"
                    title={
                        <>
                            <BiSliderAlt size={16} className="me-1" /> Sliders
                        </>
                    }
                >
                    <SlidesTable showSlider={hadleShowSlider} />
                </Tab>

                {isSliderShowEnable && (
                    <Tab
                        eventKey="slider-items"
                        title={
                            <>
                                <FiSliders size={16} className="me-1" />{" "}
                                {sliderShowData?.name}
                            </>
                        }
                        disabled={!isSliderShowEnable}
                    >
                        {sliderShowData ? (
                            <SliderItems
                                slider={sliderShowData}
                                onSuccess={handleSuccess}
                            />
                        ) : (
                            <div className="text-center py-4">
                                <p>Please select a slider to view</p>
                            </div>
                        )}
                    </Tab>
                )}
            </Tabs>
        </ErpLayout>
    );
}
