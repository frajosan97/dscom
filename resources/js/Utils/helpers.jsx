import { Badge } from "react-bootstrap";

/**
 * Generic input change handler for various input types
 * @param {Event} e - The change event
 * @param {Function} setData - State setter function
 * @param {Object} errors - Current errors object
 * @param {Function} setErrors - Error state setter function (optional)
 * @returns {void}
 */
export const handleInputChange = (
    e,
    setData,
    errors = null,
    setErrors = null
) => {
    const { name, value, type, files, checked } = e.target;

    setData((prev) => ({
        ...prev,
        [name]:
            type === "checkbox"
                ? checked
                : type === "file"
                ? files[0]
                : type === "number"
                ? parseFloat(value) || 0
                : type === "select-multiple"
                ? Array.from(e.target.selectedOptions, (option) => option.value)
                : value,
    }));

    // Clear error for this field if it exists
    if (errors && setErrors && errors[name]) {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
};

/**
 * Generic select change handler for react-select components
 * @param {string} fieldName - The field name to update
 * @param {Function} setData - State setter function
 * @param {Object} selectedOption - The selected option from react-select
 * @param {Object} errors - Current errors object
 * @param {Function} setErrors - Error state setter function (optional)
 * @returns {void}
 */
export const handleSelectChange = (
    fieldName,
    setData,
    selectedOption,
    errors = null,
    setErrors = null
) => {
    setData((prev) => ({
        ...prev,
        [fieldName]: selectedOption?.value || null,
    }));

    // Clear error for this field if it exists
    if (errors && setErrors && errors[fieldName]) {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }
};

/**
 * Handler for multiple select (react-select with isMulti)
 * @param {string} fieldName - The field name to update
 * @param {Function} setData - State setter function
 * @param {Array} selectedOptions - Array of selected options
 * @param {Object} errors - Current errors object
 * @param {Function} setErrors - Error state setter function (optional)
 * @returns {void}
 */
export const handleMultiSelectChange = (
    fieldName,
    setData,
    selectedOptions,
    errors = null,
    setErrors = null
) => {
    setData((prev) => ({
        ...prev,
        [fieldName]: selectedOptions
            ? selectedOptions.map((option) => option.value)
            : [],
    }));

    if (errors && setErrors && errors[fieldName]) {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }
};

/**
 * Handler for file upload with multiple files
 * @param {string} fieldName - The field name to update
 * @param {Function} setData - State setter function
 * @param {FileList} files - File list from input
 * @param {Object} errors - Current errors object
 * @param {Function} setErrors - Error state setter function (optional)
 * @returns {void}
 */
export const handleFileUpload = (
    fieldName,
    setData,
    files,
    errors = null,
    setErrors = null
) => {
    setData((prev) => ({
        ...prev,
        [fieldName]: Array.from(files),
    }));

    if (errors && setErrors && errors[fieldName]) {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }
};

/**
 * Handler for rich text editor changes
 * @param {string} fieldName - The field name to update
 * @param {Function} setData - State setter function
 * @param {string} content - The editor content
 * @param {Object} errors - Current errors object
 * @param {Function} setErrors - Error state setter function (optional)
 * @returns {void}
 */
export const handleRichTextChange = (
    fieldName,
    setData,
    content,
    errors = null,
    setErrors = null
) => {
    setData((prev) => ({
        ...prev,
        [fieldName]: content,
    }));

    if (errors && setErrors && errors[fieldName]) {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }
};

/**
 * Factory function to create pre-bound handlers for better performance
 * @param {Function} setData - State setter function
 * @param {Object} errors - Current errors object
 * @param {Function} setErrors - Error state setter function
 * @returns {Object} Object with pre-bound handlers
 */
export const createFormHandlers = (setData, errors, setErrors) => {
    return {
        handleInput: (e) => handleInputChange(e, setData, errors, setErrors),
        handleSelect: (fieldName) => (selectedOption) =>
            handleSelectChange(
                fieldName,
                setData,
                selectedOption,
                errors,
                setErrors
            ),
        handleMultiSelect: (fieldName) => (selectedOptions) =>
            handleMultiSelectChange(
                fieldName,
                setData,
                selectedOptions,
                errors,
                setErrors
            ),
        handleFiles: (fieldName) => (files) =>
            handleFileUpload(fieldName, setData, files, errors, setErrors),
        handleRichText: (fieldName) => (content) =>
            handleRichTextChange(
                fieldName,
                setData,
                content,
                errors,
                setErrors
            ),
    };
};

/**
 * Utility to format options for react-select components
 * @param {Array} items - Array of items to format
 * @param {string} valueKey - Key for the value property (default: 'id')
 * @param {string} labelKey - Key for the label property (default: 'name')
 * @returns {Array} Formatted options array
 */
export const formatSelectOptions = (
    items,
    valueKey = "id",
    labelKey = "name"
) => {
    return items.map((item) => ({
        value: item[valueKey],
        label: item[labelKey],
    }));
};

/**
 * Utility to find selected option for react-select
 * @param {*} value - The current value
 * @param {Array} options - Formatted options array
 * @returns {Object|null} The selected option object or null
 */
export const findSelectedOption = (value, options) => {
    if (value === null || value === undefined) return null;
    return options.find((option) => option.value === value) || null;
};

/**
 * Utility to find selected options for react-select
 * @param {Array} values - Array of selected values
 * @param {Array} options - Formatted options array
 * @returns {Array} An array of selected option objects
 */
export const findSelectedOptions = (values, options) => {
    if (!values || values.length === 0) return [];
    return values.map((value) => findSelectedOption(value, options));
};

export function formatDate(date, format = "DD/MM/YYYY") {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return format
        .replace("YYYY", year)
        .replace("MM", month)
        .replace("DD", day)
        .replace("HH", hours)
        .replace("mm", minutes);
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

export function formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function lowercase(str) {
    if (!str) return "";
    return str.toLowerCase();
}

export function toFixed(value, decimals = 2) {
    if (typeof value !== "number") return value;
    return Number(value.toFixed(decimals));
}

export function statusBadge(status) {
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

    return <Badge bg={getBadgeColor()}>{status}</Badge>;
}

export function num(v) {
    if (v === null || v === undefined) return 0;
    const s = typeof v === "string" ? v.replace(/,/g, "").trim() : v;
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
}
