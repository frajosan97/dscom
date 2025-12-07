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

export function formatTime(time) {
    return time;
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

// @/Utils/ageCalculator.js

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate - Birth date string or Date object
 * @param {Object} options - Configuration options
 * @param {Date} options.fromDate - Calculate age as of this date (default: now)
 * @param {string} options.format - Output format ('years', 'months', 'days', 'human', 'detailed', 'timestamp')
 * @param {boolean} options.includeText - Include "years", "months", "days" text
 * @param {string} options.locale - Locale for formatting (default: 'en-US')
 * @param {number} options.decimalPlaces - Decimal places for year calculation
 * @returns {string|number|object} Age in requested format
 */
export const calculateAge = (birthDate, options = {}) => {
    const {
        fromDate = new Date(),
        format = "years",
        includeText = true,
        locale = "en-US",
        decimalPlaces = 1,
    } = options;

    // Validate inputs
    if (!birthDate) return format === "human" ? "Not provided" : null;

    const birth = new Date(birthDate);
    const reference = new Date(fromDate);

    // Validate dates
    if (isNaN(birth.getTime())) {
        throw new Error("Invalid birth date");
    }
    if (isNaN(reference.getTime())) {
        throw new Error("Invalid reference date");
    }

    // Calculate raw differences
    const birthYear = birth.getFullYear();
    const birthMonth = birth.getMonth();
    const birthDay = birth.getDate();

    const refYear = reference.getFullYear();
    const refMonth = reference.getMonth();
    const refDay = reference.getDate();

    // Calculate years
    let years = refYear - birthYear;

    // Calculate months
    let months = refMonth - birthMonth;
    if (months < 0) {
        years--;
        months += 12;
    }

    // Calculate days
    let days = refDay - birthDay;
    if (days < 0) {
        months--;
        // Get days in previous month
        const lastMonth = new Date(refYear, refMonth, 0);
        days += lastMonth.getDate();
        if (months < 0) {
            years--;
            months += 12;
        }
    }

    // Calculate total months and days
    const totalMonths = years * 12 + months;
    const totalDays = Math.floor((reference - birth) / (1000 * 60 * 60 * 24));

    // Calculate exact years with decimals
    const exactYears = totalDays / 365.25;

    // Format based on requested output
    switch (format) {
        case "years":
            return includeText
                ? `${years} ${years === 1 ? "year" : "years"}`
                : years;

        case "months":
            return includeText
                ? `${totalMonths} ${totalMonths === 1 ? "month" : "months"}`
                : totalMonths;

        case "days":
            return includeText
                ? `${totalDays} ${totalDays === 1 ? "day" : "days"}`
                : totalDays;

        case "exact":
            return includeText
                ? `${exactYears.toFixed(decimalPlaces)} years`
                : parseFloat(exactYears.toFixed(decimalPlaces));

        case "human":
            if (years < 1) {
                if (months < 1) {
                    return `${days} ${days === 1 ? "day" : "days"}`;
                }
                return `${months} ${months === 1 ? "month" : "months"}`;
            }
            return `${years} ${years === 1 ? "year" : "years"}`;

        case "detailed":
            const parts = [];
            if (years > 0)
                parts.push(`${years} ${years === 1 ? "year" : "years"}`);
            if (months > 0)
                parts.push(`${months} ${months === 1 ? "month" : "months"}`);
            if (days > 0 || parts.length === 0)
                parts.push(`${days} ${days === 1 ? "day" : "days"}`);
            return parts.join(", ");

        case "timestamp":
            return {
                years,
                months,
                days,
                totalMonths,
                totalDays,
                exactYears: parseFloat(exactYears.toFixed(decimalPlaces)),
            };

        default:
            return years;
    }
};

/**
 * Get age group/category
 * @param {string|Date} birthDate - Birth date
 * @param {string} system - Age group system ('general', 'demographic', 'marketing')
 * @returns {string} Age group label
 */
export const getAgeGroup = (birthDate, system = "general") => {
    const age = calculateAge(birthDate, {
        format: "years",
        includeText: false,
    });

    if (age === null) return "Unknown";

    const ageGroups = {
        general: {
            "0-2": "Infant",
            "3-5": "Toddler",
            "6-12": "Child",
            "13-17": "Teenager",
            "18-24": "Young Adult",
            "25-34": "Adult",
            "35-44": "Middle Age",
            "45-64": "Senior Adult",
            "65+": "Senior",
        },
        demographic: {
            "0-14": "Children",
            "15-24": "Youth",
            "25-54": "Working Age",
            "55-64": "Pre-Retirement",
            "65+": "Retirement Age",
        },
        marketing: {
            "0-12": "Gen Alpha",
            "13-25": "Gen Z",
            "26-41": "Millennials",
            "42-57": "Gen X",
            "58-67": "Boomers II",
            "68-76": "Boomers I",
            "77+": "Post War",
        },
        legal: {
            "0-17": "Minor",
            "18+": "Adult",
            "21+": "Legal Drinking Age",
            "65+": "Senior Citizen",
        },
    };

    const groups = ageGroups[system] || ageGroups.general;

    for (const [range, label] of Object.entries(groups)) {
        if (range.includes("+")) {
            const min = parseInt(range);
            if (age >= min) return label;
        } else {
            const [min, max] = range.split("-").map(Number);
            if (age >= min && age <= max) return label;
        }
    }

    return "Unknown";
};

/**
 * Check if person is of legal age for specific purpose
 * @param {string|Date} birthDate - Birth date
 * @param {number} legalAge - Minimum legal age (default: 18)
 * @returns {boolean} True if person is of legal age
 */
export const isLegalAge = (birthDate, legalAge = 18) => {
    const age = calculateAge(birthDate, {
        format: "years",
        includeText: false,
    });
    return age !== null && age >= legalAge;
};

/**
 * Calculate next birthday
 * @param {string|Date} birthDate - Birth date
 * @param {Date} fromDate - Reference date (default: now)
 * @returns {Object} Next birthday information
 */
export const getNextBirthday = (birthDate, fromDate = new Date()) => {
    const birth = new Date(birthDate);
    const now = new Date(fromDate);

    if (isNaN(birth.getTime())) return null;

    const currentYear = now.getFullYear();

    // This year's birthday
    const birthdayThisYear = new Date(
        currentYear,
        birth.getMonth(),
        birth.getDate()
    );

    // If birthday has passed this year, next birthday is next year
    const nextBirthday =
        birthdayThisYear < now
            ? new Date(currentYear + 1, birth.getMonth(), birth.getDate())
            : birthdayThisYear;

    // Calculate days until next birthday
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntil = Math.ceil((nextBirthday - now) / msPerDay);

    // Calculate turning age
    const ageAtBirthday = calculateAge(birthDate, {
        fromDate: nextBirthday,
        format: "years",
        includeText: false,
    });

    return {
        date: nextBirthday,
        daysUntil,
        turningAge: ageAtBirthday,
        weekday: nextBirthday.toLocaleDateString("en-US", { weekday: "long" }),
        formatted: nextBirthday.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        }),
    };
};

