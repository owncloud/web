import isPlainObject from 'lodash-es/isPlainObject'

export const objectKeys = (obj: Record<string, unknown>): string[] => {
  const paths = []

  const walk = (o, p = '') =>
    Object.keys(o).forEach((key) => {
      if (isPlainObject(o[key])) {
        walk(o[key], `${p}${key}.`)
      } else {
        paths.push(`${p}${key}`)
      }
    })

  walk(obj)

  return paths
}
