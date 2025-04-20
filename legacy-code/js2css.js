import lodash from 'lodash'
const { merge, isEqual, cloneDeep } = lodash
import chalk from 'chalk'
const log = console.log

import { cartesian, indent, isEndValue, mo, ot } from './lib.js'
import obj2css from './obj2css.js'
import { getMedia } from './media.js'

import { join } from './join.js'
import { jsKey2cssKey } from './key.js'
import { contentValue } from './content.js'
import { prettify_css_string } from './prettify.js'

const nodeType = (node, path) =>
  ([
    [path === '@media', 'standalone media object'],

    [
      path && /^@layer/.test(path.split('\\').pop()) && ot(node) === 'string',
      'layer statement',
    ],
    [
      path && /^@layer/.test(path.split('\\').pop()) && ot(node) === 'object',
      'layer block',
    ],
    [
      path &&
        /^@container/.test(path.split('\\').pop()) &&
        ot(node) === 'object',
      'container query block',
    ],

    [path && isEndValue(node) && !/@/.test(path), 'selector'],

    [
      path && /^@/.test(path.split('\\').pop()) && !/@layer/.test(path),
      'media query or prefix',
    ],
  ].find(([cond]) => cond) || [])[1]

/*

example config params:

mediaQueries: {
  "small-phone": "(max-width: 360px)",
  "phone": "(max-width: 499px)",
  "min-tablet": "(min-width: 500px)",
  "max-tablet": "(max-width: 839px)",
  "tablet": "(min-width: 500px) and (max-width: 839px)",
  "min-notebook": "(min-width: 840px)"
}

mediaPrefixes: {
  "dark": ":root.dark",
  "light": ":root.light",
  "twilight": ":root.twilight"
}

auto: {
  "light": [
    ":root.auto",
    "screen and (prefers-color-scheme: light)"
  ],
  "dark": [
    ":root.auto",
    "screen and (prefers-color-scheme: dark)"
  ],
  "twilight": [
    ":root.twilight",
    "screen"
  ]
}

*/

