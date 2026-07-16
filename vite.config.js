import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';

const isVercel = process.env.VERCEL === '1';

export default defineConfig({
    plugins: [
        ...(isVercel ? [] : [laravel({ input: ['resources/js/main.jsx'], refresh: true })]),
        react(),
        tailwindcss(),
    ],
    build: isVercel ? {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: { input: 'index.html' },
    } : {},
    resolve: {
        alias: { '@': '/resources/js/src' },
    },
});
