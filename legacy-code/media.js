import { indent } from './lib.js'

import getCss from './js2css.js'

export const getMedia = (media, mediaQueries) => {
  const queries = Object.keys(media)

  const cssString = queries.reduce((res, query) => {
    return (
      res +
      `\n@media ${query} {${indent(getCss(media[query], mediaQueries))}\n}`
    )
  }, '')

  return cssString
    .split('\n')
    .filter((s) => s.trim())
    .join('\n')
}
