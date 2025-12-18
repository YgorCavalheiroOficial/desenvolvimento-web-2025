import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Porta do frontend
    proxy: {
      // Quando o frontend tenta acessar /api, ele redireciona para o backend
      '/api': {
        target: 'http://localhost:3000', // Sua porta do servidor Express
        changeOrigin: true,
        secure: false, // Necessário se você não estiver usando HTTPS
      }
    }
  }
});