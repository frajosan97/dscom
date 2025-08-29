import { useCallback, useEffect, useState } from "react";
import { Button, Card, ButtonGroup, Table } from "react-bootstrap";
import { FiPlusSquare } from "react-icons/fi";
import { toast } from "react-toastify";

import xios from "@/Utils/axios";
import Swal from "sweetalert2";

import SliderModal from "@/Components/Modals/SliderModal";

const initialFormData = () => ({
    id: "",
    name: "",
    type: "default",
    description: "",
    is_active: false,
    start_date: "",
    end_date: "",
    order: 0,
    image: null,
});

export default function SlidesTable({ showSlider, onSuccess }) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormData());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sliders, setSliders] = useState([]);

    const reloadTable = useCallback(() => {
        const table = $("#slidesTable").DataTable();
        if (table) {
            table.ajax.reload(null, false);
        }
    }, []);

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#slidesTable")) {
            $("#slidesTable").DataTable().destroy();
        }

        $("#slidesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("slider.index"),
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
                    data: "name",
                    name: "name",
                    title: "Slider",
                    className: "text-capitalize",
                },
                {
                    data: "type",
                    name: "type",
                    title: "Type",
                },
                {
                    data: "items_count",
                    name: "items_count",
                    title: "Item Count",
                },
                {
                    data: "status",
                    name: "status",
                    title: "Status",
                },
                {
                    data: "action",
                    name: "action",
                    title: "Actions",
                    orderable: false,
                    searchable: false,
                    width: "15%",
                },
            ],
            drawCallback: function (settings) {
                $(".items-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        getSlideItems(id);
                    });

                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        editSlide(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deleteSlide(id);
                    });
            },
        });
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            image: e.target.files[0],
        }));
    };

    const handleCreate = () => {
        setFormData(initialFormData());
        setShowModal(true);
    };

    const getSlideItems = async (id) => {
        try {
            const response = await xios.get(route("slider.edit", id));

            if (response.data.success === true) {
                showSlider(response.data.slider);
            }
        } catch (error) {
            toast.error("An error occurred while fetching the slide items.");
        }
    };

    const editSlide = async (id) => {
        try {
            const response = await xios.get(route("slider.edit", id));

            if (response.data.success === true) {
                setFormData({
                    ...response.data.slider,
                    is_active: !!response.data.slider.is_active,
                });
                setShowModal(true);
            }
        } catch (error) {
            toast.error("An error occurred while fetching the slide.");
        }
    };

    const deleteSlide = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Slide?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            const response = await xios.delete(route("slider.destroy", id));

            if (response.data.success) {
                toast.success(response.data.message);
                reloadTable();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            toast.error("An error occurred while deleting the slider.");
        }
    };

    const handleSubmit = async (values) => {
        const isEditing = !!values.id;

        const confirm = await Swal.fire({
            title: isEditing ? "Update slide?" : "Create slide?",
            text: isEditing
                ? "Are you sure you want to update this slide?"
                : "Are you sure you want to create a new slide?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: isEditing
                ? "Yes, update it!"
                : "Yes, create it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            const formData = new FormData();

            Object.entries(values).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            if (isEditing) {
                formData.append("_method", "put");
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
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
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
        <>
            <Card className="border-0 rounded-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                    <h6 className="mb-0 fw-semibold">Slides Management</h6>
                    <ButtonGroup>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="rounded-1 d-flex align-items-center"
                            onClick={handleCreate}
                        >
                            <FiPlusSquare className="me-1" />
                            New Slides
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="px-0">
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
                handleFileChange={handleFileChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                sliders={sliders}
            />
        </>
    );
}
