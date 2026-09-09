import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // "@/..." now resolves to "src/..." — this is the path
      // alias shadcn-CLI-installed components expect (you saw it
      // in the screenshot: '@/components/animate-ui/...').
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
