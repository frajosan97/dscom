import { useState } from "react";
import { Card, Container, Tab, Tabs } from "react-bootstrap";
import useFilterOptions from "@/Hooks/useData";
import ProductsList from "./ProductsList";

export default function TabProductList() {
    const { brands } = useFilterOptions();
    const [activeTab, setActiveTab] = useState("all");
    const [refreshKey, setRefreshKey] = useState(0);

    const handleTabSelect = (key) => {
        setActiveTab(key);
        setRefreshKey((prev) => prev + 1); // Increment key to force refresh
    };

    return (
        <Container fluid className="bg-white py-4 product-listing">
            <h2 className="text-center mb-4">Shop by Brand</h2>

            {/* Brands listing */}
            <Tabs
                activeKey={activeTab}
                onSelect={handleTabSelect}
                defaultActiveKey="all"
                transition={false}
                className="mb-3 d-flex justify-content-center"
            >
                <Tab eventKey="all" title="All">
                    <Card className="border-0 shadow-none rounded-0">
                        <Card.Body>
                            <ProductsList
                                key={`all-${refreshKey}`} // Add key to force remount
                                categoryName={"phones"}
                            />
                        </Card.Body>
                    </Card>
                </Tab>
                {brands.map((brand) => (
                    <Tab eventKey={brand.id} title={brand.name} key={brand.id}>
                        <Card className="border-0 shadow-none rounded-0">
                            <Card.Body>
                                <ProductsList
                                    key={`${brand.id}-${refreshKey}`} // Add key to force remount
                                    categoryName={"phones"}
                                    brandId={brand.id}
                                />
                            </Card.Body>
                        </Card>
                    </Tab>
                ))}
            </Tabs>
        </Container>
    );
}
