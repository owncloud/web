import { privatePreviewBlob } from './privatePreviewBlob'
import { publicPreviewUrl } from './publicPreviewUrl'
import { ClientService } from 'web-pkg'

export const loadPreview = async (
  {
    clientService,
    resource,
    isPublic,
    dimensions,
    server,
    userId,
    token
  }: {
    clientService: ClientService
    resource: any
    isPublic: boolean
    dimensions?: [number, number]
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
    preview = await publicPreviewUrl({ clientService, resource, dimensions })
  } else {
    preview = await privatePreviewBlob(
      {
        clientService,
        server,
        userId,
        resource,
        dimensions
      },
      cached
    )
  }

  return preview
}
