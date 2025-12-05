import { useCallback, useEffect, useState } from "react";
import { Button, Card, ButtonGroup, Table, Alert } from "react-bootstrap";
import { FiPlusSquare } from "react-icons/fi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import xios from "@/Utils/axios";
import SliderModal from "@/Components/Modals/SliderModal";
import ErpLayout from "@/Layouts/ErpLayout";
import { Head } from "@inertiajs/react";

// Constants
const INITIAL_FORM_DATA = {
    id: "",
    name: "",
    type: "default",
    is_active: true,
    autoplay: true,
    autoplay_speed: 3000,
    arrows: true,
    dots: false,
    infinite: true,
    slides_to_show: 1,
    slides_to_scroll: 1,
    breakpoints: null,
    custom_settings: null,
};

export default function SlidesTable({ showSlider }) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dataTable, setDataTable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const reloadTable = useCallback(() => {
        if (dataTable && $.fn.DataTable.isDataTable("#slidesTable")) {
            dataTable.ajax.reload(null, false);
        }
    }, [dataTable]);

    const initializeDataTable = useCallback(() => {
        try {
            // Cleanup existing DataTable
            if ($.fn.DataTable.isDataTable("#slidesTable")) {
                $("#slidesTable").DataTable().destroy();
            }

            const table = $("#slidesTable").DataTable({
                processing: true,
                serverSide: true,
                ajax: {
                    url: route("slider.index"),
                    type: "GET",
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    dataSrc: function (json) {
                        console.log("Slider DataTable Response:", json);
                        setLoading(false);
                        setError(null);

                        if (json.error) {
                            setError(json.error);
                            return [];
                        }

                        return json.data || [];
                    },
                    error: function (xhr, error, thrown) {
                        console.error("DataTable AJAX Error:", error, thrown);
                        setLoading(false);
                        setError("Failed to load sliders data");
                        toast.error("Failed to load sliders data");
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
                        data: "name",
                        name: "name",
                        title: "Slider Name",
                        className: "text-capitalize",
                    },
                    {
                        data: "type",
                        name: "type",
                        title: "Type",
                        render: function (data, type, row) {
                            return data
                                ? data.charAt(0).toUpperCase() + data.slice(1)
                                : "-";
                        },
                    },
                    {
                        data: "items_count",
                        name: "items_count",
                        title: "Items",
                        className: "text-center",
                        render: function (data, type, row) {
                            return data || 0;
                        },
                    },
                    {
                        data: "is_active",
                        name: "is_active",
                        title: "Status",
                        className: "text-center",
                        render: function (data, type, row) {
                            return data
                                ? '<span class="badge bg-success">Active</span>'
                                : '<span class="badge bg-secondary">Inactive</span>';
                        },
                    },
                    {
                        data: "id",
                        name: "action",
                        title: "Actions",
                        orderable: false,
                        searchable: false,
                        width: "15%",
                        className: "text-center",
                        render: function (data, type, row) {
                            return `
                                <div class="btn-group btn-group-sm">
                                    <a href="${route("slider-item.index", {
                                        slider: data,
                                    })}" class="btn btn-outline-primary items-btn" title="View Items">
                                        <i class="bi bi-collection"></i>
                                    </a>
                                    <button type="button" class="btn btn-outline-secondary edit-btn" data-id="${data}" title="Edit">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-danger delete-btn" data-id="${data}" title="Delete">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            `;
                        },
                    },
                ],
                language: {
                    emptyTable: "No sliders found",
                    loadingRecords: "Loading sliders...",
                    processing: "Processing...",
                    zeroRecords: "No matching sliders found",
                },
                drawCallback: function (settings) {
                    setLoading(false);
                    $("#slidesTable")
                        .off("click", ".edit-btn")
                        .on("click", ".edit-btn", function () {
                            const id = $(this).data("id");
                            editSlide(id);
                        });

                    $("#slidesTable")
                        .off("click", ".delete-btn")
                        .on("click", ".delete-btn", function () {
                            const id = $(this).data("id");
                            deleteSlide(id);
                        });
                },
                initComplete: function () {
                    setLoading(false);
                },
            });

            setDataTable(table);
        } catch (err) {
            console.error("DataTable initialization error:", err);
            setError("Failed to initialize table");
            setLoading(false);
        }
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }, []);

    const handleCreate = useCallback(() => {
        setFormData(INITIAL_FORM_DATA);
        setShowModal(true);
    }, []);

    const editSlide = async (id) => {
        try {
            setLoading(true);
            const response = await xios.get(route("slider.edit", id));

            if (response.data.success === true) {
                const sliderData = response.data.data || response.data.slider;
                setFormData({
                    ...sliderData,
                    is_active: !!sliderData.is_active,
                });
                setShowModal(true);
            } else {
                toast.error(
                    response.data.message || "Failed to load slider data"
                );
            }
        } catch (error) {
            console.error("Error editing slider:", error);
            toast.error("An error occurred while fetching the slider.");
        } finally {
            setLoading(false);
        }
    };

    const deleteSlide = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Slider?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            setLoading(true);
            const response = await xios.delete(route("slider.destroy", id));

            if (response.data.success) {
                toast.success(response.data.message);
                reloadTable();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error("Error deleting slider:", err);
            toast.error(
                err.response?.data?.message ||
                    "An error occurred while deleting the slider."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        const isEditing = !!values.id;

        const confirm = await Swal.fire({
            title: isEditing ? "Update slider?" : "Create slider?",
            text: isEditing
                ? "Are you sure you want to update this slider?"
                : "Are you sure you want to create a new slider?",
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
                    } else if (typeof value === "object") {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value);
                    }
                }
            });

            if (isEditing) {
                formData.append("_method", "PUT");
            }

            const url = isEditing
                ? route("slider.update", values.id)
                : route("slider.store");

            const response = await xios.post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success === true) {
                toast.success(response.data.message);
                setShowModal(false);
                reloadTable();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error submitting slider:", error);
            toast.error(
                error?.response?.data?.message ||
                    "An error occurred while saving the slider."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        initializeDataTable();

        return () => {
            if ($.fn.DataTable.isDataTable("#slidesTable")) {
                $("#slidesTable").DataTable().destroy();
            }
        };
    }, [initializeDataTable]);

    return (
        <ErpLayout>
            <Head title="Slides Management" />

            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">Sliders Management</h6>
                    <ButtonGroup>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="rounded-1 d-flex align-items-center"
                            onClick={handleCreate}
                            disabled={loading}
                        >
                            <FiPlusSquare className="me-1" />
                            New Slider
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="px-0">
                    {error && (
                        <Alert variant="danger" className="mx-3">
                            {error}
                        </Alert>
                    )}

                    <Table
                        bordered
                        striped
                        hover
                        responsive
                        id="slidesTable"
                        className="w-100"
                    />
                </Card.Body>
            </Card>

            <SliderModal
                showModal={showModal}
                setShowModal={setShowModal}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </ErpLayout>
    );
}
