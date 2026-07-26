import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { plugin as translation } from "./src/translator.js";

export default defineConfig({
  plugins: [tailwindcss(), translation()],
});
