#!/usr/bin/env node
import { spawn } from 'child_process'
import path from 'path'
import process from 'process'

const configPath = process.argv[2] || 'esm-styles.config.js'
const configModule = await import(
  path.isAbsolute(configPath)
    ? configPath
    : path.resolve(process.cwd(), configPath)
)
const config = configModule.default

const basePath = path.resolve(process.cwd(), config.basePath || '.')
const sourcePath = path.join(basePath, config.sourcePath || '')

const nodemonArgs = [
  '--watch',
  sourcePath,
  '--ext',
  'mjs',
  '--exec',
  `node dist/build.js ${configPath}`,
]

console.log('[esm-styles] Running:', 'nodemon', ...nodemonArgs)

const nodemon = spawn('nodemon', nodemonArgs, { stdio: 'inherit' })

nodemon.on('exit', code => process.exit(code))
