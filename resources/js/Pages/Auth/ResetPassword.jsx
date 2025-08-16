import React from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Head, useForm } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />
            <Card className="login-card">
                <div className="login-card-header">
                    <h2>Reset Password</h2>
                    <p>Create a new password for your account</p>
                </div>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="email" className="mb-3">
                            <Form.Label className="login-form-label">
                                Email
                            </Form.Label>
                            <Form.Control
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="username"
                                isInvalid={!!errors.email}
                                className="login-form-control"
                                placeholder="Enter your email"
                                readOnly
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="password" className="mb-3">
                            <Form.Label className="login-form-label">
                                New Password
                            </Form.Label>
                            <Form.Control
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="new-password"
                                isInvalid={!!errors.password}
                                className="login-form-control"
                                placeholder="Enter new password"
                                autoFocus
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.password}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="password_confirmation" className="mb-4">
                            <Form.Label className="login-form-label">
                                Confirm Password
                            </Form.Label>
                            <Form.Control
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                isInvalid={!!errors.password_confirmation}
                                className="login-form-control"
                                placeholder="Confirm new password"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.password_confirmation}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={processing}
                                className="login-button w-100"
                            >
                                {processing ? "Resetting..." : "Reset Password"}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}