// esm-styles v2 — экстрактор скелетов разметки.
// Читает .tsx и строит дерево элементов каждого PascalCase-компонента:
// теги, классы (camelCase), границы дочерних компонентов, зоны {children}.

import ts from 'typescript'

export type SkeletonNode = {
  tag: string
  classes: string[]
  children: SkeletonNode[]
  components: string[]
  /** содержит {children} / dangerouslySetInnerHTML → свободный режим */
  free: boolean
}

export type ComponentSkeleton = {
  name: string
  root: SkeletonNode
}

const kebabToCamel = (s: string): string =>
  s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())

const words = (text: string): string[] => text.split(/\s+/).filter(Boolean)

/** Собирает все строковые литералы из значения className
 *  (строка, тернарник, шаблон, массив с filter/join — что угодно). */
const collectClassWords = (init: ts.Node, out: string[]): void => {
  if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
    out.push(...words(init.text))
    return
  }
  if (ts.isTemplateExpression(init)) {
    out.push(...words(init.head.text))
    for (const span of init.templateSpans) {
      collectClassWords(span.expression, out)
      out.push(...words(span.literal.text))
    }
    return
  }
  init.forEachChild((child) => collectClassWords(child, out))
}

/** className={className} — идём по ссылке к объявлению переменной в файле
 *  (классы часто собирают в const перед return). Один уровень косвенности. */
const resolveClassNameSource = (initializer: ts.Node): ts.Node => {
  if (!ts.isJsxExpression(initializer) || !initializer.expression)
    return initializer
  const expr = initializer.expression
  if (!ts.isIdentifier(expr)) return initializer

  let resolved: ts.Node | undefined
  const search = (node: ts.Node): void => {
    if (resolved) return
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === expr.text &&
      node.initializer
    ) {
      resolved = node.initializer
      return
    }
    node.forEachChild(search)
  }
  search(expr.getSourceFile())
  return resolved ?? initializer
}

const containsChildrenIdentifier = (node: ts.Node): boolean => {
  if (ts.isIdentifier(node) && node.text === 'children') return true
  let found = false
  node.forEachChild((child) => {
    if (!found) found = containsChildrenIdentifier(child)
  })
  return found
}

/** Находит JSX-элементы верхнего уровня внутри произвольного выражения
 *  ({cond && <el/>}, {list.map(() => <el/>)}, …), не заходя внутрь них. */
const collectJsxIn = (
  node: ts.Node,
  out: (ts.JsxElement | ts.JsxSelfClosingElement)[]
): void => {
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
    out.push(node)
    return
  }
  node.forEachChild((child) => collectJsxIn(child, out))
}

const mergeNode = (target: SkeletonNode, source: SkeletonNode): void => {
  for (const cls of source.classes)
    if (!target.classes.includes(cls)) target.classes.push(cls)
  for (const comp of source.components)
    if (!target.components.includes(comp)) target.components.push(comp)
  target.free = target.free || source.free
  for (const child of source.children) {
    const existing = target.children.find((c) => c.tag === child.tag)
    if (existing) mergeNode(existing, child)
    else target.children.push(child)
  }
}

const attachElement = (
  el: ts.JsxElement | ts.JsxSelfClosingElement,
  parent: SkeletonNode
): void => {
  const opening = ts.isJsxElement(el) ? el.openingElement : el
  const tag = opening.tagName.getText()
  if (/^[A-Z]/.test(tag)) {
    if (!parent.components.includes(tag)) parent.components.push(tag)
    return
  }
  const node = buildNode(el)
  if (!node) return
  const existing = parent.children.find((c) => c.tag === node.tag)
  if (existing) mergeNode(existing, node)
  else parent.children.push(node)
}

const visitJsxChild = (child: ts.Node, parent: SkeletonNode): void => {
  if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
    attachElement(child, parent)
    return
  }
  if (ts.isJsxFragment(child)) {
    for (const c of child.children) visitJsxChild(c, parent)
    return
  }
  if (ts.isJsxExpression(child) && child.expression) {
    if (containsChildrenIdentifier(child.expression)) parent.free = true
    const found: (ts.JsxElement | ts.JsxSelfClosingElement)[] = []
    collectJsxIn(child.expression, found)
    for (const el of found) attachElement(el, parent)
  }
}

const buildNode = (
  jsx: ts.JsxElement | ts.JsxSelfClosingElement,
  dropClass?: string
): SkeletonNode | undefined => {
  const opening = ts.isJsxElement(jsx) ? jsx.openingElement : jsx
  const tag = opening.tagName.getText()
  if (/^[A-Z]/.test(tag)) return undefined

  const node: SkeletonNode = {
    tag,
    classes: [],
    children: [],
    components: [],
    free: false,
  }

  for (const attr of opening.attributes.properties) {
    if (!ts.isJsxAttribute(attr)) continue
    const attrName = attr.name.getText()
    if (attrName === 'className' && attr.initializer) {
      const raw: string[] = []
      collectClassWords(resolveClassNameSource(attr.initializer), raw)
      node.classes.push(...raw)
    }
    if (attrName === 'dangerouslySetInnerHTML') node.free = true
  }

  node.classes = [...new Set(node.classes)]
    .filter((c) => c !== dropClass)
    .map(kebabToCamel)

  if (ts.isJsxElement(jsx)) {
    for (const child of jsx.children) visitJsxChild(child, node)
  }
  return node
}

const unwrapJsx = (
  expr: ts.Expression
): ts.JsxElement | ts.JsxSelfClosingElement | undefined => {
  let e = expr
  while (ts.isParenthesizedExpression(e)) e = e.expression
  if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e)) return e
  return undefined
}

const findRootJsx = (
  fn: ts.ArrowFunction | ts.FunctionDeclaration
): ts.JsxElement | ts.JsxSelfClosingElement | undefined => {
  const body = fn.body
  if (!body) return undefined
  if (ts.isBlock(body)) {
    for (const statement of body.statements) {
      if (ts.isReturnStatement(statement) && statement.expression) {
        return unwrapJsx(statement.expression)
      }
    }
    return undefined
  }
  return unwrapJsx(body)
}

/** Извлекает скелеты всех PascalCase-компонентов файла, возвращающих JSX. */
export const extractComponents = (
  filePath: string,
  sourceText: string
): ComponentSkeleton[] => {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  const candidates: {
    name: string
    fn: ts.ArrowFunction | ts.FunctionDeclaration
  }[] = []

  sourceFile.forEachChild((node) => {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.initializer &&
          ts.isArrowFunction(decl.initializer)
        ) {
          candidates.push({ name: decl.name.text, fn: decl.initializer })
        }
      }
    }
    if (ts.isFunctionDeclaration(node) && node.name) {
      candidates.push({ name: node.name.text, fn: node })
    }
  })

  const skeletons: ComponentSkeleton[] = []
  for (const { name, fn } of candidates) {
    if (!/^[A-Z]/.test(name)) continue
    const jsx = findRootJsx(fn)
    if (!jsx) continue
    const root = buildNode(jsx, name)
    if (!root) continue
    skeletons.push({ name, root })
  }
  return skeletons
}
