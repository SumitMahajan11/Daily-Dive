import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'node:child_process';

let commitHash = process.env.VITE_COMMIT_HASH || '';
if (!commitHash) {
  try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    commitHash = 'round-7';
  }
}
const buildDate = process.env.VITE_BUILD_DATE || new Date().toISOString().slice(0, 10);

export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __BUILD_DATE__: JSON.stringify(buildDate)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-192-maskable.png',
        'icons/icon-512-maskable.png',
        'fonts/*.woff2'
      ],
      manifest: {
        name: 'Daily Dive',
        short_name: 'Daily Dive',
        description: 'Micro-learning on demand: spin for curated learning topics, maintain daily streaks, and master core concepts across tech, mind, and world ideas.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#1c1a17',
        theme_color: '#1c1a17',
        categories: ['education', 'productivity', 'utilities'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Precache app shell, all screens, and the 4 group chunks
        globPatterns: ['**/*.{html,css,png,svg,woff2,ico,js,webmanifest}'],
        globIgnores: ['**/vendor-pdf*.js', '**/vendor-jszip*.js', '**/vendor-tesseract*.js', '**/pdf.worker*.*'],
        runtimeCaching: [
          {
            urlPattern: /(?:vendor-(?:pdf|jszip|tesseract)|pdf\.worker).*\.(?:js|mjs)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'heavy-parsers-runtime-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/groups/tech')) return 'topics-tech';
          if (id.includes('src/data/groups/money-career')) return 'topics-money-career';
          if (id.includes('src/data/groups/mind-growth')) return 'topics-mind-growth';
          if (id.includes('src/data/groups/world-ideas')) return 'topics-world-ideas';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion';
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
          if (id.includes('node_modules/pdfjs-dist')) return 'vendor-pdf';
          if (id.includes('node_modules/jszip')) return 'vendor-jszip';
          if (id.includes('node_modules/tesseract.js')) return 'vendor-tesseract';
        }
      }
    }
  }
});
