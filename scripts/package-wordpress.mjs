import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const pluginDir = path.join(root, 'release', 'rugby-game-3d')
const zipPath = path.join(root, 'release', 'rugby-game-3d.zip')

const typecheck = spawnSync(process.execPath, [path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-b'], {
  cwd: root,
  stdio: 'inherit',
})
if (typecheck.status !== 0) process.exit(typecheck.status ?? 1)

await build({
  root,
  mode: 'wordpress',
  configFile: path.join(root, 'vite.config.ts'),
})

const version = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')).version
copyPluginSource(version)

const entryJs = assertPluginBundle()
pruneUnreferencedPublicFiles()
if (existsSync(zipPath)) rmSync(zipPath)
zipDirectory(pluginDir, zipPath)

const bytes = statSync(zipPath).size
console.log(`Wrote ${path.relative(root, zipPath)} (${formatSize(bytes)})`)
console.log(`Entry ${entryJs}`)

function copyPluginSource(version) {
  const source = path.join(root, 'wordpress')
  for (const name of ['embed.css', 'readme.txt']) {
    cpSync(path.join(source, name), path.join(pluginDir, name))
  }
  cpSync(path.join(source, 'templates'), path.join(pluginDir, 'templates'), { recursive: true })
  const php = readFileSync(path.join(source, 'rugby-game-3d.php'), 'utf8').replaceAll('__RUGBY_GAME_VERSION__', version)
  writeFileSync(path.join(pluginDir, 'rugby-game-3d.php'), php)
  const indexHtml = path.join(pluginDir, 'index.html')
  if (existsSync(indexHtml)) rmSync(indexHtml)
}

function assertPluginBundle() {
  const manifestPath = path.join(pluginDir, 'manifest.json')
  if (!existsSync(manifestPath)) {
    console.error('Vite did not emit manifest.json')
    process.exit(1)
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const entry = Object.values(manifest).find((item) => item && item.isEntry)
  if (!entry?.file) {
    console.error('Manifest has no entry')
    process.exit(1)
  }
  const js = readFileSync(path.join(pluginDir, entry.file), 'utf8')
  if (!js.includes('/static/') || !js.includes('import.meta.url')) {
    console.error('WordPress bundle does not resolve assets from the plugin script URL')
    process.exit(1)
  }
  if (!existsSync(path.join(pluginDir, 'models', 'pig', 'pig.glb'))) {
    console.error('Plugin build is missing public/models')
    process.exit(1)
  }
  return entry.file
}

function pruneUnreferencedPublicFiles() {
  const needed = new Set()
  const staticDir = path.join(pluginDir, 'static')
  for (const name of readdirSync(staticDir)) {
    if (!name.endsWith('.js') && !name.endsWith('.css')) continue
    const text = readFileSync(path.join(staticDir, name), 'utf8')
    for (const match of text.matchAll(/\/(?:models|assets)\/[A-Za-z0-9_./-]+\.(?:glb|svg|png|webp|jpg)/g)) {
      needed.add(match[0].slice(1))
    }
  }
  if (!needed.has('models/pig/pig.glb') || !needed.has('models/drone/drone.glb')) {
    console.error('Could not find referenced models in the bundle')
    process.exit(1)
  }
  pruneDir(path.join(pluginDir, 'models'), 'models', needed)
  pruneDir(path.join(pluginDir, 'assets'), 'assets', needed)
  console.log(`Packed ${needed.size} runtime assets`)
}

function pruneDir(dir, prefix, needed) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    const rel = `${prefix}/${entry.name}`
    if (entry.isDirectory()) pruneDir(abs, rel, needed)
    else if (!needed.has(rel)) rmSync(abs)
  }
  if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true })
}

function zipDirectory(source, destination) {
  if (process.platform === 'win32') {
    const command = [
      'Add-Type -AssemblyName System.IO.Compression.FileSystem',
      `[System.IO.Compression.ZipFile]::CreateFromDirectory('${psQuote(source)}', '${psQuote(destination)}', [System.IO.Compression.CompressionLevel]::NoCompression, $true)`,
    ].join('; ')
    const packed = spawnSync('powershell', ['-NoProfile', '-Command', command], { stdio: 'inherit' })
    if (packed.status !== 0) process.exit(packed.status ?? 1)
    return
  }
  const packed = spawnSync('tar', ['-a', '-c', '-f', destination, '-C', path.dirname(source), path.basename(source)], {
    stdio: 'inherit',
  })
  if (packed.status !== 0) process.exit(packed.status ?? 1)
}

function psQuote(value) {
  return value.replaceAll("'", "''")
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
