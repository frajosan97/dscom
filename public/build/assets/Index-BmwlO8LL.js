import{r as y,j as s,$ as D,Y as j}from"./app-CcdzEu0R.js";import{y as C}from"./Footer-4Livvlxt.js";import{d as E,e as I}from"./index-BMkeTrLY.js";import{E as _}from"./ErpLayout-u_y7Ersr.js";import{f as o}from"./helpers-B9XmgPRl.js";import{C as c}from"./Card-CSAU_t4j.js";import{B as A}from"./ButtonGroup-CEgI5t_N.js";import{B as w}from"./Image-D_GvnDn_.js";import{T as z}from"./Table-D-OHgQ10.js";import"./CloseButton-Bv_xupVB.js";import"./Form-CLPTCCgE.js";import"./iconBase-CciruWzR.js";/* empty css                      */function Q(){const m=y.useCallback(()=>($.fn.DataTable.isDataTable("#salesTable")&&$("#salesTable").DataTable().destroy(),$("#salesTable").DataTable({processing:!0,serverSide:!0,ajax:{url:route("sales.index"),type:"GET",error:a=>{var n;C.error(((n=a.responseJSON)==null?void 0:n.message)||"Failed to load sales")}},columns:[{data:"id",title:"No",render:function(a,n,i,l){return l.row+l.settings._iDisplayStart+1}},{data:"created_at",title:"Date",render:function(a){return new Date(a).toLocaleDateString()}},{data:"invoice_number",title:"Invoice No"},{data:"order_number",title:"Order No"},{data:"customer",title:"Customer",className:"text-capitalize"},{data:"items_count",title:"No of Items",render:function(a,n,i){return a||0}},{data:"total",title:"Total",className:"text-end fw-semibold",render:function(a){return o(a)}},{data:"user.full_name",title:"Cashier",defaultContent:"N/A"},{data:"action",title:"Actions",orderable:!1,searchable:!1}],order:[[3,"desc"]],drawCallback:function(){$(".print-btn").off("click").on("click",function(){const a=$(this).data("data");T(a)})},createdRow:function(a,n,i){$(a).find("td:not(:last-child)").css("cursor","pointer")}})),[]);y.useEffect(()=>{const t=m();return()=>{$.fn.DataTable.isDataTable("#salesTable")&&t.destroy()}},[m]);const T=t=>{var g,p,u,b,f,x;const i=window.screen.width/2-450,l=window.screen.height/2-700/2,r=window.open("","Print Receipt",`width=900,height=700,left=${i},top=${l},resizable=yes,scrollbars=yes`),N="/storage/images/logos/logo.png",v=new Date(t.created_at).toLocaleString(),S=t.items.map((e,d)=>`
            <tr>
                <td>${d+1}</td>
                <td>${e.id||""}</td>
                <td>${e.hsn_code||"none"}</td>
                <td>${e.product_name}</td>
                <td style="text-align:right;">${o(e.price)}</td>
                <td style="text-align:center;">${e.quantity}</td>
                <td style="text-align:right;">${o(e.price*e.quantity)}</td>
                <td style="text-align:center;">${e.gst||"0%"}</td>
                <td style="text-align:right;">${o(e.price*e.quantity)}</td>
            </tr>`).join(""),h=((g=t==null?void 0:t.payments)==null?void 0:g.map((e,d)=>`
            <tr>
                <td>${d+1}</td>
                <td>${e.payment_method_name}</td>
                <td style="text-align:right;">${o(e.amount)}</td>
                <td>${new Date(e.created_at).toLocaleDateString()}</td>
            </tr>`).join(""))||"";r.document.write(`
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
                    <!-- Header -->
                    <div class="header">
                        <div>
                            <img src="${N}" alt="Logo" />
                        </div>
                        <div class="company">
                            <h2>DSCOM Technologies Ltd</h2>
                            <p>Tell: +243 (894) 779-059</p>
                            <p>Email: info@dscomtechnologies.com</p>
                            <p>Avenue Du Tchad, No.7 IMMEUBLE RENAISSANCE, Local 6<br />Ref. Opposite EQUITY BCDC HEAD OFFICE</p>
                        </div>
                    </div>

                    <!-- Title -->
                    <div class="title">Sales Receipt</div>

                    <!-- Customer & Invoice Info -->
                    <table>
                        <tr>
                            <td>
                                <strong>Name:</strong> ${((p=t.customer)==null?void 0:p.name)||""}<br/>
                                <strong>Phone:</strong> ${((u=t.customer)==null?void 0:u.phone)||""}<br/>
                                <strong>Address:</strong> ${((b=t.customer)==null?void 0:b.address)||""}<br/>
                                <strong>Other Information:</strong> ${((f=t.customer)==null?void 0:f.info)||""}
                            </td>
                            <td>
                                <strong>Invoice No:</strong> ${t.invoice_number}<br/>
                                <strong>Date:</strong> ${v}<br/>
                                <strong>Remarks:</strong> ${t.remarks||""}<br/>
                                <strong>GST IN:</strong> ${t.gst_in||""}<br/>
                                <strong>Salesman:</strong> ${((x=t.user)==null?void 0:x.name)||""}
                            </td>
                        </tr>
                    </table>

                    <!-- Items -->
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
                        <tbody>
                            ${S}
                        </tbody>
                    </table>

                    <!-- Totals -->
                    <table class="no-border" style="margin-top:10px;">
                        <tr><td>Total Before TAX</td><td style="text-align:right;">${o(t.subtotal)}</td></tr>
                        <tr><td>CGST</td><td style="text-align:right;">${t.cgst||"0.00"}</td></tr>
                        <tr><td>SGST</td><td style="text-align:right;">${t.sgst||"0.00"}</td></tr>
                        <tr class="summary"><td>Bill Total</td><td style="text-align:right;">${o(t.total)}</td></tr>
                        <tr class="summary"><td>Net Total</td><td style="text-align:right;">${o(t.total)}</td></tr>
                    </table>

                    <!-- Payments -->
                    ${h?`<h3>Payments</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Method</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>${h}</tbody>
                            </table>`:""}

                    <div class="footer">
                        <p>Thank you for shopping with us!</p>
                    </div>
                </body>
            </html>
        `),r.document.close(),r.onload=()=>{r.focus(),r.onafterprint=()=>{r.close()},r.print()}};return s.jsxs(_,{children:[s.jsx(D,{title:"Sales Management"}),s.jsxs(c,{className:"border-0 rounded-0 shadow-sm",children:[s.jsxs(c.Header,{className:"d-flex justify-content-between align-items-center bg-transparent",children:[s.jsx("h6",{className:"mb-0 fw-semibold",children:"Sales Management"}),s.jsxs(A,{className:"gap-1",children:[s.jsxs(w,{variant:"primary",size:"sm",className:"rounded-0",children:[s.jsx(E,{size:16,className:"me-1"}),"Export Excel"]}),s.jsxs(w,{variant:"success",size:"sm",className:"rounded-0",as:j,href:route("sales.create"),children:[s.jsx(I,{size:16,className:"me-1"}),"New Sale"]})]})]}),s.jsx(c.Body,{className:"px-0",children:s.jsx(z,{bordered:!0,striped:!0,hover:!0,responsive:!0,id:"salesTable"})})]})]})}export{Q as default};
