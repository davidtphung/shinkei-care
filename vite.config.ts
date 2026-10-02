import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Connect, type Plugin } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

function zineAssets(): Plugin {
  const srcDir = path.resolve(rootDir, 'published/assets/zine')

  const serve: Connect.NextHandleFunction = (req, res, next) => {
    const url = (req.url ?? '').split('?')[0] ?? ''
    const marker = '/assets/zine/'
    const at = url.indexOf(marker)
    if (at < 0) {
      next()
      return
    }
    const name = path.basename(url.slice(at + marker.length))
    const file = path.resolve(srcDir, name)
    if (!file.startsWith(`${srcDir}${path.sep}`) || !fs.existsSync(file)) {
      next()
      return
    }
    res.setHeader('Content-Type', 'image/webp')
    fs.createReadStream(file).pipe(res)
  }

  return {
    name: 'zine-assets',
    configureServer(server) {
      server.middlewares.use(serve)
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve)
    },
    generateBundle() {
      if (!fs.existsSync(srcDir)) return
      for (const file of fs.readdirSync(srcDir)) {
        if (!file.endsWith('.webp')) continue
        this.emitFile({
          type: 'asset',
          fileName: `assets/zine/${file}`,
          source: fs.readFileSync(path.join(srcDir, file)),
        })
      }
    },
  }
}

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss(), zineAssets()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
  server: {
    host: true,
    port: 4721,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4721,
    strictPort: true,
  },
})
