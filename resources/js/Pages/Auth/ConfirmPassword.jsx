import React from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Head, useForm } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />
            <Card className="login-card">
                <div className="login-card-header">
                    <h2>Confirm Password</h2>
                    <p>This is a secure area of the application. Please confirm your password to continue.</p>
                </div>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="password" className="mb-4">
                            <Form.Label className="login-form-label">
                                Password
                            </Form.Label>
                            <Form.Control
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="current-password"
                                isInvalid={!!errors.password}
                                className="login-form-control"
                                placeholder="Enter your password"
                                autoFocus
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.password}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={processing}
                                className="login-button"
                            >
                                {processing ? "Confirming..." : "Confirm"}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}