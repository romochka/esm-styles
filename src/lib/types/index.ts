/**
 * Type definitions for the CSS in JS library
 */

export type CssJsObject = Record<string, any>

export interface GetCssOptions {
  mediaQueries?: Record<string, string>
  mediaPrefixes?: Record<string, string>
  auto?: Record<string, string[]>
  globalRootSelector?: string
  selectorShorthands?: Record<
    string,
    { selector?: string; mediaQuery?: string; prefix?: string }[]
  >
}

export type CssString = string

export type CssPropertyValue = string | number
export type CssRuleObject = Record<string, CssPropertyValue>

export type CssAstNode =
  | { type: 'rule'; selector: string; declarations: CssRuleObject }
  | { type: 'group'; children: CssAstNode[] }
  | { type: 'at-rule'; name: string; params: string; children: CssAstNode[] }

export type SelectorPath = string[][]

export type WalkCallback = (node: any, path: SelectorPath) => void

export type JsKeyToCssKey = (key: string) => string

export type IsEndValue = (value: any) => boolean

export type JoinSelectorPath = (path: SelectorPath) => string

export type ContentValue = (value: string) => string

export type CartesianProduct = <T>(arrays: T[][]) => T[][]

export type PrettifyCssString = (css: string) => string

export type MediaQueryHandler = (
  name: string,
  node: any,
  path: SelectorPath,
  options: GetCssOptions
) => string

export type LayerHandler = (
  name: string,
  node: any,
  path: SelectorPath,
  options: GetCssOptions
) => string

export type ContainerQueryHandler = (
  name: string,
  node: any,
  path: SelectorPath,
  options: GetCssOptions
) => string

export type IsHtmlTag = (key: string) => boolean

export type IsSpecialSelector = (key: string) => boolean

export type IsClassSelector = (key: string) => boolean

// End values can be string, number, array of such, or an object with a 'var' property and variable set keys.
