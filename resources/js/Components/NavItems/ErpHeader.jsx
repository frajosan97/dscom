import { useRolePermissions } from "@/Hooks/useRolePermissions";
import { usePage } from "@inertiajs/react";
import NavBar from "../Pages/NavBar";

export default function ErpHeader() {
    const { auth } = usePage().props;
    const { hasRole, hasPermission } = useRolePermissions();

    // Roles
    const isDirector = hasRole("director");
    const isAdmin = hasRole("admin");
    const isHR = hasRole("hr");
    const isFinance = hasRole("finance");
    const isSales = hasRole("sales");
    const isReceptionist = hasRole("receptionist");
    const isTechnician = hasRole("technician");
    const isCustomer = hasRole("customer");

    // Admin & Director override everything
    const isSuper = isDirector || isAdmin;

    // Permissions
    const canViewServices =
        isSuper || isTechnician || hasPermission("view services");

    const canViewStore =
        isSuper || isSales || isReceptionist || hasPermission("view store");

    const canViewAccounts =
        isSuper || isFinance || hasPermission("view accounts");

    const canViewHR = isSuper || isHR || hasPermission("view hr");

    const canViewReports = isSuper || hasPermission("view reports");

    const canViewSettings = isSuper;

    // HR-only mode
    const showOnlyHR = isHR && !isSuper;

    // Finance-only mode
    const showOnlyAccounts = isFinance && !isSuper;

    // CRM horizontal mode
    const showCRMHorizontal = isSales || isReceptionist;

    // Base Items
    const baseItems = [
        {
            path: route("dashboard"),
            icon: "bi bi-speedometer2",
            label: "Dashboard",
            show: true,
        },
    ];

    // CRM menu items
    const crmMenuItems = [
        {
            path: route("customers.index"),
            icon: "bi bi-people",
            label: "Customer",
            show: !isCustomer,
        },
        {
            path: route("customers.create"),
            icon: "bi bi-person-plus",
            label: "New Customer",
            show: !isCustomer,
        },
        {
            path: route("promotion.index"),
            icon: "bi bi-bullseye",
            label: "Promotions",
            show: true,
        },
        {
            path: route("feedback.index"),
            icon: "bi bi-chat-dots",
            label: "Feedback",
            show: true,
        },
        {
            path: route("ticket.index"),
            icon: "bi bi-headset",
            label: "Support Tickets",
            show: true,
        },
    ].filter((i) => i.show);

    // Main Menu
    const menuItems = [
        {
            label: "Store",
            icon: "bi bi-cart3",
            show: (canViewStore || isSuper) && !showOnlyHR && !showOnlyAccounts,
            children: [
                {
                    path: route("product.index"),
                    icon: "bi bi-boxes",
                    label: "Items List",
                    show: true,
                },
                {
                    path: route("product.create"),
                    icon: "bi bi-plus-square",
                    label: "New Item",
                    show: !isSales && !isReceptionist,
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
                    show: isSales || isReceptionist || isSuper,
                },
                // {
                //     path: route("barcode.index"),
                //     icon: "bi bi-upc-scan",
                //     label: "Barcode Printing",
                //     show: !isSales && !isReceptionist,
                // },
            ].filter((i) => i.show),
        },

        {
            label: "Services",
            icon: "bi bi-tools",
            show:
                (canViewServices || isSuper) &&
                !showOnlyHR &&
                !showOnlyAccounts,
            children: [
                {
                    path: route("device-type.index"),
                    icon: "bi bi-hdd-stack",
                    label: "Device Types",
                    show: isTechnician || isSuper,
                },
                {
                    path: route("repair-service.index"),
                    icon: "bi bi-wrench-adjustable",
                    label: "Repair Services",
                    show: isTechnician || isSuper,
                },
                {
                    path: route("repair-orders.create"),
                    icon: "bi bi-clipboard-plus",
                    label: "Service Job Entry",
                    show: isReceptionist || isTechnician || isSuper,
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
                    show: isSuper || isReceptionist,
                },
            ].filter((i) => i.show),
        },

        {
            label: "CRM",
            icon: "bi bi-people-fill",
            show: !showOnlyHR && !showOnlyAccounts && !showCRMHorizontal,
            children: crmMenuItems,
        },

        {
            label: "HRM",
            icon: "bi bi-people-fill",
            show: canViewHR || isSuper,
            children: [
                {
                    path: route("employee.index"),
                    icon: "bi bi-person-gear",
                    label: "Employee Mgnt",
                    show: true,
                },
                {
                    path: route("employee.create"),
                    icon: "bi bi-person-plus",
                    label: "New Employee",
                    show: isSuper || isHR,
                },
                {
                    path: route("attendance.index"),
                    icon: "bi bi-clock-history",
                    label: "Attendance Mgnt",
                    show: true,
                },
                {
                    path: route("salary.index"),
                    icon: "bi bi-cash-coin",
                    label: "Salaries Mgnt",
                    show: isSuper || isHR || isFinance,
                },
            ].filter((i) => i.show),
        },

        {
            label: "Accounts",
            icon: "bi bi-journal-arrow-down",
            show: canViewAccounts || isSuper,
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
                    show: isFinance || isSuper,
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
                    show: isFinance || isSuper,
                },
            ].filter((i) => i.show),
        },

        {
            label: "Settings",
            icon: "bi bi-gear-fill",
            show: canViewSettings || isSuper,
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
            ].filter((i) => i.show),
        },
    ];

    // Final nav items
    let navItems = [
        ...baseItems,
        ...menuItems.filter((i) => i.show && i.children.length > 0),
    ];

    // HR-only
    if (showOnlyHR && !isSuper) {
        navItems = [
            ...baseItems,
            ...menuItems.filter((i) => i.label === "HRM"),
        ];
    }

    // Finance-only
    if (showOnlyAccounts && !isSuper) {
        navItems = [
            ...baseItems,
            ...menuItems.filter((i) => i.label === "Accounts"),
        ];
    }

    return (
        <NavBar
            variant="erp"
            NavItems={navItems}
            horizontalCRMItems={showCRMHorizontal ? crmMenuItems : []}
        />
    );
}
