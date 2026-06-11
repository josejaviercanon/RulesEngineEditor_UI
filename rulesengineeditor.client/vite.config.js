import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
// NOTE: The real backend runs on https://localhost:7119 with /api/Rules paths.
// The HTTP backend profile runs on http://localhost:5064.
// This proxy is for local dev convenience only. See AGENTS.md for full backend contract.
export default defineConfig({
    plugins: [plugin(), tailwindcss()],
    server: {
        port: 65426,
        proxy: {
            '/rules': {
                target: 'http://localhost:5064',
                rewrite: (path) => path.replace(/^\/rules/, '/api/Rules')
            },
            '/scenarios': {
                target: 'http://localhost:5064',
                rewrite: (path) => path.replace(/^\/scenarios/, '/api/Rules/scenarios')
            },
            '/login': 'http://localhost:5064',
            '/register': 'http://localhost:5064',
            '/refresh': 'http://localhost:5064',
            '/manage': 'http://localhost:5064',
            '/logout': 'http://localhost:5064',
            '/api/passkey': 'http://localhost:5064'
        }
    }
})