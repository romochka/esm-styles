/**
 * Main function for converting JavaScript objects to CSS
 */

import {
  CssStyles,
  MediaQueries,
  MediaPrefixes,
  AutoConfig,
} from './types/index.js'
import { traverseObject, determineNodeType } from './utils/traversal.js'
import { indent } from './utils/common.js'
import { obj2css, prettifyCss } from './utils/obj2css.js'
import { joinSelectors, cartesianSelectors } from './utils/selectors.js'
import { formatContentValue } from './utils/content.js'
import { jsKeyToCssKey } from './utils/common.js'
import { processMediaQueries } from './utils/media.js'

/**
 * Converts a JavaScript style object to CSS string
 * @param object - The JavaScript object to convert to CSS
 * @param mediaQueries - Media query definitions (e.g., { 'phone': '(max-width: 499px)' })
 * @param mediaPrefixes - Media prefix definitions (e.g., { 'dark': ':root.dark' })
 * @param auto - Auto mode configuration (e.g., { 'dark': [':root.auto', 'screen and (prefers-color-scheme: dark)'] })
 * @returns CSS string
 */
export function getCss(
  object: CssStyles,
  mediaQueries: MediaQueries = {},
  mediaPrefixes: MediaPrefixes = {},
  auto?: AutoConfig
): string {
  // Initialize various objects to collect different types of CSS rules
  let cssStyle: CssStyles = {}
  const layerStatements: string[] = []
  let layerObject: CssStyles = {}
  let containerObject: CssStyles = {}
  const mediaObject: CssStyles = {}
  let prefixObject: CssStyles = {}

  // Process the object by traversing it and handling different node types
  traverseObject(object, (node, path, _, __) => {
    if (!path) return node

    const nodeType = determineNodeType(node, path)
    const pathParts = path.split('\\')
    const key = pathParts.pop() || ''

    switch (nodeType) {
      case 'selector': {
        // Handle CSS property-value pairs
        const selector = joinSelectors(pathParts)

        // Create cartesian product of selectors for comma-separated parts
        if (pathParts.some((part) => part.includes(','))) {
          const classPaths = pathParts.map((part) =>
            part.split(',').map((p) => p.trim())
          )
          const allPaths = cartesianSelectors(classPaths)

          // Apply the property-value to each selector
          allPaths.forEach((selectorPath) => {
            const cssKey = jsKeyToCssKey(key)
            let value = node

            // Special handling for content property
            if (cssKey === 'content') {
              value = formatContentValue(value)
            }

            // Create the CSS object and merge it
            const cssObject = {
              [selectorPath]: { [cssKey]: value },
            }

            cssStyle = mergeDeep(cssStyle, cssObject)
          })
        } else {
          // Simple case - no commas in selectors
          const cssKey = jsKeyToCssKey(key)
          let value = node

          // Special handling for content property
          if (cssKey === 'content') {
            value = formatContentValue(value)
          }

          // Create the CSS object and merge it
          const cssObject = {
            [selector]: { [cssKey]: value },
          }

          cssStyle = mergeDeep(cssStyle, cssObject)
        }
        break
      }

      case 'layer statement': {
        // Handle @layer statements
        const statement = `${key}${node ? ' ' + node : ''};`
        if (!layerStatements.includes(statement)) {
          layerStatements.push(statement)
        }
        break
      }

      case 'layer block': {
        // Handle @layer blocks
        const selector = joinSelectors(pathParts)
        const object = { [key]: { [selector]: node } }
        layerObject = mergeDeep(layerObject, object)
        break
      }

      case 'container query block': {
        // Handle @container queries
        const selector = joinSelectors(pathParts)
        const object = { [key]: { [selector]: node } }
        containerObject = mergeDeep(containerObject, object)
        break
      }

      case 'media query or prefix': {
        // Handle media queries and prefixes
        const selector = joinSelectors(pathParts)
        const name = key.replace(/^@\s*/, '')

        if (mediaPrefixes[name]) {
          // Handle media prefix
          const prefix = mediaPrefixes[name]
          const rules = selector ? { ['& ' + selector]: node } : node
          const mediaPrefixObject = { [prefix]: rules }
          prefixObject = mergeDeep(prefixObject, mediaPrefixObject)
        } else {
          // Handle media query
          let mediaQuery = key

          if (key.startsWith('@media ')) {
            // Use the media query as is, just remove @media prefix
            mediaQuery = key.replace(/^@media\s+/, '')
          } else if (mediaQueries[name]) {
            // Use the named media query from configuration
            mediaQuery = mediaQueries[name]
          } else {
            // Unknown media query type
            console.warn(`Warning: Media query type ${key} is unknown`)
            break
          }

          // Store the media query with the selector and node
          // This way we collect all the rules for each media query
          const mediaQueryKey = '@media ' + mediaQuery

          if (!mediaObject[mediaQueryKey]) {
            mediaObject[mediaQueryKey] = {}
          }

          // Add the selector and its rules to this media query
          mediaObject[mediaQueryKey] = mergeDeep(
            mediaObject[mediaQueryKey] as CssStyles,
            { [selector]: node }
          )
        }
        break
      }
    }

    return node
  })

  // Convert the main CSS style object to string
  let cssString = obj2css(cssStyle)

  // Add layer statements if any
  if (layerStatements.length > 0) {
    cssString = layerStatements.join('\n') + '\n\n' + cssString
  }

  // Process and add layer blocks if any
  if (Object.keys(layerObject).length > 0) {
    const layers = Object.keys(layerObject)

    const layerCssString = layers
      .map((layer) => {
        // Type guard for object values
        const layerStyles = layerObject[layer]
        if (!isObject(layerStyles)) return ''

        const layerContent = getCss(
          layerStyles as CssStyles,
          mediaQueries,
          mediaPrefixes,
          auto
        )
        return layerContent ? `${layer} {\n${indent(layerContent)}\n}` : ''
      })
      .filter(Boolean)
      .join('\n\n')

    if (layerCssString) {
      cssString += '\n\n' + layerCssString
    }
  }

  // Process and add container queries if any
  if (Object.keys(containerObject).length > 0) {
    const containerQueries = Object.keys(containerObject)

    const containerCssString = containerQueries
      .map((containerQuery) => {
        // Type guard for object values
        const containerStyles = containerObject[containerQuery]
        if (!isObject(containerStyles)) return ''

        const containerContent = getCss(
          containerStyles as CssStyles,
          mediaQueries,
          mediaPrefixes,
          auto
        )
        return containerContent
          ? `${containerQuery} {\n${indent(containerContent)}\n}`
          : ''
      })
      .filter(Boolean)
      .join('\n\n')

    if (containerCssString) {
      cssString += '\n\n' + containerCssString
    }
  }

  // Process and add media queries if any
  if (Object.keys(mediaObject).length > 0) {
    const mediaCssString = processMediaQueries(mediaObject, mediaQueries)
    if (mediaCssString) {
      cssString += '\n\n' + mediaCssString
    }
  }

  // Process and add media prefixes if any
  if (Object.keys(prefixObject).length > 0) {
    // First, process the prefix object as normal CSS
    const mediaPrefixedCssString = getCss(
      prefixObject,
      mediaQueries,
      mediaPrefixes
    )
    cssString += '\n\n' + mediaPrefixedCssString

    // Handle auto mode if configured
    if (auto) {
      // Create a modified prefix object for auto mode
      const autoPrefixObject: CssStyles = {}

      for (const key of Object.keys(auto)) {
        const selector = mediaPrefixes[key]
        if (!selector || !prefixObject[selector]) continue

        const [autoSelector, mediaQuery] = auto[key]

        // Create media query for auto mode
        autoPrefixObject[`@media ${mediaQuery}`] = {
          [autoSelector]: prefixObject[selector],
        }
      }

      // Process the auto prefix object if not empty
      if (Object.keys(autoPrefixObject).length > 0) {
        const autoCssString = processMediaQueries(
          autoPrefixObject,
          mediaQueries
        )
        if (autoCssString) {
          cssString += '\n\n' + autoCssString
        }
      }
    }
  }

  // Prettify the final CSS string
  return prettifyCss(cssString.replace(/__bs__/g, '\\'))
}

/**
 * Deep merge two objects
 * @param target - Target object to merge into
 * @param source - Source object to merge from
 * @returns Merged object
 */
function mergeDeep(target: CssStyles, source: CssStyles): CssStyles {
  const output = { ...target }

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key]
        } else {
          output[key] = mergeDeep(
            target[key] as CssStyles,
            source[key] as CssStyles
          )
        }
      } else {
        output[key] = source[key]
      }
    })
  }

  return output
}

/**
 * Checks if value is a non-null object
 * @param item - Value to check
 * @returns True if the value is a non-null object
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

export default getCss
