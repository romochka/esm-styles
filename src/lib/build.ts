import { getCss } from './index.js'
import { getCssVariables } from './utils/index.js'
import path from 'node:path'
import fs from 'node:fs/promises'
import { inspect } from 'node:util'
import _ from 'lodash'

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

  const cssFiles = []

  // 2. Process globalVariables
  if (config.globalVariables) {
    const inputFile = path.join(
      sourcePath,
      `${config.globalVariables}${suffix}`
    )
    const outputFile = path.join(outputPath, `global.css`)
    const fileUrl = pathToFileUrl(inputFile).href + `?update=${Date.now()}`
    const varsObj = (await import(fileUrl)).default
    const cssVars = getCssVariables(varsObj)
    const rootSelector = config.globalRootSelector || ':root'
    const wrappedCss = `${rootSelector} {\n${cssVars}\n}`
    await fs.writeFile(outputFile, wrappedCss, 'utf8')
    cssFiles.push({ type: 'global', file: 'global.css' })
  }

  // 3. Process media variable sets
  if (config.media && config.mediaSelectors) {
    for (const mediaType of Object.keys(config.media)) {
      const sets = config.media[mediaType] // e.g. ['light', 'twilight', 'dark']
      let prevVarsObj = {}
      for (const setName of sets) {
        // Inheritance: merge with previous
        const inputFile = path.join(sourcePath, `${setName}${suffix}`)
        const fileUrl = pathToFileUrl(inputFile).href + `?update=${Date.now()}`
        const varsObj = _.merge(
          {},
          prevVarsObj,
          (await import(fileUrl)).default
        )
        prevVarsObj = varsObj
        // For each selector config for this set
        const selectorConfigs =
          config.mediaSelectors?.[mediaType]?.[setName] || []
        for (const selectorConfig of selectorConfigs) {
          const { selector, mediaQuery, prefix } = selectorConfig
          // File name: {prefix.}{setName}.{mediaType}.css
          const prefixPart = prefix ? `${prefix}.` : ''
          const fileName = `${prefixPart}${setName}.${mediaType}.css`
          const outputFile = path.join(outputPath, fileName)
          const cssVars = getCssVariables(varsObj)
          const rootSelector = config.globalRootSelector || ':root'
          let fullSelector = rootSelector
          if (selector) {
            // If selector starts with combinator or pseudo, don't add space
            if (/^[.:#[]./.test(selector)) {
              fullSelector = `${rootSelector}${selector}`
            } else {
              fullSelector = `${rootSelector} ${selector}`
            }
          }
          let block = `${fullSelector} {\n${cssVars}\n}`
          if (mediaQuery) {
            block = `@media ${mediaQuery} {\n${block}\n}`
          }
          await fs.writeFile(outputFile, block, 'utf8')
          cssFiles.push({
            type: 'media',
            file: fileName,
            mediaType,
            setName,
            mediaQuery,
          })
        }
      }
    }
  }

  // 4. Process each layer (legacy, keep for now)
  for (const layer of layers) {
    const inputFile = path.join(sourcePath, `${layer}${suffix}`)
    const outputFile = path.join(outputPath, `${layer}.css`)
    const fileUrl = pathToFileUrl(inputFile).href + `?update=${Date.now()}`
    const stylesObj = (await import(fileUrl)).default
    const css = getCss(stylesObj)
    const wrappedCss = `@layer ${layer} {\n${css}\n}`
    await fs.writeFile(outputFile, wrappedCss, 'utf8')
    cssFiles.push({ layer, file: `${layer}.css` })
  }

  // 5. Create main CSS file
  const mainCssPath = path.join(outputPath, mainCssFile)
  // Compose imports for variable sets
  const varImports = cssFiles
    .filter((f) => f.type === 'global' || f.type === 'media')
    .map((f) => {
      if (f.mediaQuery) {
        return `@import '${f.file}' ${f.mediaQuery};`
      }
      return `@import '${f.file}';`
    })
    .join('\n')
  // Compose imports for layers
  const layerFiles = cssFiles.filter((f) => f.layer).map((f) => f.file)
  const layerNames = cssFiles
    .filter((f) => f.layer)
    .map((f) => f.layer)
    .join(', ')
  const layerImports = layerFiles.map((f) => `@import '${f}';`).join('\n')
  const mainCss =
    [varImports, layerNames ? `@layer ${layerNames};` : '', layerImports]
      .filter(Boolean)
      .join('\n') + '\n'
  await fs.writeFile(mainCssPath, mainCss, 'utf8')
}

// Helper for file URL import
import { pathToFileURL as pathToFileUrl } from 'node:url'
