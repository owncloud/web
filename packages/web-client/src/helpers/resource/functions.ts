import urlJoin from 'proper-url-join'

export function buildWebDavSpacesPath(storageId: string | number, path?: string) {
  return urlJoin('spaces', storageId, path, {
    leadingSlash: true
  })
}

export const extractDomSelector = (str: string): string => {
  return str.replace(/[^A-Za-z0-9\-_]/g, '')
}
