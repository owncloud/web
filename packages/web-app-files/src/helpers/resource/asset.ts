import { privatePreviewBlob } from './privatePreviewBlob'
import { publicPreviewUrl } from './publicPreviewUrl'

export const loadPreview = async (
  {
    resource,
    isPublic,
    dimensions,
    server,
    userId,
    token
  }: {
    resource: any
    isPublic: boolean
    dimensions: [number, number]
    server?: string
    userId?: string
    token?: string
  },
  cached = false
): Promise<string> => {
  let preview = ''
  if (resource.type === 'folder' || !resource.extension) {
    return preview
  }

  if (!isPublic && (!server || !userId || !token)) {
    return preview
  }

  if (isPublic) {
    preview = await publicPreviewUrl({ resource, dimensions })
  } else {
    preview = await privatePreviewBlob(
      {
        server,
        userId,
        token,
        resource,
        dimensions
      },
      cached
    )
  }

  return preview
}
