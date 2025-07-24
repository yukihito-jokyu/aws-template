import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // これにより外部からのアクセスが許可
    port: 5173, // ポート番号
  },
  plugins: [react()],
})
