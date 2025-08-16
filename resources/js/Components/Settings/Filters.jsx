import { Form, Row, Col, ButtonGroup, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Filters({
    filters,
    handleFilterChange,
    resetFilters,
    applyFilters,
    filterFields = [],
    dateRange,
    handleDateChange,
}) {
    return (
        <Form>
            <Row className="g-2">
                {filterFields.map((field) => (
                    <Col md={2} key={field.name}>
                        <Form.Group controlId={`filter-${field.name}`}>
                            {/* Render based on the input type */}
                            {field.type === "select" ? (
                                <Form.Select
                                    name={field.name}
                                    value={filters[field.name]}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">
                                        {field.placeholder}
                                    </option>
                                    {(field.options ?? []).map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            ) : field.type === "dateRange" ? (
                                <DatePicker
                                    selectsRange={true}
                                    startDate={dateRange[0]}
                                    endDate={dateRange[1]}
                                    onChange={handleDateChange}
                                    isClearable={true}
                                    placeholderText="Select date range"
                                    className="form-control w-100"
                                />
                            ) : (
                                <Form.Control
                                    type={field.type || "text"}
                                    name={field.name}
                                    value={filters[field.name]}
                                    onChange={handleFilterChange}
                                    placeholder={field.placeholder}
                                />
                            )}
                        </Form.Group>
                    </Col>
                ))}
                {/* <Col md={2}>
                    <ButtonGroup className="gap-2 d-flex">
                        <Button variant="primary" onClick={applyFilters}>
                            <i className="bi bi-filter-circle" /> Apply
                        </Button>
                        <Button variant="outline-danger" onClick={resetFilters}>
                            <i className="bi bi-arrow-clockwise" />
                        </Button>
                    </ButtonGroup>
                </Col> */}
            </Row>
        </Form>
    );
}