import { Resource } from '@ownclouders/web-client'
import { useAbility } from '../ability'
import { useCapabilityStore } from '../piniaStores'

export const useCanShare = () => {
  const capabilityStore = useCapabilityStore()
  const ability = useAbility()

  const canShare = (item: Resource) => {
    if (!capabilityStore.sharingApiEnabled) {
      return false
    }
    if (item.isReceivedShare() && !capabilityStore.sharingResharing) {
      return false
    }
    return item.canShare({ ability })
  }

  return { canShare }
}
