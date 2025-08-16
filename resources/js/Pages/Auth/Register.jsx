import React from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Register({ status, canResetPassword }) {
    const { systemMode } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("register"));
    };

    // Don't render the register form if not in ecommerce mode
    if (systemMode !== "ecommerce") {
        return (
            <GuestLayout>
                <Head title="Register" />
                <Card className="login-card">
                    <Card.Body className="text-center">
                        <Alert variant="warning">
                            User registration is only available in ecommerce mode.
                        </Alert>
                        <Link href={route("login")} className="btn btn-primary">
                            Back to Login
                        </Link>
                    </Card.Body>
                </Card>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head title="Register" />
            <Card className="login-card">
                <div className="login-card-header">
                    <h2>Create Account</h2>
                    <p>Join our ecommerce platform</p>
                </div>
                <Card.Body>
                    {status && (
                        <Alert variant="success" className="mb-4">
                            {status}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="name" className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                required
                                autoFocus
                                isInvalid={errors.name}
                                placeholder="Enter your full name"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.name}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="email" className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                required
                                isInvalid={errors.email}
                                placeholder="Enter your email"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="password" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                required
                                isInvalid={errors.password}
                                placeholder="Create a password"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.password}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                                Minimum 8 characters
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId="password_confirmation" className="mb-4">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData("password_confirmation", e.target.value)
                                }
                                required
                                isInvalid={errors.password_confirmation}
                                placeholder="Confirm your password"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.password_confirmation}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-grid mb-3">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={processing}
                                size="lg"
                            >
                                {processing ? "Creating Account..." : "Create Account"}
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="mb-0">
                                Already have an account?{" "}
                                <Link href={route("login")} className="fw-semibold">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}