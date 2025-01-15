import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ["resources/js/index.jsx", "resources/css/app.css"], // React and CSS entry points
            refresh: true,
        }),
    ],
    build: {
        outDir: "public/build", 
        emptyOutDir: true,
        manifest: true,
    },
    base: "/build/",
    server: {
        host: "127.0.0.1",
        port: 5173,
        hmr: {
            host: "127.0.0.1",
            port: 5173,
        },
        proxy: {
            "/auth": "http://127.0.0.1:8000",
            "/api": "http://127.0.0.1:8000",
        },
    },
});
