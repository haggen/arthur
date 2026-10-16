import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { plugin as translation } from "./src/translator.js";
import { plugin as linkreflist } from "./src/linkreflist.js";

export default defineConfig({
  plugins: [tailwindcss(), translation(), linkreflist()],
});
