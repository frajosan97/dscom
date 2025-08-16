import { useRolePermissions } from "@/Hooks/useRolePermissions";
import { usePage } from "@inertiajs/react";
import NavBar from "../Pages/NavBar";

export default function ErpHeader() {
    const { auth } = usePage().props;
    const { hasRole, hasPermission } = useRolePermissions();

    // Permission checks
    const canViewServices = hasPermission('view services') || hasRole('admin');
    const canViewStore = hasPermission('view store') || hasRole('admin');
    const canViewAccounts = hasPermission('view accounts') || hasRole('admin');
    const canViewHR = hasPermission('view hr') || hasRole('admin');
    const canViewReports = hasPermission('view reports') || hasRole('admin');
    const canViewSettings = hasRole('admin');

    const baseItems = [
        {
            path: route('dashboard'),
            icon: "bi bi-house",
            label: "Home",
            show: true
        }
    ];

    const menuItems = [
        {
            label: "Store",
            icon: "bi bi-shop",
            show: canViewStore,
            children: [
                {
                    path: route('category.index'),
                    icon: "bi bi-journal-plus",
                    label: "Catalogue Management",
                    show: hasPermission('view categories')
                },
                {
                    path: route('brand.index'),
                    icon: "bi bi-journal-plus",
                    label: "Brands Management",
                    show: hasPermission('view brands')
                },
                {
                    path: route('product.index'),
                    icon: "bi bi-box-seam",
                    label: "Products Management",
                    show: hasPermission('view products')
                }
            ].filter(item => item.show)
        },
        {
            label: "Sales/Orders",
            icon: "bi bi-shop",
            show: true,
            children: [
                {
                    path: route('sales.index'),
                    icon: "bi bi-journal-plus",
                    label: "Sales History",
                    show: true,
                },
                {
                    path: route('sales.create'),
                    icon: "bi bi-journal-plus",
                    label: "New Sale",
                    show: true,
                },
            ].filter(item => item.show)
        },
        {
            label: "Services",
            icon: "bi bi-tools",
            show: canViewServices,
            children: [
                {
                    path: route('device-type.index'),
                    icon: "bi bi-journal-plus",
                    label: "Device Types",
                    show: true
                },
                {
                    path: route('repair-service.index'),
                    icon: "bi bi-journal-plus",
                    label: "Services List",
                    show: true
                },
                {
                    path: route('services.create'),
                    icon: "bi bi-person-gear",
                    label: "Service Request Entry",
                    show: true
                },
                {
                    path: route('services.index'),
                    icon: "bi bi-person-gear",
                    label: "All Services",
                    show: true
                },
                {
                    path: "#/services/assign-technician",
                    icon: "bi bi-person-gear",
                    label: "Assign Technician",
                    show: hasPermission('assign technician')
                },
                {
                    path: "#/services/take-for-job",
                    icon: "bi bi-box-seam",
                    label: "Take For Job",
                    show: hasPermission('take for job')
                },
                {
                    path: "#/services/return-from-service",
                    icon: "bi bi-check-circle",
                    label: "Close Job",
                    show: hasPermission('close job')
                },
                {
                    path: "#/services/item-delivery",
                    icon: "bi bi-truck",
                    label: "Item Delivery",
                    show: hasPermission('process delivery')
                },
                {
                    path: "#/services/spot-delivery",
                    icon: "bi bi-lightning-charge",
                    label: "Spot Delivery",
                    show: hasPermission('process spot delivery')
                },
                {
                    path: "#/services/outside-service",
                    icon: "bi bi-building",
                    label: "Outside Service",
                    show: hasPermission('manage outside service')
                },
                {
                    path: "#/services/return-from-outside-service",
                    icon: "bi bi-building-check",
                    label: "Return From Outside Service",
                    show: hasPermission('manage outside service')
                },
                {
                    path: "#/services/call-to-customer-and-response",
                    icon: "bi bi-telephone",
                    label: "Call To Customer And Response",
                    show: hasPermission('contact customer')
                },
                {
                    path: "#/services/refund",
                    icon: "bi bi-arrow-counterclockwise",
                    label: "Refund",
                    show: hasPermission('process refund')
                },
                {
                    path: "#/services/service-loss",
                    icon: "bi bi-exclamation-triangle",
                    label: "Service Loss",
                    show: hasPermission('record service loss')
                },
                {
                    path: "#/services/change-position-of-service",
                    icon: "bi bi-arrow-left-right",
                    label: "Change Position of Service",
                    show: hasPermission('modify service position')
                },
                {
                    label: "Reprint",
                    icon: "bi bi-printer",
                    show: hasPermission('reprint documents'),
                    children: [
                        {
                            path: "#/services/reprint/job-entry-single-print",
                            icon: "bi bi-file-earmark-text",
                            label: "Job Entry Single",
                            show: true
                        },
                        {
                            path: "#/services/reprint/delivery-single-print",
                            icon: "bi bi-receipt",
                            label: "Delivery Single",
                            show: true
                        },
                        {
                            path: "#/services/reprint/job-entry-multiple-print",
                            icon: "bi bi-files",
                            label: "Job Entry Multiple",
                            show: true
                        },
                        {
                            path: "#/services/reprint/delivery-multiple-print",
                            icon: "bi bi-collection",
                            label: "Delivery Multiple",
                            show: true
                        }
                    ].filter(item => item.show)
                },
                {
                    path: "#/services/feedback",
                    icon: "bi bi-chat-square-text",
                    label: "Feedback",
                    show: hasPermission('view feedback')
                },
                {
                    path: "#/services/communications",
                    icon: "bi bi-envelope",
                    label: "Communications",
                    show: hasPermission('view communications')
                },
                {
                    path: "#/services/job-barcode-printing",
                    icon: "bi bi-upc-scan",
                    label: "Job Barcode Printing",
                    show: hasPermission('print barcodes')
                }
            ].filter(item => item.show)
        },
        {
            label: "Accounts",
            icon: "bi bi-calculator",
            show: canViewAccounts,
            children: [
                {
                    path: "#/accounts/chart-of-accounts",
                    icon: "bi bi-diagram-3",
                    label: "Chart of Accounts",
                    show: hasPermission('view chart of accounts')
                },
                {
                    path: "#/accounts/ledgers",
                    icon: "bi bi-journal-text",
                    label: "Ledger",
                    show: hasPermission('view ledgers')
                },
                {
                    path: "#/accounts/reciept-entry",
                    icon: "bi bi-cash-stack",
                    label: "Receipt Entry",
                    show: hasPermission('create receipts')
                },
                {
                    path: "#/accounts/payment-entry",
                    icon: "bi bi-credit-card",
                    label: "Payment Entry",
                    show: hasPermission('create payments')
                },
                {
                    path: "#/accounts/journal-entry",
                    icon: "bi bi-journal-bookmark",
                    label: "Journal Entry",
                    show: hasPermission('create journal entries')
                }
            ].filter(item => item.show)
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
                    show: true
                },
                {
                    path: "#",
                    icon: "bi bi-calendar-check",
                    label: "Attendance Register",
                    show: true
                },
                {
                    path: "#",
                    icon: "bi bi-calendar-check",
                    label: "Salary Payment",
                    show: true
                },
                {
                    path: "#",
                    icon: "bi bi-calendar-check",
                    label: "Staff Review",
                    show: true
                },
                {
                    path: "#",
                    icon: "bi bi-calendar-check",
                    label: "Attendance Report",
                    show: true
                },
            ].filter(item => item.show)
        },
        {
            label: "Reports",
            icon: "bi bi-file-earmark-bar-graph",
            show: canViewReports,
            children: [
                {
                    path: "#/reports/mis-report/1",
                    icon: "bi bi-clipboard2-data",
                    label: "MIS Report",
                    show: hasPermission('view mis reports')
                },
                {
                    label: "Service Reports",
                    icon: "bi bi-tools",
                    show: hasPermission('view service reports'),
                    children: [
                        {
                            path: "#/reports/service-reports/job-entry-report",
                            icon: "bi bi-journal-text",
                            label: "Job Entry Report",
                            show: true
                        },
                        {
                            path: "#/reports/service-reports/due-date-based",
                            icon: "bi bi-calendar-x",
                            label: "Due Date Based Service Report",
                            show: true
                        }
                    ].filter(item => item.show)
                }
            ].filter(item => item.show)
        },
        {
            label: "Settings",
            icon: "bi bi-gear",
            show: canViewSettings,
            children: [
                {
                    path: route('slider.index'),
                    icon: "bi bi-journal-plus",
                    label: "Slides Management",
                    show: true
                },
                {
                    path: route('branch.index'),
                    icon: "bi bi-journal-plus",
                    label: "Branches Management",
                    show: true
                },
                {
                    path: route('warehouse.index'),
                    icon: "bi bi-journal-plus",
                    label: "Ware Houses",
                    show: true
                },
                {
                    path: route('payment-method.index'),
                    icon: "bi bi-journal-plus",
                    label: "Payment Methods",
                    show: true
                },
            ].filter(item => item.show)
        }
    ];

    const navItems = [
        ...baseItems.filter(item => item.show),
        ...menuItems.filter(item => item.show && (!item.children || item.children.length > 0))
    ];

    return <NavBar variant="erp" NavItems={navItems} />;
}