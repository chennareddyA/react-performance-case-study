import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // React disables <Profiler> in normal production builds. The profiling build keeps it,
    // so the live metrics panel also works on the deployed site (both demo pages use it equally).
    alias: { 'react-dom/client': 'react-dom/profiling' },
  },
})
