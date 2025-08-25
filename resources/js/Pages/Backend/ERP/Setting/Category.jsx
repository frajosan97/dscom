import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, ButtonGroup, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { FiPlusSquare } from "react-icons/fi";
import ErpLayout from "@/Layouts/ErpLayout";
import Swal from "sweetalert2";
import xios from "@/Utils/axios";

import CategoryModal from "@/Components/Modals/CategoryModal";

export default function CategoryListing() {
    const [showModal, setShowModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [parentCategories, setParentCategories] = useState([]);

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#categoriesTable")) {
            $("#categoriesTable").DataTable().destroy();
        }

        $("#categoriesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("category.index"),
                type: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            },
            columns: [
                {
                    data: "DT_RowIndex",
                    name: "DT_RowIndex",
                    title: "#",
                    orderable: false,
                    searchable: false,
                    width: "5%",
                },
                {
                    data: "image_preview",
                    name: "image_preview",
                    title: "Image",
                },
                {
                    data: "icon",
                    name: "icon",
                    title: "Icon",
                },
                {
                    data: "name",
                    name: "name",
                    title: "Name",
                },
                {
                    data: "status_badge",
                    name: "status_badge",
                    title: "Status",
                },
                {
                    data: "featured_badge",
                    name: "featured_badge",
                    title: "Is Featured",
                },
                {
                    data: "products_count",
                    name: "products_count",
                    title: "Products Count",
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
                        handleEditCategory(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleDeleteCategory(id);
                    });
            },
        });
    }, []);

    useEffect(() => {
        initializeDataTable();
        fetchParentCategories();
    }, [initializeDataTable]);

    const fetchParentCategories = useCallback(async () => {
        try {
            const response = await xios.get(route("api.categories"));
            setParentCategories(response.data);
        } catch (error) {
            toast.error("Failed to load parent categories.");
        }
    }, []);

    const handleCreate = useCallback(() => {
        setCurrentCategory(null);
        setShowModal(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        setCurrentCategory(null);
    }, []);

    const handleSuccess = useCallback(
        (message) => {
            toast.success(message);
            $("#categoriesTable").DataTable().ajax.reload(null, false);
            fetchParentCategories();
            setShowModal(false);
        },
        [fetchParentCategories]
    );

    const handleEditCategory = async (id) => {
        try {
            const response = await xios.get(route("category.edit", id));

            if (response.data.success === true) {
                setCurrentCategory(response.data.category);
                setShowModal(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    const handleDeleteCategory = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Category?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await xios.delete(route("category.destroy", id));
            $("#categoriesTable").DataTable().ajax.reload(null, false);
            Swal.fire("Deleted!", "Category has been deleted.", "success");
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage =
                    "You don't have permission to delete this category.";
            }
            Swal.fire("Error!", errorMessage, "error");
        }
    };

    return (
        <ErpLayout>
            <Head title="Categories" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">Catalogue Management</h6>
                    <ButtonGroup>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="rounded-1 d-flex align-items-center"
                            onClick={handleCreate}
                        >
                            <FiPlusSquare className="me-1" />
                            New Catalogue
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="px-0">
                    <Table
                        bordered
                        striped
                        hover
                        responsive
                        id="categoriesTable"
                        className="w-100"
                    />
                </Card.Body>
            </Card>

            <CategoryModal
                show={showModal}
                onHide={handleModalClose}
                category={currentCategory}
                onSuccess={handleSuccess}
                parentCategories={parentCategories}
            />
        </ErpLayout>
    );
}
