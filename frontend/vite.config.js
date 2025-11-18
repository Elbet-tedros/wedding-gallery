import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // expose to your LAN
    port: 5173
  }
});
