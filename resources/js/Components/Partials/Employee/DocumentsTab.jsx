import { Card, Col, Form, Row, Image } from "react-bootstrap";
import { BiIdCard, BiFile } from "react-icons/bi";

const DocumentsTab = ({
    formik,
    idCardPreview,
    documentPreview,
    handleFileChange,
    setIdCardPreview,
    setDocumentPreview,
}) => {
    return (
        <Row className="g-4">
            <Col md={12}>
                <Card className="border-0 bg-light">
                    <Card.Body className="p-4">
                        <h6 className="fw-bold mb-3">Employee Documents</h6>
                        <Row className="g-4">
                            <Col md={4}>
                                <Card className="border-0 bg-white shadow-sm h-100">
                                    <Card.Body className="text-center p-4">
                                        <div className="mb-3">
                                            {idCardPreview ? (
                                                <div className="position-relative">
                                                    <Image
                                                        src={idCardPreview}
                                                        fluid
                                                        className="border rounded"
                                                        style={{
                                                            width: "100%",
                                                            height: 120,
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="rounded-circle d-flex justify-content-center align-items-center bg-light mx-auto"
                                                    style={{
                                                        width: 80,
                                                        height: 80,
                                                    }}
                                                >
                                                    <BiIdCard
                                                        size={40}
                                                        className="text-primary"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <h6 className="fw-bold">ID Card</h6>
                                        <p className="small text-muted mb-3">
                                            Upload employee's identification
                                            card
                                        </p>
                                        <Form.Group>
                                            <Form.Label
                                                className="btn btn-outline-primary btn-sm w-100 cursor-pointer mb-0"
                                                htmlFor="idCard"
                                            >
                                                <BiIdCard className="me-2" />
                                                {idCardPreview
                                                    ? "Change ID Card"
                                                    : "Upload ID Card"}
                                            </Form.Label>
                                            <Form.Control
                                                type="file"
                                                id="idCard"
                                                name="idCard"
                                                accept="image/*,.pdf,.doc,.docx"
                                                onChange={handleFileChange(
                                                    "idCard",
                                                    setIdCardPreview
                                                )}
                                                className="d-none"
                                            />
                                        </Form.Group>
                                        <div className="small text-muted mt-2">
                                            PDF, Images, Docs. Max 10MB
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card className="border-0 bg-white shadow-sm h-100">
                                    <Card.Body className="text-center p-4">
                                        <div className="mb-3">
                                            {documentPreview ? (
                                                <div className="position-relative">
                                                    <div
                                                        className="border rounded d-flex justify-content-center align-items-center bg-light"
                                                        style={{
                                                            width: "100%",
                                                            height: 120,
                                                        }}
                                                    >
                                                        <BiFile
                                                            size={40}
                                                            className="text-success"
                                                        />
                                                        <span className="ms-2">
                                                            Document Uploaded
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className="rounded-circle d-flex justify-content-center align-items-center bg-light mx-auto"
                                                    style={{
                                                        width: 80,
                                                        height: 80,
                                                    }}
                                                >
                                                    <BiFile
                                                        size={40}
                                                        className="text-success"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <h6 className="fw-bold">
                                            Other Documents
                                        </h6>
                                        <p className="small text-muted mb-3">
                                            Upload certificates, contracts, etc.
                                        </p>
                                        <Form.Group>
                                            <Form.Label
                                                className="btn btn-outline-success btn-sm w-100 cursor-pointer mb-0"
                                                htmlFor="document"
                                            >
                                                <BiFile className="me-2" />
                                                {documentPreview
                                                    ? "Change Documents"
                                                    : "Upload Documents"}
                                            </Form.Label>
                                            <Form.Control
                                                type="file"
                                                id="document"
                                                name="document"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                                onChange={handleFileChange(
                                                    "document",
                                                    setDocumentPreview
                                                )}
                                                className="d-none"
                                            />
                                        </Form.Group>
                                        <div className="small text-muted mt-2">
                                            PDF, Word, Excel. Max 10MB
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card className="border-0 bg-info bg-opacity-10 h-100">
                                    <Card.Body className="p-4">
                                        <h6 className="fw-bold text-info mb-3">
                                            <BiFile className="me-2" />
                                            Document Information
                                        </h6>
                                        <p className="small text-muted mb-0">
                                            Upload important documents for
                                            record keeping. ID cards,
                                            certificates, contracts, and other
                                            relevant documents should be
                                            uploaded here for compliance and
                                            reference.
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default DocumentsTab;
