import { useState, useCallback, useEffect, useMemo } from "react";
import {
    Card,
    Col,
    Form,
    Row,
    Badge,
    InputGroup,
    Table,
    Button,
    Modal,
} from "react-bootstrap";
import {
    Plus,
    Trash,
    Pencil,
    Box,
    Search,
    Layers,
    Calendar,
    CheckCircle,
    XCircle,
} from "react-bootstrap-icons";
import { BiBarcode } from "react-icons/bi";

// Item status options matching your database enum
const ITEM_STATUS_OPTIONS = [
    {
        value: "available",
        label: "Available",
        color: "success",
        icon: CheckCircle,
    },
    { value: "reserved", label: "Reserved", color: "warning", icon: Box },
    { value: "sold", label: "Sold", color: "secondary", icon: XCircle },
    { value: "damaged", label: "Damaged", color: "danger", icon: XCircle },
    { value: "returned", label: "Returned", color: "info", icon: Box },
    {
        value: "quarantined",
        label: "Quarantined",
        color: "dark",
        icon: XCircle,
    },
];

// Condition options matching your database enum
const CONDITION_OPTIONS = [
    { value: "new", label: "New", color: "success" },
    { value: "used", label: "Used", color: "warning" },
    { value: "refurbished", label: "Refurbished", color: "info" },
    { value: "damaged", label: "Damaged", color: "danger" },
];

