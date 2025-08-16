import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, ButtonGroup, Table, Badge } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import PaymentMethodModal from "@/Components/Modals/PaymentMethodModal";
import Swal from "sweetalert2";
import xios from "@/Utils/axios";

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
            Swal.fire("Deleted!", "Payment method has been deleted.", "success");
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage = "You don't have permission to delete this method.";
            } else if (err.response?.data?.message?.includes("default")) {
                errorMessage = "Cannot delete default payment method.";
            }
            Swal.fire("Error!", errorMessage, "error");
        }
    };

    return (
        <ErpLayout>
            <Head title="Payment Methods Management" />

            <Container fluid>
                <Row className="g-3">
                    <Col md={12} className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">Payment Methods</h2>
                        <ButtonGroup>
                            <Button
                                variant="primary"
                                onClick={handleCreate}
                                className="d-flex align-items-center gap-2"
                            >
                                <PlusCircle size={18} />
                                Add New Method
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
                                    id="paymentMethodsTable"
                                    className="w-100"
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <PaymentMethodModal
                show={showModal}
                onHide={handleModalClose}
                method={currentMethod}
                onSuccess={handleSuccess}
            />
        </ErpLayout>
    );
}