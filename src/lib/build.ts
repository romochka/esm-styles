import { getCss } from './index.js'
import { getCssVariables } from './utils/index.js'
import { getMediaShorthands } from './utils/media-shorthand.js'
import { isEndValue } from './utils/index.js'
import path from 'node:path'
import fs from 'node:fs/promises'
// import { inspect } from 'node:util'
import _ from 'lodash'

// Type for floor file tracking
type FloorFile = {
  file: string
  layer?: string
  source: string
  outputPath?: string
}

export async function build(
  configPath = 'esm-styles.config.js'
): Promise<void> {
  // --- Supporting module generation ---
  // Debug: log mergedSets and sets
  // console.log('[DEBUG] sets:', sets)
  // console.log('[DEBUG] mergedSets:', inspect(mergedSets, { depth: 10 }))

  // 1. Load config
  const configFile = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(process.cwd(), configPath)
  const config = (await import(configFile)).default

  const basePath = path.resolve(process.cwd(), config.basePath || '.')
  const sourcePath = path.join(basePath, config.sourcePath || '')
  const outputPath = path.join(basePath, config.outputPath || '')
  const suffix = config.sourceFilesSuffix || '.styles.mjs'
  const floors = config.floors || []
  const mainCssFile = config.mainCssFile || 'styles.css'

  // Helper function to generate CSS comment header
  const generateCssComment = (sourceName: string): string => {
    const normalizedBasePath = (config.basePath || '.').replace(/^\.*\//, '')
    const sourceFilePath = path.join(
      normalizedBasePath,
      config.sourcePath || '',
      `${sourceName}${suffix}`
    )
    return `/* This CSS was automatically generated from ${sourceFilePath}, do not edit directly */\n`
  }

  // Merge media shorthands
  const mediaShorthands = getMediaShorthands(config)

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
    const comment = generateCssComment(config.globalVariables)
    const wrappedCss = `${comment}${rootSelector} {\n${cssVars}\n}`
    await fs.writeFile(outputFile, wrappedCss, 'utf8')
    cssFiles.push({ type: 'global', file: 'global.css' })
  }

  // 3. Process media variable sets
  if (config.media && config.mediaSelectors) {
    for (const mediaType of Object.keys(config.media)) {
      const sets = config.media[mediaType] // e.g. ['light', 'twilight', 'dark']
      let prevVarsObj = {}
      // Collect all merged sets for supporting module
      const mergedSets: Record<string, any> = {}
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
        mergedSets[setName] = _.cloneDeep(varsObj)
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
          const comment = generateCssComment(setName)
          const block = `${comment}${fullSelector} {\n${cssVars}\n}`
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
      // --- Supporting module generation ---
      // Debug: log mergedSets and sets
      // console.log('[DEBUG] sets:', sets)
      // console.log('[DEBUG] mergedSets:', inspect(mergedSets, { depth: 10 }))

      // Define the recursive function here so it has access to sets and mergedSets
      const buildSupportingModule = (path: string[], isRoot: boolean): any => {
        const allKeys = new Set<string>()
        for (const set of sets) {
          const v =
            path.length === 0 ? mergedSets[set] : _.get(mergedSets[set], path)
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            Object.keys(v).forEach((k) => allKeys.add(k))
          } else if (v !== undefined && !isRoot) {
            allKeys.add('') // placeholder for leaf, but only at non-root
          }
        }
        // Debug: show allKeys and values at this path
        // console.log(
        //   '[DEBUG] path:',
        //   path.join('.'),
        //   'allKeys:',
        //   Array.from(allKeys)
        // )
        // for (const set of sets) {
        //   const v =
        //     path.length === 0 ? mergedSets[set] : _.get(mergedSets[set], path)
        // console.log(
        //   '[DEBUG] set:',
        //   set,
        //   'path:',
        //   path.join('.'),
        //   'value:',
        //   JSON.stringify(v)
        // )
        // }
        const result: Record<string, any> = {}
        for (const key of allKeys) {
          if (key === '') {
            // Only possible at non-root
            const varName =
              '--' + path.map((k: string) => k.replace(/_/g, '-')).join('-')
            const leaf: Record<string, any> = {
              var: `var(${varName})`,
              name: varName,
            }
            for (let i = 0; i < sets.length; i++) {
              const v =
                path.length === 0
                  ? mergedSets[sets[i]]
                  : _.get(mergedSets[sets[i]], path)
              if (isEndValue(v)) {
                leaf[sets[i]] = v
              }
            }
            if (Object.keys(leaf).length > 1) {
              return leaf
            }
          } else {
            const child = buildSupportingModule([...path, key], false)
            if (child && Object.keys(child).length > 0) {
              result[key] = child
            }
          }
        }
        // Debug log for each recursion
        // console.log(
        //   '[DEBUG] path:',
        //   path.join('.'),
        //   'result:',
        //   JSON.stringify(result, null, 2)
        // )
        return result
      }

      const supportingModuleObj = buildSupportingModule([], true)
      const supportingModulePath = path.join(sourcePath, `$${mediaType}.mjs`)
      const moduleContent = `export default ${JSON.stringify(
        supportingModuleObj,
        null,
        2
      )}\n`
      await fs.writeFile(supportingModulePath, moduleContent, 'utf8')
    }
  }

  // 4. Process each floor (replaces legacy layers)
  const importFloors =
    config.importFloors || floors.map((f: FloorFile) => f.source)
  // Track unique layer names in order of first appearance (for imported floors only)
  const uniqueLayers: string[] = []
  // Track output files for each floor
  const floorFiles: FloorFile[] = []
  for (const floor of floors) {
    const { source, layer, outputPath: floorOutputPath } = floor
    const inputFile = path.join(sourcePath, `${source}${suffix}`)

    // Use floor's outputPath if provided, otherwise use default
    const floorOutputDir = floorOutputPath
      ? path.join(basePath, floorOutputPath)
      : outputPath

    // Ensure the output directory exists
    await fs.mkdir(floorOutputDir, { recursive: true })

    const outputFile = path.join(floorOutputDir, `${source}.css`)
    const fileUrl = pathToFileUrl(inputFile).href + `?update=${Date.now()}`
    const stylesObj = (await import(fileUrl)).default
    const css = getCss(stylesObj, {
      ...mediaShorthands,
      globalRootSelector: config.globalRootSelector,
    })
    const comment = generateCssComment(source)
    let wrappedCss = `${comment}${css}`

    if (layer) {
      // add layer to order in any case, even if the floor is not imported
      if (!uniqueLayers.includes(layer)) {
        uniqueLayers.push(layer)
      }
      wrappedCss = `${comment}@layer ${layer} {\n${css}\n}`
    }
    await fs.writeFile(outputFile, wrappedCss, 'utf8')

    // Calculate relative path from default output directory for imports
    const relativePath = floorOutputPath
      ? path.relative(outputPath, outputFile)
      : `${source}.css`

    floorFiles.push({
      file: relativePath,
      layer,
      source,
      outputPath: floorOutputPath,
    })
    cssFiles.push({ floor: source, file: relativePath, layer })
  }

  // 5. Create main CSS file
  const mainCssPath = path.join(outputPath, mainCssFile)
  // Type guard for cssFiles entries with type 'global' or 'media'
  function isGlobalOrMedia(
    f: any
  ): f is { type: string; file: string; mediaQuery?: string } {
    return (
      (f.type === 'global' || f.type === 'media') && typeof f.file === 'string'
    )
  }
  // Compose imports for variable sets
  function toImportStatement(f: {
    type: string
    file: string
    mediaQuery?: string
  }): string {
    if (f.mediaQuery) {
      return `@import '${f.file}' ${f.mediaQuery};`
    }
    return `@import '${f.file}';`
  }
  const varImports = (
    cssFiles.filter(isGlobalOrMedia) as {
      type: string
      file: string
      mediaQuery?: string
    }[]
  )
    .map(toImportStatement)
    .join('\n')
  // Compose imports for floors (in order, only those in importFloors)
  function isImportedFloor(f: FloorFile): boolean {
    return importFloors.includes(f.source)
  }
  function importStatement(f: FloorFile): string {
    return `@import '${f.file}';`
  }
  const importedFloorFiles = floorFiles.filter(isImportedFloor)
  const floorImports = importedFloorFiles.map(importStatement).join('\n')
  const normalizedBasePath = (config.basePath || '.').replace(/^\.*\//, '')
  const mainCssComment = `/* This CSS was automatically generated as the main styles file from ${normalizedBasePath}, do not edit directly */\n`
  const mainCss =
    mainCssComment +
    [
      uniqueLayers.length ? `@layer ${uniqueLayers.join(', ')};` : '',
      floorImports,
      varImports,
    ]
      .filter(Boolean)
      .join('\n') +
    '\n'
  await fs.writeFile(mainCssPath, mainCss, 'utf8')
}

// Helper for file URL import
import { pathToFileURL as pathToFileUrl } from 'node:url'
