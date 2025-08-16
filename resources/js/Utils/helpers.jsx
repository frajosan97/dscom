import { Badge } from "react-bootstrap";

/**
 * Format a date string or Date object
 * @param {string|Date} date - The date to format
 * @param {string} [format='YYYY-MM-DD'] - The format string
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'DD/MM/YYYY') {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes);
}

export function formatFetchDate(date) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} [currency='USD'] - The currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** toFixed */
export function toFixed(value, decimals = 2) {
    if (typeof value !== 'number') return value;
    return Number(value.toFixed(decimals));
}

export function statusBadge(status) {
    // Determine badge background color based on status
    const getBadgeColor = () => {
        switch (status.toLowerCase()) {
            case "completed":
                return "success";
            case "pending":
                return "warning";
            default:
                return "danger";
        }
    };

    return (
        <Badge bg={getBadgeColor()}>
            {status}
        </Badge>
    );
}

// helper: safely coerce to number (handles "", "0", "00", "1,234.50")
export function num (v) {
    if (v === null || v === undefined) return 0;
    const s = typeof v === 'string' ? v.replace(/,/g, '').trim() : v;
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
};