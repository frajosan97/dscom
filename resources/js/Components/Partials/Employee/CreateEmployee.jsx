import { router } from "@inertiajs/react";
import { Form, Row, Col, ButtonGroup, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from '@inertiajs/react';
import { useState } from "react";
import xios from "@/Utils/axios";

export default function CreateEmployee() {
    const { data, setData, post, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        gender: 'Male',
        age: '',
        qualification: '',
        designation: '',
        salaryType: '',
        salary: '',
        bloodGroup: '',
        role: '',
        endingDate: '16/08/2026',
        openingBalance: '0',
        address: '',
        description: '',
        status: 'Enable',
        profileImage: null,
        idCard: null,
        document: null
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setData(name, type === 'file' ? files[0] : value);
    };

    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const response = await xios.post(route('employee.store'), data);
            if (response.data.success) {
                setProcessing(false);
                toast.success(response.data.message);
                router.visit(route('employee.index'));
            }
        } catch (error) {
            setProcessing(false);
            toast.error(error.response?.data?.message || 'An error occurred while updating the order');
        }
    }

    return (
        <Form id="userForm" onSubmit={handleSubmit} encType="multipart/form-data">
            <Row>
                <Col md={12} className="mb-2 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">Create User</h6>
                    <ButtonGroup className="float-end gap-2">
                        <Button variant="warning" size={"sm"} className="rounded-0" onClick={() => router.visit(route('employee.index'))}>
                            Cancel
                        </Button>
                        <Button variant="success" size={"sm"} className="rounded-0" type="submit" disabled={processing}>
                            {processing ? 'Processing...' : 'Save'}
                        </Button>
                    </ButtonGroup>
                </Col>
                <Col md={12}>
                    <hr className="m-0 mb-2" />
                </Col>
                <Col md={2} className="mb-2">
                    <Form.Group controlId="name">
                        <Form.Label>Name*</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={2} className="mb-2">
                    <Form.Group controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={2} className="mb-2">
                    <Form.Group controlId="phone">
                        <Form.Label>Phone*</Form.Label>
                        <Form.Control
                            type="tel"
                            name="phone"
                            value={data.phone}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Col>

                <Col md={2} className="mb-2">
                    <Form.Group controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            name="username"
                            value={data.username}
                            onChange={handleChange}
                            placeholder="demoadmin"
                        />
                    </Form.Group>
                </Col>

                <Col md={2} className="mb-2">
                    <Form.Group controlId="gender">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                            name="gender"
                            value={data.gender}
                            onChange={handleChange}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={2} className="mb-2">
                    <Form.Group controlId="age">
                        <Form.Label>Age</Form.Label>
                        <Form.Control
                            type="number"
                            name="age"
                            value={data.age}
                            onChange={handleChange}
                            placeholder="Age"
                        />
                    </Form.Group>
                </Col>
                <Col md={2} className="mb-2">
                    <Form.Group controlId="qualification">
                        <Form.Label>Qualification</Form.Label>
                        <Form.Control
                            type="text"
                            name="qualification"
                            value={data.qualification}
                            onChange={handleChange}
                            placeholder="Text"
                        />
                    </Form.Group>
                </Col>

                <Col md={2} className="mb-2">
                    <Form.Group controlId="designation">
                        <Form.Label>Designation</Form.Label>
                        <Form.Control
                            type="text"
                            name="designation"
                            value={data.designation}
                            onChange={handleChange}
                            placeholder="Text"
                        />
                    </Form.Group>
                </Col>
                <Col md={2} className="mb-2">
                    <Form.Group controlId="salaryType">
                        <Form.Label>Salary Type</Form.Label>
                        <Form.Select
                            name="salaryType"
                            value={data.salaryType}
                            onChange={handleChange}
                        >
                            <option value="">Select</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Daily">Daily</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={2} className="mb-2">
                    <Form.Group controlId="salary">
                        <Form.Label>Salary</Form.Label>
                        <Form.Control
                            type="text"
                            name="salary"
                            value={data.salary}
                            onChange={handleChange}
                            placeholder="Text"
                        />
                    </Form.Group>
                </Col>

                <Col md={2} className="mb-2">
                    <Form.Group controlId="bloodGroup">
                        <Form.Label>Blood Group</Form.Label>
                        <Form.Select
                            name="bloodGroup"
                            value={data.bloodGroup}
                            onChange={handleChange}
                        >
                            <option value="">Select</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={2} className="mb-2">
                    <Form.Group controlId="role">
                        <Form.Label>Role*</Form.Label>
                        <Form.Select
                            name="role"
                            value={data.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select</option>
                            <option value="admin">admin</option>
                            <option value="manager">manager</option>
                            <option value="technician">technician</option>
                            <option value="receptionist">receptionist</option>
                            <option value="supervisor">supervisor</option>
                            <option value="sales">sales</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={2} className="mb-2">
                    <Form.Group controlId="endingDate">
                        <Form.Label>Ending Date</Form.Label>
                        <Form.Control
                            type="text"
                            name="endingDate"
                            value={data.endingDate}
                            onChange={handleChange}
                            readOnly
                        />
                    </Form.Group>
                </Col>

                <Col md={2} className="mb-2">
                    <Form.Group controlId="openingBalance">
                        <Form.Label>Opening Balance</Form.Label>
                        <Form.Control
                            type="text"
                            name="openingBalance"
                            value={data.openingBalance}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={4} className="mb-2">
                    <Form.Group controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            name="address"
                            value={data.address}
                            onChange={handleChange}
                            placeholder="Content"
                        />
                    </Form.Group>
                </Col>
                <Col md={4} className="mb-2">
                    <Form.Group controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            name="description"
                            value={data.description}
                            onChange={handleChange}
                            placeholder="Content"
                        />
                    </Form.Group>
                </Col>

                <Col md={3} className="mb-2">
                    <Form.Label>Status</Form.Label>
                    <div>
                        <Form.Check
                            inline
                            type="radio"
                            label="Enable"
                            name="status"
                            id="enable"
                            value="Enable"
                            checked={data.status === 'Enable'}
                            onChange={handleChange}
                        />
                        <Form.Check
                            inline
                            type="radio"
                            label="Disable"
                            name="status"
                            id="disable"
                            value="Disable"
                            checked={data.status === 'Disable'}
                            onChange={handleChange}
                        />
                    </div>
                </Col>

                <Col md={3} className="mb-2">
                    <Form.Group controlId="profileImage">
                        <Form.Label>Profile Image</Form.Label>
                        <Form.Control
                            type="file"
                            name="profileImage"
                            onChange={handleChange}
                        />
                        <Form.Text className="text-muted">No file chosen</Form.Text>
                    </Form.Group>
                </Col>

                <Col md={3} className="mb-2">
                    <Form.Group controlId="idCard">
                        <Form.Label>Id Card</Form.Label>
                        <Form.Control
                            type="file"
                            name="idCard"
                            onChange={handleChange}
                        />
                        <Form.Text className="text-muted">No file chosen</Form.Text>
                    </Form.Group>
                </Col>

                <Col md={3} className="mb-2">
                    <Form.Group controlId="document">
                        <Form.Label>Document</Form.Label>
                        <Form.Control
                            type="file"
                            name="document"
                            onChange={handleChange}
                        />
                        <Form.Text className="text-muted">No file chosen</Form.Text>
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
}