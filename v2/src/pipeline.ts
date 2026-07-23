// esm-styles v2 — общий конвейер: сбор скелетов проекта.
// Используется генератором (gen.ts) и линтером (lint.ts): оба смотрят
// на одну и ту же зрячую картину разметки.

import fs from 'node:fs'
import path from 'node:path'
import { extractComponents, mergeNode } from './skeleton.ts'
import type {
  ComponentSkeleton,
  ComponentUsage,
  SkeletonNode,
} from './skeleton.ts'

export type ProjectComponent = ComponentSkeleton & { source: string }

export type Project = {
  /** все компоненты, как извлечены */
  components: ProjectComponent[]
  /** границы стилей — с развёрнутыми (прозрачные вклеены) скелетами */
  styled: ProjectComponent[]
  transparent: ProjectComponent[]
}

const cloneNode = (node: SkeletonNode): SkeletonNode => ({
  tag: node.tag,
  classes: [...node.classes],
  children: node.children.map(cloneNode),
  components: node.components.map((u) => ({
    name: u.name,
    slot: u.slot ? cloneNode(u.slot) : undefined,
  })),
  free: node.free,
  slot: node.slot,
})

const attachChild = (parent: SkeletonNode, child: SkeletonNode): void => {
  const existing = parent.children.find((c) => c.tag === child.tag)
  if (existing) mergeNode(existing, child)
  else parent.children.push(child)
}

/** Первый элемент поддерева, помеченный как слот ({children}). */
const findSlot = (node: SkeletonNode): SkeletonNode | undefined => {
  if (node.slot) return node
  for (const child of node.children) {
    const found = findSlot(child)
    if (found) return found
  }
  return undefined
}

export const loadProject = (appRoot: string): Project => {
  const tsxFiles = (fs.readdirSync(appRoot, { recursive: true }) as string[])
    .filter((f) => f.endsWith('.tsx'))
    .sort()

  const components: ProjectComponent[] = []
  for (const rel of tsxFiles) {
    const abs = path.join(appRoot, rel)
    const text = fs.readFileSync(abs, 'utf8')
    for (const skeleton of extractComponents(abs, text)) {
      components.push({ ...skeleton, source: rel })
    }
  }

  const duplicate = components.find(
    (c, i) => components.findIndex((d) => d.name === c.name) !== i
  )
  if (duplicate) {
    throw new Error(`Два компонента с именем ${duplicate.name}`)
  }

  // Разворачивание прозрачных субкомпонентов: компонент без своего
  // PascalCase-класса на корне — не граница, а способ разбить код;
  // его разметка вклеивается в скелет владельца в точке использования.

  const registry = new Map(components.map((c) => [c.name, c]))
  const resolving = new Set<string>()
  const resolved = new Map<string, SkeletonNode>()

  /** Вклейка JSX-детей места использования в слот прозрачной обёртки. */
  const spliceSlot = (sub: SkeletonNode, content: SkeletonNode): void => {
    const target = findSlot(sub)
    if (!target) {
      console.warn(
        `предупреждение: у прозрачного компонента нет {children}-слота, ` +
          `переданные дети не попали в скелет`
      )
      return
    }
    target.free = target.free || content.free
    for (const usage of content.components) {
      const existing = target.components.find((u) => u.name === usage.name)
      if (!existing) target.components.push(usage)
    }
    for (const child of content.children) attachChild(target, child)
  }

  const inlineTransparent = (node: SkeletonNode): void => {
    const boundaries: ComponentUsage[] = []
    for (const usage of node.components) {
      const entry = registry.get(usage.name)
      if (!entry || entry.styled) {
        if (!boundaries.find((u) => u.name === usage.name))
          boundaries.push(usage)
        continue
      }
      const sub = cloneNode(resolveComponent(usage.name))
      if (usage.slot) spliceSlot(sub, usage.slot)
      if (sub.tag === '#fragment') {
        node.free = node.free || sub.free
        for (const boundary of sub.components)
          if (!boundaries.find((u) => u.name === boundary.name))
            boundaries.push(boundary)
        for (const child of sub.children) attachChild(node, child)
      } else {
        attachChild(node, sub)
      }
    }
    node.components = boundaries
    for (const child of node.children) inlineTransparent(child)
  }

  const resolveComponent = (name: string): SkeletonNode => {
    if (resolved.has(name)) return resolved.get(name)!
    if (resolving.has(name)) {
      throw new Error(`Цикл прозрачных субкомпонентов через ${name}`)
    }
    resolving.add(name)
    const root = cloneNode(registry.get(name)!.root)
    inlineTransparent(root)
    resolving.delete(name)
    resolved.set(name, root)
    return root
  }

  const styled = components
    .filter((c) => c.styled)
    .map((c) => ({ ...c, root: resolveComponent(c.name) }))
  const transparent = components.filter((c) => !c.styled)

  return { components, styled, transparent }
}
