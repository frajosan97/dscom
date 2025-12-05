import{j as s,Y as w}from"./app-Bf6XjMin.js";import{a as c}from"./helpers-BvGx6l4I.js";import{s as o,t as b,g as _}from"./index-Bpn9xGpQ.js";import{A as y}from"./AddToCartBtn-wPVb4L2L.js";import{C as a}from"./Card-BnYslkqX.js";import{B as r}from"./Badge-CKPVm74Y.js";function E({product:e,systemMode:d=null,showCategory:x=!1,showStockStatus:p=!1,showActions:N=!0,className:h="",...g}){const n=()=>!e.compare_price||e.compare_price<=e.base_price?0:Math.round((e.compare_price-e.base_price)/e.compare_price*100),f=()=>{var t,i;return(t=e.default_image)!=null&&t.image_path?`/storage/${e.default_image.image_path}`:((i=e.images)==null?void 0:i.length)>0?`/storage/${e.images[0].image_path}`:"/images/default-product.jpg"},j=()=>e.is_active?!e.is_in_stock&&!e.allow_backorders?{text:"Out of Stock",variant:"danger"}:e.is_on_sale?{text:"On Sale",variant:"danger"}:e.is_new?{text:"New",variant:"success"}:null:{text:"Inactive",variant:"secondary"},v=()=>{d==="erp"&&router.visit(route("product.edit",e.id))};return d==="erp"?(()=>{var t,i;return s.jsxs(a,{className:`h-100 product-card erp-mode border ${h}`,onClick:v,role:"button",tabIndex:0,...g,children:[s.jsxs("div",{className:"position-relative overflow-hidden",children:[s.jsx("div",{className:"product-image-wrapper",style:{height:"150px"},children:s.jsx(a.Img,{src:f(),alt:e.name,className:"product-image h-100 w-100 object-fit-cover",loading:"lazy"})}),s.jsx("div",{className:"position-absolute top-0 end-0 m-2",children:s.jsx(r,{bg:((t=j())==null?void 0:t.variant)||"light",className:"text-uppercase",pill:!0,children:((i=j())==null?void 0:i.text)||"Active"})})]}),s.jsxs(a.Body,{className:"d-flex flex-column p-3",children:[x&&e.category&&s.jsx("small",{className:"text-muted text-uppercase mb-1",children:e.category.name}),s.jsx(a.Title,{className:"product-name fs-6 fw-semibold mb-2 text-truncate",title:e.name,children:e.name}),s.jsxs("div",{className:"mb-2",children:[e.sku&&s.jsxs("small",{className:"text-muted d-block",children:["SKU: ",e.sku]}),p&&s.jsxs("div",{className:"d-flex align-items-center gap-2 mt-1",children:[s.jsx("span",{className:`badge bg-${e.is_in_stock?"success":"danger"}`,children:e.is_in_stock?"In Stock":"Out of Stock"}),e.track_quantity&&s.jsxs("small",{className:"text-muted",children:["Qty: ",e.total_quantity||0]})]})]}),s.jsxs("div",{className:"mt-auto",children:[s.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-2",children:[s.jsxs("div",{children:[s.jsx("div",{className:"fs-5 fw-bold text-primary",children:c(e.base_price)}),e.cost_per_item&&s.jsxs("small",{className:"text-muted",children:["Cost:"," ",c(e.cost_per_item)]})]}),n()>0&&s.jsxs(r,{bg:"danger",className:"fs-6",children:["-",n(),"%"]})]}),s.jsxs("div",{className:"d-flex justify-content-between small text-muted",children:[s.jsxs("div",{children:[s.jsx(o,{className:"text-warning"})," ",e.rating||"N/A"]}),s.jsxs("div",{children:[s.jsx(b,{className:"me-1"})," ",e.views||0]}),s.jsxs("div",{children:[s.jsx(_,{className:"me-1"})," ",e.sold_count||0]})]})]})]})]})})():(()=>{var t,i;return s.jsxs(a,{className:`h-100 text-capitalize product-card storefront-mode border-0 shadow-sm hover-shadow transition-all ${h}`,...g,children:[s.jsxs(w,{href:route("product.show",e.slug),className:"text-decoration-none text-dark",children:[s.jsxs("div",{className:"position-relative overflow-hidden",children:[s.jsxs("div",{className:"product-image-wrapper",style:{height:"200px"},children:[s.jsx(a.Img,{src:f(),alt:e.name,className:"product-image h-100 w-100 object-fit-cover transition-transform",loading:"lazy"}),s.jsx("div",{className:"product-overlay position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 hover-bg-opacity-75 transition-all d-flex align-items-center justify-content-center",children:s.jsx(b,{className:"text-white fs-4 opacity-0 hover-opacity-100 transition-all"})})]}),s.jsxs("div",{className:"position-absolute top-0 start-0 m-2 d-flex flex-column gap-1",children:[e.is_new&&s.jsx(r,{bg:"success",className:"shadow-sm",children:"New"}),e.is_bestseller&&s.jsxs(r,{bg:"danger",className:"shadow-sm",children:[s.jsx(o,{className:"me-1"})," Bestseller"]}),n()>0&&s.jsxs(r,{bg:"info",className:"shadow-sm",children:[n(),"% OFF"]})]})]}),s.jsxs(a.Body,{className:"p-3",children:[x&&e.category&&s.jsx("small",{className:"text-muted text-uppercase d-block mb-1",children:e.category.name}),s.jsx(a.Title,{className:"product-name fs-6 fw-semibold mb-2 text-truncate",title:e.name,children:e.name}),e.short_description&&s.jsx(a.Text,{className:"text-muted small mb-2 line-clamp-2",children:e.short_description}),(e.sizes||e.colors)&&s.jsxs("div",{className:"d-flex gap-1 mb-3",children:[(t=e.sizes)==null?void 0:t.slice(0,3).map((l,m)=>s.jsx(r,{bg:"light",text:"dark",className:"border",children:l},`size-${m}`)),(i=e.colors)==null?void 0:i.slice(0,3).map((l,m)=>s.jsx(r,{bg:l.toLowerCase(),text:l.toLowerCase()==="white"?"dark":"white",className:"border",style:{backgroundColor:l},children:l},`color-${m}`))]}),s.jsxs("div",{className:"d-flex align-items-center justify-content-between mb-3",children:[s.jsxs("div",{children:[s.jsx("div",{className:"fs-5 fw-bold text-primary",children:c(e.base_price)}),e.compare_price&&e.compare_price>e.base_price&&s.jsx("del",{className:"text-muted small",children:c(e.compare_price)})]}),e.rating&&s.jsxs("div",{className:"d-flex align-items-center",children:[s.jsx(o,{className:"text-warning me-1"}),s.jsx("span",{className:"small",children:e.rating})]})]})]})]}),N&&s.jsx(a.Footer,{className:"border-0 bg-transparent p-3 pt-0",children:s.jsx(y,{product:e,variant:"primary",className:"w-100",size:"sm"})})]})})()}const u=`
    .product-card {
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .product-image {
        transition: transform 0.3s;
    }
    
    .product-card:hover .product-image {
        transform: scale(1.05);
    }
    
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .hover-shadow {
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .hover-shadow:hover {
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
`;if(typeof document<"u"){const e=document.createElement("style");e.textContent=u,document.head.appendChild(e)}export{E as P};
