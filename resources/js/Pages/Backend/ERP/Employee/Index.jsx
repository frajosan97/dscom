import { Head, Link } from "@inertiajs/react";
import { useEffect, useCallback } from "react";
import { Card, ButtonGroup, Table, Button } from "react-bootstrap";
import ErpLayout from "@/Layouts/ErpLayout";
import { People, Plus } from "react-bootstrap-icons";

export default function EmployeeList() {
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
                    data: null,
                    title: "No",
                    className: "text-center",
                    width: "5%",
                    render: function (data, type, row, meta) {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    },
                    orderable: false,
                    searchable: false
                },
                {
                    data: "photo",
                    title: "Photo",
                    className: "text-center",
                    width: "5%",
                    orderable: false,
                    searchable: false
                },
                {
                    data: "name",
                    title: "Name",
                    width: "20%"
                },
                {
                    data: "phone",
                    title: "Phone",
                    width: "15%"
                },
                {
                    data: "role",
                    title: "Role",
                    width: "15%",
                    render: function (data) {
                        return data ? data.charAt(0).toUpperCase() + data.slice(1) : '';
                    }
                },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    width: "12%",
                    orderable: false,
                    searchable: false
                },
                {
                    data: "action",
                    title: "Actions",
                    className: "text-center",
                    width: "15%",
                    orderable: false,
                    searchable: false
                }
            ],
            responsive: true,
            autoWidth: false,
            language: {
                emptyTable: "No employees found",
                processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>'
            },
            initComplete: function () {
                $(".dataTables_wrapper").css("padding", "0");
            }
        });
    }, []);

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
            <Head title="Users" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0 p-0">
                    <People size={24} />
                    Users
                </h5>
                <ButtonGroup className="gap-2">
                    <Button
                        variant="success"
                        size="sm"
                        className="rounded-0"
                        type="button"
                        as={Link}
                        href={route("employee.create")}
                    >
                        New User
                        <Plus size={24} />
                    </Button>
                </ButtonGroup>
            </div>

            <hr className="dashed-hr mb-3" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table
                        bordered
                        hover
                        responsive
                        id="employeeTable"
                        className="w-100 mb-0"
                    />
                </Card.Body>
            </Card>
        </ErpLayout>
    );
}