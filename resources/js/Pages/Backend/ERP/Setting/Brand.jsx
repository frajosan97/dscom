import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, ButtonGroup, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { FiPlusSquare } from "react-icons/fi";
import ErpLayout from "@/Layouts/ErpLayout";
import Swal from "sweetalert2";
import xios from "@/Utils/axios";

import BrandModal from "@/Components/Modals/BrandModal";

export default function BrandsList() {
    const [showModal, setShowModal] = useState(false);
    const [currentBrand, setCurrentBrand] = useState(null);

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#brandsTable")) {
            $("#brandsTable").DataTable().destroy();
        }

        $("#brandsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("brand.index"),
                type: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            },
            columns: [
                {
                    data: "logo",
                    name: "logo",
                    title: "Logo",
                },
                {
                    data: "name",
                    name: "name",
                    title: "Brand Name",
                },
                {
                    data: "slug",
                    name: "slug",
                    title: "Slug",
                },
                {
                    data: "status_badge",
                    name: "status_badge",
                    title: "Status",
                },
                {
                    data: "featured_badge",
                    name: "featured_badge",
                    title: "Featured",
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
                        handleEditBrand(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleDeleteBrand(id);
                    });
            },
        });
    }, []);

    useEffect(() => {
        initializeDataTable();
    }, [initializeDataTable]);

    const handleCreate = useCallback(() => {
        setCurrentBrand(null);
        setShowModal(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        setCurrentBrand(null);
    }, []);

    const handleSuccess = useCallback((message) => {
        toast.success(message);
        $("#brandsTable").DataTable().ajax.reload(null, false);
        setShowModal(false);
    }, []);

    const handleEditBrand = async (id) => {
        try {
            const response = await xios.get(route("brand.edit", id));

            if (response.data.success === true) {
                setCurrentBrand(response.data.brand);
                setShowModal(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    const handleDeleteBrand = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Brand?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await xios.delete(route("brand.destroy", id));
            $("#brandsTable").DataTable().ajax.reload(null, false);
            Swal.fire("Deleted!", "Brand has been deleted.", "success");
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage =
                    "You don't have permission to delete this brand.";
            }
            Swal.fire("Error!", errorMessage, "error");
        }
    };

    return (
        <ErpLayout>
            <Head title="Brands" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">Brands Management</h6>
                    <ButtonGroup>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="rounded-1 d-flex align-items-center"
                            onClick={handleCreate}
                        >
                            <FiPlusSquare className="me-1" />
                            New Brand
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="px-0">
                    <Table
                        bordered
                        striped
                        hover
                        responsive
                        id="brandsTable"
                        className="w-100"
                    />
                </Card.Body>
            </Card>

            <BrandModal
                show={showModal}
                onHide={handleModalClose}
                brand={currentBrand}
                onSuccess={handleSuccess}
            />
        </ErpLayout>
    );
}
