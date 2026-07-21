import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const proxyTarget = env.VITE_PROXY_TARGET
  const proxyPath = env.VITE_PROXY_PATH || "/v1"

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: proxyTarget
      ? {
        proxy: {
          "/api-proxy": {
            target: proxyTarget,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api-proxy/, proxyPath),
          },
        },
      }
      : undefined,
  }
})