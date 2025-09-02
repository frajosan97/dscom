import{f as o}from"./helpers-BIQDmtTa.js";function v(t,a={}){var h,g,c,m,p,y;const d=a.width||900,r=a.height||700,b=window.screen.width/2-d/2,$=window.screen.height/2-r/2,n=window.open("","Print Receipt",`width=${d},height=${r},left=${b},top=${$},resizable=yes,scrollbars=yes`),x=a.logoUrl||"/storage/images/logos/logo.png",s=a.company||{name:"DSCOM Technologies Ltd",phone:"+243 (894) 779-059",email:"info@dscomtechnologies.com",address:"Avenue Du Tchad, No.7 IMMEUBLE RENAISSANCE, Local 6<br />Ref. Opposite EQUITY BCDC HEAD OFFICE"},f=new Date(t.created_at).toLocaleString(),u=t.items.map((e,i)=>`
        <tr>
            <td>${i+1}</td>
            <td>${e.id||""}</td>
            <td>${e.hsn_code||"none"}</td>
            <td>${e.product_name}</td>
            <td style="text-align:right;">${o(e.price)}</td>
            <td style="text-align:center;">${e.quantity}</td>
            <td style="text-align:right;">${o(e.price*e.quantity)}</td>
            <td style="text-align:center;">${e.gst||"0%"}</td>
            <td style="text-align:right;">${o(e.price*e.quantity)}</td>
        </tr>`).join(""),l=((h=t==null?void 0:t.payments)==null?void 0:h.map((e,i)=>`
        <tr>
            <td>${i+1}</td>
            <td>${e.payment_method_name}</td>
            <td style="text-align:right;">${o(e.amount)}</td>
            <td>${new Date(e.created_at).toLocaleDateString()}</td>
        </tr>`).join(""))||"";n.document.write(`
        <html>
            <head>
                <title>Invoice ${t.invoice_number}</title>
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
                    <div><img src="${x}" alt="Logo" /></div>
                    <div class="company">
                        <h2>${s.name}</h2>
                        <p>Tel: ${s.phone}</p>
                        <p>Email: ${s.email}</p>
                        <p>${s.address}</p>
                    </div>
                </div>

                <div class="title">Sales Receipt</div>

                <table>
                    <tr>
                        <td>
                            <strong>Name:</strong> ${((g=t.customer)==null?void 0:g.name)||""}<br/>
                            <strong>Phone:</strong> ${((c=t.customer)==null?void 0:c.phone)||""}<br/>
                            <strong>Address:</strong> ${((m=t.customer)==null?void 0:m.address)||""}<br/>
                            <strong>Other Information:</strong> ${((p=t.customer)==null?void 0:p.info)||""}
                        </td>
                        <td>
                            <strong>Invoice No:</strong> ${t.invoice_number}<br/>
                            <strong>Date:</strong> ${f}<br/>
                            <strong>Remarks:</strong> ${t.remarks||""}<br/>
                            <strong>GST IN:</strong> ${t.gst_in||""}<br/>
                            <strong>Salesman:</strong> ${((y=t.user)==null?void 0:y.name)||""}
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
                    <tbody>${u}</tbody>
                </table>

                <table class="no-border" style="margin-top:10px;">
                    <tr><td>Total Before TAX</td><td style="text-align:right;">${o(t.subtotal)}</td></tr>
                    <tr><td>CGST</td><td style="text-align:right;">${t.cgst||"0.00"}</td></tr>
                    <tr><td>SGST</td><td style="text-align:right;">${t.sgst||"0.00"}</td></tr>
                    <tr class="summary"><td>Bill Total</td><td style="text-align:right;">${o(t.total)}</td></tr>
                    <tr class="summary"><td>Net Total</td><td style="text-align:right;">${o(t.total)}</td></tr>
                </table>

                ${l?`<h3>Payments</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>${l}</tbody>
                        </table>`:""}

                <div class="footer"><p>Thank you for shopping with us!</p></div>
            </body>
        </html>
    `),n.document.close(),n.onload=()=>{n.focus(),n.onafterprint=()=>n.close(),n.print()}}export{v as p};
