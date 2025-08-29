import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Card,
    Table,
    Row,
    Col,
    Form,
    FormControl,
    Button,
} from "react-bootstrap";
import { useEffect, useCallback, useState } from "react";
import { toast } from "react-toastify";
import { formatDate } from "@/Utils/helpers";

import Select from "react-select";
import ErpLayout from "@/Layouts/ErpLayout";
import useData from "@/Hooks/useData";
import Swal from "sweetalert2";
import axios from "axios";

export default function RepairOrders() {
    const { technicians } = useData();
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [isAssigning, setIsAssigning] = useState(false);

    const techniciansOptions = technicians.map((technician) => ({
        value: technician.id,
        label: technician.full_name,
    }));

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#repairOrdersTable")) {
            $("#repairOrdersTable").DataTable().destroy();
        }

        const dataTable = $("#repairOrdersTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("repair-orders.index"),
                type: "GET",
            },
            columns: [
                {
                    data: "order_number",
                    title: "RO #",
                },
                {
                    data: "created_at",
                    title: "Date",
                    render: function (data) {
                        return formatDate(data);
                    },
                },
                {
                    data: "customer.name",
                    title: "Customer",
                },
                {
                    data: "device_model",
                    title: "Device",
                },
                {
                    data: "status",
                    title: "Status",
                },
                {
                    data: "technician.full_name",
                    title: "Technician",
                },
                {
                    data: "expected_completion_date",
                    title: "ETA",
                    render: function (data) {
                        return data ? formatDate(data) : "N/A";
                    },
                },
                {
                    data: "id",
                    title: "Actions",
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return `
                            <div class="d-flex gap-1">
                                <button class="btn btn-sm btn-primary assign-btn" data-id="${data}" data-order="${
                            row.order_number
                        }" data-device="${
                            row.device?.model || "N/A"
                        }" data-complaint="${row.complaint || "N/A"}">
                                    <i class="fas fa-user-plus"></i> Assign
                                </button>
                            </div>
                        `;
                    },
                },
            ],
            order: [[0, "desc"]],
            createdRow: function (row, data, dataIndex) {
                $(row).find("td:not(:last-child)").css("cursor", "pointer");
                $(row).on("click", function (e) {
                    if (!$(e.target).closest("button, a").length) {
                        window.location = route("repair-orders.show", data.id);
                    }
                });
            },
            drawCallback: function () {
                // Add click event to assign buttons
                $(".assign-btn").on("click", function (e) {
                    e.stopPropagation();

                    const jobId = $(this).data("id");
                    const orderNumber = $(this).data("order");
                    const device = $(this).data("device");
                    const complaint = $(this).data("complaint");

                    // Set the selected job details
                    setSelectedJob({
                        id: jobId,
                        order_number: orderNumber,
                        device: device,
                        complaint: complaint,
                    });

                    // Update the form fields
                    $("#jobNumberInput").val(orderNumber);
                    $("#deviceInfo").text(device);
                    $("#complaintInfo").text(complaint);

                    // Scroll to the assign form
                    document
                        .getElementById("assignForm")
                        .scrollIntoView({ behavior: "smooth" });
                });
            },
        });

        return dataTable;
    }, []);

    useEffect(() => {
        const dataTable = initializeDataTable();

        return () => {
            if ($.fn.DataTable.isDataTable("#repairOrdersTable")) {
                dataTable.destroy();
            }
        };
    }, [initializeDataTable]);

    const handleAssignTechnician = async () => {
        if (!selectedJob || !selectedTechnician) {
            toast.error("Please select a job and a technician");
            return;
        }

        setIsAssigning(true);

        try {
            // Show confirmation dialog
            const result = await Swal.fire({
                title: "Confirm Assignment",
                text: `Assign job #${selectedJob.order_number} to ${selectedTechnician.label}?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, assign it!",
            });

            if (result.isConfirmed) {
                // Make API call to assign technician
                const response = await axios.post(
                    route("repair-orders.assign-technician"),
                    {
                        job_id: selectedJob.id,
                        technician_id: selectedTechnician.value,
                    }
                );

                if (response.data.success) {
                    toast.success(`Technician assigned successfully!`);
                    router.visit(route("repair-orders.assign-technician"));
                } else {
                    toast.error(
                        response.data.message || "Failed to assign technician"
                    );
                }
            }
        } catch (error) {
            console.error("Assignment error:", error);
            toast.error(
                error.response?.data?.message ||
                    "An error occurred while assigning the technician"
            );
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <ErpLayout>
            <Head title="Repair Orders" />

            <Row className="g-2">
                <Col md={8}>
                    <Card className="border-0 rounded-0 shadow-sm">
                        <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Repair Orders</h5>
                            <Link
                                href={route("repair-orders.create")}
                                className="btn btn-primary btn-sm"
                            >
                                <i className="fas fa-plus me-1"></i> New Repair
                                Order
                            </Link>
                        </Card.Header>
                        <Card.Body className="px-0">
                            <Table
                                bordered
                                striped
                                hover
                                responsive
                                id="repairOrdersTable"
                                className="mb-0"
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card
                        id="assignForm"
                        className="border-0 rounded-0 shadow-sm"
                    >
                        <Card.Header className="bg-transparent">
                            <h5 className="mb-0">Assign Technician</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row>
                                    <Col md={12} className="mb-2">
                                        <Form.Group>
                                            <Form.Label>Job Number</Form.Label>
                                            <FormControl
                                                id="jobNumberInput"
                                                type="text"
                                                placeholder="Select a job from the table"
                                                className="py-2"
                                                disabled
                                                readOnly
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12} className="mb-2">
                                        <p className="p-0 m-0 fw-bold">
                                            Device:
                                        </p>
                                        <p
                                            id="deviceInfo"
                                            className="p-0 m-0 mb-1 text-muted"
                                        >
                                            No device selected
                                        </p>
                                        <hr className="p-0 m-0" />
                                        <p className="p-0 m-0 mt-1 fw-bold">
                                            Complaint:
                                        </p>
                                        <p
                                            id="complaintInfo"
                                            className="p-0 m-0 text-muted"
                                        >
                                            No complaint selected
                                        </p>
                                    </Col>
                                    <Col md={12} className="mb-2">
                                        <Form.Group>
                                            <Form.Label>Technician</Form.Label>
                                            <Select
                                                options={techniciansOptions}
                                                value={selectedTechnician}
                                                onChange={setSelectedTechnician}
                                                placeholder="Select a technician..."
                                                isClearable
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Button
                                            onClick={handleAssignTechnician}
                                            disabled={
                                                !selectedJob ||
                                                !selectedTechnician ||
                                                isAssigning
                                            }
                                            className="w-100"
                                        >
                                            {isAssigning
                                                ? "Assigning..."
                                                : "Assign Technician"}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </ErpLayout>
    );
}
