import React, { useState, useRef } from "react";
import { Button, Modal, Form, ProgressBar } from "react-bootstrap";
import { BiUpload, BiFile, BiX, BiDownload } from "react-icons/bi";
import { toast } from "react-toastify";
import xios from "@/Utils/axios";

export default function ImportProductModal({
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
            "application/vnd.oasis.opendocument.spreadsheet",
        ];

        // Check file extension for compatibility
        const validExtensions = [".xlsx", ".xls", ".csv", ".ods"];
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();

        if (
            !validTypes.includes(file.type) &&
            !validExtensions.includes(fileExtension)
        ) {
            toast.error(
                "Please select a valid Excel or CSV file (.xlsx, .xls, .csv)"
            );
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            // 10MB limit for products
            toast.error("File size should not exceed 10MB");
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
        formData.append("_method", "POST");

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
                route("product.import"),
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
            setImportStatus("Processing products...");

            // Simulate processing time
            setTimeout(() => {
                if (response.data.success) {
                    setImportStatus("Import completed successfully!");

                    setTimeout(() => {
                        toast.success(
                            response.data.message ||
                                `${
                                    response.data.count || 0
                                } products imported successfully!`
                        );
                        resetImport();
                        onHide();
                        onImportSuccess?.();
                    }, 500);
                } else {
                    throw new Error(response.data.message || "Import failed");
                }
            }, 1000);
        } catch (error) {
            setIsImporting(false);
            setImportStatus("Import failed");

            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                setImportErrors(errors);
                toast.error(
                    "There were errors during import. Please check the error list."
                );
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
                setImportErrors([error.response.data.message]);
            } else {
                toast.error("Error importing products. Please try again.");
                setImportErrors([
                    "An unexpected error occurred during import.",
                ]);
            }
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await xios.get(
                importTemplateUrl || route("product.import.template"),
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "product_import_template.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Product template downloaded successfully!");
        } catch (error) {
            toast.error("Failed to download template. Please try again.");
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

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isImporting) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];

            // Create a fake event to reuse handleFileSelect
            const fakeEvent = {
                target: {
                    files: [file],
                },
            };
            handleFileSelect(fakeEvent);
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
                    Import Products from Excel/CSV
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* File Upload Section */}
                <div className="mb-4">
                    <Form.Group>
                        <Form.Label className="fw-semibold">
                            Select Excel/CSV File
                        </Form.Label>
                        <div
                            className="border rounded p-4 text-center"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            style={{
                                borderStyle: "dashed",
                                cursor: isImporting ? "not-allowed" : "pointer",
                                backgroundColor: isImporting
                                    ? "#f8f9fa"
                                    : "white",
                            }}
                            onClick={() =>
                                !isImporting && fileInputRef.current?.click()
                            }
                        >
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
                                                KB •{" "}
                                                {importFile.name
                                                    .split(".")
                                                    .pop()
                                                    .toUpperCase()}
                                            </small>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            resetImport();
                                        }}
                                        disabled={isImporting}
                                    >
                                        <BiX />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <BiUpload className="fs-1 text-muted mb-3" />
                                    <p className="text-muted mb-3">
                                        Drag & drop your Excel/CSV file here or
                                        click to browse
                                    </p>
                                    <Button
                                        variant="outline-primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                        disabled={isImporting}
                                    >
                                        Browse Files
                                    </Button>
                                    <Form.Control
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept=".xlsx,.xls,.csv,.ods"
                                        className="d-none"
                                        disabled={isImporting}
                                    />
                                </>
                            )}
                        </div>
                        <Form.Text className="text-muted">
                            Supported formats: .xlsx, .xls, .csv, .ods (Max
                            10MB)
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
                            <small
                                className={`d-block text-center ${
                                    importStatus.includes("failed")
                                        ? "text-danger"
                                        : importStatus.includes("success")
                                        ? "text-success"
                                        : "text-muted"
                                }`}
                            >
                                {importStatus}
                            </small>
                        )}
                    </div>
                )}

                {/* Error Display */}
                {importErrors.length > 0 && (
                    <div className="mb-4">
                        <h6 className="text-danger mb-2">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Import Errors ({importErrors.length}):
                        </h6>
                        <div className="border border-danger rounded p-3 bg-danger bg-opacity-10">
                            <ul
                                className="mb-0 ps-3"
                                style={{
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                }}
                            >
                                {importErrors.map((error, index) => (
                                    <li
                                        key={index}
                                        className="text-danger small mb-1"
                                    >
                                        {index + 1}. {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Template Download & Instructions */}
                <div className="border-top pt-3">
                    <div className="row">
                        <div className="col-md-8">
                            <h6 className="mb-2">Need a template?</h6>
                            <p className="small text-muted mb-2">
                                Download our pre-formatted Excel template with
                                all required columns:
                            </p>
                        </div>
                        <div className="col-md-4 d-flex align-items-center justify-content-end">
                            <Button
                                variant="outline-success"
                                onClick={downloadTemplate}
                                disabled={isImporting}
                                size="sm"
                                className="d-flex align-items-center"
                            >
                                <BiDownload className="me-1" />
                                Download Template
                            </Button>
                        </div>
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
                    className="d-flex align-items-center"
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
