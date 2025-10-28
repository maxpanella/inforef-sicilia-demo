import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const isProd = process.env.NODE_ENV === 'production'

// Base per GitHub Pages:
// - In CI (GitHub Actions) GITHUB_REPOSITORY è "owner/repo" -> estraiamo "repo"
// - In alternativa puoi definire REPO_BASE, altrimenti fallback al nome attuale del repo
let basePath = '/'
if (isProd) {
  const repoFromGH = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const repoName = process.env.REPO_BASE || repoFromGH || 'inforef-sicilia-demo'
  basePath = `/${repoName}/`
}

export default defineConfig({
  base: basePath,
  plugins: [vue()],
  build: { outDir: 'dist' },
})
