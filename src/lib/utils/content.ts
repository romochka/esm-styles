// Content property utility for getCss
import type { ContentValue } from '../types/index.js'

export const contentValue: ContentValue = (value) => {
  if (typeof value !== 'string') return value
  // If already quoted, return as is
  if (/^'.*'$/.test(value) || /^".*"$/.test(value)) return value
  // If all characters are printable ASCII, return as quoted string
  if (/^[\x20-\x7E]*$/.test(value)) {
    return `'${value}'`
  }
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
