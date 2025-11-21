import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), sentryVitePlugin({
        org: "{{SENTRY_ORG}}",//nemato
        project: "{{SENTRY_PROJECT_REACT}}"//"javascript-react"
    })],
    base: "/static/frontend/",
    build: {
        outDir: "dist",
        emptyOutDir: true,

        rollupOptions: {
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: function (assetInfo) {
                    if (assetInfo.name === "style.css" ||
                        assetInfo.name === "index.css") {
                        return "assets/style.css";
                    }
                    return "assets/[name].[ext]";
                },
            },
        },

        sourcemap: true
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:8000",
                changeOrigin: true,
            },
        },
    },
});