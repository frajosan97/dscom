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
            return true;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            setError(error.message || `Failed to fetch ${endpoint}`);
            return false;
        }
    };

    const fetchAll = async () => {
        try {
            setIsLoading(true);
            setError(null);

            await Promise.all([
                fetchData("api.roles", setRoles),
                fetchData("api.categories", setCategories),
                fetchData("api.brands", setBrands),
                fetchData("api.branches", setBranches),
                fetchData("api.warehouses", setWarehouses),
                fetchData("api.taxes", setTaxes),
                fetchData("api.customers", setCustomers),
                fetchData("api.staff", setStaff),
                fetchData("api.technicians", setTechnicians),
                fetchData("api.products", setProducts),
                fetchData("api.services", setServices),
                fetchData("api.device-types", setDeviceTypes),
                fetchData("api.payment-methods", setPaymentMethods),
            ]);
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
        roles,
        categories,
        brands,
        branches,
        warehouses,
        taxes,
        customers,
        technicians,
        staff,
        products,
        services,
        deviceTypes,
        paymentMethods,
        isLoading,
        error,
        refreshRoles,
        refreshCategories,
        refreshBrands,
        refreshBranches,
        refreshWarehouses,
        refreshTaxes,
        refreshCustomers,
        refreshTechnicians,
        refreshStaff,
        refreshProducts,
        refreshServices,
        refreshDeviceTypes,
        refreshPaymentMethods,
    };
}
