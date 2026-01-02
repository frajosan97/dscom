import { Card, ListGroup } from "react-bootstrap";
import SectionTitle from "./SectionTitle";
import InfoItem from "./InfoItem";

export default function InfoCard({ title, icon, items }) {
    return (
        <Card className="border-0 bg-light h-100">
            <Card.Body>
                <SectionTitle icon={icon} title={title} />
                <ListGroup variant="flush">
                    {items.map((item, index) => (
                        <InfoItem
                            key={index}
                            label={item.label}
                            value={item.value}
                            fallback={item.fallback}
                            isHighlight={item.isHighlight}
                        />
                    ))}
                </ListGroup>
            </Card.Body>
        </Card>
    );
}
