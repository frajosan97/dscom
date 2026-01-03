import { useRolePermissions } from "@/Hooks/useRolePermissions";
import { usePage } from "@inertiajs/react";
import NavBar from "../Pages/NavBar";

export default function ErpHeader() {
    const { auth } = usePage().props;
    const { hasRole, hasPermission } = useRolePermissions();

    // Roles
    const roles = {
        isDirector: hasRole("director"),
        isAdmin: hasRole("admin"),
        isHR: hasRole("hr"),
        isFinance: hasRole("finance"),
        isSales: hasRole("sales"),
        isReceptionist: hasRole("receptionist"),
        isTechnician: hasRole("technician"),
        isCustomer: hasRole("customer"),
        isSupplier: hasRole("supplier"), // added supplier role
    };

    const isSuper = roles.isDirector || roles.isAdmin;

    // Permissions
    const permissions = {
        canViewServices:
            isSuper || roles.isTechnician || hasPermission("view services"),
        canViewStore:
            isSuper ||
            roles.isSales ||
            roles.isReceptionist ||
            roles.isSupplier ||
            hasPermission("view store"),
        canViewAccounts:
            isSuper || roles.isFinance || hasPermission("view accounts"),
        canViewHR: isSuper || roles.isHR || hasPermission("view hr"),
        canViewReports: isSuper || hasPermission("view reports"),
        canViewSettings: isSuper,
    };

    // Horizontal menu flags
    const showHRHorizontalMenu = roles.isHR && !isSuper;
    const showFinanceHorizontalMenu = roles.isFinance && !isSuper;
    const showTechnicianHorizontalMenu = roles.isTechnician && !isSuper;
    const showSupplierHorizontalMenu = roles.isSupplier && !isSuper;
    const showCRMHorizontalMenu =
        roles.isSales || roles.isReceptionist || roles.isCustomer;

    // Base Items (always visible)
    const baseItems = [
        {
            path: route("dashboard"),
            icon: "bi bi-speedometer2",
            label: "Dashboard",
            show: true,
        },
    ];

    // CRM menu (hidden from Supplier)
    const crmMenuItems = [
        {
            path: route("customers.index"),
            icon: "bi bi-people",
            label: "Customer",
            show: !roles.isCustomer && !roles.isSupplier,
        },
        {
            path: route("customers.create"),
            icon: "bi bi-person-plus",
            label: "New Customer",
            show: !roles.isCustomer && !roles.isSupplier,
        },
        {
            path: route("promotion.index"),
            icon: "bi bi-bullseye",
            label: "Promotions",
            show: !roles.isSupplier,
        },
        {
            path: route("feedback.index"),
            icon: "bi bi-chat-dots",
            label: "Feedback",
            show: !roles.isSupplier,
        },
        {
            path: route("ticket.index"),
            icon: "bi bi-headset",
            label: "Support Tickets",
            show: !roles.isSupplier,
        },
    ].filter((i) => i.show);

    // HRM menu
    const hrmMenuItems = [
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
            show: isSuper || roles.isHR,
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
            show: isSuper || roles.isHR || roles.isFinance,
        },
    ].filter((i) => i.show);

    // Services menu (for Technicians)
    const servicesMenuItems = [
        {
            path: route("device-type.index"),
            icon: "bi bi-hdd-stack",
            label: "Device Types",
            show: roles.isTechnician || isSuper,
        },
        {
            path: route("repair-service.index"),
            icon: "bi bi-wrench-adjustable",
            label: "Repair Services",
            show: roles.isTechnician || isSuper,
        },
        {
            path: route("repair-orders.create"),
            icon: "bi bi-clipboard-plus",
            label: "Service Job Entry",
            show: roles.isReceptionist || roles.isTechnician || isSuper,
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
            show: isSuper || roles.isReceptionist,
        },
    ].filter((i) => i.show);

    // Accounts menu (for Finance)
    const accountsMenuItems = [
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
            show: roles.isFinance || isSuper,
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
            show: roles.isFinance || isSuper,
        },
    ].filter((i) => i.show);

    // Store menu (for Supplier horizontal view)
    const storeMenuItems = [
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
            show: !roles.isSales && !roles.isReceptionist,
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
            show: roles.isSales || roles.isReceptionist || isSuper,
        },
    ].filter((i) => i.show);

    // Main vertical menu
    const menuItems = [
        {
            label: "Store",
            icon: "bi bi-cart3",
            show:
                (permissions.canViewStore || isSuper) &&
                !showSupplierHorizontalMenu &&
                !showOnlyHR &&
                !showFinanceHorizontalMenu,
            children: storeMenuItems,
        },
        {
            label: "Services",
            icon: "bi bi-tools",
            show:
                (permissions.canViewServices || isSuper) &&
                !showTechnicianHorizontalMenu,
            children: servicesMenuItems,
        },
        {
            label: "CRM",
            icon: "bi bi-people-fill",
            show: !showCRMHorizontalMenu,
            children: crmMenuItems,
        },
        {
            label: "HRM",
            icon: "bi bi-people-fill",
            show: isSuper && !showHRHorizontalMenu,
            children: hrmMenuItems,
        },
        {
            label: "Accounts",
            icon: "bi bi-journal-arrow-down",
            show:
                (permissions.canViewAccounts || isSuper) &&
                !showFinanceHorizontalMenu,
            children: accountsMenuItems,
        },
        {
            label: "Settings",
            icon: "bi bi-gear-fill",
            show: permissions.canViewSettings || isSuper,
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

    // Final vertical nav items
    let navItems = [
        ...baseItems,
        ...menuItems.filter((i) => i.show && i.children.length > 0),
    ];

    // Vertical overrides: hide vertical menus if horizontal menu is active
    if (showHRHorizontalMenu && !isSuper) navItems = [...baseItems];
    if (showFinanceHorizontalMenu && !isSuper) navItems = [...baseItems];
    if (showTechnicianHorizontalMenu && !isSuper) navItems = [...baseItems];
    if (showSupplierHorizontalMenu && !isSuper) navItems = [...baseItems];

    // Unified horizontal menu
    const horizontalItems = showHRHorizontalMenu
        ? hrmMenuItems
        : showFinanceHorizontalMenu
        ? accountsMenuItems
        : showTechnicianHorizontalMenu
        ? servicesMenuItems
        : showSupplierHorizontalMenu
        ? storeMenuItems
        : showCRMHorizontalMenu
        ? crmMenuItems
        : [];

    return (
        <NavBar
            variant="erp"
            NavItems={navItems}
            horizontalItems={horizontalItems}
        />
    );
}
