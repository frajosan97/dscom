import { useState, useCallback, useEffect, useMemo } from "react";
import {
    Card,
    Col,
    Form,
    Row,
    Badge,
    Alert,
    Button,
    Modal,
    ProgressBar,
    ButtonGroup,
} from "react-bootstrap";

import {
    Plus,
    Trash,
    Star,
    StarFill,
    Image,
    ArrowsMove,
    Eye,
    InfoCircle,
    Upload,
    CheckCircle,
} from "react-bootstrap-icons";

const SUPPORTED_FORMATS = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 10;

export default function MediaTab({
    data,
    updateFormData,
    handleImagesUpdate,
    errors,
}) {
    const [images, setImages] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [dragOver, setDragOver] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [sorting, setSorting] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Initialize with existing images only once
    useEffect(() => {
        if (!initialized && data?.images) {
            const processed = data.images.map((img) => ({
                ...img,
                isExisting: true,
                isNew: false,
            }));
            setImages(processed);
            setInitialized(true);
        }
    }, [data?.images, initialized]);

    // Update parent when images change
    useEffect(() => {
        if (initialized) {
            handleImagesUpdate(images);
        }
    }, [images, initialized]);

    const isNewImage = useCallback(
        (image) => image.file instanceof File || image.isNew,
        []
    );

    const isExistingImage = useCallback(
        (image) => image.id && !image.file && !image.isNew,
        []
    );

    const validateFile = useCallback(
        (file) => {
            const errors = [];

            if (!SUPPORTED_FORMATS.includes(file.type)) {
                errors.push(`Unsupported format: ${file.type}`);
            }

            if (file.size > MAX_FILE_SIZE) {
                errors.push(
                    `File exceeds 5MB limit (${(file.size / 1048576).toFixed(
                        1
                    )}MB)`
                );
            }

            if (images.length >= MAX_IMAGES) {
                errors.push(`Maximum ${MAX_IMAGES} images allowed.`);
            }

            return errors;
        },
        [images.length]
    );

    // Handle drag and drop
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, []);

    // Handle file input
    const handleFileInput = useCallback((e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
        e.target.value = ""; // Reset input
    }, []);

    // Process uploaded files
    const handleFiles = useCallback(
        (files) => {
            const validFiles = [];
            const errors = [];

            files.forEach((file) => {
                const fileErrors = validateFile(file);
                if (fileErrors.length === 0) {
                    validFiles.push(file);
                } else {
                    errors.push(...fileErrors);
                }
            });

            if (errors.length > 0) {
                alert(`Some files were rejected:\n${errors.join("\n")}`);
            }

            if (validFiles.length > 0) {
                // Check if we need a default image
                const hasDefault = images.some((img) => img.is_default);

                const newImages = validFiles.map((file, index) => {
                    const timestamp = Date.now();
                    const tempId = `temp-${timestamp}-${index}`;

                    return {
                        id: tempId,
                        file: file,
                        image_path: URL.createObjectURL(file),
                        alt_text: "",
                        title: "",
                        is_default: !hasDefault && index === 0,
                        order: images.length + index,
                        isNew: true,
                        isExisting: false,
                        tempId: tempId,
                    };
                });

                setImages((prev) => {
                    const updated = [...prev, ...newImages];
                    // Ensure only one default image
                    const defaultImages = updated.filter(
                        (img) => img.is_default
                    );
                    if (defaultImages.length > 1) {
                        return updated.map((img, idx) => ({
                            ...img,
                            is_default: idx === 0,
                        }));
                    }
                    return updated;
                });

                simulateUploadProgress(validFiles);
            }
        },
        [images, validateFile]
    );

    // Simulate upload progress
    const simulateUploadProgress = useCallback((files) => {
        files.forEach((file) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 20;
                setUploadProgress((prev) => ({
                    ...prev,
                    [file.name]: progress,
                }));

                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setUploadProgress((prev) => {
                            const newProgress = { ...prev };
                            delete newProgress[file.name];
                            return newProgress;
                        });
                    }, 1000);
                }
            }, 200);
        });
    }, []);

    // Image management functions
    const setDefaultImage = useCallback((imageId) => {
        setImages((prev) =>
            prev.map((img) => ({
                ...img,
                is_default: img.id === imageId,
            }))
        );
    }, []);

    const deleteImage = useCallback((imageId) => {
        setImages((prev) => {
            const newImages = prev.filter((img) => img.id !== imageId);
            // Clean up object URL for new images
            const deletedImage = prev.find((img) => img.id === imageId);
            if (
                deletedImage &&
                deletedImage.isNew &&
                deletedImage.image_path?.startsWith("blob:")
            ) {
                URL.revokeObjectURL(deletedImage.image_path);
            }

            // If we deleted the default image and there are other images, set a new default
            if (
                newImages.length > 0 &&
                !newImages.some((img) => img.is_default)
            ) {
                return newImages.map((img, index) => ({
                    ...img,
                    is_default: index === 0,
                }));
            }
            return newImages;
        });
    }, []);

    const updateImageMetadata = useCallback((imageId, updates) => {
        setImages((prev) =>
            prev.map((img) =>
                img.id === imageId ? { ...img, ...updates } : img
            )
        );
    }, []);

    const reorderImages = useCallback((fromIndex, toIndex) => {
        setImages((prev) => {
            const newImages = [...prev];
            const [movedImage] = newImages.splice(fromIndex, 1);
            newImages.splice(toIndex, 0, movedImage);

            // Update order property
            return newImages.map((img, index) => ({
                ...img,
                order: index,
            }));
        });
    }, []);

    // Calculate image statistics
    const imageStats = useMemo(() => {
        const stats = {
            total: images.length,
            new: images.filter((img) => isNewImage(img)).length,
            existing: images.filter((img) => isExistingImage(img)).length,
            default: images.find((img) => img.is_default),
            formats: {},
            totalSize: 0,
        };

        images.forEach((img) => {
            let format = "unknown";
            if (img.file?.type) {
                format = img.file.type.split("/")[1] || img.file.type;
            } else if (img.image_path) {
                const path = img.image_path.split("?")[0];
                const ext = path.split(".").pop().toLowerCase();
                format = ext;
            }

            stats.formats[format] = (stats.formats[format] || 0) + 1;

            if (img.file) {
                stats.totalSize += img.file.size;
            }
        });

        stats.remainingSlots = MAX_IMAGES - stats.total;
        stats.usedPercentage = (stats.total / MAX_IMAGES) * 100;

        return stats;
    }, [images, isNewImage, isExistingImage]);

    // Sortable image grid component
    const ImageGrid = useMemo(() => {
        const handleDragStart = (e, index) => {
            e.dataTransfer.setData("text/plain", index);
        };

        const handleDragOver = (e, index) => {
            e.preventDefault();
        };

        const handleDrop = (e, toIndex) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
            if (fromIndex !== toIndex) {
                reorderImages(fromIndex, toIndex);
            }
        };

        return (
            <Row className="g-3">
                {images.map((image, index) => (
                    <Col key={image.id} xs={6} md={4} lg={3} xl={2}>
                        <Card
                            className={`h-100 image-card ${
                                image.is_default ? "border-primary" : ""
                            } ${sorting ? "cursor-grab" : ""}`}
                            draggable={sorting}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            {/* Image */}
                            <div className="position-relative">
                                <Card.Img
                                    variant="top"
                                    src={
                                        image.image_path?.startsWith("blob:") ||
                                        image.image_path?.startsWith("http")
                                            ? image.image_path
                                            : `/storage/${image.image_path}`
                                    }
                                    style={{
                                        height: "150px",
                                        objectFit: "cover",
                                        cursor: "pointer",
                                    }}
                                    alt={
                                        image.alt_text ||
                                        `Product image ${index + 1}`
                                    }
                                    onClick={() => setPreviewImage(image)}
                                    className={
                                        uploadProgress[image.file?.name]
                                            ? "opacity-50"
                                            : ""
                                    }
                                />

                                {/* Upload Progress */}
                                {uploadProgress[image.file?.name] && (
                                    <div className="position-absolute top-50 start-50 translate-middle">
                                        <div className="bg-dark bg-opacity-75 rounded p-2">
                                            <ProgressBar
                                                now={
                                                    uploadProgress[
                                                        image.file?.name
                                                    ]
                                                }
                                                variant="success"
                                                style={{
                                                    width: "80px",
                                                    height: "6px",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Image Badges */}
                                <div className="position-absolute top-0 start-0 p-2">
                                    {image.is_default && (
                                        <Badge bg="primary" className="me-1">
                                            <StarFill size={10} />
                                        </Badge>
                                    )}
                                    {isNewImage(image) && (
                                        <Badge bg="success">New</Badge>
                                    )}
                                    {isExistingImage(image) && (
                                        <Badge bg="secondary">Existing</Badge>
                                    )}
                                </div>

                                {/* Image Actions */}
                                <div className="position-absolute top-0 end-0 p-2">
                                    <ButtonGroup size="sm">
                                        <Button
                                            variant="outline-light"
                                            title="Set as default"
                                            onClick={() =>
                                                setDefaultImage(image.id)
                                            }
                                            disabled={image.is_default}
                                        >
                                            {image.is_default ? (
                                                <StarFill />
                                            ) : (
                                                <Star />
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-light"
                                            title="Preview"
                                            onClick={() =>
                                                setPreviewImage(image)
                                            }
                                        >
                                            <Eye />
                                        </Button>
                                        <Button
                                            variant="outline-light"
                                            title="Delete"
                                            onClick={() =>
                                                deleteImage(image.id)
                                            }
                                        >
                                            <Trash />
                                        </Button>
                                    </ButtonGroup>
                                </div>

                                {/* Image Order (when sorting) */}
                                {sorting && (
                                    <div className="position-absolute bottom-0 start-0 p-2">
                                        <Badge bg="dark" className="fs-6">
                                            {index + 1}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Image Metadata */}
                            <Card.Body className="p-2">
                                <Form.Group className="mb-2">
                                    <Form.Control
                                        size="sm"
                                        type="text"
                                        placeholder="Alt text"
                                        value={image.alt_text || ""}
                                        onChange={(e) =>
                                            updateImageMetadata(image.id, {
                                                alt_text: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Control
                                        size="sm"
                                        type="text"
                                        placeholder="Title"
                                        value={image.title || ""}
                                        onChange={(e) =>
                                            updateImageMetadata(image.id, {
                                                title: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }, [
        images,
        uploadProgress,
        sorting,
        setDefaultImage,
        deleteImage,
        updateImageMetadata,
        reorderImages,
        isNewImage,
        isExistingImage,
    ]);

    return (
        <div className="media-tab">
            {/* Header with Stats */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">
                        <Image className="me-2" />
                        Product Media Gallery
                    </h4>
                    <p className="text-muted mb-0">
                        Upload and manage product images for optimal display
                    </p>
                </div>
                <div className="text-end">
                    <Badge bg="light" text="dark" className="fs-6">
                        {imageStats.total} / {MAX_IMAGES} Images
                    </Badge>
                    <div className="mt-1">
                        <small className="text-muted">
                            <Badge bg="success" className="me-1">
                                {imageStats.new} New
                            </Badge>
                            <Badge bg="secondary">
                                {imageStats.existing} Existing
                            </Badge>
                        </small>
                    </div>
                </div>
            </div>

            {/* Statistics & Progress */}
            <Row className="g-3 mb-4">
                <Col md={2}>
                    <Card className="border-0 bg-light">
                        <Card.Body className="text-center py-3">
                            <div className="h5 mb-1 text-dark">
                                {imageStats.total}
                            </div>
                            <small className="text-muted">Total Images</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="border-0 bg-success bg-opacity-10">
                        <Card.Body className="text-center py-3">
                            <div className="h5 mb-1 text-success">
                                {imageStats.new}
                            </div>
                            <small className="text-muted">New Images</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="border-0 bg-primary bg-opacity-10">
                        <Card.Body className="text-center py-3">
                            <div className="h5 mb-1 text-primary">
                                {imageStats.default ? "Set" : "None"}
                            </div>
                            <small className="text-muted">Default Image</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-warning bg-opacity-10">
                        <Card.Body className="text-center py-3">
                            <div className="h5 mb-1 text-warning">
                                {imageStats.remainingSlots}
                            </div>
                            <small className="text-muted">
                                Remaining Slots
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-info bg-opacity-10">
                        <Card.Body className="text-center py-3">
                            <div className="h5 mb-1 text-info">
                                {(imageStats.totalSize / 1024 / 1024).toFixed(
                                    1
                                )}
                                MB
                            </div>
                            <small className="text-muted">Total Size</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Upload Area */}
            <Card
                className={`border-0 shadow-sm mb-4 ${
                    dragOver ? "border-primary" : ""
                }`}
            >
                <Card.Header className="bg-light py-3">
                    <h6 className="mb-0 fw-semibold">
                        <Upload className="me-2" />
                        Upload Images
                    </h6>
                </Card.Header>
                <Card.Body
                    className="p-5 text-center"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        border: dragOver
                            ? "2px dashed #0d6efd"
                            : "2px dashed #dee2e6",
                        backgroundColor: dragOver ? "#f8f9ff" : "#f8f9fa",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                    onClick={() =>
                        document.getElementById("file-input").click()
                    }
                >
                    <Image size={48} className="text-muted mb-3" />
                    <h5 className="text-muted mb-2">
                        {dragOver
                            ? "Drop images here"
                            : "Drag & drop images here"}
                    </h5>
                    <p className="text-muted mb-3">or click to browse files</p>
                    <small className="text-muted d-block">
                        Supports: JPEG, PNG, WebP, GIF • Max 5MB per image • Up
                        to {MAX_IMAGES} images
                    </small>

                    <input
                        id="file-input"
                        type="file"
                        multiple
                        accept={SUPPORTED_FORMATS.join(",")}
                        onChange={handleFileInput}
                        style={{ display: "none" }}
                    />

                    <div className="mt-3">
                        <Button variant="primary">
                            <Plus className="me-2" />
                            Select Images
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Image Management */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-semibold">
                            Image Gallery ({images.length})
                        </h6>
                        <div className="d-flex gap-2">
                            <Button
                                variant={
                                    sorting ? "warning" : "outline-secondary"
                                }
                                size="sm"
                                onClick={() => setSorting(!sorting)}
                            >
                                <ArrowsMove className="me-1" />
                                {sorting ? "Done Sorting" : "Reorder Images"}
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-4">
                    {images.length === 0 ? (
                        <div className="text-center py-5">
                            <Image size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">No Images Yet</h5>
                            <p className="text-muted mb-3">
                                Upload product images to showcase your product
                                from different angles.
                            </p>
                            <Button
                                variant="primary"
                                onClick={() =>
                                    document
                                        .getElementById("file-input")
                                        .click()
                                }
                            >
                                <Upload className="me-2" />
                                Upload First Image
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Gallery Controls */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <small className="text-muted">
                                    Drag to reorder images. The first image is
                                    used as the primary product image.
                                </small>
                                <div className="d-flex align-items-center gap-2">
                                    <Badge bg="primary">
                                        Default:{" "}
                                        {images.findIndex(
                                            (img) => img.is_default
                                        ) + 1}
                                    </Badge>
                                </div>
                            </div>

                            {/* Image Grid */}
                            {ImageGrid}

                            {/* Format Summary */}
                            <Card className="border-0 bg-light mt-4">
                                <Card.Body className="py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            Format distribution:{" "}
                                            {Object.entries(
                                                imageStats.formats
                                            ).map(([format, count]) => (
                                                <Badge
                                                    key={format}
                                                    bg="outline-secondary"
                                                    text="dark"
                                                    className="ms-1"
                                                >
                                                    {format}: {count}
                                                </Badge>
                                            ))}
                                        </small>
                                        <ProgressBar
                                            now={imageStats.usedPercentage}
                                            variant={
                                                imageStats.usedPercentage > 80
                                                    ? "warning"
                                                    : "success"
                                            }
                                            style={{
                                                width: "100px",
                                                height: "6px",
                                            }}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Best Practices Alert */}
            <Alert variant="info" className="mt-4">
                <Alert.Heading className="h6">
                    <InfoCircle className="me-2" />
                    Image Best Practices
                </Alert.Heading>
                <ul className="mb-0">
                    <li>Use high-quality, well-lit product photos</li>
                    <li>Include multiple angles and close-ups</li>
                    <li>Set the most attractive image as default</li>
                    <li>Add descriptive alt text for accessibility</li>
                    <li>Recommended size: 1200x1200 pixels</li>
                </ul>
            </Alert>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                image={previewImage}
                show={!!previewImage}
                onHide={() => setPreviewImage(null)}
                onSetDefault={() =>
                    previewImage && setDefaultImage(previewImage.id)
                }
                onDelete={() => {
                    if (previewImage) {
                        deleteImage(previewImage.id);
                        setPreviewImage(null);
                    }
                }}
                isNewImage={isNewImage}
                isExistingImage={isExistingImage}
            />
        </div>
    );
}

// Image Preview Modal Component
function ImagePreviewModal({
    image,
    show,
    onHide,
    onSetDefault,
    onDelete,
    isNewImage,
    isExistingImage,
}) {
    if (!image) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Image Preview</Modal.Title>
                <div className="ms-3">
                    {image.is_default && (
                        <Badge bg="primary" className="me-1">
                            Default
                        </Badge>
                    )}
                    {isNewImage(image) && <Badge bg="success">New</Badge>}
                    {isExistingImage(image) && (
                        <Badge bg="secondary">Existing</Badge>
                    )}
                </div>
            </Modal.Header>
            <Modal.Body className="text-center">
                <img
                    src={
                        image.image_path?.startsWith("blob:") ||
                        image.image_path?.startsWith("http")
                            ? image.image_path
                            : `/storage/${image.image_path}`
                    }
                    alt={image.alt_text || "Product image"}
                    style={{
                        maxWidth: "100%",
                        maxHeight: "70vh",
                        objectFit: "contain",
                    }}
                    className="rounded"
                />

                {(image.alt_text || image.title) && (
                    <div className="mt-3 text-start">
                        {image.alt_text && (
                            <p>
                                <strong>Alt Text:</strong> {image.alt_text}
                            </p>
                        )}
                        {image.title && (
                            <p>
                                <strong>Title:</strong> {image.title}
                            </p>
                        )}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex justify-content-between w-100">
                    <div>
                        <Button
                            variant={
                                image.is_default ? "success" : "outline-primary"
                            }
                            onClick={onSetDefault}
                            disabled={image.is_default}
                        >
                            {image.is_default ? (
                                <CheckCircle className="me-2" />
                            ) : (
                                <Star className="me-2" />
                            )}
                            {image.is_default
                                ? "Default Image"
                                : "Set as Default"}
                        </Button>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-danger" onClick={onDelete}>
                            <Trash className="me-2" />
                            Delete
                        </Button>
                        <Button variant="primary" onClick={onHide}>
                            Close
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
