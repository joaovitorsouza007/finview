import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'brand/favicon.svg',
        'brand/favicon-32.png',
        'brand/favicon-192.png',
        'brand/favicon-512.png',
        'brand/mark.svg',
        'brand/horizontal.svg',
      ],
      workbox: { maximumFileSizeToCacheInBytes: 3 * 1024 * 1024 },
      manifest: {
        name: 'FinView',
        short_name: 'FinView',
        description: 'Controle sua vida financeira',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'brand/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'brand/favicon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'brand/favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'brand/favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
