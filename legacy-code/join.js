import chalk from 'chalk'
const log = console.log

import { ot } from './lib.js'
import htmlTags from './tags.js'
import { prettify_selector } from './prettify.js'

const isHtmlTag = (key) => {
  if (/^\w+[\.\[#:~\+ ]/.test(key)) {
    return htmlTags.includes(key.split(/[\.\[#:~\+ ]/)[0])
  } else {
    return htmlTags.includes(key)
  }
}

export const join = (path) => {
  let res = ''
  const array = ot(path) === 'string' ? [path] : path

  // log(chalk.yellow('join path:', path))

  for (const keyStr of array) {
    const key = keyStr.replace(/&/g, '').trim()
    if (isHtmlTag(key)) {
      res += ` ${key}`
    } else {
      let prefix = ''
      let selector = key
      if (/^&/.test(keyStr)) {
        prefix += ' '
      }
      if (/^__/.test(key)) {
        prefix += ' '
        selector = selector.replace(/^_/, '')
      }
      if (/^_/.test(key)) {
        selector = selector.replace(/^_/, '')
        if (!isHtmlTag(selector)) {
          // if not tag, increase level
          prefix += ' '
        }
      }
      if (!/^[\.:>*\[#~\+]/.test(selector)) {
        if (!/\./.test(prefix)) prefix += '.'
      }
      if (/^\*/.test(selector)) {
        prefix = ' ' + prefix
      }
      res += prefix + selector
    }
  }

  if (/\.\s*\./.test(res)) {
    // bug
    log(chalk.red('to do: fix the bug', res))
    res = res.replace(/\.\s*\./g, '.')
  }

  res = prettify_selector(res)

  // log(chalk.yellow('res:', res))

  return res
}
