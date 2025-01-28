import { Resource, SpaceResource, urlJoin } from '@ownclouders/web-client'
import { SharingLinkType } from '@ownclouders/web-client/graph/generated'
import { useClientService, useResourcesStore, useSharesStore } from '@ownclouders/web-pkg'
import { unref } from 'vue'

export const useCreateFileHandler = () => {
  const clientService = useClientService()
  const { upsertResource } = useResourcesStore()
  const { addLink } = useSharesStore()

  const createFileHandler = async ({
    fileName,
    space,
    currentFolder,
    password,
    type
  }: {
    fileName: string
    space: SpaceResource
    currentFolder: Resource
    password: string
    type: SharingLinkType
  }) => {
    if (fileName === '') {
      return
    }

    const folderPath = '/.' + fileName

    const folder = await clientService.webdav.createFolder(unref(space), { path: folderPath })
    upsertResource(folder)

    await addLink({
      clientService,
      space,
      resource: folder,
      options: { password, type }
    })

    const path = urlJoin(currentFolder.path, fileName + '.psec')

    const file = await clientService.webdav.putFileContents(unref(space), { path })
    upsertResource(file)
  }

  return { createFileHandler }
}
