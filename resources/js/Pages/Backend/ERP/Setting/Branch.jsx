import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, ButtonGroup, Table } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import BranchModal from "@/Components/Modals/BranchModal";
import Swal from "sweetalert2";
import xios from "@/Utils/axios";

export default function Branches() {
    const [showModal, setShowModal] = useState(false);
    const [currentBranch, setCurrentBranch] = useState(null);

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#branchesTable")) {
            $("#branchesTable").DataTable().destroy();
        }

        $("#branchesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("branch.index"),
                type: "GET",
            },
            columns: [
                { data: "name", title: "Name" },
                { data: "code", title: "Code" },
                { data: "city", title: "City" },
                { data: "phone", title: "Phone" },
                { data: "status_badge", title: "Status" },
                { data: "action", title: "Actions" },
            ],
            drawCallback: () => {
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleEditBranch(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleDeleteBranch(id);
                    });
            },
        });
    }, []);

    useEffect(() => {
        initializeDataTable();
    }, [initializeDataTable]);

    const handleCreate = useCallback(() => {
        setCurrentBranch(null);
        setShowModal(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        setCurrentBranch(null);
    }, []);

    const handleSuccess = useCallback((message) => {
        toast.success(message);
        $("#branchesTable").DataTable().ajax.reload(null, false);
        setShowModal(false);
    }, []);

    const handleEditBranch = async (id) => {
        try {
            const response = await xios.get(route("branch.edit", id));

            if (response.data.success === true) {
                setCurrentBranch(response.data.data);
                setShowModal(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    const handleDeleteBranch = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Branch?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await xios.delete(route("branch.destroy", id));
            $("#branchesTable").DataTable().ajax.reload(null, false);
            Swal.fire("Deleted!", "Branch has been deleted.", "success");
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage = "You don't have permission to delete this branch.";
            }
            Swal.fire("Error!", errorMessage, "error");
        }
    };

    return (
        <ErpLayout>
            <Head title="Branches Management" />

            <Container fluid>
                <Row className="g-3">
                    <Col md={12} className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">Branches Management</h2>
                        <ButtonGroup>
                            <Button
                                variant="primary"
                                onClick={handleCreate}
                                className="d-flex align-items-center gap-2"
                            >
                                <PlusCircle size={18} />
                                Add New Branch
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
                                    id="branchesTable"
                                    className="w-100"
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <BranchModal
                show={showModal}
                onHide={handleModalClose}
                branch={currentBranch}
                onSuccess={handleSuccess}
            />
        </ErpLayout>
    );
}