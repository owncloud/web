import { bus } from 'web-pkg/src/instance'

interface BreadcrumbItem {
  text: string
  to?: string
  onClick?()
}

export const breadcrumbsFromPath = (routePath: string, resourcePath: string = ''): BreadcrumbItem[] => {

  const basePaths =
    '/' +
    decodeURIComponent(routePath)
      .replace(resourcePath, '')
      .split('/')
      .filter(Boolean)
      .join('/')

  return [basePaths, ...resourcePath.split('/').filter(Boolean)].reduce(
    (acc, rawItem, i, rawItems) => {
      const to = [(acc[i - 1] || {}).to, rawItem].filter(Boolean).join('/')
      acc.push({
        text: rawItem,
        // onClick: () => bus.publish('app.files.list.load', to.replace(basePaths, '') || '/'),
        to
      })
      return acc
    },
    []
  )
}
