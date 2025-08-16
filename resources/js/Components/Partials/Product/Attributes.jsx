import { Card, Form } from "react-bootstrap";
import Select from 'react-select';

export default function AttributesCard({ data, setData, attributes }) {
    return (
        <Card className="mb-4">
            <Card.Header className="bg-white">
                <h5 className="mb-0">Attributes</h5>
            </Card.Header>
            <Card.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Product Attributes</Form.Label>
                    <Select
                        isMulti
                        options={attributes?.map(attr => ({
                            value: attr.id,
                            label: attr.name,
                            options: attr.values.map(val => ({
                                value: val.id,
                                label: val.value
                            }))
                        }))}
                        value={data.selected_attributes}
                        onChange={(selected) => setData('selected_attributes', selected)}
                        className="basic-multi-select"
                        classNamePrefix="select"
                    />
                </Form.Group>
            </Card.Body>
        </Card>
    )
}