/**
 * Calculate zodiac sign from birth date
 * @param {string|Date} birthDate - Birth date
 * @returns {string} Zodiac sign
 */
export const getZodiacSign = (birthDate) => {
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return "Unknown";

    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    const signs = [
        { name: "Capricorn", start: [12, 22], end: [1, 19] },
        { name: "Aquarius", start: [1, 20], end: [2, 18] },
        { name: "Pisces", start: [2, 19], end: [3, 20] },
        { name: "Aries", start: [3, 21], end: [4, 19] },
        { name: "Taurus", start: [4, 20], end: [5, 20] },
        { name: "Gemini", start: [5, 21], end: [6, 20] },
        { name: "Cancer", start: [6, 21], end: [7, 22] },
        { name: "Leo", start: [7, 23], end: [8, 22] },
        { name: "Virgo", start: [8, 23], end: [9, 22] },
        { name: "Libra", start: [9, 23], end: [10, 22] },
        { name: "Scorpio", start: [10, 23], end: [11, 21] },
        { name: "Sagittarius", start: [11, 22], end: [12, 21] },
    ];

    for (const sign of signs) {
        const [startMonth, startDay] = sign.start;
        const [endMonth, endDay] = sign.end;

        if (
            (month === startMonth && day >= startDay) ||
            (month === endMonth && day <= endDay) ||
            (startMonth > endMonth && (month > startMonth || month < endMonth))
        ) {
            return sign.name;
        }
    }

    return "Unknown";
};

