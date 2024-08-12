import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import glsl from "vite-plugin-glslify-inject"; // https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  optimizeDeps: {
    exclude: ['dependency-that-causes-the-problem']
  },
  plugins: [
    react(),
    glsl({
      include: "./src/**/*.(vert|frag|glsl)",
      exclude: "node_modules/**",
      // types: { alias: "@shaders", library: "threejs" },
    }),
  ],
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      "@shaders": "/src/shaders/",
    },
  },
});
