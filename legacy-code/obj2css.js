const obj2css = (object) => {
  // console.log(inspect(cssStyle, { depth: 100 }));

  const json = JSON.stringify(object, null, 2)

  // console.log(json)

  //   console.log(json)
  // if (/url\(/.test(json)) {
  // }

  const cssString = json

    // \"abc.jpg\" --> 'abc.jpg'
    .replace(/\\"/gm, "'")

    // "abc": { --> abc {
    .replace(/"([^"]+)":\s*{/gm, '$1 {')

    // remove comma },{ and add empty line
    .replace(/},/gm, '}\n')

    // color: "red" --> color: red
    .replace(/"/gm, '')

    // restore outer quotes for inline images
    // url(data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'>...) -->
    // url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'>...")
    .replace(/url\('(.+)'\)/gm, 'url("$1")')

    // color: red, --> color: red;
    .replace(/,$/gm, ';')

    // remove first and last curly brackets
    .replace(/^{|}$/g, '')

    // add last semicolon
    .replace(/([^;])\s*}/gm, '$1;\n}')

    // remove indent
    .replace(/^  /gm, '')

  // console.log(cssString);

  return cssString
}

export default obj2css
