interface BreadcrumbItem {
  text: string
  to?: string

  onClick?()
}

export const breadcrumbsFromPath = (
  currentPath: string,
  resourcePath: string
): BreadcrumbItem[] => {
  const pathSplit = (p = '') => p.split('/').filter(Boolean)
  const current = pathSplit(currentPath)
  const resource = pathSplit(resourcePath)

  return resource.map((text, i) => ({
    text,
    to: '/' + [...current].splice(0, current.length - resource.length + i + 1).join('/')
  }))
}
