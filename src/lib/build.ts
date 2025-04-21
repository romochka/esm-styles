import { getCss } from './index.js'
import path from 'node:path'
import fs from 'node:fs/promises'
import { inspect } from 'node:util'

export async function build(
  configPath = 'esm-styles.config.js'
): Promise<void> {
  // 1. Load config
  const configFile = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(process.cwd(), configPath)
  const config = (await import(configFile)).default

  const basePath = path.resolve(process.cwd(), config.basePath || '.')
  const sourcePath = path.join(basePath, config.sourcePath || '')
  const outputPath = path.join(basePath, config.outputPath || '')
  const suffix = config.sourceFilesSuffix || '.styles.mjs'
  const layers = config.layers || []
  const mainCssFile = config.mainCssFile || 'styles.css'

  // Ensure output directory exists
  await fs.mkdir(outputPath, { recursive: true })

  // 2. Process each layer
  const cssFiles = []
  for (const layer of layers) {
    const inputFile = path.join(sourcePath, `${layer}${suffix}`)
    const outputFile = path.join(outputPath, `${layer}.css`)
    // Import the JS file as ESM, bust cache with query param
    const fileUrl = pathToFileUrl(inputFile).href + `?update=${Date.now()}`
    console.log('importing', fileUrl)
    const stylesObj = (await import(fileUrl)).default
    console.log('imported', inspect(stylesObj, { depth: 10 }))
    const css = getCss(stylesObj)
    const wrappedCss = `@layer ${layer} {\n${css}\n}`
    await fs.writeFile(outputFile, wrappedCss, 'utf8')
    cssFiles.push({ layer, file: `${layer}.css` })
  }

  // 3. Create main CSS file
  const mainCssPath = path.join(outputPath, mainCssFile)
  const layerNames = cssFiles.map(f => f.layer).join(', ')
  const imports = cssFiles.map(f => `@import '${f.file}';`).join('\n')
  const mainCss = `@layer ${layerNames};\n${imports}\n`
  await fs.writeFile(mainCssPath, mainCss, 'utf8')
}

// Helper for file URL import
import { pathToFileURL as pathToFileUrl } from 'node:url'
