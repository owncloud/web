import { buildSpace, extractStorageId, SpaceResource } from '@ownclouders/web-client'
import { useClientService } from '../clientService'
import { useConfigStore, useResourcesStore } from '../piniaStores'

export const useCreateSpace = () => {
  const clientService = useClientService()
  const configStore = useConfigStore()
  const resourcesStore = useResourcesStore()

  const createSpace = async (name: string) => {
    const { graphAuthenticated } = clientService
    const { data: createdSpace } = await graphAuthenticated.drives.createDrive(
      { name },
      { params: { template: 'default' } }
    )
    return buildSpace({
      ...createdSpace,
      serverUrl: configStore.serverUrl
    })
  }

  const createDefaultMetaFolder = async (space: SpaceResource, metaFolderId: string) => {
    const spaceFolder = await clientService.webdav.createFolder(space, {
      path: '.space',
      fileId: metaFolderId,
      folderName: '.space'
    })
    if (extractStorageId(spaceFolder.parentFolderId) === resourcesStore.currentFolder?.id) {
      resourcesStore.upsertResource(spaceFolder)
    }

    return spaceFolder
  }

  return { createSpace, createDefaultMetaFolder }
}
