import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [glsl()],
  // your other configuration...
});
