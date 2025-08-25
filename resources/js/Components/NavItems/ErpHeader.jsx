import { useRolePermissions } from "@/Hooks/useRolePermissions";
import { usePage } from "@inertiajs/react";
import NavBar from "../Pages/NavBar";

export default function ErpHeader() {
    const { auth } = usePage().props;
    const { hasRole, hasPermission } = useRolePermissions();

    // Permission checks
    const canViewServices = hasPermission("view services") || hasRole("admin");
    const canViewStore = hasPermission("view store") || hasRole("admin");
    const canViewAccounts = hasPermission("view accounts") || hasRole("admin");
    const canViewHR = hasPermission("view hr") || hasRole("admin");
    const canViewReports = hasPermission("view reports") || hasRole("admin");
    const canViewSettings = hasRole("admin");

    const baseItems = [
        {
            path: route("dashboard"),
            icon: "bi bi-house",
            label: "Dashboard",
            show: true,
        },
    ];

    const menuItems = [
        {
            label: "Store",
            icon: "bi bi-shop",
            show: canViewStore,
            children: [
                {
                    path: route("product.index"),
                    icon: "bi bi-box-seam",
                    label: "Items Register",
                    show: true,
                },
                {
                    path: route("product.create"),
                    icon: "bi bi-box-seam",
                    label: "New Item",
                    show: true,
                },
                {
                    path: route("product.index"),
                    icon: "bi bi-box-seam",
                    label: "Purchase",
                    show: true,
                },
                {
                    path: route("sales.index"),
                    icon: "bi bi-journal-plus",
                    label: "Sales",
                    show: true,
                },
                {
                    path: route("sales.create"),
                    icon: "bi bi-journal-plus",
                    label: "Sales Entry",
                    show: true,
                },
            ].filter((item) => item.show),
        },
        {
            label: "Services",
            icon: "bi bi-tools",
            show: canViewServices,
            children: [
                {
                    path: route("services.create"),
                    icon: "bi bi-person-gear",
                    label: "Job Entry",
                    show: hasPermission("assign technician"),
                },
                {
                    path: "#/services/assign-technician",
                    icon: "bi bi-person-gear",
                    label: "Assign Technician",
                    show: hasPermission("assign technician"),
                },
                {
                    path: "#/services/take-for-job",
                    icon: "bi bi-box-seam",
                    label: "Take For Job",
                    show: hasPermission("take for job"),
                },
                {
                    path: "#/services/return-from-service",
                    icon: "bi bi-check-circle",
                    label: "Close Job",
                    show: hasPermission("close job"),
                },
                {
                    path: "#/services/item-delivery",
                    icon: "bi bi-truck",
                    label: "Item Delivery",
                    show: hasPermission("process delivery"),
                },
                {
                    path: "#/services/spot-delivery",
                    icon: "bi bi-lightning-charge",
                    label: "Spot Delivery",
                    show: hasPermission("process spot delivery"),
                },
                {
                    path: "#/services/outside-service",
                    icon: "bi bi-building",
                    label: "Outside Service",
                    show: hasPermission("manage outside service"),
                },
                {
                    path: "#/services/return-from-outside-service",
                    icon: "bi bi-building-check",
                    label: "Return From Outside Service",
                    show: hasPermission("manage outside service"),
                },
                {
                    path: "#/services/call-to-customer-and-response",
                    icon: "bi bi-telephone",
                    label: "Call To Customer And Response",
                    show: hasPermission("contact customer"),
                },
                {
                    path: "#/services/refund",
                    icon: "bi bi-arrow-counterclockwise",
                    label: "Refund",
                    show: hasPermission("process refund"),
                },
                {
                    path: "#/services/service-loss",
                    icon: "bi bi-exclamation-triangle",
                    label: "Service Loss",
                    show: hasPermission("record service loss"),
                },
                {
                    path: "#/services/change-position-of-service",
                    icon: "bi bi-arrow-left-right",
                    label: "Change Position of Service",
                    show: hasPermission("modify service position"),
                },
            ].filter((item) => item.show),
        },
        {
            label: "HR Management",
            icon: "bi bi-people",
            show: true,
            children: [
                {
                    path: route("employee.index"),
                    icon: "bi bi-person-gear",
                    label: "User Management",
                    show: true,
                },
                {
                    path: route("attendance.index"),
                    icon: "bi bi-calendar-check",
                    label: "Attendance",
                    show: true,
                },
                {
                    path: route("salary.index"),
                    icon: "bi bi-calendar-check",
                    label: "Salary Payment",
                    show: true,
                },
            ].filter((item) => item.show),
        },
        {
            label: "Settings",
            icon: "bi bi-gear",
            show: canViewSettings,
            children: [
                {
                    path: route("slider.index"),
                    icon: "bi bi-journal-plus",
                    label: "Slides Management",
                    show: true,
                },
                {
                    path: route("branch.index"),
                    icon: "bi bi-journal-plus",
                    label: "Branches",
                    show: true,
                },
                {
                    path: route("warehouse.index"),
                    icon: "bi bi-journal-plus",
                    label: "Ware Houses",
                    show: true,
                },
                {
                    path: route("payment-method.index"),
                    icon: "bi bi-journal-plus",
                    label: "Payment Methods",
                    show: true,
                },
                {
                    path: route("category.index"),
                    icon: "bi bi-journal-plus",
                    label: "Catalogue",
                    show: true,
                },
                {
                    path: route("brand.index"),
                    icon: "bi bi-journal-plus",
                    label: "Brands",
                    show: true,
                },
            ].filter((item) => item.show),
        },
    ];

    const navItems = [
        ...baseItems.filter((item) => item.show),
        ...menuItems.filter(
            (item) => item.show && (!item.children || item.children.length > 0)
        ),
    ];

    return <NavBar variant="erp" NavItems={navItems} />;
}
