import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, ButtonGroup, Table, Alert } from "react-bootstrap";
import { FiPlusSquare } from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import xios from "@/Utils/axios";
import SliderItemModal from "@/Components/Modals/SliderItemModal";
import ErpLayout from "@/Layouts/ErpLayout";
import { Head } from "@inertiajs/react";

const INITIAL_FORM_DATA = {
    slider_id: "",
    title: "",
    subtitle: "",
    description: "",
    button_text: "",
    button_url: "",
    is_active: true,
    order: 0,
    image: null,
};

export default function SliderItems({ slider, onSuccess }) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const tableRef = useRef(null);
    const initializedRef = useRef(false);

    /** Reload DataTable */
    const reloadTable = useCallback(() => {
        if (tableRef.current) {
            tableRef.current.ajax.reload(null, false);
        }
    }, []);

    /** Initialize DataTable */
    const initializeDataTable = useCallback(() => {
        if (!slider?.id) {
            setError("No slider selected");
            setLoading(false);
            return;
        }

        // Prevent multiple initializations
        if ($.fn.DataTable.isDataTable("#sliderItemsTable")) {
            reloadTable();
            return;
        }

        setLoading(true);
        setError(null);

        const table = $("#sliderItemsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("slider-item.index"),
                type: "GET",
                data: { slider: slider.id },
                dataSrc: (json) => {
                    console.log("DataTable response:", json);
                    return json.data || [];
                },
                error: (xhr) => {
                    console.error("DataTable error:", xhr);
                    setError("Failed to load slider items");
                    toast.error("Failed to load slider items");
                },
            },
            columns: [
                {
                    data: "DT_RowIndex",
                    name: "DT_RowIndex",
                    orderable: false,
                    searchable: false,
                },
                {
                    data: "image_preview",
                    name: "image_preview",
                    orderable: false,
                    searchable: false,
                },
                { data: "title", name: "title" },
                { data: "subtitle", name: "subtitle" },
                {
                    data: "is_active",
                    name: "is_active",
                    render: (data) =>
                        data
                            ? `<span class="badge bg-success">Active</span>`
                            : `<span class="badge bg-secondary">Inactive</span>`,
                },
                { data: "order", name: "order" },
                {
                    data: "id",
                    name: "actions",
                    orderable: false,
                    searchable: false,
                    render: (id) => {
                        return `
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-secondary edit-item-btn" data-id="${id}">
                                    <i class="bi bi-pencil"></i> Edit
                                </button>
                                <button class="btn btn-outline-danger delete-item-btn" data-id="${id}">
                                    <i class="bi bi-trash"></i> Delete
                                </button>
                            </div>
                        `;
                    },
                },
            ],
            drawCallback: function (settings) {
                console.log("DataTable draw complete");

                // Use event delegation on the table itself
                $("#sliderItemsTable")
                    .off("click", ".edit-item-btn")
                    .on("click", ".edit-item-btn", function (e) {
                        e.preventDefault();
                        const id = $(this).data("id");
                        console.log("Edit button clicked:", id);
                        editItem(id);
                    });

                $("#sliderItemsTable")
                    .off("click", ".delete-item-btn")
                    .on("click", ".delete-item-btn", function (e) {
                        e.preventDefault();
                        const id = $(this).data("id");
                        console.log("Delete button clicked:", id);
                        deleteItem(id);
                    });
            },
            initComplete: function () {
                console.log("DataTable initialized");
                initializedRef.current = true;
                setLoading(false);
            },
        });

        tableRef.current = table;
    }, [slider?.id, reloadTable]);

    /** Create item */
    const handleCreate = () => {
        setFormData({ ...INITIAL_FORM_DATA, slider_id: slider.id });
        setShowModal(true);
    };

    /** Edit item */
    const editItem = async (id) => {
        try {
            console.log("Editing item:", id);
            const res = await xios.get(route("slider-item.edit", id));
            console.log("Edit response:", res.data);

            // FIX: Use the correct response structure from your backend
            if (res.data.item) {
                setFormData({
                    ...res.data.item,
                    slider_id: slider.id,
                });
                setShowModal(true);
            } else if (res.data.data) {
                // Alternative response structure
                setFormData({
                    ...res.data.data,
                    slider_id: slider.id,
                });
                setShowModal(true);
            } else {
                toast.error("Item data not found in response");
            }
        } catch (error) {
            console.error("Edit error:", error);
            toast.error("Failed to load item");
        }
    };

    /** Delete item */
    const deleteItem = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete item?",
            icon: "warning",
            showCancelButton: true,
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await xios.delete(route("slider-item.destroy", id));
            if (res.data.success) {
                toast.success(res.data.message);
                reloadTable();
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error("Delete failed");
        }
    };

    /** Submit form */
    const handleSubmit = async (values) => {
        const isEditing = !!values.id;

        const confirm = await Swal.fire({
            title: isEditing ? "Update item?" : "Create item?",
            showCancelButton: true,
            icon: "question",
        });

        if (!confirm.isConfirmed) return;

        setIsSubmitting(true);

        try {
            const form = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value !== null) {
                    if (key === "image" && value instanceof File) {
                        form.append(key, value);
                    } else if (
                        key === "mobile_image" &&
                        value instanceof File
                    ) {
                        form.append(key, value);
                    } else if (typeof value === "boolean") {
                        form.append(key, value ? 1 : 0);
                    } else {
                        form.append(key, value);
                    }
                }
            });

            if (isEditing) {
                form.append("_method", "PUT");
            }

            const url = isEditing
                ? route("slider-item.update", values.id)
                : route("slider-item.store");

            const res = await xios.post(url, form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.success) {
                setShowModal(false);
                reloadTable();
                onSuccess?.();
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Submit failed");
        }

        setIsSubmitting(false);
    };

    /** Initialize DataTable once */
    useEffect(() => {
        console.log("Slider ID changed:", slider?.id);

        if (slider?.id) {
            const timer = setTimeout(() => {
                console.log("Initializing DataTable...");
                initializeDataTable();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [slider?.id, initializeDataTable]);

    /** Cleanup on unmount */
    useEffect(() => {
        return () => {
            if (tableRef.current) {
                tableRef.current.destroy(true);
                tableRef.current = null;
                initializedRef.current = false;
            }
        };
    }, []);

    return (
        <ErpLayout>
            <Head title="Slides Items Management" />

            {slider?.id ? (
                <Card className="shadow-sm border-0 rounded-0">
                    <Card.Header className="d-flex justify-content-between bg-transparent">
                        <h6 className="mb-0 fw-semibold">
                            {slider.name} - Items
                        </h6>

                        <ButtonGroup>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={handleCreate}
                            >
                                <FiPlusSquare className="me-1" />
                                New Item
                            </Button>
                        </ButtonGroup>
                    </Card.Header>

                    <Card.Body className="px-0">
                        {error && (
                            <Alert variant="danger" className="mx-3">
                                {error}
                            </Alert>
                        )}

                        <div className="table-responsive px-2">
                            <Table
                                id="sliderItemsTable"
                                className="table table-bordered table-striped w-100"
                            >
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Image</th>
                                        <th>Title</th>
                                        <th>Sub Title</th>
                                        <th>Status</th>
                                        <th>Order</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="warning" className="text-center">
                    Please select a slider to manage.
                </Alert>
            )}

            <SliderItemModal
                showModal={showModal}
                setShowModal={setShowModal}
                formData={formData}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </ErpLayout>
    );
}