const getCss = (object, mediaQueries, mediaPrefixes = {}, auto) => {
  let cssStyle = {},
    layerStatements = [],
    layerObject = {},
    containerObject = {},
    mediaObject = {},
    prefixObject = {}

  mo(
    object,
    (node, path) => {
      switch (nodeType(node, path)) {
        case 'selector': {
          // log(chalk.cyan(`${path} is a selector`))
          const classPath = path.split('\\')
          const key = classPath.pop()

          let selector

          if (classPath.some((key) => /,/.test(key))) {
            const classPaths = classPath.map((key) => key.split(','))
            // log(chalk.yellow(`for value: ${key}:${node}`))
            const allPaths = cartesian(classPaths)
            // log(chalk.blue(inspect(allPaths)))
            const selectorList = allPaths.map((classPath) => join(classPath))
            // log(chalk.red(inspect(selectorList.join(', '), { depth: 100 })))
            selector = selectorList.join(', ')
          } else {
            selector = join(classPath)
          }

          // log(chalk.red(`last selector key:`, key));

          let value = cloneDeep(node)

          const cssKey = jsKey2cssKey(key)

          if (cssKey === 'content') {
            // log(chalk.red(`cssKey:`, cssKey))
            value = contentValue(value)
            // log(chalk.red(`value:`, value))
          }

          const cssObject = { [selector]: { [cssKey]: value } }
          merge(cssStyle, cssObject)
          break
        }

        case 'layer statement': {
          // log(chalk.cyan(`the node ${path} is a layer statement`))
          // log(chalk.cyan(inspect(node, { depth: 10 })))
          // log(chalk.cyan(inspect(cssStyle, { depth: 10 })))

          const statement =
            path.split('\\').pop() + (node ? ' ' + node : '') + ';'
          if (!layerStatements.includes(statement)) {
            layerStatements.push(statement)
          }
          break
        }

        case 'layer block': {
          // log(chalk.cyan(`the node ${path} is a layer block`))
          const classPath = path.split('\\')
          const key = classPath.pop()
          const selector = join(classPath)
          const object = { [key]: { [selector]: node } }
          merge(layerObject, object)
          break
        }

        case 'container query block': {
          // log(chalk.cyan(`the node ${path} is a container query block`))
          const classPath = path.split('\\')
          const key = classPath.pop()
          const selector = join(classPath)
          const object = { [key]: { [selector]: node } }
          merge(containerObject, object)
          // log(chalk.cyan(inspect(containerObject, { depth: 10 })));
          break
        }

        case 'standalone media object': {
          merge(mediaObject, node)
          break
        }

        case 'media query or prefix': {
          // log(chalk.cyan(`the node ${path} is MQ`))
          const classPath = path.split('\\')
          const key = classPath.pop()
          const selector = join(classPath)

          const name = key.replace(/^@\s*/, '')

          const mediaType = mediaPrefixes.hasOwnProperty(name)
            ? 'prefix'
            : /^@media\s/.test(key)
            ? 'general media'
            : mediaQueries.hasOwnProperty(name)
            ? 'named media'
            : null

          if (!mediaType) {
            log(chalk.red(`media query type ${key} is unknown`))
            break
          }

          if (mediaType === 'prefix') {
            // log(chalk.blue(`yay! it's a prefix: ${key}`))
            // log(chalk.blue(ot(node), inspect(node)))
            // log(chalk.blue(path))
            const prefix = mediaPrefixes[name]

            const selector = join(classPath)
            const rules = selector ? { ['& ' + selector]: node } : node

            const mediaPrefixObject = {
              [prefix]: rules,
            }
            // const path = `${prefix}.${'& ' + classPath.join('.')}`
            // log(chalk.yellow(path))
            // set(mediaPrefixObject, path, node)
            // log(
            //   'mediaPrefixObject',
            //   chalk.blue(inspect(mediaPrefixObject, { depth: 10 }))
            // )
            merge(prefixObject, mediaPrefixObject)

            break
          }

          let mediaQuery = key.replace(/^@media\s+/, '')

          if (mediaType === 'named media') {
            const query = mediaQueries[name]
            // log(chalk.green(`media query ${key} = ${query}`));
            mediaQuery = `${query}`
          }
          const mediaQueryObject = { [mediaQuery]: { [selector]: node } }
          // log(`media query object to add:`, mediaQueryObject)
          merge(mediaObject, mediaQueryObject)
          break
        }
      }

      return node
    },
    undefined,
    undefined,
    -1,
    '\\'
  )

  let cssString = obj2css(cssStyle)

  if (layerStatements.length > 0) {
    cssString = layerStatements.join('\n') + '\n' + cssString
  }

  if (Object.keys(layerObject).length > 0) {
    // log(chalk.blue('layerObject:', inspect(layerObject, { depth: 10 })))
    const layers = Object.keys(layerObject)

    const layerCssString = layers.reduce((res, layer) => {
      return (
        res +
        `\n${layer} {${indent(
          getCss(layerObject[layer], mediaQueries, mediaPrefixes, auto)
        )}\n}`
      )
    }, '')

    // log(chalk.yellow(`layer css:`, layerCssString))

    cssString += '\n' + layerCssString
  }

  if (Object.keys(containerObject).length > 0) {
    // log(chalk.cyan(inspect(containerObject, { depth: 10 })));

    // log(chalk.blue('layerObject:', inspect(layerObject, { depth: 10 })))
    const containerQueries = Object.keys(containerObject)

    const containerCssString = containerQueries.reduce(
      (res, containerQuery) => {
        const substring = getCss(
          containerObject[containerQuery],
          mediaQueries,
          mediaPrefixes,
          auto
        )

        // log(chalk.yellow("Substring:", substring));

        // log(
        //   chalk.yellow(inspect(containerObject[containerQuery], { depth: 10 }))
        // );
        return substring
          ? res + `\n${containerQuery} {${indent(substring)}\n}`
          : res
      },
      ''
    )

    // log(chalk.yellow(`layer css:`, layerCssString))

    cssString += '\n' + containerCssString
  }

  if (Object.keys(mediaObject).length > 0) {
    // log(chalk.yellow(inspect(mediaObject, { depth: 10 })))

    const mediaCssString = getMedia(mediaObject, mediaQueries)
    // log(`add media css:`, mediaCssString)
    if (mediaCssString) cssString += '\n' + mediaCssString
  }

  if (Object.keys(prefixObject).length > 0) {
    const mediaPrefixedCssString = getCss(
      prefixObject,
      mediaQueries,
      mediaPrefixes
    )
    // log(chalk.yellow(cssString))
    // log(
    //   'merged prefix object:',
    //   chalk.yellow(inspect(prefixObject, { depth: 10 }))
    // )
    // log('css string:', chalk.blue(mediaPrefixedCssString))
    cssString += '\n' + mediaPrefixedCssString

    if (auto) {
      const mediaPrefixObject = { ...prefixObject }

      for (const key of Object.keys(auto)) {
        const selector = mediaPrefixes[key]
        if (!selector) continue
        const [autoSelector, mediaQuery] = auto[key]
        // log('replace:', selector, autoSelector, mediaQuery)
        // log(inspect(prefixObject, { depth: 10 }))

        if (mediaPrefixObject[selector]) {
          mediaPrefixObject[mediaQuery] = {
            [autoSelector]: mediaPrefixObject[selector],
          }
          delete mediaPrefixObject[selector]
        }
      }
      // log(inspect(mediaPrefixObject, { depth: 10 }))

      if (!isEqual(prefixObject, mediaPrefixObject)) {
        // log('replaced with media:', inspect(mediaPrefixObject, { depth: 10 }))
        const mediaCssString = getMedia(mediaPrefixObject, mediaQueries)
        // log(`converted to css:`, mediaCssString)

        cssString += '\n' + mediaCssString
      }
    }
  }

  const result = prettify_css_string(cssString.replace(/__bs__/g, '\\'))

  // log(chalk.yellow("Result type and length:", typeof result, result.length));
  // log(chalk.yellow("Result:", result));

  return result
}

export default getCss
