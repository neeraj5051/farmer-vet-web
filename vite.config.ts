import { defineConfig } from 'vite'
// Force Reload
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
