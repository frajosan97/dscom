import { useState, useMemo } from "react";
import {
    Row,
    Col,
    Card,
    Table,
    Badge,
    Button,
    InputGroup,
    Form,
} from "react-bootstrap";
import {
    CashCoin,
    Wallet,
    PersonCheck,
    BarChart,
    Search,
    Eye,
} from "react-bootstrap-icons";
import TabTable from "../../../../ui/TabTable";
import { formatCurrency } from "@/Utils/helpers";
import { Link } from "@inertiajs/react";

export default function SalesTab({ employee }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSales = useMemo(
        () =>
            employee.sales?.filter(
                (sale) =>
                    !searchTerm ||
                    sale.invoice_number
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    sale.customer_name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
            ) || [],
        [employee.sales, searchTerm]
    );

    const salesSummary = useMemo(() => {
        const totalSales = filteredSales.reduce(
            (sum, sale) => sum + (sale.amount || 0),
            0
        );
        const totalCommission = filteredSales.reduce(
            (sum, sale) => sum + (sale.commission || 0),
            0
        );
        const completedSales = filteredSales.filter(
            (s) => s.status === "completed"
        ).length;

        return {
            totalSales,
            totalCommission,
            completedSales,
            averageSale:
                filteredSales.length > 0
                    ? totalSales / filteredSales.length
                    : 0,
        };
    }, [filteredSales]);

    const columns = [
        {
            key: "invoice_number",
            label: "Invoice #",
            render: (val) => val || "—",
        },
        {
            key: "date",
            label: "Date",
            render: (val) => new Date(val).toLocaleDateString(),
        },
        {
            key: "customer_name",
            label: "Customer",
            render: (val) => val || "—",
        },
        {
            key: "amount",
            label: "Amount",
            render: (val) => formatCurrency(val),
        },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <Badge bg={val === "completed" ? "success" : "warning"} pill>
                    {val}
                </Badge>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, sale) => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    as={Link}
                    href={route("sales.show", sale.id)}
                >
                    <Eye size={14} />
                </Button>
            ),
        },
    ];

    return (
        <div>
            {/* Sales Summary Cards */}
            <Row className="g-3 mb-4">
                <Col md={3}>
                    <Card className="border-0 bg-success bg-opacity-10">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">
                                        Total Sales
                                    </h6>
                                    <h4 className="fw-bold mb-0">
                                        {formatCurrency(
                                            salesSummary.totalSales
                                        )}
                                    </h4>
                                </div>
                                <CashCoin size={24} className="text-success" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-warning bg-opacity-10">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">
                                        Total Commission
                                    </h6>
                                    <h4 className="fw-bold mb-0">
                                        {formatCurrency(
                                            salesSummary.totalCommission
                                        )}
                                    </h4>
                                </div>
                                <Wallet size={24} className="text-warning" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <TabTable
                title="Sales History"
                data={filteredSales}
                columns={columns}
                emptyMessage="No sales records found for this employee."
                onSearch={setSearchTerm}
            />
        </div>
    );
}
