import { Table, Form, Button } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";

export default function SelectedServicesTable({
    selectedServices,
    removeService,
    updateServiceQuantity,
    updateServicePrice,
}) {
    return (
        <Table striped hover className="mb-0">
            <thead>
                <tr>
                    <th width="5%">#</th>
                    <th width="35%">Service</th>
                    <th width="15%">Price</th>
                    <th width="15%">Quantity</th>
                    <th width="15%">Total</th>
                    <th width="15%">Action</th>
                </tr>
            </thead>
            <tbody>
                {selectedServices.length > 0 ? (
                    selectedServices.map((service, index) => (
                        <tr key={service.id}>
                            <td>{index + 1}</td>
                            <td>
                                <div className="d-flex align-items-center">
                                    {service.image && (
                                        <img
                                            src={`/storage/${service.image}`}
                                            alt={service.name}
                                            width="40"
                                            className="me-2"
                                        />
                                    )}
                                    <div>
                                        <h6 className="mb-0">{service.name}</h6>
                                        <small className="text-muted">
                                            {service.code}
                                        </small>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <Form.Control
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={service.price}
                                    onChange={(e) =>
                                        updateServicePrice(
                                            service.id,
                                            e.target.value
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={service.quantity}
                                    onChange={(e) =>
                                        updateServiceQuantity(
                                            service.id,
                                            e.target.value
                                        )
                                    }
                                />
                            </td>
                            <td>
                                ${(service.price * service.quantity).toFixed(2)}
                            </td>
                            <td>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeService(service.id)}
                                >
                                    <Trash size={14} />
                                </Button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                            No services added yet
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
}
