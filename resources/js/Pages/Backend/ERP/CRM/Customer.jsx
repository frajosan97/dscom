import React, { useCallback, useEffect, useRef, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    ButtonGroup,
    Table,
} from "react-bootstrap";
import ErpLayout from "@/Layouts/ErpLayout";

export default function Customer() {
    const [search, setSearch] = useState("");
    const dataTableInitialized = useRef(false);
    const dataTable = useRef(null);

    // Initialize DataTable
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
                data: function (d) {
                    d.search = search;
                },
            },
            columns: [
                {
                    data: "DT_RowIndex",
                    title: "#",
                    className: "text-center",
                    width: "1%",
                    orderable: false,
                    searchable: false,
                },
                { data: "name", title: "Name", className: "text-start" },
                { data: "email", title: "Email", className: "text-start" },
                { data: "phone", title: "Phone", className: "text-start" },
                {
                    data: "role",
                    title: "Type",
                    className: "text-start",
                    width: "10%",
                },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    render: (data) =>
                        `<span class="badge ${
                            data === "active"
                                ? "bg-success"
                                : data === "pending"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                        }">${data}</span>`,
                },
                { data: "balance", title: "Balance", className: "text-end" },
                {
                    data: "action",
                    title: "Actions",
                    className: "text-center",
                    orderable: false,
                    searchable: false,
                },
            ],
            drawCallback: function () {
                // Bind custom button actions
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        editCustomer(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deleteCustomer(id);
                    });
            },
            initComplete: function () {
                dataTableInitialized.current = true;
            },
        });

        dataTable.current = dt;
        return dt;
    }, [search]);

    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#customerTable")) {
                $("#customerTable").DataTable().destroy();
                dataTableInitialized.current = false;
            }
        };
    }, [initializeDataTable]);

    // Stub functions for edit/delete actions
    const editCustomer = (id) => {
        console.log("Edit customer:", id);
    };
    const deleteCustomer = (id) => {
        console.log("Delete customer:", id);
    };

    return (
        <ErpLayout>
            <Head title="Customer Management" />

            <Container fluid className="py-4">
                {/* Page Header */}
                <Row className="mb-4">
                    <Col>
                        <h3 className="fw-bold text-primary">
                            Customer Management
                        </h3>
                        <p className="text-muted mb-0">
                            View, manage, and maintain all customer accounts.
                        </p>
                    </Col>
                    <Col className="text-end">
                        <ButtonGroup>
                            <Button
                                variant="outline-primary"
                                as={Link}
                                href={route("customers.create")}
                            >
                                <i className="bi bi-person-plus me-1"></i> Add
                                Customer
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* Customer Table */}
                <Card>
                    <Card.Body>
                        <Table
                            bordered
                            hover
                            responsive
                            id="customerTable"
                            className="align-middle mb-0"
                        />
                    </Card.Body>
                </Card>
            </Container>
        </ErpLayout>
    );
}
