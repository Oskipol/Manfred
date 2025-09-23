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
      'import.meta.env.API_KEY': JSON.stringify(process.env.API_KEY),
      global: 'globalThis',
    },
    resolve: {
      alias: {
        'node:async_hooks': new URL('./src/polyfills/async_hooks.js', import.meta.url).pathname
      }
    },
    optimizeDeps: {
      exclude: ['@langchain/langgraph']
    },
    build: {
      rollupOptions: {
        external: ['node:async_hooks'],
        output: {
          globals: {
            'node:async_hooks': 'AsyncHooks'
          }
        }
      }
    }
  })
});
