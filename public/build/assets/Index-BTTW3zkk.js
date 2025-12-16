import{q as I,r as h,j as e,$ as R,Y as k}from"./app-CG0rYmwP.js";import{y as A,D as r}from"./Footer-CVrb9yvl.js";import{l as C,u as F}from"./index-CkxFe3AD.js";import{f as M,a as s}from"./helpers-D52D6J_C.js";import{E as B}from"./ErpLayout-lZW-50vv.js";import{C as u}from"./Card-CewoDW1c.js";import{B as z}from"./ButtonGroup-C8dF5zH6.js";import{B as L}from"./Image-DOSiFVRD.js";import{T as U}from"./Table-DxO-cu9g.js";import"./CloseButton-BDXCjQ_i.js";import"./Form-DBT1bdVP.js";import"./iconBase-JZvYHVIv.js";/* empty css                      */function at(){const{statusOptions:c,priorityOptions:m}=I().props,[n,b]=h.useState("all"),[o,x]=h.useState("all"),f=h.useCallback(()=>($.fn.DataTable.isDataTable("#repairOrdersTable")&&$("#repairOrdersTable").DataTable().destroy(),$("#repairOrdersTable").DataTable({processing:!0,serverSide:!0,ajax:{url:route("repair-orders.index"),type:"GET",data:function(a){a.status=n!=="all"?n:"",a.priority=o!=="all"?o:""},error:a=>{var d;A.error(((d=a.responseJSON)==null?void 0:d.message)||"Failed to load repair orders")}},columns:[{data:"order_number",title:"RO #"},{data:"created_at",title:"Date",render:function(a){return M(a)}},{data:"customer.name",title:"Customer"},{data:"device_metadata.brand",title:"Brand",render:function(a){return a||"N/A"}},{data:"device_metadata.model",title:"Model"},{data:"status",title:"Status"},{data:"technician.full_name",title:"Technician"},{data:"total_amount",title:"Total",className:"text-end fw-semibold",render:function(a){return s(a)}},{data:"action",title:"Actions",orderable:!1,searchable:!1}],order:[[0,"desc"]],createdRow:function(a,d,y){$(a).find("td:not(:last-child)").css("cursor","pointer"),$(a).on("click",function(p){$(p.target).closest("button, a").length||(window.location=route("repair-orders.show",d.id))})},drawCallback:function(){$(".print-btn").off("click").on("click",function(){const a=$(this).data("data");S(a)})}})),[n,o]);h.useEffect(()=>{const t=f();return()=>{$.fn.DataTable.isDataTable("#repairOrdersTable")&&t.destroy()}},[f,n,o]);const S=t=>{var w,T,v,_,D,N;const y=window.screen.width/2-450,p=window.screen.height/2-700/2,l=window.open("","Print Repair Invoice",`width=900,height=700,left=${y},top=${p},resizable=yes,scrollbars=yes`),E="/storage/images/logos/logo.png",O=new Date(t.created_at).toLocaleString(),P=((w=t==null?void 0:t.parts)==null?void 0:w.map((i,g)=>`
                    <tr>
                        <td>${g+1}</td>
                        <td>${i.part_name}</td>
                        <td>${i.part_number||"-"}</td>
                        <td style="text-align:right;">${s(i.selling_price)}</td>
                        <td style="text-align:center;">${i.quantity}</td>
                        <td style="text-align:right;">${s(i.total)}</td>
                    </tr>`).join(""))||"",j=((T=t==null?void 0:t.payments)==null?void 0:T.map((i,g)=>`
                <tr>
                    <td>${g+1}</td>
                    <td>${i.payment_method}</td>
                    <td style="text-align:right;">${s(i.amount)}</td>
                    <td>${new Date(i.payment_date).toLocaleDateString()}</td>
                </tr>`).join(""))||"";l.document.write(`
            <html>
                <head>
                    <title>Repair Invoice ${t.invoice_number||t.order_number}</title>
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
                            <img src="${E}" alt="Logo" />
                        </div>
                        <div class="company">
                            <h2>DSCOM Technologies Ltd</h2>
                            <p>Tell: +243 (894) 779-059</p>
                            <p>Email: info@dscomtechnologies.com</p>
                            <p>Avenue Du Tchad, No.7 IMMEUBLE RENAISSANCE, Local 6<br />Opposite EQUITY BCDC HEAD OFFICE</p>
                        </div>
                    </div>

                    <!-- Title -->
                    <div class="title">Repair Invoice</div>

                    <!-- Customer & Order Info -->
                    <table>
                        <tr>
                            <td>
                                <strong>Name:</strong> ${((v=t.customer)==null?void 0:v.name)||""}<br/>
                                <strong>Phone:</strong> ${((_=t.customer)==null?void 0:_.phone)||""}<br/>
                                <strong>Email:</strong> ${((D=t.customer)==null?void 0:D.email)||""}<br/>
                                <strong>Device:</strong> ${t.device_brand||""} ${t.device_model||""}<br/>
                                <strong>Serial:</strong> ${t.device_serial||""}
                            </td>
                            <td>
                                <strong>Invoice No:</strong> ${t.invoice_number||"-"}<br/>
                                <strong>Order No:</strong> ${t.order_number}<br/>
                                <strong>Date:</strong> ${O}<br/>
                                <strong>Status:</strong> ${t.status}<br/>
                                <strong>Technician:</strong> ${((N=t.technician)==null?void 0:N.full_name)||""}
                            </td>
                        </tr>
                    </table>

                    <!-- Services/Parts -->
                    <h3>Parts & Services</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Part Name</th>
                                <th>Part No</th>
                                <th>Unit Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${P||"<tr><td colspan='6' style='text-align:center;'>No parts added</td></tr>"}
                        </tbody>
                    </table>

                    <!-- Totals -->
                    <table class="no-border" style="margin-top:10px;">
                        <tr><td>Diagnosis Fee</td><td style="text-align:right;">${s(t.diagnosis_fee||0)}</td></tr>
                        <tr><td>Estimated Cost</td><td style="text-align:right;">${s(t.estimated_cost||0)}</td></tr>
                        <tr><td>Final Cost</td><td style="text-align:right;">${s(t.final_cost||0)}</td></tr>
                        <tr><td>Tax</td><td style="text-align:right;">${s(t.tax_amount||0)}</td></tr>
                        <tr><td>Discount</td><td style="text-align:right;">${s(t.discount_amount||0)}</td></tr>
                        <tr class="summary"><td>Grand Total</td><td style="text-align:right;">${s(t.total_amount||0)}</td></tr>
                        <tr><td>Paid</td><td style="text-align:right;">${s(t.amount_paid||0)}</td></tr>
                        <tr><td>Balance</td><td style="text-align:right;">${s(t.balance_due||0)}</td></tr>
                    </table>

                    <!-- Payments -->
                    ${j?`<h3>Payments</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Method</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>${j}</tbody>
                            </table>`:""}

                    <div class="footer">
                        <p>Thank you for trusting us with your repair!</p>
                    </div>
                </body>
            </html>
        `),l.document.close(),l.onload=()=>{l.focus(),l.onafterprint=()=>{l.close()},l.print()}};return e.jsxs(B,{children:[e.jsx(R,{title:"Repair Orders Management"}),e.jsxs(u,{className:"border-0 rounded-0 shadow-sm",children:[e.jsxs(u.Header,{className:"d-flex justify-content-between align-items-center bg-transparent",children:[e.jsxs("div",{children:[e.jsx("h6",{className:"mb-0 fw-semibold",children:"Repair Orders Management"}),e.jsx("small",{className:"text-muted",children:"Manage all repair orders and track their progress"})]}),e.jsxs(z,{className:"gap-1",children:[e.jsxs(r,{children:[e.jsxs(r.Toggle,{variant:"outline-secondary",size:"sm",className:"rounded-0",children:[e.jsx(C,{className:"me-1"}),"Status:"," ",n==="all"?"All":(c==null?void 0:c[n])||n]}),e.jsxs(r.Menu,{children:[e.jsx(r.Item,{onClick:()=>b("all"),children:"All Statuses"}),e.jsx(r.Divider,{}),Object.entries(c||{}).map(([t,a])=>e.jsx(r.Item,{onClick:()=>b(t),active:n===t,children:a},t))]})]}),e.jsxs(r,{children:[e.jsxs(r.Toggle,{variant:"outline-secondary",size:"sm",className:"rounded-0",children:[e.jsx(C,{className:"me-1"}),"Priority:"," ",o==="all"?"All":(m==null?void 0:m[o])||o]}),e.jsxs(r.Menu,{children:[e.jsx(r.Item,{onClick:()=>x("all"),children:"All Priorities"}),e.jsx(r.Divider,{}),Object.entries(m||{}).map(([t,a])=>e.jsx(r.Item,{onClick:()=>x(t),active:o===t,children:a},t))]})]}),e.jsxs(L,{variant:"success",size:"sm",className:"rounded-0",as:k,href:route("repair-orders.create"),children:[e.jsx(F,{size:16,className:"me-1"}),"New Repair Order"]})]})]}),e.jsx(u.Body,{className:"px-0",children:e.jsx(U,{bordered:!0,striped:!0,hover:!0,responsive:!0,id:"repairOrdersTable",className:"mb-0"})})]})]})}export{at as default};