export default function ItemsTab({
    formik,
    handleItemsUpdate,
    warehouses = [],
    productType,
}) {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [warehouseFilter, setWarehouseFilter] = useState("all");

    // Initialize items from formik values - ONLY ONCE
    useEffect(() => {
        if (
            formik.values.items &&
            formik.values.items.length > 0 &&
            items.length === 0
        ) {
            setItems(formik.values.items);
        }
    }, [formik.values.items]); // Remove items from dependencies

    // Update formik when items change - WITH DEBOUNCING
    useEffect(() => {
        if (items.length > 0 || formik.values.items?.length === 0) {
            const timeoutId = setTimeout(() => {
                handleItemsUpdate(items);
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [items, handleItemsUpdate]); // Only depend on items and handleItemsUpdate

    // Filter items based on search and filters
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                searchTerm === "" ||
                item.serial_number
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                item.barcode
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                item.item_code
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === "all" || item.status === statusFilter;
            const matchesWarehouse =
                warehouseFilter === "all" ||
                item.warehouse_id === warehouseFilter;

            return matchesSearch && matchesStatus && matchesWarehouse;
        });
    }, [items, searchTerm, statusFilter, warehouseFilter]);

    // Calculate statistics
    const itemStats = useMemo(() => {
        const stats = {
            total: items.length,
            available: items.filter((item) => item.status === "available")
                .length,
            reserved: items.filter((item) => item.status === "reserved").length,
            sold: items.filter((item) => item.status === "sold").length,
            damaged: items.filter((item) => item.status === "damaged").length,
        };

        stats.availablePercentage =
            stats.total > 0 ? (stats.available / stats.total) * 100 : 0;
        return stats;
    }, [items]);

    // Generate unique identifiers
    const generateSerialNumber = useCallback(() => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `SN-${timestamp}-${random}`.toUpperCase();
    }, []);

    const generateBarcode = useCallback(() => {
        return Math.random().toString().substr(2, 12).padStart(12, "0");
    }, []);

    // Initialize new item
    const initializeNewItem = useCallback(() => {
        const baseItem = {
            id: `temp-${Date.now()}`, // Temporary ID for new items
            product_id: formik.values.id,
            warehouse_id: warehouses[0]?.id || "",
            serial_number: generateSerialNumber(),
            barcode: generateBarcode(),
            item_code: `ITEM-${Date.now().toString(36).toUpperCase()}`,
            size: formik.values.sizes?.[0] || "",
            color: formik.values.colors?.[0] || "",
            material: formik.values.materials?.[0] || "",
            attributes: {},
            status: "available",
            condition: "new",
            aisle: "",
            rack: "",
            shelf: "",
            bin: "",
            manufacture_date: "",
            expiry_date: "",
            notes: "",
            metadata: {},
            quantity: 1, // Add quantity field
        };

        // Pre-fill with product variations if available
        if (formik.values.sizes && formik.values.sizes.length === 1) {
            baseItem.size = formik.values.sizes[0];
        }
        if (formik.values.colors && formik.values.colors.length === 1) {
            baseItem.color = formik.values.colors[0];
        }
        if (formik.values.materials && formik.values.materials.length === 1) {
            baseItem.material = formik.values.materials[0];
        }

        return baseItem;
    }, [formik.values, warehouses, generateSerialNumber, generateBarcode]);

    // Handle add/edit item
    const handleAddItem = useCallback(() => {
        setEditingItem(initializeNewItem());
        setShowModal(true);
    }, [initializeNewItem]);

    const handleEditItem = useCallback((item) => {
        setEditingItem({ ...item });
        setShowModal(true);
    }, []);

    const handleSaveItem = useCallback(
        (itemData) => {
            // Check if it's a new item by checking if ID is a string starting with "temp-"
            const isNewItem =
                typeof itemData.id === "string" &&
                itemData.id.startsWith("temp-");

            let updatedItems;
            if (isNewItem) {
                // New item - generate proper ID
                const newItem = {
                    ...itemData,
                    id: Date.now(), // Use timestamp as ID for new items
                };
                updatedItems = [...items, newItem];
            } else {
                // Update existing item
                updatedItems = items.map((item) =>
                    item.id === itemData.id ? itemData : item
                );
            }

            setItems(updatedItems);
            setShowModal(false);
            setEditingItem(null);
        },
        [items]
    );

    const handleDeleteItem = useCallback(
        (itemId) => {
            const updatedItems = items.filter((item) => item.id !== itemId);
            setItems(updatedItems);
        },
        [items]
    );

    // Bulk actions
    const handleBulkStatusChange = useCallback(
        (newStatus) => {
            const updatedItems = items.map((item) => ({
                ...item,
                status: newStatus,
            }));
            setItems(updatedItems);
        },
        [items]
    );

    const handleGenerateMultipleItems = useCallback(
        (count) => {
            const newItems = Array.from({ length: count }, (_, index) => ({
                ...initializeNewItem(),
                id: `temp-${Date.now()}-${index}`, // Use temp IDs for generated items
                item_code: `ITEM-${Date.now()}-${index}`,
            }));
            const updatedItems = [...items, ...newItems];
            setItems(updatedItems);
        },
        [initializeNewItem, items]
    );

    // Warehouse options
    const warehouseOptions = useMemo(
        () =>
            warehouses.map((wh) => ({
                value: wh.id,
                label: wh.name,
                location: wh.location,
            })),
        [warehouses]
    );

    // Digital product check
    const isDigitalProduct = productType === "digital";

    if (isDigitalProduct) {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                    <Box size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">Digital Product</h5>
                    <p className="text-muted">
                        This is a digital product and doesn't require physical
                        item management.
                    </p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <div className="items-tab">
            {/* Header with Stats */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">
                        <Layers className="me-2" />
                        Product Items Management
                    </h4>
                    <p className="text-muted mb-0">
                        Manage individual product units, serial numbers, and
                        inventory tracking
                    </p>
                </div>
                <div className="text-end">
                    <Badge bg="light" text="dark" className="fs-6">
                        {items.length} Items
                    </Badge>
                </div>
            </div>

            {/* Statistics Cards */}
            <Row className="g-3 mb-4">
                <Col md={2}>
                    <Card className="border-0 bg-light">
                        <Card.Body className="text-center py-3">
                            <div className="h5 mb-1 text-dark">
                                {itemStats.total}
                            </div>
                            <small className="text-muted">Total Items</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="border-0 bg-success bg-opacity-10">
                        <Card.Body className="text-center py-3">
                            <div className="h5 mb-1 text-success">
                                {itemStats.available}
                            </div>
                            <small className="text-muted">Available</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="border-0 bg-warning bg-opacity-10">
                        <Card.Body className="text-center py-3">
                            <div className="h5 mb-1 text-warning">
                                {itemStats.reserved}
                            </div>
                            <small className="text-muted">Reserved</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="border-0 bg-secondary bg-opacity-10">
                        <Card.Body className="text-center py-3">
                            <div className="h5 mb-1 text-secondary">
                                {itemStats.sold}
                            </div>
                            <small className="text-muted">Sold</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="border-0 bg-danger bg-opacity-10">
                        <Card.Body className="text-center py-3">
                            <div className="h5 mb-1 text-danger">
                                {itemStats.damaged}
                            </div>
                            <small className="text-muted">Damaged</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="border-0 bg-primary bg-opacity-10">
                        <Card.Body className="text-center py-3">
                            <div className="h5 mb-1 text-primary">
                                {itemStats.availablePercentage.toFixed(1)}%
                            </div>
                            <small className="text-muted">Available Rate</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Action Bar */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="py-3">
                    <Row className="g-3 align-items-center">
                        <Col md={3}>
                            <InputGroup size="sm">
                                <InputGroup.Text>
                                    <Search size={14} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search by serial, barcode..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <Form.Select
                                size="sm"
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                            >
                                <option value="all">All Status</option>
                                {ITEM_STATUS_OPTIONS.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Select
                                size="sm"
                                value={warehouseFilter}
                                onChange={(e) =>
                                    setWarehouseFilter(e.target.value)
                                }
                            >
                                <option value="all">All Warehouses</option>
                                {warehouseOptions.map((wh) => (
                                    <option key={wh.value} value={wh.value}>
                                        {wh.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={5} className="text-end">
                            <div className="d-flex gap-2 justify-content-end">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() =>
                                        handleGenerateMultipleItems(5)
                                    }
                                >
                                    <Plus size={14} className="me-1" />
                                    Generate 5 Items
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleAddItem}
                                >
                                    <Plus size={14} className="me-1" />
                                    Add Item
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Items Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light py-3">
                    <h6 className="mb-0 fw-semibold">
                        Product Items ({filteredItems.length})
                    </h6>
                </Card.Header>
                <Card.Body className="p-0">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-5">
                            <Box size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">No Items Found</h5>
                            <p className="text-muted mb-3">
                                {items.length === 0
                                    ? "Get started by adding your first product item."
                                    : "No items match your current filters."}
                            </p>
                            {items.length === 0 && (
                                <Button
                                    variant="primary"
                                    onClick={handleAddItem}
                                >
                                    <Plus size={14} className="me-1" />
                                    Add First Item
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th width="120">Serial Number</th>
                                        <th width="120">Barcode</th>
                                        <th width="100">Item Code</th>
                                        <th width="80">Size</th>
                                        <th width="80">Color</th>
                                        <th width="100">Warehouse</th>
                                        <th width="100">Status</th>
                                        <th width="100">Condition</th>
                                        <th width="120">Location</th>
                                        <th width="100" className="text-end">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => {
                                        const StatusIcon =
                                            ITEM_STATUS_OPTIONS.find(
                                                (s) => s.value === item.status
                                            )?.icon || Box;
                                        const statusConfig =
                                            ITEM_STATUS_OPTIONS.find(
                                                (s) => s.value === item.status
                                            );
                                        const warehouse = warehouseOptions.find(
                                            (w) => w.value === item.warehouse_id
                                        );

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <BiBarcode
                                                            size={14}
                                                            className="text-muted me-2"
                                                        />
                                                        <code className="text-primary">
                                                            {item.serial_number}
                                                        </code>
                                                    </div>
                                                </td>
                                                <td>
                                                    <code className="text-muted">
                                                        {item.barcode}
                                                    </code>
                                                </td>
                                                <td>
                                                    <small>
                                                        {item.item_code}
                                                    </small>
                                                </td>
                                                <td>
                                                    {item.size && (
                                                        <Badge
                                                            bg="outline-secondary"
                                                            text="dark"
                                                        >
                                                            {item.size}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    {item.color && (
                                                        <Badge
                                                            bg="outline-info"
                                                            text="dark"
                                                        >
                                                            {item.color}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    <small>
                                                        {warehouse?.label ||
                                                            "N/A"}
                                                    </small>
                                                </td>
                                                <td>
                                                    <Badge
                                                        bg={
                                                            statusConfig?.color ||
                                                            "secondary"
                                                        }
                                                        className="d-flex align-items-center gap-1"
                                                    >
                                                        <StatusIcon size={12} />
                                                        {statusConfig?.label}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge
                                                        bg="outline-dark"
                                                        text="dark"
                                                    >
                                                        {item.condition}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {item.aisle ||
                                                    item.rack ||
                                                    item.shelf ||
                                                    item.bin ? (
                                                        <small>
                                                            {[
                                                                item.aisle,
                                                                item.rack,
                                                                item.shelf,
                                                                item.bin,
                                                            ]
                                                                .filter(Boolean)
                                                                .join("-")}
                                                        </small>
                                                    ) : (
                                                        <small className="text-muted">
                                                            Not set
                                                        </small>
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    <div className="d-flex gap-1 justify-content-end">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleEditItem(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <Pencil size={12} />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDeleteItem(
                                                                    item.id
                                                                )
                                                            }
                                                        >
                                                            <Trash size={12} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Bulk Actions */}
            {items.length > 0 && (
                <Card className="border-0 shadow-sm mt-4">
                    <Card.Body className="py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                Bulk actions for {filteredItems.length} items
                            </small>
                            <div className="d-flex gap-2">
                                <Form.Select
                                    size="sm"
                                    style={{ width: "200px" }}
                                    onChange={(e) =>
                                        handleBulkStatusChange(e.target.value)
                                    }
                                    defaultValue=""
                                >
                                    <option value="">Bulk Status Change</option>
                                    {ITEM_STATUS_OPTIONS.map((status) => (
                                        <option
                                            key={status.value}
                                            value={status.value}
                                        >
                                            Set all to {status.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Add/Edit Item Modal */}
            <ItemModal
                show={showModal}
                item={editingItem}
                warehouses={warehouseOptions}
                productData={formik.values}
                onSave={handleSaveItem}
                onClose={() => {
                    setShowModal(false);
                    setEditingItem(null);
                }}
            />
        </div>
    );
}

// Item Modal Component for Add/Edit
function ItemModal({ show, item, warehouses, productData, onSave, onClose }) {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    // Initialize form data when item changes - FIXED VERSION
    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            setFormData({});
        }
    }, [item, show]); // Add show to dependencies

    const handleInputChange = useCallback(
        (field, value) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            // Clear error when field is updated
            if (errors[field]) {
                setErrors((prev) => ({ ...prev, [field]: undefined }));
            }
        },
        [errors]
    );

    const handleSave = useCallback(() => {
        // Basic validation
        const newErrors = {};
        if (!formData.serial_number)
            newErrors.serial_number = "Serial number is required";
        if (!formData.warehouse_id)
            newErrors.warehouse_id = "Warehouse is required";
        if (!formData.status) newErrors.status = "Status is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSave(formData);
    }, [formData, onSave]);

    const generateNewSerial = useCallback(() => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        handleInputChange(
            "serial_number",
            `SN-${timestamp}-${random}`.toUpperCase()
        );
    }, [handleInputChange]);

    const generateNewBarcode = useCallback(() => {
        handleInputChange(
            "barcode",
            Math.random().toString().substr(2, 12).padStart(12, "0")
        );
    }, [handleInputChange]);

    // FIX: Check if item exists and determine modal title safely
    const getModalTitle = () => {
        if (!item) return "Add New Item";

        // Check if it's a new item (ID is string and starts with "temp-")
        const isNewItem =
            typeof item.id === "string" && item.id.startsWith("temp-");
        return isNewItem ? "Add New Item" : "Edit Item";
    };

    if (!show) return null;

    return (
        <Modal show={show} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{getModalTitle()}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="g-3">
                    {/* Identification */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Serial Number *
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 ms-2"
                                    onClick={generateNewSerial}
                                >
                                    Generate
                                </Button>
                            </Form.Label>
                            <Form.Control
                                value={formData.serial_number || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "serial_number",
                                        e.target.value
                                    )
                                }
                                isInvalid={!!errors.serial_number}
                                placeholder="Unique serial number"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.serial_number}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Barcode
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 ms-2"
                                    onClick={generateNewBarcode}
                                >
                                    Generate
                                </Button>
                            </Form.Label>
                            <Form.Control
                                value={formData.barcode || ""}
                                onChange={(e) =>
                                    handleInputChange("barcode", e.target.value)
                                }
                                placeholder="Barcode number"
                            />
                        </Form.Group>
                    </Col>

                    {/* Warehouse & Status */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Warehouse *
                            </Form.Label>
                            <Form.Select
                                value={formData.warehouse_id || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "warehouse_id",
                                        e.target.value
                                    )
                                }
                                isInvalid={!!errors.warehouse_id}
                            >
                                <option value="">Select Warehouse</option>
                                {warehouses.map((wh) => (
                                    <option key={wh.value} value={wh.value}>
                                        {wh.label}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.warehouse_id}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Status *
                            </Form.Label>
                            <Form.Select
                                value={formData.status || ""}
                                onChange={(e) =>
                                    handleInputChange("status", e.target.value)
                                }
                                isInvalid={!!errors.status}
                            >
                                <option value="">Select Status</option>
                                {ITEM_STATUS_OPTIONS.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.status}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    {/* Variations */}
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Size
                            </Form.Label>
                            <Form.Select
                                value={formData.size || ""}
                                onChange={(e) =>
                                    handleInputChange("size", e.target.value)
                                }
                            >
                                <option value="">Select Size</option>
                                {productData.sizes?.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Color
                            </Form.Label>
                            <Form.Select
                                value={formData.color || ""}
                                onChange={(e) =>
                                    handleInputChange("color", e.target.value)
                                }
                            >
                                <option value="">Select Color</option>
                                {productData.colors?.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Condition
                            </Form.Label>
                            <Form.Select
                                value={formData.condition || "new"}
                                onChange={(e) =>
                                    handleInputChange(
                                        "condition",
                                        e.target.value
                                    )
                                }
                            >
                                {CONDITION_OPTIONS.map((condition) => (
                                    <option
                                        key={condition.value}
                                        value={condition.value}
                                    >
                                        {condition.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Location Tracking */}
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Aisle
                            </Form.Label>
                            <Form.Control
                                value={formData.aisle || ""}
                                onChange={(e) =>
                                    handleInputChange("aisle", e.target.value)
                                }
                                placeholder="Aisle"
                            />
                        </Form.Group>
                    </Col>

                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Rack
                            </Form.Label>
                            <Form.Control
                                value={formData.rack || ""}
                                onChange={(e) =>
                                    handleInputChange("rack", e.target.value)
                                }
                                placeholder="Rack"
                            />
                        </Form.Group>
                    </Col>

                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Shelf
                            </Form.Label>
                            <Form.Control
                                value={formData.shelf || ""}
                                onChange={(e) =>
                                    handleInputChange("shelf", e.target.value)
                                }
                                placeholder="Shelf"
                            />
                        </Form.Group>
                    </Col>

                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">Bin</Form.Label>
                            <Form.Control
                                value={formData.bin || ""}
                                onChange={(e) =>
                                    handleInputChange("bin", e.target.value)
                                }
                                placeholder="Bin"
                            />
                        </Form.Group>
                    </Col>

                    {/* Dates */}
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                <Calendar className="me-2" />
                                Manufacture Date
                            </Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.manufacture_date || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "manufacture_date",
                                        e.target.value
                                    )
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                <Calendar className="me-2" />
                                Expiry Date
                            </Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.expiry_date || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "expiry_date",
                                        e.target.value
                                    )
                                }
                            />
                        </Form.Group>
                    </Col>

                    {/* Notes */}
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Notes
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.notes || ""}
                                onChange={(e) =>
                                    handleInputChange("notes", e.target.value)
                                }
                                placeholder="Additional notes about this item..."
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Item
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
