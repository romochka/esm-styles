#!/usr/bin/env node
import { spawn } from 'child_process'
import path from 'path'
import process from 'process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const configPath = process.argv[2] || 'esm-styles.config.js'
const configModule = await import(
  path.isAbsolute(configPath)
    ? configPath
    : path.resolve(process.cwd(), configPath)
)
const config = configModule.default

const basePath = path.resolve(process.cwd(), config.basePath || '.')
const sourcePath = path.join(basePath, config.sourcePath || '')

// Use absolute path to build.js from the esm-styles package
const buildJsPath = path.join(__dirname, 'build.js')

const nodemonArgs = [
  '--watch',
  sourcePath,
  '--ext',
  'mjs',
  '--ignore',
  path.join(sourcePath, '$*.mjs'),
  '--exec',
  `node ${buildJsPath} ${configPath}`,
]

console.log('[esm-styles] Running:', 'nodemon', ...nodemonArgs)

const nodemon = spawn('nodemon', nodemonArgs, { stdio: 'inherit' })

nodemon.on('exit', (code) => process.exit(code))
