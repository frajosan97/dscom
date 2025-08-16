import { Head } from '@inertiajs/react';
import { Container, Row, Col, Card, Button, ButtonGroup, Table } from 'react-bootstrap';
import { useState, useEffect, useCallback } from 'react';

import axios from "axios";
import Swal from "sweetalert2";

import ErpLayout from "@/Layouts/ErpLayout";
import withReactContent from "sweetalert2-react-content";
import CategoryModal from "@/Components/Modals/CategoryModal";

const SweetAlert = withReactContent(Swal);

const initialFormData = () => ({
    id: "",
    name: "",
    slug: "",
    description: "",
    parent_id: null,
    image: null,
    icon: "",
    meta_title: "",
    meta_description: "",
    is_active: false,
    is_featured: false,
    order: 0,
});

export default function CategoryListing() {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormData());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [parentCategories, setParentCategories] = useState([]);

    const reloadTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#categoriesTable")) {
            $("#categoriesTable").DataTable().ajax.reload(null, false);
        }
    }, []);

    const fetchParentCategories = useCallback(async () => {
        try {
            const response = await axios.get(route("api.categories"));
            setParentCategories(response.data);
        } catch (error) {
            // console.error("Error:", error);
            SweetAlert.fire("Error", "Failed to load parent categories.", "error");
        }
    }, []);

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
                { data: "DT_RowIndex", name: "DT_RowIndex", title: "#", orderable: false, searchable: false, width: "5%" },
                { data: "image_preview", name: "image_preview", title: "Image" },
                { data: "icon", name: "icon", title: "Icon" },
                { data: "name", name: "name", title: "Name" },
                { data: "status_badge", name: "status_badge", title: "Status" },
                { data: "featured_badge", name: "featured_badge", title: "Is Featured" },
                { data: "products_count", name: "products_count", title: "Products Count" },
                { data: "action", name: "action", title: "Actions", orderable: false, searchable: false, width: "10%" },
            ],
            order: [[0, "desc"]],
            drawCallback: () => {
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        editCategory(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deleteCategory(id);
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

    const editCategory = async (id) => {
        try {
            const res = await axios.get(route("category.edit", id));
            setFormData({
                ...res.data,
                is_active: !!res.data.is_active,
                is_featured: !!res.data.is_featured,
            });
            setShowModal(true);
        } catch (error) {
            // console.error("Error:", error);
            SweetAlert.fire("Error", "Failed to load category data.", "error");
        }
    };

    const deleteCategory = async (id) => {
        const confirm = await SweetAlert.fire({
            title: "Delete Category?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await axios.delete(route("category.destroy", id));
            reloadTable();
            SweetAlert.fire("Deleted!", "Category has been deleted.", "success");
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage = "You don't have permission to delete this category.";
            }
            SweetAlert.fire("Error!", errorMessage, "error");
        }
    };

    const handleSubmit = async (values) => {
        const isEditing = !!values.id;

        const confirm = await SweetAlert.fire({
            title: isEditing ? "Update category?" : "Create category?",
            text: isEditing
                ? "Are you sure you want to update this category?"
                : "Are you sure you want to create a new category?",
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

            const url = isEditing ? route("category.update", values.id) : route("category.store");
            await axios.post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setShowModal(false);
            reloadTable();
            fetchParentCategories();
            SweetAlert.fire(
                "Success",
                `Category ${isEditing ? "updated" : "created"} successfully.`,
                "success"
            );
        } catch (err) {
            // console.error("Error saving category", err);
            let errorMessage = "Failed to save category.";
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
        fetchParentCategories();
        return () => {
            if ($.fn.DataTable.isDataTable("#categoriesTable")) {
                $("#categoriesTable").DataTable().destroy();
            }
        };
    }, [initializeDataTable, fetchParentCategories]);

    return (
        <ErpLayout>
            <Head title="Categories" />

            <Container>
                <Row className="g-3">
                    <Col md={12} className="d-flex justify-content-between align-items-center">
                        <h2 className='mb-0'>Categories</h2>
                        <ButtonGroup className="gap-2">
                            <Button
                                variant="outline-primary"
                                className="rounded"
                                onClick={handleCreate}
                            >
                                <i className="bi bi-plus-circle"></i>{" "}
                                Create Category
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
                                    id="categoriesTable"
                                    className="w-100"
                                ></Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <CategoryModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleFileChange={handleFileChange}
                    handleSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    parentCategories={parentCategories}
                />
            </Container>
        </ErpLayout>
    );
}