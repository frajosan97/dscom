// resources/js/Utils/PrintReceipt.js
import { formatCurrency } from "@/Utils/helpers";

export function printReceipt(order, options = {}) {
    const width = options.width || 900;
    const height = options.height || 700;

    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const printWindow = window.open(
        "",
        "Print Receipt",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    const logoUrl = options.logoUrl || `/storage/images/logos/logo.png`;
    const company = options.company || {
        name: "DSCOM Technologies Ltd",
        phone: "+243 (894) 779-059",
        email: "info@dscomtechnologies.com",
        address:
            "Avenue Du Tchad, No.7 IMMEUBLE RENAISSANCE, Local 6<br />Ref. Opposite EQUITY BCDC HEAD OFFICE",
    };

    const orderDate = new Date(order.created_at).toLocaleString();

    // Items
    const itemsRows = order.items
        .map(
            (item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.id || ""}</td>
            <td>${item.hsn_code || "none"}</td>
            <td>${item.product_name}</td>
            <td style="text-align:right;">${formatCurrency(item.price)}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">${formatCurrency(
                item.price * item.quantity
            )}</td>
            <td style="text-align:center;">${item.gst || "0%"}</td>
            <td style="text-align:right;">${formatCurrency(
                item.price * item.quantity
            )}</td>
        </tr>`
        )
        .join("");

    // Payments
    const paymentsRows =
        order?.payments
            ?.map(
                (p, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${p.payment_method_name}</td>
            <td style="text-align:right;">${formatCurrency(p.amount)}</td>
            <td>${new Date(p.created_at).toLocaleDateString()}</td>
        </tr>`
            )
            .join("") || "";

    // Inject HTML
    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice ${order.invoice_number}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 15px; font-size: 14px; }
                    .header { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                    .header img { max-width: 120px; }
                    .company { text-align: right; }
                    .company h2 { margin: 0; }
                    .title { text-align: center; border: 1px solid #000; padding: 5px; font-weight: bold; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #000; padding: 6px; text-align: left; }
                    th { background: #f2f2f2; }
                    .no-border td { border: none; }
                    .summary td { font-weight: bold; }
                    .footer { margin-top: 20px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div><img src="${logoUrl}" alt="Logo" /></div>
                    <div class="company">
                        <h2>${company.name}</h2>
                        <p>Tel: ${company.phone}</p>
                        <p>Email: ${company.email}</p>
                        <p>${company.address}</p>
                    </div>
                </div>

                <div class="title">Sales Receipt</div>

                <table>
                    <tr>
                        <td>
                            <strong>Name:</strong> ${
                                order.customer?.name || ""
                            }<br/>
                            <strong>Phone:</strong> ${
                                order.customer?.phone || ""
                            }<br/>
                            <strong>Address:</strong> ${
                                order.customer?.address || ""
                            }<br/>
                            <strong>Other Information:</strong> ${
                                order.customer?.info || ""
                            }
                        </td>
                        <td>
                            <strong>Invoice No:</strong> ${
                                order.invoice_number
                            }<br/>
                            <strong>Date:</strong> ${orderDate}<br/>
                            <strong>Remarks:</strong> ${
                                order.remarks || ""
                            }<br/>
                            <strong>GST IN:</strong> ${order.gst_in || ""}<br/>
                            <strong>Salesman:</strong> ${order.user?.name || ""}
                        </td>
                    </tr>
                </table>

                <table>
                    <thead>
                        <tr>
                            <th>Sl No</th>
                            <th>Item Code</th>
                            <th>HSN Code</th>
                            <th>Store Items Name</th>
                            <th>Unit Price</th>
                            <th>Qty</th>
                            <th>Amount</th>
                            <th>GST</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>${itemsRows}</tbody>
                </table>

                <table class="no-border" style="margin-top:10px;">
                    <tr><td>Total Before TAX</td><td style="text-align:right;">${formatCurrency(
                        order.subtotal
                    )}</td></tr>
                    <tr><td>CGST</td><td style="text-align:right;">${
                        order.cgst || "0.00"
                    }</td></tr>
                    <tr><td>SGST</td><td style="text-align:right;">${
                        order.sgst || "0.00"
                    }</td></tr>
                    <tr class="summary"><td>Bill Total</td><td style="text-align:right;">${formatCurrency(
                        order.total
                    )}</td></tr>
                    <tr class="summary"><td>Net Total</td><td style="text-align:right;">${formatCurrency(
                        order.total
                    )}</td></tr>
                </table>

                ${
                    paymentsRows
                        ? `<h3>Payments</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>${paymentsRows}</tbody>
                        </table>`
                        : ""
                }

                <div class="footer"><p>Thank you for shopping with us!</p></div>
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
        printWindow.focus();
        printWindow.onafterprint = () => printWindow.close();
        printWindow.print();
    };
}
