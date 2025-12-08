import{r as n,j as e,$ as A,Y as F}from"./app-DNbblsqy.js";import{P as $}from"./ProductCard-B2t_7k0I.js";import{A as I}from"./AppLayout-DC81hHP1.js";import{d as z,e as S,f as P,g as H,h as T,i as D,j as G}from"./index-BptU9ig5.js";import{d as M,e as V}from"./index-DWCw532r.js";import{C as Y,B as i}from"./Image-B2guXFiL.js";import{B as u}from"./Breadcrumb-DOS15yDJ.js";import{R as j,I as B,D as d}from"./Footer-CBvjFA-K.js";import{C as h,F as g}from"./Form-DcjuL28X.js";import{C as o}from"./Card-wc2ewD_Z.js";import{B as _}from"./Badge--WidTIWd.js";import"./helpers-Ccy-920w.js";import"./index-BWoVzFCU.js";import"./iconBase-DBBNSjAs.js";import"./AddToCartBtn-ww7s26gB.js";/* empty css                      */import"./useData-IxntDvy9.js";import"./ListGroup-BzCcJdyU.js";import"./CloseButton-CmQ7BlHL.js";function he({category:r}){var w,y,C;const[t,f]=n.useState("grid"),[x,L]=n.useState("featured"),[b,p]=n.useState([0,1e3]),[N,R]=n.useState(!1),[Q,U]=n.useState(!1),[c,m]=n.useState(""),a=[...((w=r==null?void 0:r.products)==null?void 0:w.filter(s=>{var l;return s.name.toLowerCase().includes(c.toLowerCase())||((l=s.description)==null?void 0:l.toLowerCase().includes(c.toLowerCase()))}))||[]].sort((s,l)=>{switch(x){case"price-low":return s.price-l.price;case"price-high":return l.price-s.price;case"rating":return l.rating-s.rating;case"newest":return new Date(l.created_at)-new Date(s.created_at);default:return 0}}),v=[{value:"featured",label:"Featured"},{value:"newest",label:"Newest Arrivals"},{value:"price-low",label:"Price: Low to High"},{value:"price-high",label:"Price: High to Low"},{value:"rating",label:"Highest Rated"}];return e.jsxs(I,{children:[e.jsx(A,{title:r.name.toUpperCase()}),e.jsxs(Y,{fluid:!0,className:"py-4",children:[e.jsxs(u,{className:"mb-4",children:[e.jsx(u.Item,{linkAs:F,linkProps:{href:"/"},children:"Home"}),e.jsx(u.Item,{active:!0,className:"text-capitalize fw-semibold",children:r.name})]}),((y=r==null?void 0:r.children)==null?void 0:y.length)>0&&e.jsxs("div",{className:"mb-5",children:[e.jsxs("h3",{className:"h5 mb-3 d-flex align-items-center",children:[e.jsx(z,{className:"me-2"}),"Shop by Sub-category"]}),e.jsx(j,{className:"g-3",children:r.children.map(s=>e.jsx(h,{xs:6,sm:4,md:3,lg:2,children:e.jsx(F,{href:`/category/${s.slug}`,className:"text-decoration-none",children:e.jsxs(o,{className:"subcategory-card h-100 border-0 shadow-sm hover-lift transition-all",children:[e.jsxs("div",{className:"position-relative overflow-hidden rounded-top",children:[e.jsx(o.Img,{variant:"top",src:`/${s.image}`,alt:s.name,className:"transition-transform",style:{height:"120px",objectFit:"cover"}}),e.jsx("div",{className:"card-overlay"})]}),e.jsxs(o.Body,{className:"text-center py-3",children:[e.jsx("h6",{className:"mb-0 fw-semibold text-dark",children:s.name}),e.jsxs("small",{className:"text-muted",children:[s.product_count||0," ","items"]})]})]})})},s.id))})]}),e.jsxs("div",{className:"d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4",children:[e.jsxs("div",{className:"mb-3 mb-md-0",children:[e.jsx("h2",{className:"h3 mb-1",children:"All Products"}),e.jsx("p",{className:"text-muted mb-0",children:e.jsxs(_,{bg:"light",text:"dark",className:"fw-normal",children:[(a==null?void 0:a.length)||0," products found"]})})]}),e.jsxs("div",{className:"d-flex flex-wrap gap-3",children:[e.jsxs(B,{className:"search-box",style:{width:"250px"},children:[e.jsx(B.Text,{className:"bg-white border-end-0",children:e.jsx(S,{className:"text-muted"})}),e.jsx(g.Control,{placeholder:"Search in category...",value:c,onChange:s=>m(s.target.value),className:"border-start-0"}),c&&e.jsx(i,{variant:"light",onClick:()=>m(""),className:"border-start-0",children:e.jsx(P,{})})]}),e.jsxs(d,{className:"me-2",children:[e.jsxs(d.Toggle,{variant:"light",className:"d-flex align-items-center",children:[e.jsx(H,{className:"me-2"}),"Sort:"," ",(C=v.find(s=>s.value===x))==null?void 0:C.label]}),e.jsx(d.Menu,{children:v.map(s=>e.jsx(d.Item,{active:x===s.value,onClick:()=>L(s.value),children:s.label},s.value))})]}),e.jsxs("div",{className:"btn-group",role:"group",children:[e.jsx(i,{variant:t==="grid"?"primary":"light",onClick:()=>f("grid"),className:"d-flex align-items-center",children:e.jsx(M,{})}),e.jsx(i,{variant:t==="list"?"primary":"light",onClick:()=>f("list"),className:"d-flex align-items-center",children:e.jsx(V,{})})]}),e.jsxs(i,{variant:"outline-primary",onClick:()=>R(!N),className:"d-md-none",children:[e.jsx(T,{className:"me-1"}),"Filters"]})]})]}),e.jsxs(j,{children:[e.jsx(h,{lg:3,className:`mb-4 ${N?"d-block":"d-none d-lg-block"}`,children:e.jsxs(o,{style:{top:"20px"},children:[e.jsx(o.Header,{className:"bg-white border-bottom",children:e.jsxs("h5",{className:"mb-0 d-flex align-items-center",children:[e.jsx(D,{className:"me-2"}),"Filters"]})}),e.jsxs(o.Body,{children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("h6",{className:"mb-3",children:"Price Range"}),e.jsx(g.Range,{min:"0",max:"5000",step:"50",value:b[1],onChange:s=>p([0,parseInt(s.target.value)])}),e.jsxs("div",{className:"d-flex justify-content-between mt-2",children:[e.jsx("small",{className:"text-muted",children:"$0"}),e.jsxs("small",{className:"text-muted",children:["$",b[1],"+"]})]})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("h6",{className:"mb-3",children:"Customer Rating"}),[4,3,2,1].map(s=>e.jsx(g.Check,{type:"checkbox",id:`rating-${s}`,label:e.jsxs("div",{className:"d-flex align-items-center",children:[[...Array(5)].map((l,k)=>e.jsx(G,{className:`me-1 ${k<s?"text-warning fill":"text-muted"}`,size:14},k)),e.jsx("span",{className:"ms-2",children:"& above"})]}),className:"mb-2"},s))]}),e.jsx(i,{variant:"outline-secondary",size:"sm",className:"w-100",onClick:()=>{p([0,1e3]),m("")},children:"Clear All Filters"})]})]})}),e.jsxs(h,{lg:9,children:[(a==null?void 0:a.length)>0?e.jsx(j,{className:"g-4",children:a.map(s=>e.jsx(h,{xs:t==="list"?12:6,md:t==="list"?12:4,lg:t==="list"?12:3,xl:t==="list"?12:t==="grid"?3:2,children:e.jsx($,{item:s,viewMode:t,showRating:!0,showQuickView:!0,showAddToCart:!0,showWishlist:!0})},s.id))}):e.jsxs("div",{className:"text-center py-5",children:[e.jsx("div",{className:"mb-4",children:e.jsx(S,{size:64,className:"text-muted opacity-50"})}),e.jsx("h4",{className:"mb-3",children:"No products found"}),e.jsx("p",{className:"text-muted mb-4",children:"Try adjusting your search or filter to find what you're looking for."}),e.jsx(i,{variant:"outline-primary",onClick:()=>{m(""),p([0,1e3])},children:"Clear All Filters"})]}),(a==null?void 0:a.length)>0&&e.jsx("div",{className:"text-center mt-5",children:e.jsx(i,{variant:"outline-primary",size:"lg",className:"px-5",children:"Load More Products"})})]})]})]}),e.jsx("style",{jsx:!0,children:`
                .category-hero {
                    background: linear-gradient(
                        135deg,
                        #667eea 0%,
                        #764ba2 100%
                    );
                    position: relative;
                    overflow: hidden;
                }

                .hero-wave {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    overflow: hidden;
                    line-height: 0;
                }

                .hero-wave svg {
                    position: relative;
                    display: block;
                    width: calc(100% + 1.3px);
                    height: 50px;
                    transform: rotate(180deg);
                }

                .hero-wave path {
                    fill: #ffffff;
                }

                .subcategory-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
                }

                .subcategory-card:hover img {
                    transform: scale(1.05);
                }

                .transition-all {
                    transition: all 0.3s ease;
                }

                .hover-lift:hover {
                    transform: translateY(-5px);
                }

                .card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        to bottom,
                        transparent 50%,
                        rgba(0, 0, 0, 0.1)
                    );
                }

                .rotate-270 {
                    transform: rotate(270deg);
                }

                .search-box {
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    border-radius: 8px;
                }

                .fill {
                    fill: currentColor;
                }

                @media (max-width: 768px) {
                    .category-hero {
                        padding: 3rem 0 !important;
                    }

                    .category-hero h1 {
                        font-size: 2rem !important;
                    }
                }
            `})]})}export{he as default};
