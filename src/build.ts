#!/usr/bin/env node
import { build } from './lib/build.js'

async function main() {
  const args = process.argv.slice(2)
  const configPath =
    args.find((arg) => !arg.startsWith('-')) || 'esm-styles.config.js'
  const watch = args.includes('--watch') || args.includes('-w')

  if (watch) {
    console.log(
      '[esm-styles] Watch mode is not supported internally due to ESM module caching.'
    )
    console.log(
      '[esm-styles] Please use nodemon or a similar tool to restart the build process on file changes.'
    )
    console.log('[esm-styles] Example:')
    console.log(
      "  npx nodemon --watch <source-dir> --ext mjs --exec 'node dist/build.js <config-file>'"
    )
    process.exit(0)
  }

  try {
    console.log('Build v0.0.4')
    await build(configPath)
    console.log('Build completed successfully.')
  } catch (err) {
    console.error('Build failed:', err)
    process.exit(1)
  }
}

main()
