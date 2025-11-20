import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { reactRouterDevTools } from "react-router-devtools";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/",
  plugins: [
    tailwindcss(),
    reactRouterDevTools(),
    reactRouter(),
    tsconfigPaths(),
  ],
  server: {
    hmr: {
      path: "/",
      clientPort: 5173,
      host: "localhost",
    },
  },
  customLogger: {
    ...console,
    info: (msg: string, options?: any) => {
      // Filtrer ut health check logs
      if (msg.includes('/api/health')) return;
      console.info(msg, options);
    },
  } as any,
});
