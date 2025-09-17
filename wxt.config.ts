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
    }
  })
});
