import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';
import { Button, Card, CardBody, Col, Row, Form, Container, Alert, Image } from 'react-bootstrap';

export default function FileUpload({
    name,
    label = 'Upload files',
    accept = 'image/*',
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024,
    disabled = false,
    value = [],
    onChange,
    error
}) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept,
        maxFiles,
        maxSize,
        disabled: disabled,
        onDrop: acceptedFiles => {
            const updatedFiles = [...value, ...acceptedFiles].slice(0, maxFiles);
            onChange(updatedFiles, null);
        },
        onDropRejected: fileRejections => {
            const error = fileRejections[0]?.errors[0]?.message || 'Invalid file';
            onChange(value, error);
        }
    });

    const removeFile = index => {
        const updatedFiles = [...value];
        updatedFiles.splice(index, 1);
        onChange(updatedFiles, null);
    };

    return (
        <Form.Group className="mb-4">
            {label && (
                <Form.Label>
                    {label}
                    <span className="text-danger">*</span>
                </Form.Label>
            )}

            <Container
                {...getRootProps()}
                fluid
                className={`
          p-5 text-center border rounded
          ${isDragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}
          ${disabled ? 'opacity-75 pe-none bg-light' : 'cursor-pointer bg-white'}
        `}
            >
                <input {...getInputProps()} name={name} />
                <div className="d-flex flex-column align-items-center justify-content-center gap-3">
                    <div className="p-3 bg-primary bg-opacity-10 rounded-circle">
                        <FiUpload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="d-flex flex-column gap-1">
                        <p className="mb-0 fw-medium text-dark">
                            {isDragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="mb-0 small text-muted">
                            {accept} (Max {maxFiles} files, {maxSize / 1024 / 1024}MB each)
                        </p>
                    </div>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={e => e.stopPropagation()}
                    >
                        Select Files
                    </Button>
                </div>
            </Container>

            {/* Error Message */}
            {error && (
                <Alert variant="danger" className="d-flex align-items-center mt-2 p-2">
                    <FiX className="flex-shrink-0 me-2" />
                    {error}
                </Alert>
            )}

            {/* Preview Area */}
            {value?.length > 0 && (
                <div className="mt-4">
                    <h6 className="text-muted text-uppercase small fw-bold mb-3">
                        Selected Files ({value.length}/{maxFiles})
                    </h6>

                    <Row className="g-3">
                        {value.map((file, index) => (
                            <Col md={4} key={file.name || file.id || index}>
                                <Card className="h-100">
                                    {file instanceof File ? (
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="card-img-top"
                                            style={{ height: '150px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Image
                                            src={file.image_path || file.url}
                                            alt={file.name || `Image ${index}`}
                                            className="card-img-top"
                                            style={{ height: '150px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <CardBody className="p-2">
                                        <p className="mb-1 text-truncate small">{file.name}</p>
                                        <p className="mb-0 small">
                                            {file.size ? Math.round(file.size / 1024) + 'KB' : ''}
                                        </p>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="w-100 mt-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(index);
                                            }}
                                            disabled={disabled}
                                        >
                                            Remove
                                        </Button>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </Form.Group>
    );
}