/**
 * Calculate Chinese zodiac year
 * @param {string|Date} birthDate - Birth date
 * @returns {string} Chinese zodiac animal
 */
export const getChineseZodiac = (birthDate) => {
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return "Unknown";

    const year = date.getFullYear();
    const animals = [
        "Monkey",
        "Rooster",
        "Dog",
        "Pig",
        "Rat",
        "Ox",
        "Tiger",
        "Rabbit",
        "Dragon",
        "Snake",
        "Horse",
        "Goat",
    ];

    return animals[year % 12];
};

/**
 * Get generation name based on birth year
 * @param {string|Date} birthDate - Birth date
 * @returns {string} Generation name
 */
export const getGeneration = (birthDate) => {
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return "Unknown";

    const year = date.getFullYear();

    if (year >= 2013) return "Generation Alpha";
    if (year >= 1997) return "Generation Z";
    if (year >= 1981) return "Millennials";
    if (year >= 1965) return "Generation X";
    if (year >= 1946) return "Baby Boomers";
    if (year >= 1928) return "Silent Generation";
    if (year >= 1901) return "Greatest Generation";

    return "Lost Generation";
};

/**
 * Format age with emoji or icons
 * @param {string|Date} birthDate - Birth date
 * @param {Object} options - Formatting options
 * @returns {string} Formatted age string with icons
 */
export const formatAgeWithIcons = (birthDate, options = {}) => {
    const { showEmoji = true, showIcon = true, includeGroup = false } = options;

    const age = calculateAge(birthDate, { format: "human" });
    const ageGroup = getAgeGroup(birthDate);

    let icon = "";
    if (showEmoji) {
        const years = calculateAge(birthDate, {
            format: "years",
            includeText: false,
        });
        if (years < 13) icon = "👶";
        else if (years < 20) icon = "🧒";
        else if (years < 40) icon = "👨";
        else if (years < 60) icon = "🧔";
        else icon = "👴";
    }

    if (showIcon) {
        icon += " ";
    }

    let result = `${icon}${age}`;
    if (includeGroup) {
        result += ` (${ageGroup})`;
    }

    return result;
};

/**
 * Calculate age difference between two people
 * @param {string|Date} birthDate1 - First person's birth date
 * @param {string|Date} birthDate2 - Second person's birth date
 * @param {string} format - Output format
 * @returns {string|object} Age difference
 */
export const calculateAgeDifference = (
    birthDate1,
    birthDate2,
    format = "human"
) => {
    const age1 = calculateAge(birthDate1, { format: "timestamp" });
    const age2 = calculateAge(birthDate2, { format: "timestamp" });

    if (!age1 || !age2) return null;

    const diffYears = Math.abs(age1.years - age2.years);
    const diffMonths = Math.abs(age1.months - age2.months);
    const diffDays = Math.abs(age1.days - age2.days);

    if (format === "timestamp") {
        return {
            years: diffYears,
            months: diffMonths,
            days: diffDays,
            isOlder: age1.years > age2.years ? "first" : "second",
        };
    }

    const parts = [];
    if (diffYears > 0)
        parts.push(`${diffYears} ${diffYears === 1 ? "year" : "years"}`);
    if (diffMonths > 0)
        parts.push(`${diffMonths} ${diffMonths === 1 ? "month" : "months"}`);
    if (diffDays > 0 || parts.length === 0)
        parts.push(`${diffDays} ${diffDays === 1 ? "day" : "days"}`);

    return parts.join(", ");
};

/**
 * Age calculator React hook
 * @param {string|Date} birthDate - Birth date
 * @param {Object} options - Calculation options
 * @returns {Object} Age information and utilities
 */
