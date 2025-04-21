#!/usr/bin/env node
import { build } from './lib/build.js'

async function main() {
  const args = process.argv.slice(2)
  const configPath =
    args.find(arg => !arg.startsWith('-')) || 'esm-styles.config.js'
  const watch = args.includes('--watch') || args.includes('-w')

  async function runBuild() {
    try {
      await build(configPath)
      console.log('Build completed successfully.')
    } catch (err) {
      console.error('Build failed:', err)
      process.exit(1)
    }
  }

  if (watch) {
    // NOTE: You need to install chokidar: npm install chokidar
    const chokidar = (await import('chokidar')).default
    const pathMod = await import('node:path')
    // Load config to get sourcePath
    const { default: config } = await import(
      pathMod.isAbsolute(configPath)
        ? configPath
        : pathMod.resolve(process.cwd(), configPath)
    )
    const basePath = pathMod.resolve(process.cwd(), config.basePath || '.')
    const sourcePath = pathMod.join(basePath, config.sourcePath || '')
    const suffix = config.sourceFilesSuffix || '.styles.mjs'
    const relSourcePath = pathMod.relative(process.cwd(), sourcePath)
    const relPattern = relSourcePath + '/**/*' + suffix
    const absPattern = pathMod.join(sourcePath, '**', '*' + suffix)
    console.log('build v. 0.0.2')
    console.log(`[watch] cwd: ${process.cwd()}`)
    console.log(`[watch] Relative pattern: ${relPattern}`)
    console.log(`[watch] Absolute pattern: ${absPattern}`)
    console.log(`[watch] Starting watcher with polling...`)
    await runBuild()
    const watcher = chokidar.watch([relPattern, absPattern], {
      followSymlinks: true,
      usePolling: true,
      interval: 300,
      persistent: true,
      ignoreInitial: false,
    })
    watcher
      .on('ready', () => {
        console.log('[watch] Initial scan complete. Ready for changes.')
      })
      .on('all', async (event: string, file: string) => {
        console.log(`[watch] Event: ${event} on ${file}`)
        if (event === 'change') {
          console.log(`[watch] File changed: ${file}. Rebuilding...`)
          await runBuild()
        }
      })
  } else {
    await runBuild()
  }
}

main()
