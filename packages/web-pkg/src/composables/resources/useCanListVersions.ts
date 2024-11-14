import { useUserStore } from '../piniaStores'
import { isSpaceResource, isTrashResource, Resource, SpaceResource } from '@ownclouders/web-client'

export const useCanListVersions = () => {
  const userStore = useUserStore()

  const canListVersions = ({ space, resource }: { space: SpaceResource; resource: Resource }) => {
    if (resource.type === 'folder') {
      return false
    }
    if (isSpaceResource(resource)) {
      return false
    }
    if (isTrashResource(resource)) {
      return false
    }
    return space?.canListVersions({ user: userStore.user })
  }

  return {
    canListVersions
  }
}
