import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, ButtonGroup, Table, Badge } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import RepairServiceModal from "@/Components/Modals/RepairServiceModal";
import Swal from "sweetalert2";
import xios from "@/Utils/axios";
import useFilterOptions from "@/Hooks/useData";
import { formatCurrency } from "@/Utils/helpers";

export default function RepairServices() {
    const [showModal, setShowModal] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const { deviceTypes } = useFilterOptions();

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#repairServicesTable")) {
            $("#repairServicesTable").DataTable().destroy();
        }

        $("#repairServicesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("repair-service.index"),
                type: "GET",
            },
            columns: [
                { data: "name", title: "Service Name" },
                { data: "base_price", title: "Base Price", render: function (data) { return formatCurrency(data) || '0'; } },
                { data: "orders_count", title: "Orders" },
                { data: "status", title: "Status" },
                { data: "action", title: "Actions" },
            ],
            drawCallback: () => {
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleEditService(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleDeleteService(id);
                    });
            },
        });
    }, []);

    useEffect(() => {
        initializeDataTable();
    }, [initializeDataTable]);

    const handleCreate = useCallback(() => {
        setCurrentService(null);
        setShowModal(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        setCurrentService(null);
    }, []);

    const handleSuccess = useCallback((message) => {
        toast.success(message);
        $("#repairServicesTable").DataTable().ajax.reload(null, false);
        setShowModal(false);
    }, []);

    const handleEditService = async (id) => {
        try {
            const response = await xios.get(route("repair-service.edit", id));

            if (response.data.success === true) {
                setCurrentService(response.data.data);
                setShowModal(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    const handleDeleteService = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Repair Service?",
            text: "This cannot be undone. Make sure there are no orders associated with this service.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await xios.delete(route("repair-service.destroy", id));
            $("#repairServicesTable").DataTable().ajax.reload(null, false);
            Swal.fire("Deleted!", "Repair service has been deleted.", "success");
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage = "You don't have permission to delete this service.";
            } else if (err.response?.data?.message?.includes("existing orders")) {
                errorMessage = "Cannot delete service with existing orders.";
            }
            Swal.fire("Error!", errorMessage, "error");
        }
    };

    return (
        <ErpLayout>
            <Head title="Repair Services Management" />

            <Container fluid>
                <Row className="g-3">
                    <Col md={12} className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">Repair Services</h2>
                        <ButtonGroup>
                            <Button
                                variant="primary"
                                onClick={handleCreate}
                                className="d-flex align-items-center gap-2"
                            >
                                <PlusCircle size={18} />
                                Add New Service
                            </Button>
                        </ButtonGroup>
                    </Col>

                    <Col md={12}>
                        <hr className="dashed-hr" />
                    </Col>

                    <Col md={12}>
                        <Card>
                            <Card.Body>
                                <Table
                                    bordered
                                    striped
                                    hover
                                    responsive
                                    id="repairServicesTable"
                                    className="w-100"
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <RepairServiceModal
                show={showModal}
                onHide={handleModalClose}
                service={currentService}
                deviceTypes={deviceTypes}
                onSuccess={handleSuccess}
            />
        </ErpLayout>
    );
}