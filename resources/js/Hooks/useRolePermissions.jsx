import { usePage } from "@inertiajs/react";

export const useRolePermissions = () => {
    const { auth } = usePage().props;

    const hasRole = (roleName) => {
        return auth?.user?.roles?.some((role) => role.name === roleName);
    };

    const hasPermission = (permissionName) => {
        return auth?.user?.permissions?.some((permission) => permission.name === permissionName) ||
            auth?.user?.roles?.some(role => role.permissions?.some(p => p.name === permissionName));
    };

    return {
        hasRole,
        hasPermission,
    };
};