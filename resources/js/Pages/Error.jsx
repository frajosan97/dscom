import React from 'react';
import { Head } from '@inertiajs/react';
import ErpLayout from '@/Layouts/ErpLayout';
import { Alert, Container } from 'react-bootstrap';

export default function Error({ message }) {
    return (
        <ErpLayout>
            <Head title="Error" />
            <Container className="py-4">
                <Alert variant="danger" className="mb-0">
                    <Alert.Heading>Error!</Alert.Heading>
                    <p>{message}</p>
                </Alert>
            </Container>
        </ErpLayout>
    );
}