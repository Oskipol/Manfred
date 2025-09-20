import { defineConfig } from 'wxt';


export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: [
      'activeTab',
      'tabs',
      'storage'
    ],
    host_permissions: [
      '<all_urls>'
    ]
  },

  vite: () => ({
    define: {
      global: 'globalThis',
    },
    resolve: {
      alias: {
        'node:async_hooks': new URL('./lib/async-hooks.ts', import.meta.url).pathname,
      }
    },
  })
});
