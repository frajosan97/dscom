import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, ButtonGroup, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { FiPlusSquare } from "react-icons/fi";
import ErpLayout from "@/Layouts/ErpLayout";
import Swal from "sweetalert2";
import xios from "@/Utils/axios";

import WarehouseModal from "@/Components/Modals/WarehouseModal";
import useFilterOptions from "@/Hooks/useData";

export default function Warehouses() {
    const [showModal, setShowModal] = useState(false);
    const [currentWarehouse, setCurrentWarehouse] = useState(null);
    const { branches } = useFilterOptions();

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#warehousesTable")) {
            $("#warehousesTable").DataTable().destroy();
        }

        $("#warehousesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("warehouse.index"),
                type: "GET",
            },
            columns: [
                { data: "name", title: "Name" },
                { data: "code", title: "Code" },
                { data: "branch", title: "Branch" },
                { data: "location", title: "Location" },
                { data: "status", title: "Status" },
                { data: "action", title: "Actions" },
            ],
            drawCallback: () => {
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleEditWarehouse(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleDeleteWarehouse(id);
                    });
            },
        });
    }, []);

    useEffect(() => {
        initializeDataTable();
    }, [initializeDataTable]);

    const handleCreate = useCallback(() => {
        setCurrentWarehouse(null);
        setShowModal(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        setCurrentWarehouse(null);
    }, []);

    const handleSuccess = useCallback((message) => {
        toast.success(message);
        $("#warehousesTable").DataTable().ajax.reload(null, false);
        setShowModal(false);
    }, []);

    const handleEditWarehouse = async (id) => {
        try {
            const response = await xios.get(route("warehouse.edit", id));

            if (response.data.success === true) {
                setCurrentWarehouse(response.data.data);
                setShowModal(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    const handleDeleteWarehouse = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Warehouse?",
            text: "This cannot be undone. All related inventory data will be affected.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await xios.delete(route("warehouse.destroy", id));
            $("#warehousesTable").DataTable().ajax.reload(null, false);
            Swal.fire("Deleted!", "Warehouse has been deleted.", "success");
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage =
                    "You don't have permission to delete this warehouse.";
            } else if (
                err.response?.data?.message?.includes("foreign key constraint")
            ) {
                errorMessage =
                    "Cannot delete warehouse because it has associated inventory records.";
            }
            Swal.fire("Error!", errorMessage, "error");
        }
    };

    return (
        <ErpLayout>
            <Head title="Warehouses Management" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">Warehouse Management</h6>
                    <ButtonGroup>
                        <ButtonGroup>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="rounded-1 d-flex align-items-center"
                                onClick={handleCreate}
                            >
                                <FiPlusSquare className="me-1" />
                                New Warehouse
                            </Button>
                        </ButtonGroup>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="px-0">
                    <Table
                        bordered
                        striped
                        hover
                        responsive
                        id="warehousesTable"
                        className="w-100"
                    />
                </Card.Body>
            </Card>

            <WarehouseModal
                show={showModal}
                onHide={handleModalClose}
                warehouse={currentWarehouse}
                branches={branches}
                onSuccess={handleSuccess}
            />
        </ErpLayout>
    );
}
