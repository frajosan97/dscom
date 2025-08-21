import ErpLayout from '@/Layouts/ErpLayout';
import { Head, usePage } from '@inertiajs/react';
import {
    BiCart, BiDollar, BiBox, BiWrench, BiUser,
    BiLineChart, BiTrendingUp, BiTrendingDown,
    BiStore, BiPackage, BiCheckCircle, BiTime,
    BiLineChartDown
} from 'react-icons/bi';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, Row, Col, ProgressBar, Badge, Button, Container, Dropdown } from 'react-bootstrap';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard({ dashboardData }) {
    const { auth } = usePage().props;
    
    // Destructure data from backend
    const {
        summaryMetrics,
        salesData,
        revenueSources,
        repairData,
        inventoryData,
        topProducts,
        recentOrders,
        repairStatus,
        customerAcquisition
    } = dashboardData;

    // Summary cards data
    const summaryCards = [
        {
            title: "Total Sales",
            value: `$${summaryMetrics.totalSales.toLocaleString()}`,
            description: `${summaryMetrics.salesGrowth >= 0 ? '+' : ''}${summaryMetrics.salesGrowth}% vs last month`,
            icon: <BiDollar size={24} className="text-primary" />,
            bg: "bg-primary bg-opacity-10",
            trend: summaryMetrics.salesGrowth >= 0 ? 'up' : 'down'
        },
        {
            title: "Total Orders",
            value: summaryMetrics.totalOrders,
            description: `<span class="text-success">${summaryMetrics.onlineOrders} online</span> • <span class="text-info">${summaryMetrics.retailOrders} in-store</span>`,
            icon: <BiCart size={24} className="text-success" />,
            bg: "bg-success bg-opacity-10",
            isHtml: true
        },
        {
            title: "Inventory Value",
            value: `$${summaryMetrics.inventoryValue.toLocaleString()}`,
            description: `${summaryMetrics.lowStockItems} low stock items`,
            icon: <BiBox size={24} className="text-warning" />,
            bg: "bg-warning bg-opacity-10",
            trend: 'down'
        },
        {
            title: "Repair Revenue",
            value: `$${summaryMetrics.repairRevenue.toLocaleString()}`,
            description: `${summaryMetrics.completedRepairs} completed • ${summaryMetrics.repairOrders - summaryMetrics.completedRepairs} in progress`,
            icon: <BiWrench size={24} className="text-info" />,
            bg: "bg-info bg-opacity-10"
        }
    ];

    // Status badge colors mapping
    const statusColors = {
        completed: 'success',
        processing: 'primary',
        pending: 'warning',
        shipped: 'info',
        in_progress: 'primary',
        diagnosis: 'info',
        awaiting_parts: 'warning'
    };

    return (
        <ErpLayout>
            <Head title="Dashboard" />

            <Container fluid>
                {/* <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Dashboard</h4>
                    <Dropdown>
                        <Dropdown.Toggle variant="primary" id="quick-actions-dropdown" className="text-muted">
                            <BiLineChartDown size={18} className="me-1" />
                            Quick Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu-end" aria-labelledby="quick-actions-dropdown" align="end">
                            <Dropdown.Item href={route('sales.create')}>New Sale</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                <hr className="dashed-hr" /> */}

                {/* Summary Cards */}
                <Row className="mb-4">
                    {summaryCards.map((card, index) => (
                        <Col md={3} sm={6} key={index}>
                            <Card className="shadow-sm border-0 h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-2">{card.title}</h6>
                                            <h3 className="mb-0">{card.value}</h3>
                                            {card.isHtml ? <div dangerouslySetInnerHTML={{ __html: card.description }} /> : <p className="mb-0">{card.description}</p>}
                                        </div>
                                        <div className={`${card.bg} p-3 rounded`}>
                                            {card.icon}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Sales & Revenue Charts */}
                <Row className="mb-4">
                    <Col lg={8}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Sales Performance</h5>
                                    <div>
                                        <Badge bg="light" text="dark" className="me-2">Online</Badge>
                                        <Badge bg="light" text="dark">Retail</Badge>
                                    </div>
                                </div>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="online" fill="#4e73df" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="retail" fill="#1cc88a" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <h5 className="mb-3">Revenue Sources</h5>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={revenueSources}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {revenueSources.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Inventory & Repair Analytics */}
                <Row className="mb-4">
                    <Col lg={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <h5 className="mb-3">Inventory Distribution</h5>
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={inventoryData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={70}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {inventoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} units`, 'Inventory']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <h5 className="mb-3">Repair Service Trends</h5>
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={repairData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="completed" stroke="#36b9cc" strokeWidth={2} dot={{ r: 4 }} />
                                            <Line type="monotone" dataKey="pending" stroke="#f6c23e" strokeWidth={2} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Top Products & Recent Orders */}
                <Row className="mb-4">
                    <Col lg={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <h5 className="mb-3">Top Selling Products</h5>
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th className="text-end">Sales</th>
                                                <th className="text-end">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.map(product => (
                                                <tr key={product.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="bg-light rounded p-1 me-2">
                                                                <BiPackage size={16} />
                                                            </div>
                                                            <span>{product.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-end">{product.sales}</td>
                                                    <td className="text-end">${product.revenue.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <h5 className="mb-3">Recent Orders</h5>
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Order #</th>
                                                <th>Customer</th>
                                                <th className="text-end">Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map(order => (
                                                <tr key={order.id}>
                                                    <td>{order.id}</td>
                                                    <td>{order.customer}</td>
                                                    <td className="text-end">${order.amount}</td>
                                                    <td>
                                                        <Badge bg={statusColors[order.status]}>
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Repair Status & Customer Acquisition */}
                <Row>
                    <Col lg={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <h5 className="mb-3">Repair Status</h5>
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Repair #</th>
                                                <th>Device</th>
                                                <th>Issue</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {repairStatus.map(repair => (
                                                <tr key={repair.id}>
                                                    <td>{repair.id}</td>
                                                    <td>{repair.device}</td>
                                                    <td>{repair.issue}</td>
                                                    <td>
                                                        <Badge bg={statusColors[repair.status]}>
                                                            {repair.status.replace('_', ' ')}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <h5 className="mb-3">Customer Acquisition</h5>
                                {customerAcquisition.metrics.map((metric, index) => (
                                    <div className="mb-4" key={index}>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{metric.label}</span>
                                            <span>
                                                {metric.value}
                                                {metric.trend && (
                                                    <small className={`text-${metric.trend > 0 ? 'success' : 'danger'}`}>
                                                        ({metric.trend > 0 ? '+' : ''}{metric.trend}%)
                                                    </small>
                                                )}
                                            </span>
                                        </div>
                                        {metric.components ? (
                                            <ProgressBar>
                                                {metric.components.map((comp, i) => (
                                                    <ProgressBar
                                                        variant={comp.variant}
                                                        now={comp.value}
                                                        key={i}
                                                    />
                                                ))}
                                            </ProgressBar>
                                        ) : (
                                            <ProgressBar
                                                now={metric.percentage}
                                                variant={metric.variant || 'success'}
                                            />
                                        )}
                                    </div>
                                ))}
                                <div className="text-center mt-4">
                                    <Button variant="outline-primary" size="sm">
                                        View Customer Analytics <BiLineChart className="ms-1" />
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </ErpLayout>
    );
}