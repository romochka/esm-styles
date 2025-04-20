export const prettify_selector = selector => {
  let res = selector.trim()
  // insert space before and after >, +, ~ if it is missing

  res = res.replace(/([>+\~])/g, ' $1 ')

  res = res.replace(/\s\s+/g, ' ')

  return res
}

export const prettify_css_string = cssString => {
  return (
    cssString

      // remove triple lines
      .replace(/\n\n\n/g, '\n\n')

      // remove empty lines
      .replace(/^\s+$/gm, '')

      // remove redundant line
      .replace(/\}\n\n\}/gm, '}\n}')

      // add line between first level blocks
      .replace(/^\}\n([^\}\n])/gm, '}\n\n$1')
  )
}
