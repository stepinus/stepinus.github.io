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
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  server: {
    proxy: {
      '/api/recognition-audio/': {
        target: 'https://generate.ai-akedemi-project.ru/',
        changeOrigin: true,
        secure: false, // Установите в true, если ваш сервер использует HTTPS и имеет действительный сертификат
        rewrite: (path) => path.replace(/^\/api\/recognition-audio/, '/api/recognition-audio/')
      }
    }
  },
  resolve: {
    alias: {
      "@shaders": "/src/shaders/",
    },
  },
});
