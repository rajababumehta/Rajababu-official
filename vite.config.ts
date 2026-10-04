import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// In environments where HMR is disabled (DISABLE_HMR=true), Vite sets server.ws to undefined.
// This guard ensures any plugins calling server.ws.on/send do not throw TypeError.
const guardEmptyWsPlugin = (): Plugin => ({
  name: 'guard-empty-ws',
  enforce: 'pre',
  configureServer(server) {
    if (!server.ws) {
      (server as any).ws = {
        on: () => {},
        off: () => {},
        send: () => {},
        close: () => {},
        clients: new Set(),
      };
    }
  },
});

export default defineConfig(() => {
  return {
    plugins: [
      guardEmptyWsPlugin(),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        includeAssets: [
          'favicon.ico',
          'favicon.png',
          'brand-avatar.png',
          'brand-logo.png',
          'apple-touch-icon.png',
          'screenshot-wide.png',
          'screenshot-narrow.png',
        ],
        manifest: {
          id: '/',
          name: 'Rajababu Mehta',
          short_name: 'Rajababu',
          description: 'Rajababu Mehta – Official website of the AI Website Developer & AI Explainer from Birgunj, Nepal.',
          theme_color: '#020617',
          background_color: '#020617',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          orientation: 'any',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/brand-avatar.png',
              sizes: '320x320',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
