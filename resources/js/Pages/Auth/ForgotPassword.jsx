import React from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Head, Link, useForm } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ForgotPassword({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("password.email"), {
            onFinish: () => reset("email"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />
            <Card className="login-card">
                <div className="login-card-header">
                    <h2>Reset Password</h2>
                    <p>Forgot your password? No problem. Just enter your email and we'll send you a reset link.</p>
                </div>
                <Card.Body>
                    {status && (
                        <Alert variant="success" className="mb-4">
                            {status}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="email" className="mb-3">
                            <Form.Label className="login-form-label">
                                Email
                            </Form.Label>
                            <Form.Control
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                autoComplete="email"
                                autoFocus
                                isInvalid={!!errors.email}
                                className="login-form-control"
                                placeholder="Enter your email"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={processing}
                                className="login-button w-100"
                            >
                                {processing ? "Sending..." : "Email Password Reset Link"}
                            </Button>
                        </div>

                        <div className="text-center">
                            <Link
                                href={route("login")}
                                className="login-forgot-password"
                            >
                                Back to login
                            </Link>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}