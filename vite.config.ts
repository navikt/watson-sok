import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { reactRouterDevTools } from "react-router-devtools";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/",
  plugins: [
    tailwindcss(),
    process.env.NODE_ENV === "development" ? reactRouterDevTools() : null,
    reactRouter(),
    process.env.NODE_ENV === "development" ? devtoolsJson() : null,
    tsconfigPaths(),
  ].filter(Boolean), // Fjern dev only plugins
  server: {
    hmr: {
      path: "/",
      clientPort: 5173,
      host: "localhost",
    },
  },
});