export const useAgeCalculator = (birthDate, options = {}) => {
    const [currentAge, setCurrentAge] = useState(() =>
        calculateAge(birthDate, { ...options, format: "timestamp" })
    );

    useEffect(() => {
        if (options.autoUpdate !== false) {
            const interval = setInterval(() => {
                setCurrentAge(
                    calculateAge(birthDate, { ...options, format: "timestamp" })
                );
            }, 60000); // Update every minute

            return () => clearInterval(interval);
        }
    }, [birthDate, options]);

    return {
        age: currentAge,
        formatted: calculateAge(birthDate, {
            ...options,
            format: options.format || "human",
        }),
        ageGroup: getAgeGroup(birthDate),
        zodiac: getZodiacSign(birthDate),
        chineseZodiac: getChineseZodiac(birthDate),
        generation: getGeneration(birthDate),
        nextBirthday: getNextBirthday(birthDate),
        isLegal: isLegalAge(birthDate, options.legalAge),
        getAgeAsOf: (date) =>
            calculateAge(birthDate, { fromDate: date, ...options }),
    };
};

/**
 * Format phone number with various international formats
 * @param {string|number} phoneNumber - The phone number to format
 * @param {Object} options - Formatting options
 * @param {string} options.format - Format style: 'national', 'international', 'local', 'simple', 'e164'
 * @param {string} options.countryCode - Default country code (e.g., 'US', 'CA', 'GB')
 * @param {boolean} options.strict - Only format valid phone numbers
 * @param {boolean} options.fallback - Return original if can't format
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phoneNumber, options = {}) {
    const {
        format = "national",
        countryCode = "US",
        strict = false,
        fallback = true,
    } = options;

    // Handle empty/null/undefined
    if (!phoneNumber) {
        return fallback ? String(phoneNumber || "") : "";
    }

    // Convert to string and clean
    let cleaned = String(phoneNumber)
        .replace(/\s+/g, "") // Remove spaces
        .replace(/[^\d\+]/g, ""); // Remove non-digits except +

    // If strict mode and number doesn't look valid, return original or empty
    if (strict && !isValidPhoneNumber(cleaned, countryCode)) {
        return fallback ? String(phoneNumber) : "";
    }

    // If number starts with +, treat as international
    const isInternational = cleaned.startsWith("+");

    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, "");

    // If no digits left after cleaning
    if (cleaned.length === 0) {
        return fallback ? String(phoneNumber) : "";
    }

    // Determine country code
    let country = countryCode.toUpperCase();
    let phoneDigits = cleaned;

    if (isInternational) {
        // Extract country code from international number
        const countryMatch = cleaned.match(
            /^\+(1|44|91|61|49|33|81|86|7|39|34|46|31|41|48|55|61|64|27|234)/
        );
        if (countryMatch) {
            const codeToCountry = {
                1: "US",
                44: "GB",
                91: "IN",
                61: "AU",
                49: "DE",
                33: "FR",
                81: "JP",
                86: "CN",
                7: "RU",
                39: "IT",
                34: "ES",
                46: "SE",
                31: "NL",
                41: "CH",
                48: "PL",
                55: "BR",
                64: "NZ",
                27: "ZA",
                234: "NG",
            };
            country = codeToCountry[countryMatch[1]] || country;
            phoneDigits = cleaned.substring(countryMatch[0].length);
        }
    }

    // Format based on country and format type
    switch (format) {
        case "e164":
            return formatE164(cleaned, country);

        case "international":
            return formatInternational(phoneDigits, country);

        case "national":
            return formatNational(phoneDigits, country);

        case "local":
            return formatLocal(phoneDigits, country);

        case "simple":
            return formatSimple(phoneDigits, country);

        case "hyphenated":
            return formatHyphenated(phoneDigits, country);

        case "parentheses":
            return formatWithParentheses(phoneDigits, country);

        default:
            return formatNational(phoneDigits, country);
    }
}

/** Format in E.164 standard (+[country code][number]) */
function formatE164(number, country) {
    const countryCode = getCountryCode(country);
    if (countryCode && !number.startsWith("+")) {
        return `+${countryCode}${number}`;
    }
    return number.startsWith("+") ? number : `+${number}`;
}

/** Format international (e.g., +1 (234) 567-8900) */
function formatInternational(number, country) {
    const countryCode = getCountryCode(country);
    const nationalFormat = formatNational(number, country);

    if (countryCode && nationalFormat) {
        return `+${countryCode} ${nationalFormat}`;
    }
    return nationalFormat;
}

