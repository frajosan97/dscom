import { Head, router } from '@inertiajs/react';
import { Container, Row, Col, Card, Button, ButtonGroup, Table, Badge } from 'react-bootstrap';
import { useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import ErpLayout from "@/Layouts/ErpLayout";
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function Services() {
    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#servicesTable")) {
            $("#servicesTable").DataTable().destroy();
        }

        const dataTable = $("#servicesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("services.index"),
                type: "GET",
            },
            columns: [
                { data: "order_number", title: "Order #" },
                { data: "customer_name", title: "Customer" },
                { data: "service_name", title: "Service" },
                {
                    data: "total_amount",
                    title: "Amount",
                    render: function (data) {
                        return formatCurrency(data);
                    }
                },
                {
                    data: "status",
                    title: "Status",
                    render: function (data) {
                        return <Badge bg={getStatusBadgeColor(data)}>{data}</Badge>;
                    }
                },
                {
                    data: "expected_completion_date",
                    title: "Completion Date",
                    render: function (data) {
                        return data ? formatDate(data) : 'N/A';
                    }
                },
                { data: "action", title: "Actions", orderable: false, searchable: false }
            ],
            order: [[5, 'asc']],
            drawCallback: function () {
                // View button handler
                $(".view-btn").off("click").on("click", function () {
                    const id = $(this).data("id");
                    router.get(route('services.show', id));
                });

                // Edit button handler
                $(".edit-btn").off("click").on("click", function () {
                    const id = $(this).data("id");
                    router.get(route('services.edit', id));
                });

                // Update status handler
                $(".status-btn").off("click").on("click", function () {
                    const id = $(this).data("id");
                    const status = $(this).data("status");

                    if (confirm(`Are you sure you want to mark this service as ${status}?`)) {
                        axios.post(route('services.update-status', { id, status }))
                            .then(response => {
                                dataTable.ajax.reload();
                                toast.success(response.data.message);
                            })
                            .catch(error => {
                                toast.error(error.response?.data?.message || 'Failed to update status');
                            });
                    }
                });
            }
        });

        return dataTable;
    }, []);

    const getStatusBadgeColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'repairing':
                return 'primary';
            case 'cancelled':
                return 'danger';
            case 'pending':
                return 'warning';
            case 'diagnosis':
                return 'info';
            case 'quoted':
                return 'secondary';
            default:
                return 'light';
        }
    };

    useEffect(() => {
        const dataTable = initializeDataTable();

        return () => {
            if ($.fn.DataTable.isDataTable("#servicesTable")) {
                dataTable.destroy();
            }
        };
    }, [initializeDataTable]);

    return (
        <ErpLayout>
            <Head title="Service Management" />

            <Container>
                <Row className="g-3">
                    <Col md={12} className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">Service Orders</h2>
                        <ButtonGroup className="gap-2">
                            <Button
                                variant="primary"
                                className="rounded"
                                onClick={() => router.get(route('services.create'))}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                New Service
                            </Button>
                        </ButtonGroup>
                    </Col>

                    <Col md={12}>
                        <hr className='dashed-hr' />
                    </Col>

                    <Col md={12}>
                        <Card>
                            <Card.Body className="position-relative">
                                <Table
                                    bordered
                                    striped
                                    hover
                                    responsive
                                    id="servicesTable"
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