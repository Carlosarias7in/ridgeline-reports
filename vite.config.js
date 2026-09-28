import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// In dev, mirror the Netlify redirect: /for/:slug serves report.html.
const forRewrite = () => ({
  name: 'for-rewrite',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && /^\/for\/[^/?]+\/?(\?.*)?$/.test(req.url)) req.url = '/report.html';
      next();
    });
  },
});

export default defineConfig({
  plugins: [forRewrite()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        report: resolve(__dirname, 'report.html'),
      },
    },
  },
});
