export const ot = (obj) =>
  /^\[object (\w+)]$/.exec(Object.prototype.toString.call(obj))[1].toLowerCase()

export const indent = (str, spaces = 2) =>
  str
    .split('\n')
    .map((s) => ' '.repeat(spaces) + s)
    .join('\n')

export const pipe =
  (...fns) =>
  (arg) =>
    fns.reduce((res, fn) => fn(res), arg)

export const isEndValue = (value) => {
  return ['number', 'string', 'boolean', 'null'].includes(ot(value))
}

export const hexToRgb = (hexColor) => {
  console.log(hexColor)
  // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const hex = hexColor.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b
  })
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export const isGetter = (node, key) => {
  const descriptor = Object.getOwnPropertyDescriptor(node, key)
  return descriptor.get
}

export const round = (num, places) => {
  return +(Math.round(num + 'e+' + places) + 'e-' + places)
}

export const merge2 = (obj1, obj2) => {
  const merged = Object.defineProperties(
    obj1,
    Object.getOwnPropertyDescriptors(obj2)
  )
  return merged
}

export const cartesian =
  // https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
  (a) => a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())))

export const mo = (node, updater, path, root, index = -1, separator = '.') => {
  // throw "ERROR";
  const realroot = root || node
  if (!realroot) {
    console.error('ERROR: mo() no root received')
    process.exit()
  }

  if (ot(node) === 'array') {
    const arr = node.map((item, index) =>
      mo(item, updater, path, root || node, index, separator)
    )
    return updater(arr, path, root || node, index)
  }

  if (ot(node) === 'object') {
    const updated = Reflect.ownKeys(node).reduce((acc, key) => {
      // console.log(`checking key ${key}`);
      if (isGetter(node, key)) {
        // console.log(`${key} is a getter`);
        Object.defineProperty(
          acc,
          key,
          Object.getOwnPropertyDescriptor(node, key)
        )
        return acc
      }
      const mutated = mo(
        node[key],
        updater,
        `${path ? path + separator : ''}${key}`,
        root || node,
        index,
        separator
      )
      const res = merge2(acc, { [key]: mutated })
      return res
    }, {})
    return updater(updated, path, root || node, index)
  }
  return updater(node, path, root || node, index)
}
