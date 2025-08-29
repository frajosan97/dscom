import { useDropzone } from "react-dropzone";
import { FiUpload, FiX, FiFile, FiImage, FiVideo } from "react-icons/fi";
import {
    Button,
    Card,
    Col,
    Row,
    Form,
    Alert,
    Image,
    ProgressBar,
    Badge,
} from "react-bootstrap";
import { useState } from "react";

export default function FileUpload({
    name,
    label = "",
    accept = "image/*",
    maxFiles = 6,
    maxSize = 5 * 1024 * 1024, // 5MB
    disabled = false,
    value = [],
    onChange,
    error,
    showPreview = true,
}) {
    const [uploadProgress, setUploadProgress] = useState({});

    const { getRootProps, getInputProps, isDragActive, isDragReject } =
        useDropzone({
            accept,
            maxFiles,
            maxSize,
            disabled,
            onDrop: (acceptedFiles) => {
                const updatedFiles = [...value, ...acceptedFiles].slice(
                    0,
                    maxFiles
                );
                onChange(updatedFiles, null);

                acceptedFiles.forEach((file) => {
                    simulateUploadProgress(file.name);
                });
            },
            onDropRejected: (fileRejections) => {
                const error =
                    fileRejections[0]?.errors[0]?.message ||
                    "Invalid file format or size";
                onChange(value, error);
            },
        });

    const simulateUploadProgress = (fileName) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setUploadProgress((prev) => {
                        const newProgress = { ...prev };
                        delete newProgress[fileName];
                        return newProgress;
                    });
                }, 1000);
            }
        }, 200);
    };

    const removeFile = (index) => {
        const updatedFiles = [...value];
        updatedFiles.splice(index, 1);
        onChange(updatedFiles, null);
    };

    const getFileIcon = (file) => {
        if (file.type?.startsWith("image/"))
            return <FiImage className="h-5 w-5" />;
        if (file.type?.startsWith("video/"))
            return <FiVideo className="h-5 w-5" />;
        return <FiFile className="h-5 w-5" />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getAcceptText = () => {
        if (accept === "image/*") return "JPG, PNG, GIF, WebP";
        if (accept === "video/*") return "MP4, MOV, AVI";
        if (accept === "application/pdf") return "PDF documents";
        return accept;
    };

    return (
        <Form.Group>
            {label && (
                <Form.Label className="fw-semibold">
                    {label}
                    {!disabled && <span className="text-danger ms-1">*</span>}
                </Form.Label>
            )}

            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={`
                    border rounded py-5 text-center
                    ${
                        isDragActive
                            ? "border-primary bg-primary bg-opacity-10"
                            : ""
                    }
                    ${
                        isDragReject
                            ? "border-danger bg-danger bg-opacity-10"
                            : ""
                    }
                    transition-all duration-200
                `}
                style={{ cursor: "pointer", minHeight: "120px" }}
            >
                <input {...getInputProps()} name={name} />
                <div className="d-flex flex-column align-items-center justify-content-center gap-2">
                    <div className="mb-2">
                        <i className="bi bi-cloud-upload fs-1 text-muted"></i>
                    </div>
                    <h6 className="fw-semibold">Drag & Drop Images Here</h6>
                    <p className="text-muted mb-2">or click to browse files</p>
                    <small className="text-muted">
                        {getAcceptText()} (Max {maxFiles} files,{" "}
                        {maxSize / 1024 / 1024}MB each)
                    </small>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <Alert
                    variant="danger"
                    className="d-flex align-items-center mt-2 p-2 small"
                >
                    <FiX className="flex-shrink-0 me-2" />
                    {error}
                </Alert>
            )}

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="mt-3">
                    <h6 className="text-muted small fw-semibold mb-2">
                        Uploading...
                    </h6>
                    {Object.entries(uploadProgress).map(
                        ([fileName, progress]) => (
                            <div key={fileName} className="mb-2">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span
                                        className="small text-truncate"
                                        style={{ maxWidth: "200px" }}
                                    >
                                        {fileName}
                                    </span>
                                    <span className="small">{progress}%</span>
                                </div>
                                <ProgressBar
                                    now={progress}
                                    variant={
                                        progress === 100 ? "success" : "primary"
                                    }
                                    style={{ height: "4px" }}
                                />
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Preview Area */}
            {showPreview && value?.length > 0 && (
                <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-semibold mb-0">
                            Selected Files
                            <Badge bg="secondary" className="ms-2">
                                {value.length}/{maxFiles}
                            </Badge>
                        </h6>
                        <small className="text-muted">
                            Total:{" "}
                            {formatFileSize(
                                value.reduce(
                                    (total, file) => total + (file.size || 0),
                                    0
                                )
                            )}
                        </small>
                    </div>

                    <Row className="g-3">
                        {value.map((file, index) => (
                            <Col
                                md={4}
                                sm={6}
                                key={file.name || file.id || index}
                            >
                                <Card className="h-100 shadow-sm">
                                    {file.type?.startsWith("image/") ? (
                                        <Image
                                            src={
                                                file instanceof File
                                                    ? URL.createObjectURL(file)
                                                    : file.url
                                            }
                                            alt={file.name}
                                            className="card-img-top"
                                            style={{
                                                height: "150px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="text-center p-4 bg-light"
                                            style={{ height: "150px" }}
                                        >
                                            {getFileIcon(file)}
                                            <p className="small text-truncate mt-2 mb-0 px-2">
                                                {file.name}
                                            </p>
                                            <small className="text-muted">
                                                {formatFileSize(file.size)}
                                            </small>
                                        </div>
                                    )}

                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="flex-grow-1 me-2">
                                                <p className="mb-0 small text-truncate fw-medium">
                                                    {file.name}
                                                </p>
                                                <small className="text-muted">
                                                    {formatFileSize(file.size)}
                                                </small>
                                            </div>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="flex-shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile(index);
                                                }}
                                                disabled={disabled}
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                }}
                                            >
                                                <FiX className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {uploadProgress[file.name] && (
                                            <ProgressBar
                                                now={uploadProgress[file.name]}
                                                variant="primary"
                                                className="mt-2"
                                                style={{ height: "3px" }}
                                            />
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </Form.Group>
    );
}
