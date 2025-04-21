// test-watch.js
import chokidar from 'chokidar'
import fg from 'fast-glob'
// import path from 'path'

const relPattern = 'sample-styles/source/*.js'
const absPattern = process.cwd() + '/sample-styles/source/*.js'

// const relPatternOutside = '../test/**/*.styles.mjs'
// const absPatternOutside = path.join(process.cwd(), '../test', '/**/*.styles.mjs')

console.log('cwd:', process.cwd())
console.log('Relative pattern:', relPattern)
console.log('Absolute pattern:', absPattern)

const watcher = chokidar.watch(
  [
    //
    relPattern,
    //
    absPattern,
  ],
  {
    cwd: process.cwd(),
    followSymlinks: true,
    usePolling: true,
    interval: 300,
    persistent: true,
    ignoreInitial: false,
  }
)

watcher
  .on('ready', () => {
    console.log('[test-watch] Initial scan complete. Ready for changes.')
  })
  .on('all', (event, file) => {
    console.log(`[test-watch] Event: ${event} on ${file}`)
  })

console.log(await fg(relPattern))
