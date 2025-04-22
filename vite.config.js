// vite.config.js
import { defineConfig } from 'vite' // 임포트 필요
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    port: 5173 
  }
})