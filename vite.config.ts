import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const wordpress = mode === 'wordpress'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      watch: {
        ignored: ['**/release/**'],
      },
    },
    ...(wordpress
      ? {
          // Chunk imports stay relative to the plugin script, so they still resolve on a WordPress page.
          base: './',
          build: {
            outDir: 'release/rugby-game-3d',
            emptyOutDir: true,
            assetsDir: 'static',
            manifest: 'manifest.json',
          },
        }
      : {}),
  }
})
