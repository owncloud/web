import { extractStorageId, SpaceResource } from '@ownclouders/web-client'
import { useClientService } from '../clientService'
import { useResourcesStore } from '../piniaStores'

export const useCreateSpace = () => {
  const clientService = useClientService()
  const resourcesStore = useResourcesStore()

  const createSpace = (name: string) => {
    const { graphAuthenticated } = clientService
    return graphAuthenticated.drives.createDrive({ name }, { params: { template: 'default' } })
  }

  const createDefaultMetaFolder = async (space: SpaceResource) => {
    const spaceFolder = await clientService.webdav.createFolder(space, { path: '.space' })
    if (extractStorageId(spaceFolder.parentFolderId) === resourcesStore.currentFolder?.id) {
      resourcesStore.upsertResource(spaceFolder)
    }

    return spaceFolder
  }

  return { createSpace, createDefaultMetaFolder }
}
