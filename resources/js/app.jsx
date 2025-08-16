/******************************************************
 * 🧩 GLOBAL STYLES & VENDOR IMPORTS
 ******************************************************/
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import jquery from "jquery";
import "jquery-validation";
import "jquery-validation/dist/additional-methods";

window.$ = window.jQuery = jquery;

import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

import "../css/app.css";

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { CartProvider } from "./Context/CartContext";

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - DSCom Technologies`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <CartProvider>
                <App {...props} />
            </CartProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
