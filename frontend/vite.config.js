import { defineConfig } from "vite";
import React from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [React()],
  base: "/digital-twin-learning--style/",
  server: {
    port: 5173,
  },
});