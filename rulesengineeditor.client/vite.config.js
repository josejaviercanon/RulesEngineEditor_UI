import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
// NOTE: The real backend runs on https://localhost:7119 with /api/Rules paths.
// This proxy is for local dev convenience only. See AGENTS.md for full backend contract.
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