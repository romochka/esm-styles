import { ot } from './lib.js'

export const contentValue = (value) => {
  if (ot(value) !== 'string') return ''

  // if value is a css function, return it as is
  if (/^[\w-]+\(/.test(value)) return value

  let res = value

  // if value is not wrapped in apostrophes or quotes, wrap it in apostrophes
  if (!/^['"]/.test(value)) res = `'${value}'`

  // if value contains non-ascii unicode characters, convert them to css-compliant unicode codes

  if (/[^\x00-\x7F]/.test(value)) {
    res = res.replace(
      /[\u007F-\uFFFF]/g,
      (c) =>
        '__bs__' + String(`${c.charCodeAt(0).toString(16)}`).padStart(6, '0')
    )
  }

  return res
}
