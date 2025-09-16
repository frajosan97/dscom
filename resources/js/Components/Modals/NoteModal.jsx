<Modal show={showAddNoteModal} onHide={() => setShowAddNoteModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>
            <Journal className="me-2" />
            Add Note
        </Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form.Group className="mb-3">
            <Form.Label>Note</Form.Label>
            <Form.Control
                as="textarea"
                rows={4}
                placeholder="Add a note about this customer..."
            />
        </Form.Group>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="primary">Save Note</Button>
        <Button variant="secondary" onClick={() => setShowAddNoteModal(false)}>
            Cancel
        </Button>
    </Modal.Footer>
</Modal>;
