import { Card, Col, Form, Row, Image } from "react-bootstrap";
import { BiImage, BiLock } from "react-icons/bi";

const PersonalDetailsTab = ({ formik, photoPreview, handlePhotoChange }) => {
    return (
        <>
            <Row className="g-4">
                <Col md={4} lg={3}>
                    <Card className="border-0 bg-light">
                        <Card.Body className="text-center p-4">
                            <div className="mb-3">
                                {photoPreview ? (
                                    <Image
                                        src={photoPreview}
                                        roundedCircle
                                        fluid
                                        className="border shadow-sm"
                                        style={{
                                            width: 140,
                                            height: 140,
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="border rounded-circle d-flex justify-content-center align-items-center bg-white mx-auto"
                                        style={{
                                            width: 140,
                                            height: 140,
                                        }}
                                    >
                                        <BiImage
                                            size={50}
                                            className="text-muted"
                                        />
                                    </div>
                                )}
                            </div>
                            <Form.Group>
                                <Form.Label
                                    className="btn btn-outline-primary btn-sm w-100 cursor-pointer mb-0"
                                    htmlFor="profileImage"
                                >
                                    <BiImage className="me-2" />
                                    {photoPreview
                                        ? "Change Photo"
                                        : "Upload Photo"}
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    id="profileImage"
                                    name="profileImage"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="d-none"
                                />
                            </Form.Group>
                            <div className="small text-muted mt-2">
                                JPG, PNG or GIF. Max 2MB.
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8} lg={9}>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    First Name *
                                </Form.Label>
                                <Form.Control
                                    name="first_name"
                                    value={formik.values.first_name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.first_name &&
                                        !!formik.errors.first_name
                                    }
                                    placeholder="Enter first name"
                                    className="py-2"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.first_name}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    Last Name *
                                </Form.Label>
                                <Form.Control
                                    name="last_name"
                                    value={formik.values.last_name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.last_name &&
                                        !!formik.errors.last_name
                                    }
                                    placeholder="Enter last name"
                                    className="py-2"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.last_name}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    Email Address
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.email &&
                                        !!formik.errors.email
                                    }
                                    placeholder="employee@example.com"
                                    className="py-2"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.email}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    Phone Number *
                                </Form.Label>
                                <Form.Control
                                    name="phone"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        formik.touched.phone &&
                                        !!formik.errors.phone
                                    }
                                    placeholder="+254 XXX XXX XXX"
                                    className="py-2"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.phone}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    Gender
                                </Form.Label>
                                <Form.Select
                                    name="gender"
                                    value={formik.values.gender}
                                    onChange={formik.handleChange}
                                    className="py-2"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    Date of Birth
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date_of_birth"
                                    value={
                                        formik.values.date_of_birth
                                            ? new Date(
                                                  formik.values.date_of_birth
                                              )
                                                  .toISOString()
                                                  .slice(0, 10)
                                            : ""
                                    }
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="py-2"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    Blood Group
                                </Form.Label>
                                <Form.Select
                                    name="blood_group"
                                    value={formik.values.blood_group}
                                    onChange={formik.handleChange}
                                    className="py-2"
                                >
                                    <option value="">Select Blood Group</option>
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
                    </Row>
                </Col>
            </Row>

            {/* Credentials Section */}
            <Row className="mt-4">
                <Col md={12}>
                    <Card className="border-0 bg-light">
                        <Card.Body className="p-4">
                            <h6 className="fw-bold mb-3 d-flex align-items-center">
                                <BiLock className="me-2" />
                                Login Credentials
                            </h6>
                            <Row className="g-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Username
                                        </Form.Label>
                                        <Form.Control
                                            name="username"
                                            value={formik.values.username}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="username"
                                            className="py-2"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Password
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={formik.values.password}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isInvalid={
                                                formik.touched.password &&
                                                !!formik.errors.password
                                            }
                                            placeholder="••••••"
                                            className="py-2"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.password}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Confirm Password
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="confirm_password"
                                            value={
                                                formik.values.confirm_password
                                            }
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isInvalid={
                                                formik.touched
                                                    .confirm_password &&
                                                !!formik.errors.confirm_password
                                            }
                                            placeholder="••••••"
                                            className="py-2"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.confirm_password}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default PersonalDetailsTab;
