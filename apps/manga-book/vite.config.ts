import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Set BASE_PATH when deploying under a subpath (GitHub Pages). Empty = site root.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
});
