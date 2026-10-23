import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Dentro de Docker el servidor tiene que escuchar fuera del contenedor.
    host: true,
  },
})
