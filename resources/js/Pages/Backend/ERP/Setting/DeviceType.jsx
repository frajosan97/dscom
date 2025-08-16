import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, ButtonGroup, Table, Badge } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import ErpLayout from "@/Layouts/ErpLayout";
import DeviceTypeModal from "@/Components/Modals/DeviceTypeModal";
import Swal from "sweetalert2";
import xios from "@/Utils/axios";

export default function DeviceTypes() {
    const [showModal, setShowModal] = useState(false);
    const [currentDeviceType, setCurrentDeviceType] = useState(null);
    const [parentDeviceTypes, setParentDeviceTypes] = useState([]);

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#deviceTypesTable")) {
            $("#deviceTypesTable").DataTable().destroy();
        }

        $("#deviceTypesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("device-type.index"),
                type: "GET",
            },
            columns: [
                { data: "name", title: "Device Type" },
                { data: "parent_name", title: "Parent Category" },
                { data: "repair_services_count", title: "Services" },
                { data: "orders_count", title: "Orders" },
                { data: "action", title: "Action" },
            ],
            drawCallback: () => {
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleEditDeviceType(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleDeleteDeviceType(id);
                    });
            },
        });
    }, []);

    useEffect(() => {
        initializeDataTable();
        // // Fetch parent device types for the modal
        // xios.get(route('device-type.parents'))
        //     .then(response => {
        //         setParentDeviceTypes(response.data.data || []);
        //     })
        //     .catch(error => {
        //         console.error("Failed to fetch parent device types:", error);
        //     });
    }, [initializeDataTable]);

    const handleCreate = useCallback(() => {
        setCurrentDeviceType(null);
        setShowModal(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        setCurrentDeviceType(null);
    }, []);

    const handleSuccess = useCallback((message) => {
        toast.success(message);
        $("#deviceTypesTable").DataTable().ajax.reload(null, false);
        setShowModal(false);
    }, []);

    const handleEditDeviceType = async (id) => {
        try {
            const response = await xios.get(route("device-type.edit", id));

            if (response.data.success === true) {
                setCurrentDeviceType(response.data.data);
                setShowModal(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    const handleDeleteDeviceType = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Device Type?",
            text: "This cannot be undone. Make sure there are no child categories, services, or orders associated.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await xios.delete(route("device-type.destroy", id));
            $("#deviceTypesTable").DataTable().ajax.reload(null, false);
            Swal.fire("Deleted!", "Device type has been deleted.", "success");
        } catch (err) {
            let errorMessage = "Delete failed.";
            if (err.response?.status === 403) {
                errorMessage = "You don't have permission to delete this device type.";
            } else if (err.response?.data?.message?.includes("child categories")) {
                errorMessage = "Cannot delete device type with child categories.";
            } else if (err.response?.data?.message?.includes("repair services")) {
                errorMessage = "Cannot delete device type with associated repair services.";
            } else if (err.response?.data?.message?.includes("existing orders")) {
                errorMessage = "Cannot delete device type with existing orders.";
            }
            Swal.fire("Error!", errorMessage, "error");
        }
    };

    return (
        <ErpLayout>
            <Head title="Device Types Management" />

            <Container fluid>
                <Row className="g-3">
                    <Col md={12} className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">Device Types</h2>
                        <ButtonGroup>
                            <Button
                                variant="primary"
                                onClick={handleCreate}
                                className="d-flex align-items-center gap-2"
                            >
                                <PlusCircle size={18} />
                                Add New Device Type
                            </Button>
                        </ButtonGroup>
                    </Col>

                    <Col md={12}>
                        <hr className="dashed-hr" />
                    </Col>

                    <Col md={12}>
                        <Card>
                            <Card.Body>
                                <Table
                                    bordered
                                    striped
                                    hover
                                    responsive
                                    id="deviceTypesTable"
                                    className="w-100"
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <DeviceTypeModal
                show={showModal}
                onHide={handleModalClose}
                deviceType={currentDeviceType}
                parentDeviceTypes={parentDeviceTypes}
                onSuccess={handleSuccess}
            />
        </ErpLayout>
    );
}