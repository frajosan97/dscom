import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, ButtonGroup, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { FiPlusSquare } from "react-icons/fi";
import ErpLayout from "@/Layouts/ErpLayout";
import Swal from "sweetalert2";
import xios from "@/Utils/axios";

import BranchModal from "@/Components/Modals/BranchModal";

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
                errorMessage =
                    "You don't have permission to delete this branch.";
            }
            Swal.fire("Error!", errorMessage, "error");
        }
    };

    return (
        <ErpLayout>
            <Head title="Branches Management" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">Branches Management</h6>
                    <ButtonGroup>
                        <ButtonGroup>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="rounded-1 d-flex align-items-center"
                                onClick={handleCreate}
                            >
                                <FiPlusSquare className="me-1" />
                                New Branch
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
                        id="branchesTable"
                        className="w-100"
                    />
                </Card.Body>
            </Card>

            <BranchModal
                show={showModal}
                onHide={handleModalClose}
                branch={currentBranch}
                onSuccess={handleSuccess}
            />
        </ErpLayout>
    );
}
