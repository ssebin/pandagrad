import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ["resources/js/index.jsx", "resources/css/app.css"],
            refresh: true,
        }),
    ],
    build: {
        outDir: "public/build", // Output directory for Laravel
        emptyOutDir: true, // Clears the output directory before building
        rollupOptions: {
            input: "resources/js/index.jsx",
        },
    },
});
