import{a as r}from"./helpers-BvGx6l4I.js";function b(t,n={}){var a;const s=n.width||900,d=n.height||700,i=window.screen.width/2-s/2,l=window.screen.height/2-d/2,e=window.open("","Print Receipt",`width=${s},height=${d},left=${i},top=${l},resizable=yes,scrollbars=yes`),c=new Date(t.created_at).toLocaleDateString(),p=new Date(t.created_at).toLocaleTimeString(),g=t.items.map(o=>`
        <tr>
            <td>${o.product_name}</td>
            <td style="text-align:center;">${o.quantity}</td>
            <td style="text-align:right;">${r(o.price)}</td>
            <td style="text-align:right;">${r(o.price*o.quantity)}</td>
        </tr>`).join("");e.document.write(`
        <html>
            <head>
                <title>Receipt ${t.invoice_number}</title>
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
                    <h3>RCCM: ${t.rccm||"16-A-4685"}</h3>
                    <h3>NIF: ${t.nif||"01622682Y"}</h3>
                </div>

                <table>
                    <tr>
                        <td><strong>Date:</strong> ${c}</td>
                        <td><strong>Heure:</strong> ${p}</td>
                    </tr>
                    <tr>
                        <td><strong>Fact. N°:</strong> ${t.invoice_number}</td>
                        <td><strong>Credit</strong></td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Client:</strong> ${((a=t.customer)==null?void 0:a.name)||""}</td>
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
                    <tbody>${g}</tbody>
                </table>

                <table class="summary" style="margin-top:10px; width:100%;">
                    <tr class="border-top"><td><strong>T.Fac :</strong></td><td style="text-align:right;">USD ${r(t.subtotal)}</td></tr>
                    <tr class="border-top"><td><strong>Remise :</strong></td><td style="text-align:right;">${t.discount||"0.00"}</td></tr>
                    <tr class="border-top"><td><strong>T.NET :</strong></td><td style="text-align:right;">USD ${r(t.total)}</td></tr>
                    <tr class="border-top border-bottom"><td><strong>Ancien Solde :</strong></td><td style="text-align:right;">${r(t.previous_balance||0)}</td></tr>
                </table>

                <div class="footer">
                    <p>LES MARCHANDISES VENDUES NE SONT NI REPRISES NI ECHANGEES</p>
                </div>
            </body>
        </html>
    `),e.document.close(),e.onload=()=>{e.focus(),e.onafterprint=()=>e.close(),e.print()}}export{b as p};
