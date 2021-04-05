import { isPlainObject } from 'lodash'

export const keysDeep = obj => {
  const paths = []

  const walk = (o, p = '') =>
    Object.keys(o).forEach(key => {
      if (isPlainObject(o[key])) {
        walk(o[key], `${p}${key}.`)
      } else {
        paths.push(`${p}${key}`)
      }
    })

  walk(obj)
  return paths
}