/** Format national (country-specific formatting) */
function formatNational(number, country) {
    const formats = {
        US: formatUSNumber,
        CA: formatUSNumber, // Same as US
        GB: formatUKNumber,
        IN: formatIndiaNumber,
        AU: formatAustraliaNumber,
        DE: formatGermanyNumber,
        FR: formatFranceNumber,
        JP: formatJapanNumber,
        CN: formatChinaNumber,
        RU: formatRussiaNumber,
        IT: formatItalyNumber,
        ES: formatSpainNumber,
        BR: formatBrazilNumber,
        MX: formatMexicoNumber,
    };

    const formatter = formats[country] || formatGenericNumber;
    return formatter(number);
}

/** Local format (without country code, just the local number) */
function formatLocal(number, country) {
    const national = formatNational(number, country);
    // Remove country code if present in national format
    return national.replace(/^\+?\d+\s*/, "");
}

/** Simple format (just digits with spaces) */
function formatSimple(number, country) {
    // Just add spaces every 3-4 digits
    return number.replace(/(\d{3,4})(?=\d)/g, "$1 ");
}

/** Hyphenated format */
function formatHyphenated(number, country) {
    const national = formatNational(number, country);
    return national.replace(/\s/g, "-");
}

/** Format with parentheses for area code */
function formatWithParentheses(number, country) {
    const national = formatNational(number, country);
    return national.replace(/\((\d+)\)/, "($1)");
}

/** Country-specific formatters */
function formatUSNumber(num) {
    // Remove country code if present
    num = num.replace(/^1/, "");

    if (num.length === 10) {
        return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6)}`;
    } else if (num.length === 11 && num.startsWith("1")) {
        return `+1 (${num.slice(1, 4)}) ${num.slice(4, 7)}-${num.slice(7)}`;
    } else if (num.length === 7) {
        return `${num.slice(0, 3)}-${num.slice(3)}`;
    }
    return num;
}

function formatUKNumber(num) {
    if (num.length === 10) {
        return `${num.slice(0, 4)} ${num.slice(4, 6)} ${num.slice(6)}`;
    } else if (num.length === 11 && num.startsWith("0")) {
        return `${num.slice(0, 5)} ${num.slice(5)}`;
    }
    return num;
}

function formatIndiaNumber(num) {
    if (num.length === 10) {
        return `${num.slice(0, 5)} ${num.slice(5)}`;
    } else if (num.length === 12 && num.startsWith("91")) {
        return `+91 ${num.slice(2, 7)} ${num.slice(7)}`;
    }
    return num;
}

function formatAustraliaNumber(num) {
    if (num.length === 10) {
        return `${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`;
    }
    return num;
}

function formatGermanyNumber(num) {
    if (num.length === 10 || num.length === 11) {
        return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
    }
    return num;
}

function formatGenericNumber(num) {
    // Generic formatting for unknown countries
    if (num.length <= 6) {
        return num;
    } else if (num.length <= 10) {
        return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
    } else {
        // Group in chunks of 3 or 4
        const chunks = [];
        let remaining = num;
        while (remaining.length > 4) {
            chunks.push(remaining.slice(0, 3));
            remaining = remaining.slice(3);
        }
        chunks.push(remaining);
        return chunks.join(" ");
    }
}

// Add other country formatters as needed...
function formatFranceNumber(num) {
    if (num.length === 10) {
        return `${num.slice(0, 2)} ${num.slice(2, 4)} ${num.slice(
            4,
            6
        )} ${num.slice(6, 8)} ${num.slice(8)}`;
    }
    return num;
}

function formatJapanNumber(num) {
    if (num.length === 10 || num.length === 11) {
        return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`;
    }
    return num;
}

function formatChinaNumber(num) {
    if (num.length === 11) {
        return `${num.slice(0, 3)} ${num.slice(3, 7)} ${num.slice(7)}`;
    }
    return num;
}

