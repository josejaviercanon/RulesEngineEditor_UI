import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin(), tailwindcss()],
    server: {
        port: 65426,
        proxy: {
            '/rules': 'http://localhost:5000',
            '/scenarios': 'http://localhost:5000'
        }
    }
})