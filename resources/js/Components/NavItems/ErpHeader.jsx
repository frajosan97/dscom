import { useRolePermissions } from "@/Hooks/useRolePermissions";
import { usePage } from "@inertiajs/react";
import NavBar from "../Pages/NavBar";

export default function ErpHeader() {
    const { auth } = usePage().props;
    const { hasRole, hasPermission } = useRolePermissions();

    // Permission checks
    const canViewServices =
        hasPermission("view services") ||
        hasRole("director", "admin", "technician");
    const canViewStore =
        hasPermission("view store") || hasRole("director", "admin");
    const canViewAccounts =
        hasPermission("view accounts") ||
        hasRole("director", "admin", "finance");
    const canViewHR =
        hasPermission("view hr") || hasRole("director", "admin", "hr");
    const canViewReports =
        hasPermission("view reports") || hasRole("director", "admin");
    const canViewSettings = hasRole("director", "admin");

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
                    path: route("product.create"),
                    icon: "bi bi-plus-square",
                    label: "New Item",
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
                    path: route("barcode.index"),
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
            label: "CRM",
            icon: "bi bi-people-fill",
            show: true,
            children: [
                {
                    path: route("customers.index"),
                    icon: "bi bi-people",
                    label: "Customer/Supplier Mgnt",
                    show: true,
                },
                {
                    path: route("promotion.index"),
                    icon: "bi bi-bullseye",
                    label: "Campaigns / Promotions",
                    show: true,
                },
                {
                    path: route("feedback.index"),
                    icon: "bi bi-chat-dots",
                    label: "Customer Feedback",
                    show: true,
                },
                {
                    path: route("ticket.index"),
                    icon: "bi bi-headset",
                    label: "Customer Support / Tickets",
                    show: true,
                },
            ].filter((item) => item.show),
        },
        {
            label: "HRM",
            icon: "bi bi-people-fill",
            show: canViewHR,
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
                    path: route("finance.reports"),
                    icon: "bi bi-graph-up",
                    label: "Financial Reports",
                    show: true,
                },
                {
                    path: route("finance.chart-of-accounts"),
                    icon: "bi bi-journal-text",
                    label: "Chart of Accounts",
                    show: true,
                },
                {
                    path: route("finance.transactions"),
                    icon: "bi bi-arrow-left-right",
                    label: "Transactions",
                    show: true,
                },
                {
                    path: route("finance.invoices"),
                    icon: "bi bi-receipt-cutoff",
                    label: "Invoices",
                    show: true,
                },
                {
                    path: route("finance.payments"),
                    icon: "bi bi-currency-dollar",
                    label: "Payments",
                    show: true,
                },
                {
                    path: route("finance.bank-reconciliation"),
                    icon: "bi bi-bank",
                    label: "Bank Reconciliation",
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
