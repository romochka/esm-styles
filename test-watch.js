// test-watch.js
import fs from 'fs'
import path from 'path'

const dir = 'sample-styles/source/components'

console.log('Watching directory:', dir)

fs.watch(dir, (eventType, filename) => {
  if (filename) {
    console.log(`[fs.watch] Event: ${eventType} on ${filename}`)
    if (filename.endsWith('.styles.mjs')) {
      console.log(`[fs.watch] Matched .styles.mjs: ${filename}`)
    }
  } else {
    console.log(`[fs.watch] Event: ${eventType} (no filename)`)
  }
})
