const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const frontendDir = path.join(rootDir, 'frontend')
const distDir = path.join(frontendDir, 'dist')
const outputDir = path.join(rootDir, 'public')

// Routes handled by the client-side router in frontend/src/App.jsx. Vercel's
// static build serves files only, so each deep link needs a real HTML entry
// point for a hard refresh to work with the unified deployment.
const clientRoutes = ['admin', 'admin-login', 'reset-password', 'forgot-password']

function run(command, cwd) {
  execSync(command, { cwd, stdio: 'inherit', shell: true })
}

function main() {
  // Vercel builds with NODE_ENV=production, so explicitly include dev
  // dependencies (Vite and the React plugin) required to build the frontend.
  const installCommand = process.env.VERCEL
    ? 'npm ci --include=dev --no-audit --no-fund'
    : 'npm install --include=dev --no-audit --no-fund'

  console.log('Installing frontend dependencies...')
  run(installCommand, frontendDir)

  console.log('Building frontend...')
  run('npm run build', frontendDir)

  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error(`Frontend build did not produce ${path.join(distDir, 'index.html')}.`)
  }

  console.log('Copying frontend build to public/...')
  fs.rmSync(outputDir, { recursive: true, force: true })
  fs.cpSync(distDir, outputDir, { recursive: true })

  const indexHtml = fs.readFileSync(path.join(outputDir, 'index.html'))
  for (const route of clientRoutes) {
    fs.mkdirSync(path.join(outputDir, route), { recursive: true })
    fs.writeFileSync(path.join(outputDir, route, 'index.html'), indexHtml)
    fs.writeFileSync(path.join(outputDir, `${route}.html`), indexHtml)
  }

  // Vercel serves this automatically for paths that do not match a file, so
  // unknown client-side routes render the app instead of a bare 404 page.
  fs.writeFileSync(path.join(outputDir, '404.html'), indexHtml)

  console.log('Unified Vercel build output is ready in public/.')
}

main()
