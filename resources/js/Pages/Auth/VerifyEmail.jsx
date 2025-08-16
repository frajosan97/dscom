import React from "react";
import { Button, Card, Alert } from "react-bootstrap";
import { Head, Link, useForm } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />
            <Card className="login-card">
                <div className="login-card-header">
                    <h2>Verify Your Email</h2>
                    <p>Thanks for signing up! Before getting started, please verify your email address.</p>
                </div>
                <Card.Body>
                    {status === 'verification-link-sent' && (
                        <Alert variant="success" className="mb-4">
                            A new verification link has been sent to the email address
                            you provided during registration.
                        </Alert>
                    )}

                    <div className="mb-4 text-muted">
                        We've sent a verification link to your email address.
                        If you didn't receive the email, we can send another.
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="d-flex justify-content-between align-items-center">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={processing}
                                className="login-button"
                            >
                                {processing ? "Sending..." : "Resend Verification Email"}
                            </Button>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="btn btn-link text-decoration-none login-forgot-password"
                            >
                                Log Out
                            </Link>
                        </div>
                    </form>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}