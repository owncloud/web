import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useAbility } from '../ability'
import { useCapabilityStore, useUserStore } from '../piniaStores'
import { isProjectSpaceResource, isShareSpaceResource } from '@ownclouders/web-client/src/helpers'

export const useCanShare = () => {
  const capabilityStore = useCapabilityStore()
  const ability = useAbility()
  const userStore = useUserStore()

  const canShare = ({ space, resource }: { space: SpaceResource; resource: Resource }) => {
    if (!capabilityStore.sharingApiEnabled) {
      return false
    }

    if (isShareSpaceResource(space)) {
      return false
    }

    if (isProjectSpaceResource(space) && !space.isManager(userStore.user)) {
      return false
    }

    return resource.canShare({ ability, user: userStore.user })
  }

  return { canShare }
}
