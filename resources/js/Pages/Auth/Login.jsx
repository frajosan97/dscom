// Updated Login.jsx
import React from "react";
import { Form, Button, Card, Alert, FormCheck } from "react-bootstrap";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Login({ status, canResetPassword }) {
    const { systemMode } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            <Card className="login-card">
                <div className="login-card-header">
                    <h2>Welcome Back</h2>
                    <p>Please login to access the {systemMode.toUpperCase()} portal</p>
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
                                autoComplete="username"
                                autoFocus
                                isInvalid={!!errors.email}
                                className="login-form-control"
                                placeholder="Enter your email"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="password" className="mb-3">
                            <Form.Label className="login-form-label">
                                Password
                            </Form.Label>
                            <Form.Control
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                autoComplete="current-password"
                                isInvalid={!!errors.password}
                                className="login-form-control"
                                placeholder="Enter your password"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.password}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="remember" className="d-flex justify-content-between align-items-center mb-3">
                            <FormCheck
                                type="checkbox"
                                label="Remember me"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                                className="login-remember-me"
                            />

                            {canResetPassword && (
                                <Link
                                    href={route("password.request")}
                                    className="login-forgot-password"
                                >
                                    Forgot your password?
                                </Link>
                            )}
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={processing}
                                className="login-button w-100"
                            >
                                {processing ? "Logging in..." : "Log in"}
                            </Button>
                        </div>

                        {systemMode === "ecommerce" && (
                            <p className="text-center">
                                Don't have an account?{" "}
                                <Link href={route("register")}>Sign up</Link>
                            </p>
                        )}
                    </Form>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}
