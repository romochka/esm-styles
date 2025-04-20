/**
 * Type definitions for the CSS in JS library
 */

/**
 * CSS property value - can be string, number, or boolean
 */
export type CssValue = string | number | boolean | null

/**
 * CSS selector or CSS property name
 */
export type CssKey = string

/**
 * CSS styles object that can contain nested selectors or properties
 */
export interface CssStyles {
  [key: CssKey]: CssValue | CssStyles
}

/**
 * Named media queries configuration
 */
export interface MediaQueries {
  [name: string]: string
}

/**
 * Media prefixes configuration
 */
export interface MediaPrefixes {
  [name: string]: string
}

/**
 * Auto mode configuration for color schemes
 */
export interface AutoConfig {
  [mode: string]: [string, string]
}

/**
 * Configuration for the CSS generator
 */
export interface CssConfig {
  mediaQueries?: MediaQueries
  mediaPrefixes?: MediaPrefixes
  auto?: AutoConfig
}
