import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // GitHub Pages 项目页会部署在 /<repo>/ 下；构建用相对路径，部署到子路径也能正确加载静态资源。
  base: command === 'build' ? './' : '/',
  plugins: [react()],
}))
