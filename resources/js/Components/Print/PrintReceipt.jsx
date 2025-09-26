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

    const orderDate = new Date(order.created_at).toLocaleDateString();
    const orderTime = new Date(order.created_at).toLocaleTimeString();

    // Items
    const itemsRows = order.items
        .map(
            (item) => `
        <tr>
            <td>${item.product_name}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">${formatCurrency(item.price)}</td>
            <td style="text-align:right;">${formatCurrency(
                item.price * item.quantity
            )}</td>
        </tr>`
        )
        .join("");

    // Inject HTML
    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt ${order.invoice_number}</title>
                <style>
                    body { font-family: 'DejaVu Sans', sans-serif; margin: 15px; font-size: 12pt; color: #333; }
                    .header { text-align: center; margin-bottom: 10px; }
                    .header h2, .header h3 { margin: 2px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .border-top {border-top: 1px solid #000; }
                    .border-bottom {border-bottom: 1px solid #000; }
                    .padding-top-bottom { padding: 5px 0; }
                    .summary td { border: none; padding: 5px; font-size: 11pt; }
                    .footer { margin-top: 15px; text-align: center; font-size: 10pt; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h3>RCCM: ${order.rccm || "16-A-4685"}</h3>
                    <h3>NIF: ${order.nif || "01622682Y"}</h3>
                </div>

                <table>
                    <tr>
                        <td><strong>Date:</strong> ${orderDate}</td>
                        <td><strong>Heure:</strong> ${orderTime}</td>
                    </tr>
                    <tr>
                        <td><strong>Fact. N°:</strong> ${
                            order.invoice_number
                        }</td>
                        <td><strong>Credit</strong></td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Client:</strong> ${
                            order.customer?.name || ""
                        }</td>
                    </tr>
                </table>

                <table>
                    <thead class="border-top border-bottom">
                        <tr>
                            <th class="padding-top-bottom" style="text-align:left;">Produit</th>
                            <th class="padding-top-bottom">Qté</th>
                            <th class="padding-top-bottom">Prix</th>
                            <th class="padding-top-bottom">Total</th>
                        </tr>
                    </thead>
                    <tbody>${itemsRows}</tbody>
                </table>

                <table class="summary" style="margin-top:10px; width:100%;">
                    <tr class="border-top"><td><strong>T.Fac :</strong></td><td style="text-align:right;">USD ${formatCurrency(
                        order.subtotal
                    )}</td></tr>
                    <tr class="border-top"><td><strong>Remise :</strong></td><td style="text-align:right;">${
                        order.discount || "0.00"
                    }</td></tr>
                    <tr class="border-top"><td><strong>T.NET :</strong></td><td style="text-align:right;">USD ${formatCurrency(
                        order.total
                    )}</td></tr>
                    <tr class="border-top border-bottom"><td><strong>Ancien Solde :</strong></td><td style="text-align:right;">${formatCurrency(
                        order.previous_balance || 0
                    )}</td></tr>
                </table>

                <div class="footer">
                    <p>LES MARCHANDISES VENDUES NE SONT NI REPRISES NI ECHANGEES</p>
                </div>
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
