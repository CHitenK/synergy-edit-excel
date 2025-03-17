import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    assetsDir: './libs/',
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    copyPublicDir: true,
    sourcemap: false,
    minify: 'terser',
    cssMinify: false,
    cssCodeSplit: true, // 如果设置为false，整个项目中的所有 CSS 将被提取到一个 CSS 文件中  
    terserOptions: {
      compress: {
        // warnings: false, 
        // drop_console: true, // 打包时删除console 
        drop_debugger: true, // 打包时删除 debugger
        pure_funcs: ['console.log']
      },
      output: {
        // 去掉注释内容
        comments: true
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 9876, // 设置服务启动端口号
    open: true, // 设置服务启动时是否自动打开浏览器
    hmr: true, 
    cors: true, // 允许跨域
    proxy: {
      '/api': {
         target: 'http://localhost:3011',
       // target: 'http://excelxt.sixk.top',
        changeOrigin: true
      },
    }
  }
})
