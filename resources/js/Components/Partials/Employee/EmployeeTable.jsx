import xios from "@/Utils/axios";
import { useCallback, useEffect, useRef } from "react";
import { Card, Table } from "react-bootstrap";
import { toast } from "react-toastify";

export default function EmployeeTable({ onEdit }) {
    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#employeeTable")) {
            $("#employeeTable").DataTable().destroy();
        }

        const dt = $("#employeeTable").DataTable({
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
                    searchable: false,
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
                    width: "15%",
                },
                {
                    data: "phone",
                    title: "Phone",
                    className: "text-start",
                    width: "15%",
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
                },
            ],
            drawCallback: function () {
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        editEmployee(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deleteEmployee(id);
                    });
            },
            initComplete: function () {
                dataTableInitialized.current = true;
            },
        });

        dataTable.current = dt;
        return dt;
    });

    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#employeeTable")) {
                $("#employeeTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    const editEmployee = async (id) => {
        try {
            const response = await xios.get(route("employee.edit", id));

            if (response.data.success === true) {
                onEdit(response.data.employee);
            }
        } catch (error) {
            toast.error("An error occurred while fetching the employee data.");
        }
    };

    const deleteEmployee = async (id) => {
        try {
            const response = await xios.get(route("employee.destroy", id));

            if (response.data.success === true) {
                toast.success("Employee deleted successfully");
            }
        } catch (error) {
            toast.error("An error occurred while fetching the employee data.");
        }
    };

    return (
        <Card className="border-0 rounded-0 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                <h6 className="mb-0 fw-semibold">Employee Management</h6>
            </Card.Header>
            <Card.Body className="px-0">
                <Table
                    size="sm"
                    bordered
                    hover
                    striped
                    responsive
                    id="employeeTable"
                />
            </Card.Body>
        </Card>
    );
}
