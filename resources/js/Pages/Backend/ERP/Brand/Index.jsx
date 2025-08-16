import { Head } from "@inertiajs/react";
import { Container, Row, Col, Card, Button, ButtonGroup, Table } from "react-bootstrap";
import ErpLayout from "@/Layouts/ErpLayout";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import $ from "jquery";
import "jquery-validation";
import withReactContent from "sweetalert2-react-content";
import BrandModal from "@/Components/Modals/BrandModal";

// Configure axios for CSRF protection
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "XSRF-TOKEN";
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

const SweetAlert = withReactContent(Swal);

const initialFormData = () => ({
    id: "",
    name: "",
    slug: "",
    description: "",
    meta_title: "",
    meta_description: "",
    logo: null,
    website_url: "",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    is_active: false,
    is_featured: false,
    order: 0,
});

export default function BrandsList() {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormData());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reloadTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#brandsTable")) {
            $("#brandsTable").DataTable().ajax.reload(null, false);
        }
    }, []);

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
                { data: "name", title: "Brand Name" },
                { data: "slug", title: "Slug" },
                { data: "logo", title: "Logo" },
                { data: "status_badge", title: "Status" },
                { data: "featured_badge", title: "Featured" },
                { data: "action", title: "Actions", orderable: false },
            ],
            drawCallback: () => {
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        editBrand(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        deleteBrand(id);
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
            logo: e.target.files[0],
        }));
    };

    const handleCreate = () => {
        setFormData(initialFormData());
        setShowModal(true);
    };

    const editBrand = async (id) => {
        try {
            const res = await axios.get(route("brand.edit", id));
            setFormData({
                ...res.data,
                is_active: !!res.data.is_active,
                is_featured: !!res.data.is_featured,
            });
            setShowModal(true);
        } catch (error) {
            // console.error("Error:", error);
            SweetAlert.fire("Error", "Failed to load brand data.", "error");
        }
    };

    const deleteBrand = async (id) => {
        const confirm = await SweetAlert.fire({
            title: "Delete Brand?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await axios.delete(route("brand.destroy", id));
            reloadTable();
            SweetAlert.fire("Deleted!", "Brand has been deleted.", "success");
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage = "You don't have permission to delete this brand.";
            }
            SweetAlert.fire("Error!", errorMessage, "error");
        }
    };

    const handleSubmit = async (values) => {
        const isEditing = !!values.id;

        const confirm = await SweetAlert.fire({
            title: isEditing ? "Update brand?" : "Create brand?",
            text: isEditing
                ? "Are you sure you want to update this brand?"
                : "Are you sure you want to create a new brand?",
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

            const url = isEditing ? route("brand.update", values.id) : route("brand.store");
            await axios.post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setShowModal(false);
            reloadTable();
            SweetAlert.fire(
                "Success",
                `Brand ${isEditing ? "updated" : "created"} successfully.`,
                "success"
            );
        } catch (err) {
            // console.error("Error saving brand", err);
            let errorMessage = "Failed to save brand.";
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
        return () => {
            if ($.fn.DataTable.isDataTable("#brandsTable")) {
                $("#brandsTable").DataTable().destroy();
            }
        };
    }, [initializeDataTable]);

    return (
        <ErpLayout>
            <Head title="Brands" />

            <Container>
                <Row className="g-3">
                    <Col md={12} className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">Brands</h2>
                        <ButtonGroup className="gap-2">
                            <Button
                                variant="outline-primary"
                                className="rounded"
                                onClick={handleCreate}
                            >
                                <i className="bi bi-plus-circle"></i>{" "}
                                Create Brand
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
                                    id="brandsTable"
                                    className="w-100"
                                ></Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <BrandModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleFileChange={handleFileChange}
                    handleSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </Container>
        </ErpLayout>
    );
}