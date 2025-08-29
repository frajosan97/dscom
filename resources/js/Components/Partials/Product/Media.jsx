import { Card, Row, Col, Form, Alert } from "react-bootstrap";
import { useState } from "react";

export default function MediaTab({ renderImages, data, errors, onFilesDrop }) {
    const [uploadProgress, setUploadProgress] = useState({});
    const [dragOver, setDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files);

        // Filter only image files
        const imageFiles = files.filter((file) =>
            file.type.startsWith("image/")
        );

        if (imageFiles.length === 0) {
            // Handle non-image files error
            console.error("Only image files are allowed");
            return;
        }

        // Validate file size (5MB max)
        const validFiles = imageFiles.filter(
            (file) => file.size <= 5 * 1024 * 1024
        );
        const oversizedFiles = imageFiles.filter(
            (file) => file.size > 5 * 1024 * 1024
        );

        if (oversizedFiles.length > 0) {
            console.error("Some files exceed 5MB limit");
        }

        if (validFiles.length > 0) {
            // Pass files to parent component for handling
            if (onFilesDrop) {
                onFilesDrop(validFiles);
            }

            // Simulate upload progress
            simulateUploadProgress(validFiles);
        }
    };

    const simulateUploadProgress = (files) => {
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
                    // Remove progress after completion
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
    };

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0 && onFilesDrop) {
            onFilesDrop(files);
            simulateUploadProgress(files);
        }
    };

    // Calculate image statistics
    const totalImages = data?.images?.length || 0;
    const defaultImage =
        data?.images?.find((img) => img.is_default) || data?.images?.[0];
    const imageTypes = data?.images?.reduce((acc, img) => {
        const type = img.type || img.name?.split(".").pop() || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    return (
        <Card className="border-0 rounded-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                <div>
                    <h6 className="mb-0 fw-semibold text-capitalize">
                        Product Media
                    </h6>
                    <small className="text-muted">
                        Upload product images and media files
                    </small>
                </div>
                <div className="text-end">
                    <span className="badge bg-primary">
                        {totalImages} {totalImages === 1 ? "Image" : "Images"}
                    </span>
                </div>
            </Card.Header>

            <Card.Body>
                {/* Upload Guidelines */}
                <Alert variant="info" className="mb-4">
                    <Alert.Heading className="h6">
                        Upload Guidelines
                    </Alert.Heading>
                    <ul className="mb-0 ps-3">
                        <li>Supported formats: JPG, PNG, GIF, WebP</li>
                        <li>Maximum file size: 5MB per image</li>
                        <li>Recommended dimensions: 1200x1200px</li>
                        <li>First image will be used as default</li>
                    </ul>
                </Alert>

                {/* Images Grid */}
                {renderImages()}

                {/* Additional Media Options */}
                <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-semibold mb-3">Additional Media</h6>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    Video URL
                                </Form.Label>
                                <Form.Control
                                    type="url"
                                    placeholder="https://youtube.com/embed/..."
                                    className="py-2"
                                />
                                <Form.Text className="text-muted">
                                    Add product video demonstration
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    360° View
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="py-2"
                                />
                                <Form.Text className="text-muted">
                                    Upload images for 360° product view
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </Card.Body>
        </Card>
    );
}
