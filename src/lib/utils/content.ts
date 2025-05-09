// Content property utility for getCss
import type { ContentValue } from '../types/index.js'

const keywords = [
  'normal',
  'none',
  'open-quote',
  'close-quote',
  'no-open-quote',
  'no-close-quote',
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset',
]

export const contentValue: ContentValue = (value) => {
  if (typeof value !== 'string') return value

  if (
    keywords.some((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`)
      return regex.test(value)
    })
  )
    return value

  // If already contains quoted values, return as is
  if (/'.*'/.test(value) || /".*"/.test(value)) return value

  // If contains functions, return as is
  if (/[a-z]+\(.*\)/i.test(value)) return value // url(...), attr(...), etc.

  // If all characters are printable ASCII, wrap in single quotes
  if (/^[\x20-\x7E]*$/.test(value)) return `'${value}'`

  // Otherwise, convert each character to CSS unicode escape: \00xxxx
  const unicode = value
    .split('')
    .map((ch) => {
      const code = ch.codePointAt(0)
      if (!code) return ''
      // CSS unicode escape: \00xxxx (4 hex digits, single backslash)
      return '\\00' + code.toString(16).padStart(4, '0')
    })
    .join('')
  return `'${unicode}'`
}
