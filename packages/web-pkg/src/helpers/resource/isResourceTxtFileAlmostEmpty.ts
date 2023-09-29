import { Resource } from '@ownclouders/web-client'

export const isResourceTxtFileAlmostEmpty = (resource: Resource): boolean => {
  const mimeType = resource.mimeType || ''
  return mimeType.startsWith('text/') && (resource.size as number) < 30
}
