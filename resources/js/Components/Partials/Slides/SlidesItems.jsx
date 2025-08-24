import { useCallback, useEffect, useState, useMemo } from "react";
import { Button, Card, ButtonGroup, Table } from "react-bootstrap";
import { FiPlusSquare } from "react-icons/fi";
import { toast } from "react-toastify";

import Swal from "sweetalert2";
import xios from "@/Utils/axios";
import SliderItemModal from "@/Components/Modals/SliderItemModal";

export default function SlidesItems({ slider }) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ slider_id: slider.id });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dataTable, setDataTable] = useState(null);

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#sliderItemsTable")) {
            dataTable?.destroy();
        }

        const newDataTable = $("#sliderItemsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("slider-item.index", { slider: slider.id }),
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
                    data: "title",
                    name: "title",
                    title: "Title",
                },
                {
                    data: "subtitle",
                    name: "subtitle",
                    title: "Sub Title",
                },
                {
                    data: "status_badge",
                    name: "status_badge",
                    title: "Status",
                },
                {
                    data: "order",
                    name: "order",
                    title: "Order",
                },
                {
                    data: "action",
                    name: "action",
                    title: "Actions",
                    className: "text-end",
                    orderable: false,
                    searchable: false,
                    width: "10%",
                },
            ],
            drawCallback: function () {
                // Use event delegation for better performance
                $("#sliderItemsTable")
                    .off("click", ".view-item-btn")
                    .on("click", ".view-item-btn", function () {
                        window.location.href = route(
                            "slider-item.show",
                            $(this).data("id")
                        );
                    });

                $("#sliderItemsTable")
                    .off("click", ".edit-item-btn")
                    .on("click", ".edit-item-btn", function () {
                        const id = $(this).data("id");
                        editItem(id);
                    });

                $("#sliderItemsTable")
                    .off("click", ".delete-item-btn")
                    .on("click", ".delete-item-btn", function () {
                        const id = $(this).data("id");
                        deleteItem(id);
                    });
            },
        });

        setDataTable(newDataTable);
    }, [slider.id]);

    const handleCreate = () => {
        setFormData({ slider_id: slider.id });
        setShowModal(true);
    };

    const editItem = async (id) => {
        try {
            const res = await xios.get(route("slider-item.edit", id));
            setFormData({
                ...res.data,
                is_active: !!res.data.is_active,
                slider_id: slider.id,
            });
            setShowModal(true);
        } catch (error) {
            toast.error("An error occurred while fetching the slider item.");
        }
    };

    const deleteItem = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Slider Item?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            const response = await xios.delete(
                route("slider-item.destroy", id)
            );

            if (response.data.success) {
                toast.success(response.data.message);
                dataTable?.ajax.reload(null, false); // Reload table without resetting pagination
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            toast.error("An error occurred while deleting the slider item.");
        }
    };

    const handleSubmit = async (values) => {
        const isEditing = !!values.id;

        const confirm = await Swal.fire({
            title: isEditing ? "Update slider item?" : "Create slider item?",
            text: isEditing
                ? "Are you sure you want to update this slider item?"
                : "Are you sure you want to create a new slider item?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: isEditing
                ? "Yes, update it!"
                : "Yes, create it!",
        });

        if (!confirm.isConfirmed) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData();

            Object.entries(values).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (typeof value === "boolean") {
                        formData.append(key, value ? 1 : 0);
                    } else {
                        formData.append(key, value);
                    }
                }
            });

            if (isEditing) {
                formData.append("_method", "put");
            }

            const url = isEditing
                ? route("slider-item.update", values.id)
                : route("slider-item.store");

            const response = await xios.post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success === true) {
                toast.success(response.data.message);
                setShowModal(false);
                dataTable?.ajax.reload(null, false); // Reload table without resetting pagination
            }
        } catch (err) {
            console.error("Submission error:", err);
            toast.error(
                err.response?.data?.message ||
                    "An error occurred while processing the request."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        initializeDataTable();

        return () => {
            if (dataTable) {
                dataTable.destroy();
            }
        };
    }, [initializeDataTable]);

    return (
        <>
            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">{slider?.name}</h6>
                    <ButtonGroup>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-1 d-flex align-items-center"
                            onClick={handleCreate}
                        >
                            <FiPlusSquare className="me-1" />
                            New Slide Item
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="px-0">
                    <div className="table-responsive">
                        <Table
                            bordered
                            striped
                            hover
                            id="sliderItemsTable"
                            className="w-100"
                        ></Table>
                    </div>
                </Card.Body>
            </Card>

            <SliderItemModal
                showModal={showModal}
                setShowModal={setShowModal}
                formData={formData}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </>
    );
}
