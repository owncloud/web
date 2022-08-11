import { Resource } from 'web-client'
import fileExtensions from '../extensions/fileExtensions'

export const extractStorageId = (id?: string): string => {
  if (!id || typeof id !== 'string') {
    return ''
  }
  return id.indexOf('!') >= 0 ? id.split('!')[0] : ''
}

export const extractNameWithoutExtension = (resource?: Resource): string => {
  const extension = resource.extension || ''
  const name = resource.name || ''
  if (!extension.length) return name
  const extensionIndexInName = name.lastIndexOf(`.${extension}`)
  return name.substring(0, extensionIndexInName)
}

export const extractExtensionFromFile = (resource: Resource): string => {
  const name = resource.name
  if (resource.type === 'dir' || resource.type === 'folder' || resource.isFolder) return ''

  const parts = name.split('.')
  if (parts.length > 2) {
    for (let i = 0; i < parts.length; i++) {
      const possibleExtension = parts.slice(i, parts.length).join('.')
      if (fileExtensions.complex.includes(possibleExtension)) {
        return possibleExtension
      }
    }
  }
  // Fallback if file extension is unknown or no extension
  if (parts.length < 2) return ''
  return parts[parts.length - 1]
}
