import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import glsl from "vite-plugin-glslify-inject"; // https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    glsl({
      include: "./src/**/*.(vert|frag|glsl)",
      exclude: "node_modules/**",
      // types: { alias: "@shaders", library: "threejs" },
    }),
  ],
  resolve: {
    alias: {
      "@shaders": "/src/shaders/",
    },
  },
});
