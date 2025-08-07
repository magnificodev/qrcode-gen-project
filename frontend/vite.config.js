import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// const API_URL = import.meta.VITE_API_BASE_URL || "/api"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    // server: {
    //     host: "0.0.0.0",
    //     port: 3000,
    //     proxy: API_URL.startsWith("/api") ? {
    //         "/api": {
    //             target: "http://localhost:8000",
    //             changeOrigin: true,
    //         },
    //     } : undefined,
    // },
})
