import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages деплоит проект в подкаталог /krai-music/. CI передаёт это
  // значение через BASE_PATH; локально используем значение по умолчанию.
  base: process.env.BASE_PATH || '/krai-music/',
})
