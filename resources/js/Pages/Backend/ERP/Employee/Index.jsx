import { Head } from "@inertiajs/react";
import { useEffect, useCallback, useState } from "react";
import { Card, Table, Tabs, Tab } from "react-bootstrap";
import { FaClipboardCheck, FaUserPlus, FaUsers } from "react-icons/fa";
import ErpLayout from "@/Layouts/ErpLayout";
import CreateEmployee from "@/Components/Partials/Employee/CreateEmployee";
import StaffReview from "@/Components/Partials/Employee/StaffReview";
import EditEmployee from "@/Components/Partials/Employee/EditEmployee";

export default function EmployeeList() {
    const [activeTab, setActiveTab] = useState("users");
    const [editData, setEditData] = useState(null);
    const [isEditTabEnabled, setIsEditTabEnabled] = useState(false);

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#employeeTable")) {
            $("#employeeTable").DataTable().destroy();
        }

        $("#employeeTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("employee.index"),
                type: "GET",
            },
            columns: [
                {
                    data: "DT_RowIndex",
                    name: "DT_RowIndex",
                    title: "No",
                    className: "text-center",
                    width: "1%",
                    orderable: false,
                    searchable: false
                },
                {
                    data: "photo",
                    title: "Photo",
                    className: "text-center",
                    width: "5%",
                },
                {
                    data: "name",
                    title: "Name",
                    className: "text-start",
                    width: "15%"
                },
                {
                    data: "phone",
                    title: "Phone",
                    className: "text-start",
                    width: "15%"
                },
                {
                    data: "role",
                    title: "Role",
                    className: "text-start",
                    width: "15%",
                },
                {
                    data: "ending_date",
                    title: "Ending Date",
                    className: "text-start",
                    width: "15%",
                },
                {
                    data: "download_assets",
                    title: "Download Assets",
                    className: "text-start",
                    width: "15%",
                },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    width: "10%",
                },
                {
                    data: "action",
                    title: "Actions",
                    className: "text-center",
                    width: "10%",
                    orderable: false,
                    searchable: false,
                }
            ],
            drawCallback: function () {
                // Handle edit button click
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const employee = $(this).data("employee");
                        setEditData(employee);
                        setIsEditTabEnabled(true);
                        setActiveTab("user-update");
                    });

                // Handle delete button click
                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deleteEmployee(id);
                    });
            },
        });
    }, []);

    const deleteEmployee = (id) => {
        if (confirm("Are you sure you want to delete this employee?")) {
            // Implement actual delete functionality here
            console.log("Deleting employee with ID:", id);
        }
    };

    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#employeeTable")) {
                $("#employeeTable").DataTable().destroy();
            }
        };
    }, [initializeDataTable]);

    return (
        <ErpLayout>
            <Head title="User Management" />

            <Tabs
                activeKey={activeTab}
                onSelect={(k) => {
                    setActiveTab(k);
                    // Reset edit state if switching away from edit tab
                    if (k !== "user-update") {
                        setIsEditTabEnabled(false);
                        setEditData(null);
                    }
                }}
                className="users-tabs mb-3"
                id="user-management-tabs"
            >
                <Tab eventKey="users" title={<><FaUsers size={16} className="me-1" /> Users</>}>
                    <Card className="border-0 rounded-0 shadow-sm">
                        <Card.Body className="p-0">
                            <Table
                                size="sm"
                                bordered
                                hover
                                responsive
                                id="employeeTable"
                                className="w-100 mb-0"
                            />
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="new-user" title={<><FaUserPlus size={16} className="me-1" /> New User</>}>
                    <Card className="border-0 rounded-0 shadow-sm">
                        <Card.Body>
                            <CreateEmployee />
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab
                    eventKey="user-update"
                    title={<><FaClipboardCheck size={16} className="me-1" /> User Update</>}
                    disabled={!isEditTabEnabled}
                >
                    <Card className="border-0 rounded-0 shadow-sm">
                        <Card.Body>
                            {editData ? (
                                <EditEmployee employee={editData} />
                            ) : (
                                <div className="text-center py-4">
                                    <p>Please select a user to edit</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab
                    eventKey="staff-review"
                    title={<><FaClipboardCheck size={16} className="me-1" /> Staff Review</>}
                    disabled
                >
                    <Card className="border-0 rounded-0 shadow-sm">
                        <Card.Body>
                            <StaffReview />
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>
        </ErpLayout>
    );
}