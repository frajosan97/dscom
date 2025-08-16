import { Head } from "@inertiajs/react";
import AboutUsShortDesc from "@/Components/Pages/AboutUsShortDesc";
import CategoryExplore from "@/Components/Data/CategoryExplore";
import ContactInfoBar from "@/Components/Pages/ContactInfoBar";
import HeroPage from "@/Components/Pages/HeroPage";
import AccessoryList from "@/Components/Data/Accessories";
import TabProductList from "@/Components/Data/TabProductsList";
import AppLayout from "@/Layouts/AppLayout";
import PhonesWithBannerList from "@/Components/Data/PhonesWithBanner";
import LaptopsList from "@/Components/Data/Laptops";
import DesktopsList from "@/Components/Data/Desktops";

export default function Home({ children }) {
    return (
        <AppLayout>
            <Head title="Home" />
            <HeroPage />
            <CategoryExplore />
            <LaptopsList />
            <PhonesWithBannerList />
            <AccessoryList />
            <DesktopsList />
            <TabProductList />
            <AboutUsShortDesc />
            <ContactInfoBar />
        </AppLayout>
    );
}
