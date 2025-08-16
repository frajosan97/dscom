import { Head } from '@inertiajs/react';
import { Container, Row, Col, Card, Button, ButtonGroup, Table } from 'react-bootstrap';
import { useState, useEffect, useCallback } from 'react';

import axios from "axios";
import Swal from "sweetalert2";
import { toast } from 'react-toastify';

import ErpLayout from "@/Layouts/ErpLayout";
import withReactContent from "sweetalert2-react-content";
import SliderModal from "@/Components/Modals/SliderModal";

const SweetAlert = withReactContent(Swal);

const initialFormData = () => ({
    id: "",
    name: "",
    type: "",
    description: "",
    is_active: false,
    start_date: "",
    end_date: "",
    order: 0,
});

export default function SlidesListing() {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormData());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sliders, setSliders] = useState([]);

    const reloadTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#slidesTable")) {
            $("#slidesTable").DataTable().ajax.reload(null, false);
        }
    }, []);

    const fetchSliders = useCallback(async () => {
        try {
            const response = await axios.get(route("slider.index"));
            setSliders(response.data);
        } catch (error) {
            // console.error("Error:", error);
            SweetAlert.fire("Error", "Failed to load sliders.", "error");
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
                { data: "DT_RowIndex", name: "DT_RowIndex", title: "#", orderable: false, searchable: false, width: "5%" },
                { data: "name", name: "name", title: "Slider", className: "text-capitalize" },
                { data: "type", name: "type", title: "Type" },
                { data: "items_count", name: "items_count", title: "Item Count" },
                { data: "status_badge", name: "status_badge", title: "Status" },
                { data: "action", name: "action", title: "Actions", orderable: false, searchable: false, width: "15%" },
            ],
            drawCallback: () => {
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

    const editSlide = async (id) => {
        try {
            const res = await axios.get(route("slider.edit", id));
            setFormData({
                ...res.data,
                is_active: !!res.data.is_active,
            });
            setShowModal(true);
        } catch (error) {
            // console.error("Error:", error);
            SweetAlert.fire("Error", "Failed to load slide data.", "error");
        }
    };

    const deleteSlide = async (id) => {
        const confirm = await SweetAlert.fire({
            title: "Delete Slide?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await axios.delete(route("slider.destroy", id));
            reloadTable();
            SweetAlert.fire("Deleted!", "Slide has been deleted.", "success");
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage = "You don't have permission to delete this slide.";
            }
            SweetAlert.fire("Error!", errorMessage, "error");
        }
    };

    const updateItemsOrder = async (items) => {
        try {
            await axios.post(route("slider.order.update"), { items });
            SweetAlert.fire("Success", "Slides order updated successfully!", "success");
        } catch (error) {
            // console.error("Error updating slides order:", error);
            SweetAlert.fire("Error", "Failed to update slides order.", "error");
            reloadTable();
        }
    };

    const handleSubmit = async (values) => {
        const isEditing = !!values.id;

        const confirm = await SweetAlert.fire({
            title: isEditing ? "Update slide?" : "Create slide?",
            text: isEditing
                ? "Are you sure you want to update this slide?"
                : "Are you sure you want to create a new slide?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: isEditing ? "Yes, update it!" : "Yes, create it!",
        });

        if (!confirm.isConfirmed) return;

        setIsSubmitting(true);
        SweetAlert.fire({
            icon: "info",
            title: "Processing...",
            text: "Please wait...",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => SweetAlert.showLoading(),
        });

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

            const url = isEditing ? route("slider.update", values.id) : route("slider.store");
            await axios.post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setShowModal(false);
            reloadTable();
            fetchSliders();
            SweetAlert.fire(
                "Success",
                `Slide ${isEditing ? "updated" : "created"} successfully.`,
                "success"
            );
        } catch (err) {
            // console.error("Error saving slide", err);
            let errorMessage = "Failed to save slide.";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 422) {
                errorMessage = "Validation error. Please check your input.";
            } else if (err.response?.status === 403) {
                errorMessage = "You don't have permission to perform this action.";
            }

            SweetAlert.fire("Error", errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        initializeDataTable();
        fetchSliders();
        return () => {
            if ($.fn.DataTable.isDataTable("#slidesTable")) {
                $("#slidesTable").DataTable().destroy();
            }
        };
    }, [initializeDataTable, fetchSliders]);

    return (
        <ErpLayout>
            <Head title="Slides" />

            <Container>
                <Row className="g-3">
                    <Col md={12} className="d-flex justify-content-between align-items-center">
                        <h2 className='mb-0'>Slides</h2>
                        <ButtonGroup className="gap-2">
                            <Button
                                variant="outline-primary"
                                className="rounded"
                                onClick={handleCreate}
                            >
                                <i className="bi bi-plus-circle"></i>{" "}
                                Create Slide
                            </Button>
                        </ButtonGroup>
                    </Col>

                    <Col md={12}>
                        <hr className='dashed-hr' />
                    </Col>

                    <Col md={12}>
                        <Card>
                            <Card.Body>
                                <Table
                                    bordered
                                    striped
                                    hover
                                    responsive
                                    id="slidesTable"
                                    className="w-100"
                                ></Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

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
            </Container>
        </ErpLayout>
    );
}