import { Table, InputGroup, Form } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";

export default function TabTable({
    title,
    data,
    columns,
    emptyMessage,
    onSearch,
}) {
    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-semibold mb-0">{title}</h6>
                {onSearch && (
                    <InputGroup style={{ width: "300px" }}>
                        <InputGroup.Text>
                            <Search />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder={`Search ${title.toLowerCase()}...`}
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </InputGroup>
                )}
            </div>

            {data.length > 0 ? (
                <div className="table-responsive rounded border">
                    <Table hover className="mb-0">
                        <thead className="table-light">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} className="border-0">
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item.id}>
                                    {columns.map((col) => (
                                        <td key={`${item.id}-${col.key}`}>
                                            {col.render
                                                ? col.render(
                                                      item[col.key],
                                                      item
                                                  )
                                                : item[col.key] || "—"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-5 bg-light rounded">
                    <div className="text-muted mb-3">📄</div>
                    <h5 className="text-muted">{emptyMessage}</h5>
                </div>
            )}
        </div>
    );
}
