import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import path from 'path';

export default defineConfig({
    root: path.resolve(__dirname, 'resources'),
    plugins: [
        react(),
        laravel({
            input: ['resources/js/index.jsx', 'resources/css/app.css'],
            refresh: true,
        }),
    ],
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            host: '127.0.0.1',
            port: 5173,
        },
        proxy: {
            '/auth': 'http://127.0.0.1:8000',
            '/api': 'http://127.0.0.1:8000',
        },
        historyApiFallback: true,
    },
    build: {
        // Output directory for build files
        outDir: path.resolve(__dirname, 'public/build'),
        emptyOutDir: true,
      },
});
