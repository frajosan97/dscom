import { useState } from "react";
import {
    Row,
    Col,
    Card,
    Button,
    Dropdown,
    Badge,
    Modal,
    Form,
} from "react-bootstrap";
import {
    FileEarmarkText,
    FileEarmarkPdf,
    FileEarmarkWord,
    FileEarmarkExcel,
    FileEarmarkImage,
    Eye,
    Download,
    Trash,
    Upload,
    Search,
    Filter,
} from "react-bootstrap-icons";
import { formatDate } from "@/Utils/helpers";

export default function DocumentsTab({ employee }) {
    const [documents, setDocuments] = useState([
        {
            id: 1,
            name: "Employment Contract",
            type: "contract",
            category: "Employment",
            size: "2.5 MB",
            uploadDate: "2023-06-15",
            uploadedBy: "HR Department",
            fileType: "pdf",
        },
        {
            id: 2,
            name: "ID Verification",
            type: "id",
            category: "Identity",
            size: "1.2 MB",
            uploadDate: "2023-06-15",
            uploadedBy: "HR Department",
            fileType: "pdf",
        },
        {
            id: 3,
            name: "Tax Forms",
            type: "tax",
            category: "Financial",
            size: "850 KB",
            uploadDate: "2024-01-10",
            uploadedBy: "Finance",
            fileType: "pdf",
        },
        {
            id: 4,
            name: "Performance Review Q4 2023",
            type: "review",
            category: "Performance",
            size: "450 KB",
            uploadDate: "2023-12-20",
            uploadedBy: "Manager",
            fileType: "word",
        },
        {
            id: 5,
            name: "Professional Certification",
            type: "certificate",
            category: "Qualifications",
            size: "3.1 MB",
            uploadDate: "2023-08-05",
            uploadedBy: "Employee",
            fileType: "pdf",
        },
        {
            id: 6,
            name: "Training Records",
            type: "training",
            category: "Development",
            size: "620 KB",
            uploadDate: "2024-01-25",
            uploadedBy: "Training Dept",
            fileType: "excel",
        },
        {
            id: 7,
            name: "December 2023 Payslip",
            type: "payslip",
            category: "Financial",
            size: "320 KB",
            uploadDate: "2024-01-01",
            uploadedBy: "Payroll",
            fileType: "pdf",
        },
        {
            id: 8,
            name: "Bank Account Details",
            type: "bank",
            category: "Financial",
            size: "280 KB",
            uploadDate: "2023-06-15",
            uploadedBy: "HR Department",
            fileType: "pdf",
        },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newDocument, setNewDocument] = useState({
        name: "",
        category: "Employment",
        file: null,
    });

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "Employment", label: "Employment" },
        { value: "Identity", label: "Identity" },
        { value: "Financial", label: "Financial" },
        { value: "Performance", label: "Performance" },
        { value: "Qualifications", label: "Qualifications" },
        { value: "Development", label: "Development" },
    ];

    const fileTypeIcons = {
        pdf: <FileEarmarkPdf className="text-danger" size={20} />,
        word: <FileEarmarkWord className="text-primary" size={20} />,
        excel: <FileEarmarkExcel className="text-success" size={20} />,
        image: <FileEarmarkImage className="text-warning" size={20} />,
        default: <FileEarmarkText className="text-secondary" size={20} />,
    };

    const getFileIcon = (fileType) => {
        return fileTypeIcons[fileType] || fileTypeIcons.default;
    };

    const getCategoryColor = (category) => {
        const colors = {
            Employment: "primary",
            Identity: "info",
            Financial: "success",
            Performance: "warning",
            Qualifications: "danger",
            Development: "secondary",
        };
        return colors[category] || "light";
    };

    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch =
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "all" || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            setDocuments(documents.filter((doc) => doc.id !== id));
        }
    };

    const handleUpload = () => {
        if (newDocument.name && newDocument.file) {
            const newDoc = {
                id: documents.length + 1,
                name: newDocument.name,
                type: newDocument.category.toLowerCase(),
                category: newDocument.category,
                size: "1 MB",
                uploadDate: new Date().toISOString().split("T")[0],
                uploadedBy: "Admin",
                fileType: "pdf",
            };
            setDocuments([...documents, newDoc]);
            setNewDocument({ name: "", category: "Employment", file: null });
            setShowUploadModal(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewDocument({
                ...newDocument,
                file: file,
                name: newDocument.name || file.name,
            });
        }
    };

    return (
        <div>
            {/* Header with Actions */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h6 className="fw-semibold mb-0">Employee Documents</h6>
                    <small className="text-muted">
                        {filteredDocuments.length} documents found
                    </small>
                </div>
                <div className="d-flex gap-2">
                    <div className="d-flex gap-2">
                        <div
                            className="position-relative"
                            style={{ width: "250px" }}
                        >
                            <Search
                                className="position-absolute top-50 start-3 translate-middle-y text-muted"
                                size={16}
                            />
                            <input
                                type="text"
                                className="form-control ps-5"
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Dropdown>
                            <Dropdown.Toggle
                                variant="outline-secondary"
                                id="category-filter"
                            >
                                <Filter className="me-2" size={14} />
                                {categories.find(
                                    (c) => c.value === selectedCategory
                                )?.label || "Filter"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {categories.map((category) => (
                                    <Dropdown.Item
                                        key={category.value}
                                        active={
                                            selectedCategory === category.value
                                        }
                                        onClick={() =>
                                            setSelectedCategory(category.value)
                                        }
                                    >
                                        {category.label}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Button
                            variant="success"
                            onClick={() => setShowUploadModal(true)}
                        >
                            <Upload className="me-2" /> Upload
                        </Button>
                    </div>
                </div>
            </div>

            {/* Document Stats */}
            <Row className="g-3 mb-4">
                {categories.slice(1).map((category) => {
                    const count = documents.filter(
                        (doc) => doc.category === category.label
                    ).length;
                    return (
                        <Col key={category.value} xs={6} md={4}>
                            <Card className="border-0 bg-light">
                                <Card.Body className="p-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="fw-bold mb-0">
                                                {count}
                                            </h6>
                                            <small className="text-muted">
                                                {category.label}
                                            </small>
                                        </div>
                                        <Badge
                                            bg={getCategoryColor(
                                                category.label
                                            )}
                                        >
                                            {category.label.charAt(0)}
                                        </Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Documents Grid */}
            {filteredDocuments.length > 0 ? (
                <Row className="g-3">
                    {filteredDocuments.map((doc) => (
                        <Col md={6} lg={4} key={doc.id}>
                            <Card className="h-100 border">
                                <Card.Body className="p-3">
                                    <div className="d-flex align-items-start mb-2">
                                        <div className="bg-light rounded p-2 me-3">
                                            {getFileIcon(doc.fileType)}
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6
                                                className="mb-1 text-truncate"
                                                title={doc.name}
                                            >
                                                {doc.name}
                                            </h6>
                                            <Badge
                                                bg={getCategoryColor(
                                                    doc.category
                                                )}
                                                className="mb-2"
                                            >
                                                {doc.category}
                                            </Badge>
                                            <div className="small text-muted">
                                                <div>Size: {doc.size}</div>
                                                <div>
                                                    Uploaded:{" "}
                                                    {formatDate(
                                                        doc.uploadDate,
                                                        "MMM DD, YYYY"
                                                    )}
                                                </div>
                                                <div>By: {doc.uploadedBy}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2 mt-3">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="flex-grow-1"
                                        >
                                            <Eye className="me-1" size={14} />{" "}
                                            View
                                        </Button>
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            className="flex-grow-1"
                                        >
                                            <Download
                                                className="me-1"
                                                size={14}
                                            />{" "}
                                            Download
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(doc.id)}
                                        >
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="text-center py-5 bg-light rounded">
                    <FileEarmarkText size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No documents found</h5>
                    <p className="text-muted mb-3">
                        Try adjusting your search or upload new documents
                    </p>
                    <Button
                        variant="success"
                        onClick={() => setShowUploadModal(true)}
                    >
                        <Upload className="me-2" /> Upload First Document
                    </Button>
                </div>
            )}

            {/* Upload Modal */}
            <Modal
                show={showUploadModal}
                onHide={() => setShowUploadModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Upload Document</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Document Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newDocument.name}
                                onChange={(e) =>
                                    setNewDocument({
                                        ...newDocument,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Enter document name"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                value={newDocument.category}
                                onChange={(e) =>
                                    setNewDocument({
                                        ...newDocument,
                                        category: e.target.value,
                                    })
                                }
                            >
                                {categories.slice(1).map((category) => (
                                    <option
                                        key={category.value}
                                        value={category.label}
                                    >
                                        {category.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Select File</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleFileSelect}
                            />
                            {newDocument.file && (
                                <small className="text-muted mt-2 d-block">
                                    Selected: {newDocument.file.name}
                                </small>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowUploadModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpload}>
                        Upload Document
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
