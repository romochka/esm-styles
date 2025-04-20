/**
 * Utilities for converting JavaScript objects to CSS strings
 */

/**
 * Converts a CSS object to a string representation
 * @param cssObject - Object with CSS selectors and properties
 * @returns CSS string
 */
export function obj2css(cssObject: Record<string, any>): string {
  // Convert object to JSON string with indentation
  const json = JSON.stringify(cssObject, null, 2)

  // Process the JSON string to convert to valid CSS
  const css = json
    // Replace double quotes with single quotes for strings
    .replace(/\\"/g, "'")

    // Convert object keys to CSS selectors
    .replace(/"([^"]+)":\s*{/g, '$1 {')

    // Remove commas between rule sets and add empty line
    .replace(/},/g, '}')

    // Remove remaining double quotes
    .replace(/"/g, '')

    // Restore quotes for inlined URLs
    .replace(/url\('(.+)'\)/g, 'url("$1")')

    // Convert property-value commas to semicolons
    .replace(/,(\s*})/g, ';$1')

    // Remove the outermost curly braces
    .replace(/^{|}$/g, '')

    // Convert commas between property values to semicolons
    .replace(/,\s*(?=[a-z-]+:)/g, ';\n  ')

    // Remove indentation from the start of lines
    .replace(/^( {2})/gm, '')

    // Add semicolons before closing brackets if missing
    .replace(/([^;])\s*}/g, '$1;\n}')

    // Ensure space between property name and value
    .replace(/:\s*/g, ': ')

    // Clean up extra spaces
    .replace(/\s+/g, ' ')

    // Fix colon spacing in selectors
    .replace(/([:#]) /g, '$1')

  // Split into lines for additional processing
  const lines = css.split('\n')
  const result = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Handle property lines
    if (line.includes(': ')) {
      result.push('  ' + line.trim())
    }
    // Handle selector lines
    else if (line.includes('{')) {
      result.push(line.trim())
    }
    // Handle closing bracket lines
    else if (line.includes('}')) {
      result.push('}')
    }
    // Other lines
    else {
      result.push(line)
    }
  }

  return result.join('\n')
}

/**
 * Prettifies a CSS string by ensuring consistent spacing and formatting
 * @param cssString - CSS string to prettify
 * @returns Prettified CSS string
 */
export function prettifyCss(cssString: string): string {
  return (
    cssString
      // Ensure consistent newlines between rule sets
      .replace(/}\s*/g, '}\n\n')

      // Fix spacing inside brackets
      .replace(/{\s*/g, ' {\n')

      // Clean up extra newlines
      .replace(/\n{3,}/g, '\n\n')

      // Trim the string
      .trim()
  )
}
