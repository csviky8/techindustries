import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({ input: ['resources/js/main.jsx'], refresh: true }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: { '@': '/resources/js/src' },
    },
});
