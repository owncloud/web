export function buildWebDavSpacesPath(storageId, path) {
  return '/' + `spaces/${storageId}/${path}`.split('/').filter(Boolean).join('/')
}

export const extractDomSelector = (str: string): string => {
  return str.replace(/[^A-Za-z0-9\-_]/g, '')
}
