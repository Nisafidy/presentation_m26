import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function viteSingleFileCompat(): Plugin {
  return {
    name: "vite:singlefile-compat",
    config() {
      return {
        build: {
          assetsInlineLimit: 100000000,
          chunkSizeWarningLimit: 100000000,
          cssCodeSplit: false,
          reportCompressedSize: false,
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
            },
          },
        },
      };
    },
    transformIndexHtml: {
      order: "post",
      handler(html, { bundle }) {
      if (!bundle) return html;

      for (const entry of Object.values(bundle)) {
        if (entry.type === "chunk" && entry.code) {
          const reScript = new RegExp(
            `<script type="module"[^>]*?src="[\\./]*${entry.fileName}"[^>]*?></script>`
          );
          const code = `<script type="module">\n//${entry.fileName}\n${entry.code}\n</script>`;
          html = html.replace(reScript, code);
        } else if (entry.type === "asset" && entry.fileName.endsWith(".css")) {
          const reCSS = new RegExp(
            `<link rel="stylesheet"[^>]*?href="[\\./]*${entry.fileName}"[^>]*?>`
          );
          const code = `<style type="text/css">\n${entry.source}\n</style>`;
          html = html.replace(reCSS, code);
        }
      }

      return html;
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFileCompat()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
