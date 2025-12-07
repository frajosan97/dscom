import { useEffect, useState } from "react";

export default function useData() {
    const [roles, setRoles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [branches, setBranches] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [staff, setStaff] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async (endpoint, setter) => {
        try {
            const response = await fetch(route(endpoint));
            if (!response.ok) {
                throw new Error(
                    `API request failed with status ${response.status}`
                );
            }
            const data = await response.json();
            setter(data);
            return { success: true, data };
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            setError(error.message || `Failed to fetch ${endpoint}`);
            return { success: false, error };
        }
    };

    const fetchAll = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const promises = [
                fetchData("api.roles", setRoles),
                fetchData("api.categories", setCategories),
                fetchData("api.brands", setBrands),
                fetchData("api.branches", setBranches),
                fetchData("api.warehouses", setWarehouses),
                fetchData("api.taxes", setTaxes),
                fetchData("api.customers", setCustomers),
                fetchData("api.staff", setStaff),
                fetchData("api.employees", setEmployees), // Added employees
                fetchData("api.technicians", setTechnicians),
                fetchData("api.products", setProducts),
                fetchData("api.services", setServices),
                fetchData("api.device-types", setDeviceTypes),
                fetchData("api.payment-methods", setPaymentMethods),
            ];

            const results = await Promise.allSettled(promises);

            // Log any failed requests for debugging
            results.forEach((result, index) => {
                if (result.status === "rejected") {
                    console.error(`Request ${index} failed:`, result.reason);
                }
            });
        } catch (error) {
            console.error("Error in fetchAll:", error);
            setError(error.message || "Failed to fetch all data");
        } finally {
            setIsLoading(false);
        }
    };

    // Individual refresh functions
    const refreshRoles = () => fetchData("api.roles", setRoles);
    const refreshCategories = () => fetchData("api.categories", setCategories);
    const refreshBrands = () => fetchData("api.brands", setBrands);
    const refreshBranches = () => fetchData("api.branches", setBranches);
    const refreshWarehouses = () => fetchData("api.warehouses", setWarehouses);
    const refreshTaxes = () => fetchData("api.taxes", setTaxes);
    const refreshCustomers = () => fetchData("api.customers", setCustomers);
    const refreshTechnicians = () =>
        fetchData("api.technicians", setTechnicians);
    const refreshStaff = () => fetchData("api.staff", setStaff);
    const refreshEmployees = () => fetchData("api.employees", setEmployees);
    const refreshProducts = () => fetchData("api.products", setProducts);
    const refreshServices = () => fetchData("api.services", setServices);
    const refreshDeviceTypes = () =>
        fetchData("api.device-types", setDeviceTypes);
    const refreshPaymentMethods = () =>
        fetchData("api.payment-methods", setPaymentMethods);

    useEffect(() => {
        fetchAll();
    }, []);

    return {
        // Data states
        roles,
        categories,
        brands,
        branches,
        warehouses,
        taxes,
        customers,
        technicians,
        staff,
        employees, // Added to return object
        products,
        services,
        deviceTypes,
        paymentMethods,

        // Loading states
        isLoading,
        error,

        // Refresh functions
        refreshRoles,
        refreshCategories,
        refreshBrands,
        refreshBranches,
        refreshWarehouses,
        refreshTaxes,
        refreshCustomers,
        refreshTechnicians,
        refreshStaff,
        refreshEmployees, // Added to return object
        refreshProducts,
        refreshServices,
        refreshDeviceTypes,
        refreshPaymentMethods,

        // Bulk refresh
        refreshAll: fetchAll,
    };
}