function formatRussiaNumber(num) {
    if (num.length === 10) {
        return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(
            6,
            8
        )} ${num.slice(8)}`;
    }
    return num;
}

function formatItalyNumber(num) {
    if (num.length === 10) {
        return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
    }
    return num;
}

function formatSpainNumber(num) {
    if (num.length === 9) {
        return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
    }
    return num;
}

function formatBrazilNumber(num) {
    if (num.length === 11) {
        return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
    } else if (num.length === 10) {
        return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
    }
    return num;
}

function formatMexicoNumber(num) {
    if (num.length === 10) {
        return `${num.slice(0, 2)} ${num.slice(2, 6)} ${num.slice(6)}`;
    }
    return num;
}

/** Get country dialing code */
function getCountryCode(country) {
    const countryCodes = {
        US: "1",
        CA: "1",
        GB: "44",
        IN: "91",
        AU: "61",
        DE: "49",
        FR: "33",
        JP: "81",
        CN: "86",
        RU: "7",
        IT: "39",
        ES: "34",
        BR: "55",
        MX: "52",
        ZA: "27",
        NG: "234",
        EG: "20",
        KE: "254",
        SA: "966",
        AE: "971",
        TR: "90",
        KR: "82",
        ID: "62",
        TH: "66",
        VN: "84",
        MY: "60",
        SG: "65",
        PH: "63",
        NZ: "64",
    };
    return countryCodes[country] || null;
}

/** Validate phone number (basic validation) */
export function isValidPhoneNumber(number, country = "US") {
    if (!number || typeof number !== "string") return false;

    const cleaned = number.replace(/\D/g, "");

    // Basic length checks by country
    const lengthRequirements = {
        US: [10, 11], // 10 digits or 11 with country code
        CA: [10, 11],
        GB: [10, 11],
        IN: [10, 12], // 10 or 12 with country code
        AU: [9, 10],
        DE: [10, 11],
        FR: [9, 10],
        JP: [10, 11],
        CN: [11],
        RU: [10],
        BR: [10, 11],
        MX: [10],
    };

    const requirements = lengthRequirements[country] || [8, 15];
    const length = cleaned.length;

    return (
        length >= requirements[0] &&
        length <= (requirements[1] || requirements[0])
    );
}

/** Extract area code from phone number */
export function extractAreaCode(phoneNumber, country = "US") {
    const formatted = formatPhoneNumber(phoneNumber, { countryCode: country });

    if (!formatted) return null;

    // Extract area code from common formats
    const patterns = {
        US: /\((\d{3})\)/,
        CA: /\((\d{3})\)/,
        GB: /^(\d{4})/,
        IN: /^(\d{5})/,
        AU: /^(\d{4})/,
    };

    const pattern = patterns[country];
    if (pattern) {
        const match = formatted.match(pattern);
        return match ? match[1] : null;
    }

    return null;
}

/** Mask phone number for display (e.g., **** *** 8900) */
export function maskPhoneNumber(phoneNumber, options = {}) {
    const { visibleDigits = 4, maskChar = "*", countryCode = "US" } = options;

    const formatted = formatPhoneNumber(phoneNumber, { countryCode });
    if (!formatted) return "";

    // Get only the digits
    const digits = formatted.replace(/\D/g, "");
    if (digits.length <= visibleDigits) {
        return formatted;
    }

    // Mask all but last visibleDigits
    const masked =
        digits.slice(0, -visibleDigits).replace(/\d/g, maskChar) +
        digits.slice(-visibleDigits);

    // Try to maintain original formatting
    return formatPhoneNumber(masked, { countryCode });
}

/** Parse phone number into parts */
export function parsePhoneNumber(phoneNumber, country = "US") {
    const formatted = formatPhoneNumber(phoneNumber, { countryCode: country });
    const digits = formatted.replace(/\D/g, "");

    return {
        original: phoneNumber,
        formatted,
        digits,
        countryCode: getCountryCode(country),
        isValid: isValidPhoneNumber(phoneNumber, country),
        areaCode: extractAreaCode(phoneNumber, country),
        localNumber: digits.slice(-7), // Last 7 digits typically
        extension: null, // Could be extended to handle extensions
    };
}

export function calculateYearsOfService(hireDate) {
    if (!hireDate) return 0;
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const monthDiff = now.getMonth() - hire.getMonth();
    return monthDiff < 0 ? years - 1 : years;
}
