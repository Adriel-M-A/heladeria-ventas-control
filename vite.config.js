import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; // 1. Importamos fs para leer archivos

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Leemos el package.json para sacar la versión
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"), "utf-8")
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 3. Definimos la variable global
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
    },
  },
  base: "./",
  build: {
    rollupOptions: {
      external: ["better-sqlite3"],
    },
  },
});
