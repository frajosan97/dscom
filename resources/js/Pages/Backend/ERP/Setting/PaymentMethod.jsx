import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, ButtonGroup, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { FiPlusSquare } from "react-icons/fi";
import ErpLayout from "@/Layouts/ErpLayout";
import Swal from "sweetalert2";
import xios from "@/Utils/axios";

import PaymentMethodModal from "@/Components/Modals/PaymentMethodModal";

export default function PaymentMethods() {
    const [showModal, setShowModal] = useState(false);
    const [currentMethod, setCurrentMethod] = useState(null);

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#paymentMethodsTable")) {
            $("#paymentMethodsTable").DataTable().destroy();
        }

        $("#paymentMethodsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("payment-method.index"),
                type: "GET",
            },
            columns: [
                { data: "name", title: "Name" },
                { data: "code", title: "Code" },
                { data: "fee", title: "Processing Fee" },
                { data: "status", title: "Status" },
                { data: "action", title: "Actions" },
            ],
            drawCallback: () => {
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleEditMethod(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleDeleteMethod(id);
                    });
            },
        });
    }, []);

    useEffect(() => {
        initializeDataTable();
    }, [initializeDataTable]);

    const handleCreate = useCallback(() => {
        setCurrentMethod(null);
        setShowModal(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        setCurrentMethod(null);
    }, []);

    const handleSuccess = useCallback((message) => {
        toast.success(message);
        $("#paymentMethodsTable").DataTable().ajax.reload(null, false);
        setShowModal(false);
    }, []);

    const handleEditMethod = async (id) => {
        try {
            const response = await xios.get(route("payment-method.edit", id));

            if (response.data.success === true) {
                setCurrentMethod(response.data.data);
                setShowModal(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    const handleDeleteMethod = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Payment Method?",
            text: "This cannot be undone. Transactions using this method will be preserved.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await xios.delete(route("payment-method.destroy", id));
            $("#paymentMethodsTable").DataTable().ajax.reload(null, false);
            Swal.fire(
                "Deleted!",
                "Payment method has been deleted.",
                "success"
            );
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage =
                    "You don't have permission to delete this method.";
            } else if (err.response?.data?.message?.includes("default")) {
                errorMessage = "Cannot delete default payment method.";
            }
            Swal.fire("Error!", errorMessage, "error");
        }
    };

    return (
        <ErpLayout>
            <Head title="Payment Methods Management" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">
                        Payment Methods Management
                    </h6>
                    <ButtonGroup>
                        <ButtonGroup>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="rounded-1 d-flex align-items-center"
                                onClick={handleCreate}
                            >
                                <FiPlusSquare className="me-1" />
                                New Payment Method
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
                        id="paymentMethodsTable"
                        className="w-100"
                    />
                </Card.Body>
            </Card>

            <PaymentMethodModal
                show={showModal}
                onHide={handleModalClose}
                method={currentMethod}
                onSuccess={handleSuccess}
            />
        </ErpLayout>
    );
}
