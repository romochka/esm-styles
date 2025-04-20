import kebabCase from 'lodash/kebabCase.js'

export const jsKey2cssKey = key => {
  const cssKey = kebabCase(key)
  let prefix = ''
  if (/^-/.test(key)) {
    // possible vendor prefix
    prefix = key.match(/^[-]+/)[0]
  }

  return prefix + cssKey
}
