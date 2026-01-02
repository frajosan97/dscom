import React, { useState, useRef } from "react";
import { Button, Modal, Form, ProgressBar } from "react-bootstrap";
import { BiUpload, BiFile, BiX, BiDownload } from "react-icons/bi";
import { toast } from "react-toastify";
import xios from "@/Utils/axios";

export default function ImportEmployeeModal({
    show,
    onHide,
    onImportSuccess,
    importTemplateUrl,
}) {
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importStatus, setImportStatus] = useState("");
    const [importErrors, setImportErrors] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv",
        ];

        if (!validTypes.includes(file.type)) {
            toast.error("Please select a valid Excel or CSV file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should not exceed 5MB");
            return;
        }

        setImportFile(file);
        setImportErrors([]);
    };

    const handleImportSubmit = async () => {
        if (!importFile) {
            toast.error("Please select a file to import");
            return;
        }

        const formData = new FormData();
        formData.append("file", importFile);

        setIsImporting(true);
        setImportProgress(0);
        setImportStatus("Uploading...");
        setImportErrors([]);

        try {
            const progressInterval = setInterval(() => {
                setImportProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);

            const response = await xios.post(
                route("employee.import"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setImportProgress(percentCompleted);
                    },
                }
            );

            clearInterval(progressInterval);
            setImportProgress(100);
            setImportStatus("Processing...");

            if (response.data.success) {
                setTimeout(() => {
                    toast.success(
                        response.data.message ||
                            "Employees imported successfully!"
                    );
                    resetImport();
                    onHide();
                    onImportSuccess?.();
                }, 1000);
            } else {
                throw new Error(response.data.message || "Import failed");
            }
        } catch (error) {
            setIsImporting(false);
            setImportStatus("Import failed");

            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                setImportErrors(errors);
                toast.error(
                    "There were errors during import. Please check the error list."
                );
            } else {
                toast.error(
                    error.response?.data?.message || "Error importing file"
                );
            }
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await xios.get(
                importTemplateUrl || route("employee.import.template"),
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "employee_import_template.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Template downloaded successfully!");
        } catch (error) {
            toast.error("Failed to download template");
        }
    };

    const resetImport = () => {
        setImportFile(null);
        setImportErrors([]);
        setImportProgress(0);
        setImportStatus("");
        setIsImporting(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        if (isImporting) {
            if (
                window.confirm(
                    "Import is in progress. Are you sure you want to cancel?"
                )
            ) {
                resetImport();
                onHide();
            }
        } else {
            resetImport();
            onHide();
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            backdrop={isImporting ? "static" : true}
            keyboard={!isImporting}
        >
            <Modal.Header closeButton={!isImporting}>
                <Modal.Title className="d-flex align-items-center">
                    <BiUpload className="me-2" />
                    Import Employees from Excel
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* File Upload Section */}
                <div className="mb-4">
                    <Form.Group>
                        <Form.Label className="fw-semibold">
                            Select Excel/CSV File
                        </Form.Label>
                        <div className="border rounded p-4 text-center">
                            {importFile ? (
                                <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded">
                                    <div className="d-flex align-items-center">
                                        <BiFile className="fs-4 text-primary me-2" />
                                        <div>
                                            <div className="fw-semibold">
                                                {importFile.name}
                                            </div>
                                            <small className="text-muted">
                                                {(
                                                    importFile.size / 1024
                                                ).toFixed(2)}{" "}
                                                KB
                                            </small>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={resetImport}
                                        disabled={isImporting}
                                    >
                                        <BiX />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <BiUpload className="fs-1 text-muted mb-3" />
                                    <p className="text-muted mb-3">
                                        Drag & drop your Excel file here or
                                        click to browse
                                    </p>
                                    <Button
                                        variant="outline-primary"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={isImporting}
                                    >
                                        Browse Files
                                    </Button>
                                    <Form.Control
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept=".xlsx,.xls,.csv"
                                        className="d-none"
                                        disabled={isImporting}
                                    />
                                </>
                            )}
                        </div>
                        <Form.Text className="text-muted">
                            Supported formats: .xlsx, .xls, .csv (Max 5MB)
                        </Form.Text>
                    </Form.Group>
                </div>

                {/* Progress Bar */}
                {isImporting && (
                    <div className="mb-4">
                        <div className="d-flex justify-content-between mb-2">
                            <small className="text-muted">
                                Import Progress
                            </small>
                            <small className="text-muted">
                                {importProgress}%
                            </small>
                        </div>
                        <ProgressBar
                            now={importProgress}
                            animated={importProgress < 100}
                            variant={
                                importProgress === 100 ? "success" : "primary"
                            }
                            className="mb-2"
                        />
                        {importStatus && (
                            <small className="text-muted d-block text-center">
                                {importStatus}
                            </small>
                        )}
                    </div>
                )}

                {/* Error Display */}
                {importErrors.length > 0 && (
                    <div className="mb-4">
                        <h6 className="text-danger mb-2">Import Errors:</h6>
                        <div className="border border-danger rounded p-3 bg-danger bg-opacity-10">
                            <ul className="mb-0 ps-3">
                                {importErrors.map((error, index) => (
                                    <li
                                        key={index}
                                        className="text-danger small"
                                    >
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Template Download */}
                <div className="border-top pt-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-1">Need a template?</h6>
                            <p className="small text-muted mb-0">
                                Download our Excel template with proper column
                                formatting
                            </p>
                        </div>
                        <Button
                            variant="outline-success"
                            onClick={downloadTemplate}
                            disabled={isImporting}
                            size="sm"
                        >
                            <BiDownload className="me-1" />
                            Download Template
                        </Button>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={isImporting}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleImportSubmit}
                    disabled={!importFile || isImporting}
                >
                    {isImporting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Importing...
                        </>
                    ) : (
                        "Start Import"
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
