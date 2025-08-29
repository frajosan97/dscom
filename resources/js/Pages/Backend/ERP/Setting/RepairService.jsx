import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, ButtonGroup, Table } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import { formatCurrency } from "@/Utils/helpers";

import ErpLayout from "@/Layouts/ErpLayout";
import RepairServiceModal from "@/Components/Modals/RepairServiceModal";
import Swal from "sweetalert2";
import xios from "@/Utils/axios";
import useData from "@/Hooks/useData";

export default function RepairServices() {
    const [showModal, setShowModal] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    
    const { deviceTypes } = useData();

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
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            },
            columns: [
                {
                    data: "name",
                    name: "name",
                    title: "Service Name",
                },
                {
                    data: "base_price",
                    name: "base_price",
                    title: "Base Price",
                    render: function (data) {
                        return formatCurrency(data) || "0";
                    },
                },
                // {
                //     data: "orders_count",
                //     name: "orders_count",
                //     title: "Orders",
                // },
                {
                    data: "status",
                    name: "status",
                    title: "Status",
                },
                {
                    data: "action",
                    name: "action",
                    title: "Actions",
                    orderable: false,
                    searchable: false,
                    width: "10%",
                },
            ],
            order: [[0, "desc"]],
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
            Swal.fire(
                "Deleted!",
                "Repair service has been deleted.",
                "success"
            );
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage =
                    "You don't have permission to delete this service.";
            } else if (
                err.response?.data?.message?.includes("existing orders")
            ) {
                errorMessage = "Cannot delete service with existing orders.";
            }
            Swal.fire("Error!", errorMessage, "error");
        }
    };

    return (
        <ErpLayout>
            <Head title="Repair Services Management" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">
                        Repair Services Management
                    </h6>
                    <ButtonGroup>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="rounded-1 d-flex align-items-center"
                            onClick={handleCreate}
                        >
                            <PlusCircle className="me-1" />
                            New Service
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="px-0">
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
