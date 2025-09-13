import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Card, Table } from "react-bootstrap";

import ErpLayout from "@/Layouts/ErpLayout";
import CustomerModal from "@/Components/Modals/CustomerModal";

export default function Customer() {
    const [showCustomerModal, setShowCustomerModal] = useState(false);

    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    const initializeDataTable = useCallback(() => {
        if (dataTableInitialized.current) return;

        if ($.fn.DataTable.isDataTable("#customerTable")) {
            $("#customerTable").DataTable().destroy();
        }

        const dt = $("#customerTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("customers.index"),
                type: "GET",
            },
            columns: [
                {
                    data: "DT_RowIndex",
                    name: "DT_RowIndex",
                    title: "#",
                    className: "text-center",
                    width: "1%",
                    orderable: false,
                    searchable: false,
                },
                {
                    data: "name",
                    title: "Name",
                    className: "text-start",
                },
                {
                    data: "email",
                    title: "email",
                    className: "text-start",
                },
                {
                    data: "phone",
                    title: "Phone",
                    className: "text-start",
                },
                {
                    data: "role",
                    title: "Type",
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
                    data: "balance",
                    title: "Balance",
                    className: "text-end",
                },
                {
                    data: "action",
                    title: "Actions",
                    className: "text-center",
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
            if ($.fn.DataTable.isDataTable("#customerTable")) {
                $("#customerTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    const handleAddNewCustomer = useCallback(() => {
        setShowCustomerModal(true);
    }, []);

    return (
        <ErpLayout>
            <Head title="Customer Management" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h5 className="mb-0">
                        <i className="bi bi-people-fill me-2"></i>
                        Customer Management
                    </h5>
                    <ButtonGroup>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAddNewCustomer}
                        >
                            <i className="bi bi-person-plus me-1"></i> Add
                            Customer
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                            <i className="bi bi-download me-1"></i> Export
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                            <i className="bi bi-arrow-clockwise"></i>
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="px-0">
                    <Table
                        size="sm"
                        bordered
                        hover
                        striped
                        responsive
                        id="customerTable"
                    />
                </Card.Body>
            </Card>

            {/* Customer Modal */}
            <CustomerModal
                show={showCustomerModal}
                onHide={() => setShowCustomerModal(false)}
                onClose={() => setShowCustomerModal(false)}
            />
        </ErpLayout>
    );
}
