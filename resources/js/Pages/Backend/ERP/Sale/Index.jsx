import { Head, router } from '@inertiajs/react';
import { Container, Row, Col, Card, Button, ButtonGroup, Table, Form } from 'react-bootstrap';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import ErpLayout from "@/Layouts/ErpLayout";
import useData from "@/Hooks/useData";
import Filters from '@/Components/Settings/Filters';

export default function SalesListing() {
    const { customers, paymentMethods, branches } = useData();
    const [filters, setFilters] = useState({
        branch_id: "",
        customer_id: "",
        payment_method_id: "",
        status: "",
        date_from: "",
        date_to: "",
    });

    const statusOptions = [
        { value: "pending", label: "Pending" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
    ];

    const filterFields = [
        {
            name: "branch_id",
            type: "select",
            placeholder: "All Branches",
            options: branches.map((b) => ({
                value: b.id,
                label: b.name,
            })),
        },
        {
            name: "customer_id",
            type: "select",
            placeholder: "All Customers",
            options: customers.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.phone})`
            })),
        },
        {
            name: "payment_method_id",
            type: "select",
            placeholder: "All Payment Methods",
            options: paymentMethods.map((p) => ({
                value: p.id,
                label: p.name
            })),
        },
        {
            name: "status",
            type: "select",
            placeholder: "All Statuses",
            options: statusOptions.map((s) => ({
                value: s.value,
                label: s.label
            })),
        },
        {
            name: "date_from",
            type: "date",
            placeholder: "From Date",
        },
        {
            name: "date_to",
            type: "date",
            placeholder: "To Date",
        },
    ];

    const applyFilters = () => {
        reloadTable();
    };

    const reloadTable = () => {
        if ($.fn.DataTable.isDataTable("#salesTable")) {
            $("#salesTable").DataTable().ajax.reload();
        }
    };

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#salesTable")) {
            $("#salesTable").DataTable().destroy();
        }

        const dataTable = $("#salesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("sales.index"),
                type: "GET",
                data: function (d) {
                    return {
                        ...d,
                        ...filters
                    };
                },
            },
            columns: [
                { data: "order_number", title: "Order #" },
                { data: "customer", title: "Customer", className: "text-capitalize" },
                { data: "total", title: "Amount", className: "text-end fw-semibold" },
                {
                    data: "created_at",
                    title: "Date",
                    render: function (data) {
                        return new Date(data).toLocaleDateString();
                    }
                },
                { data: "status", title: "Status" },
                { data: "payment", title: "Payment" },
                { data: "action", title: "Actions" },
            ],
            order: [[3, 'desc']],
            drawCallback: function () {
                $('#salesTable tbody').off('click', 'tr');
                $('#salesTable tbody').on('click', 'tr', function (e) {
                    if (!$(e.target).closest('td:last-child').length) {
                        const rowData = table.row(this).data();
                        if (rowData) {
                            window.location.href = `/sales/${rowData.id}`;
                        }
                    }
                });
            },
            createdRow: function (row, data, dataIndex) {
                $(row).find('td:not(:last-child)').css('cursor', 'pointer');
            }
        });

        return dataTable;
    }, [filters]);

    useEffect(() => {
        const dataTable = initializeDataTable();

        return () => {
            if ($.fn.DataTable.isDataTable("#salesTable")) {
                dataTable.destroy();
            }
        };
    }, [initializeDataTable]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            branch_id: "",
            customer_id: "",
            payment_method_id: "",
            status: "",
            date_from: "",
            date_to: "",
        });
    };

    return (
        <ErpLayout>
            <Head title="Sales Management" />

            <Container fluid>
                <Row className="g-3">
                    <Col md={12} className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">Sales</h2>
                        <ButtonGroup className="gap-2">
                            <Button
                                variant="primary"
                                className="rounded"
                                onClick={() => router.get(route('sales.create'))}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                New Sale
                            </Button>
                            <Button
                                variant="outline-secondary"
                                className="rounded"
                            >
                                <i className="bi bi-download me-2"></i>
                                Export
                            </Button>
                        </ButtonGroup>
                    </Col>

                    <Col md={12}>
                        <hr className='dashed-hr mb-3' />

                        <Filters
                            filters={filters}
                            handleFilterChange={handleFilterChange}
                            resetFilters={resetFilters}
                            applyFilters={applyFilters}
                            filterFields={filterFields}
                        />
                    </Col>

                    <Col md={12}>
                        <Card>
                            <Card.Body className="position-relative">
                                <Table
                                    bordered
                                    striped
                                    hover
                                    responsive
                                    id="salesTable"
                                    className="w-100"
                                ></Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </ErpLayout>
    );
}