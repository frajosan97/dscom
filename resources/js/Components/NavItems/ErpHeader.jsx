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
            icon: "bi bi-speedometer2",
            label: "Dashboard",
            show: true,
        },
    ];

    const menuItems = [
        {
            label: "Store",
            icon: "bi bi-cart3",
            show: canViewStore,
            children: [
                {
                    path: route("product.index"),
                    icon: "bi bi-boxes",
                    label: "Items Register",
                    show: true,
                },
                {
                    path: route("sales.index"),
                    icon: "bi bi-receipt",
                    label: "Sales List",
                    show: true,
                },
                {
                    path: route("sales.create"),
                    icon: "bi bi-cart-plus",
                    label: "New Sale",
                    show: true,
                },
                {
                    path: route("sales.create"),
                    icon: "bi bi-upc-scan",
                    label: "Store Barcode Printing",
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
                    path: route("device-type.index"),
                    icon: "bi bi-hdd-stack",
                    label: "Device Types",
                    show: true,
                },
                {
                    path: route("repair-service.index"),
                    icon: "bi bi-wrench-adjustable",
                    label: "Repair Services",
                    show: true,
                },
                {
                    path: route("repair-orders.create"),
                    icon: "bi bi-clipboard-plus",
                    label: "Service Job Entry",
                    show: true,
                },
                {
                    path: route("repair-orders.index"),
                    icon: "bi bi-clipboard-data",
                    label: "Jobs List & Status",
                    show: true,
                },
                {
                    path: route("repair-orders.assign-technician"),
                    icon: "bi bi-person-badge",
                    label: "Assign Technician",
                    show: true,
                },
            ].filter((item) => item.show),
        },
        {
            label: "HR Management",
            icon: "bi bi-people-fill",
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
                    icon: "bi bi-clock-history",
                    label: "Attendance",
                    show: true,
                },
                {
                    path: route("salary.index"),
                    icon: "bi bi-cash-coin",
                    label: "Salary Payment",
                    show: true,
                },
            ].filter((item) => item.show),
        },
        {
            label: "Accounts",
            icon: "bi bi-journal-arrow-down",
            show: canViewAccounts,
            children: [
                {
                    path: "",
                    icon: "bi bi-journal-text",
                    label: "Chart of Accounts",
                    show: true,
                },
                {
                    path: "",
                    icon: "bi bi-arrow-left-right",
                    label: "Transactions",
                    show: true,
                },
                {
                    path: "",
                    icon: "bi bi-graph-up",
                    label: "Financial Reports",
                    show: true,
                },
            ].filter((item) => item.show),
        },
        {
            label: "Reports",
            icon: "bi bi-bar-chart",
            show: canViewReports,
            children: [
                {
                    path: "",
                    icon: "bi bi-currency-dollar",
                    label: "Sales Reports",
                    show: true,
                },
                {
                    path: "",
                    icon: "bi bi-box-seam",
                    label: "Inventory Reports",
                    show: true,
                },
                {
                    path: "",
                    icon: "bi bi-tools",
                    label: "Service Reports",
                    show: true,
                },
            ].filter((item) => item.show),
        },
        {
            label: "Settings",
            icon: "bi bi-gear-fill",
            show: canViewSettings,
            children: [
                {
                    path: route("slider.index"),
                    icon: "bi bi-images",
                    label: "Slides Management",
                    show: true,
                },
                {
                    path: route("branch.index"),
                    icon: "bi bi-building",
                    label: "Branches",
                    show: true,
                },
                {
                    path: route("warehouse.index"),
                    icon: "bi bi-house-gear",
                    label: "Ware Houses",
                    show: true,
                },
                {
                    path: route("payment-method.index"),
                    icon: "bi bi-credit-card",
                    label: "Payment Methods",
                    show: true,
                },
                {
                    path: route("category.index"),
                    icon: "bi bi-tags",
                    label: "Catalogues List",
                    show: true,
                },
                {
                    path: route("brand.index"),
                    icon: "bi bi-tag",
                    label: "Brands List",
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
