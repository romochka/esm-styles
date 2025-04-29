// Selector utilities for getCss
import type {
  IsHtmlTag,
  IsSpecialSelector,
  IsClassSelector,
  JoinSelectorPath,
  SelectorPath,
} from '../types/index.js'
import { CartesianProduct } from '../types/index.js'
import * as utils from './cartesian.js'

// List of standard HTML tags (not exhaustive, but covers common cases)
const HTML_TAGS = new Set([
  'html',
  'body',
  'div',
  'span',
  'p',
  'a',
  'ul',
  'ol',
  'li',
  'img',
  'input',
  'textarea',
  'button',
  'form',
  'label',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'section',
  'article',
  'nav',
  'header',
  'footer',
  'main',
  'aside',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'video',
  'audio',
  'canvas',
  'svg',
  'select',
  'option',
  'blockquote',
  'pre',
  'code',
  'figure',
  'figcaption',
  'dl',
  'dt',
  'dd',
  'fieldset',
  'legend',
  'details',
  'summary',
  'iframe',
  'picture',
  'source',
  'map',
  'area',
  'meta',
  'link',
  'style',
  'script',
  'noscript',
  'b',
  'i',
  'u',
  's',
  'em',
  'strong',
  'small',
  'cite',
  'q',
  'dfn',
  'abbr',
  'data',
  'time',
  'mark',
  'ruby',
  'rt',
  'rp',
  'bdi',
  'bdo',
  'span',
  'br',
  'wbr',
  'ins',
  'del',
  'sub',
  'sup',
  'hr',
  'progress',
  'meter',
  'output',
  'details',
  'dialog',
  'menu',
  'menuitem',
  'fieldset',
  'legend',
  'datalist',
  'optgroup',
  'keygen',
  'command',
  'track',
  'embed',
  'object',
  'param',
  'col',
  'colgroup',
  'caption',
  'address',
  'applet',
  'base',
  'basefont',
  'big',
  'center',
  'dir',
  'font',
  'frame',
  'frameset',
  'isindex',
  'listing',
  'marquee',
  'multicol',
  'nextid',
  'nobr',
  'noembed',
  'noframes',
  'plaintext',
  'rb',
  'rtc',
  'strike',
  'tt',
  'xmp',
])

const isHtmlTag = (key: string) => {
  // Only match if the key is a plain tag name (no underscores, no special chars)
  return HTML_TAGS.has(key)
}

export const isSpecialSelector: IsSpecialSelector = (key) => {
  // Pseudo-classes/elements, id, attribute selectors
  return (
    key.startsWith(':') ||
    key.startsWith('::') ||
    key.startsWith('#') ||
    key.startsWith('[')
  )
}

export const isClassSelector: IsClassSelector = (key) => {
  // _foo = class, __foo = descendant class
  return key.startsWith('_')
}

export const joinSelectorPath = (path: string[][]): string[] => {
  // Compute cartesian product of all segments
  const combos = utils.cartesianProduct(path)
  // Join each combination into a selector string
  return combos.map((parts) =>
    parts.reduce((acc, part) => {
      if (part.startsWith('__')) {
        return acc + (acc ? ' ' : '') + '.' + part.slice(2)
      } else if (part.startsWith('_')) {
        return acc + (acc ? ' ' : '') + '.' + part.slice(1)
      } else if (
        part.startsWith('>') ||
        part.startsWith('+') ||
        part.startsWith('~')
      ) {
        // Combinators: always join with a space
        return acc + ' ' + part
      } else if (
        part.startsWith(':') ||
        part.startsWith('::') ||
        part.startsWith('#') ||
        part.startsWith('[') ||
        part.startsWith('.')
      ) {
        return acc + part
      } else if (isHtmlTag(part)) {
        return acc + (acc ? ' ' : '') + part
      } else if (/^([a-z][a-z0-9]*)\.(.+)/.test(part)) {
        // If part matches 'tag.class...' and tag is an HTML tag
        const match = part.match(/^([a-z][a-z0-9]*)\.(.+)/)
        if (match && isHtmlTag(match[1])) {
          return acc + (acc ? ' ' : '') + match[1] + '.' + match[2]
        }
      }
      // Not a tag, not a special selector: treat as class
      return acc + (acc ? '' : '') + '.' + part
    }, '')
  )
}
