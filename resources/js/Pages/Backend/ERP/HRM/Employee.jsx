import { Head, router } from "@inertiajs/react";
import { useCallback, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { BiUser, BiUserPin, BiUserPlus } from "react-icons/bi";

import ErpLayout from "@/Layouts/ErpLayout";
import EmployeeForm from "@/Components/Partials/Employee/EmployeeForm";
import EmployeeTable from "@/Components/Partials/Employee/EmployeeTable";

export default function Employee() {
    const [activeTab, setActiveTab] = useState("users");
    const [editData, setEditData] = useState(null);
    const [isEditTabEnabled, setIsEditTabEnabled] = useState(false);

    const handleTabSelect = useCallback((key) => {
        setActiveTab(key);
        if (key !== "user-update") {
            setIsEditTabEnabled(false);
            setEditData(null);
        }
    }, []);

    const handleEdit = useCallback((data) => {
        setActiveTab("user-update");
        setIsEditTabEnabled(true);
        setEditData(data);
    }, []);

    const handleSuccess = useCallback(() => {
        setActiveTab("users");
        router.reload();
    }, []);

    return (
        <ErpLayout>
            <Head title="User Management" />

            <Tabs
                activeKey={activeTab}
                onSelect={handleTabSelect}
                className="users-tabs mb-3"
                id="user-management-tabs"
            >
                <Tab
                    eventKey="users"
                    title={
                        <>
                            <BiUser size={16} className="me-1" /> Users
                        </>
                    }
                >
                    <EmployeeTable
                        onEdit={handleEdit}
                        onSuccess={handleSuccess}
                    />
                </Tab>

                <Tab
                    eventKey="new-user"
                    title={
                        <>
                            <BiUserPlus size={16} className="me-1" /> New User
                        </>
                    }
                >
                    <EmployeeForm onSuccess={handleSuccess} />
                </Tab>

                {isEditTabEnabled && (
                    <Tab
                        eventKey="user-update"
                        title={
                            <>
                                <BiUserPin size={16} className="me-1" /> User
                                Update
                            </>
                        }
                        disabled={!isEditTabEnabled}
                    >
                        {editData ? (
                            <EmployeeForm
                                employee={editData}
                                onSuccess={handleSuccess}
                                onCancel={() => setActiveTab("users")}
                            />
                        ) : (
                            <div className="text-center py-4">
                                <p>Please select a user to edit</p>
                            </div>
                        )}
                    </Tab>
                )}
            </Tabs>
        </ErpLayout>
    );
}
