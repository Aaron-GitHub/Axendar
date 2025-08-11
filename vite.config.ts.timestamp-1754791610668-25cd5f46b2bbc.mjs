// vite.config.ts
import { defineConfig } from "file:///C:/Users/Aaron/Desktop/CVPA%20Desarrollo%20-%20Proyectos/Reservas%20Pro%20(bolt)/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Aaron/Desktop/CVPA%20Desarrollo%20-%20Proyectos/Reservas%20Pro%20(bolt)/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { viteStaticCopy } from "file:///C:/Users/Aaron/Desktop/CVPA%20Desarrollo%20-%20Proyectos/Reservas%20Pro%20(bolt)/node_modules/vite-plugin-static-copy/dist/index.js";
import * as path from "path";
var __vite_injected_original_dirname = "C:\\Users\\Aaron\\Desktop\\CVPA Desarrollo - Proyectos\\Reservas Pro (bolt)";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/*",
          dest: "dist"
        }
      ]
    })
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__vite_injected_original_dirname, "index.html")
      }
    },
    // Pre-render configuration
    ssrManifest: true
  },
  server: {
    port: 5173,
    host: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBYXJvblxcXFxEZXNrdG9wXFxcXENWUEEgRGVzYXJyb2xsbyAtIFByb3llY3Rvc1xcXFxSZXNlcnZhcyBQcm8gKGJvbHQpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBYXJvblxcXFxEZXNrdG9wXFxcXENWUEEgRGVzYXJyb2xsbyAtIFByb3llY3Rvc1xcXFxSZXNlcnZhcyBQcm8gKGJvbHQpXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BYXJvbi9EZXNrdG9wL0NWUEElMjBEZXNhcnJvbGxvJTIwLSUyMFByb3llY3Rvcy9SZXNlcnZhcyUyMFBybyUyMChib2x0KS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSAndml0ZS1wbHVnaW4tc3RhdGljLWNvcHknO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHZpdGVTdGF0aWNDb3B5KHtcbiAgICAgIHRhcmdldHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHNyYzogJ3B1YmxpYy8qJyxcbiAgICAgICAgICBkZXN0OiAnZGlzdCdcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pXG4gIF0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgaW5wdXQ6IHtcbiAgICAgICAgbWFpbjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2luZGV4Lmh0bWwnKVxuICAgICAgfSxcbiAgICB9LFxuICAgIC8vIFByZS1yZW5kZXIgY29uZmlndXJhdGlvblxuICAgIHNzck1hbmlmZXN0OiB0cnVlXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgaG9zdDogdHJ1ZVxuICB9XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFosU0FBUyxvQkFBb0I7QUFDdmIsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsc0JBQXNCO0FBQy9CLFlBQVksVUFBVTtBQUh0QixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixlQUFlO0FBQUEsTUFDYixTQUFTO0FBQUEsUUFDUDtBQUFBLFVBQ0UsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLFFBQ0wsTUFBVyxhQUFRLGtDQUFXLFlBQVk7QUFBQSxNQUM1QztBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
