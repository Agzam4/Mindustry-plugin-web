import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        checker({
            typescript: {
                tsconfigPath: './tsconfig.app.json'
            },
            overlay: true,

        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: "http://localhost:8080",
                changeOrigin: true
            },
            '/auth/callback': {
                target: "http://localhost:8080",
                changeOrigin: true
            }

        }
    }
})
