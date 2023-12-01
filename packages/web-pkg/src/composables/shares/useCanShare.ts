import { Resource } from '@ownclouders/web-client'
import { useStore } from '../store'
import { useAbility } from '../ability'

export const useCanShare = () => {
  const store = useStore()
  const ability = useAbility()

  const canShare = (item: Resource) => {
    const { capabilities } = store.state.user
    if (!capabilities.files_sharing || !capabilities.files_sharing.api_enabled) {
      return false
    }
    if (item.isReceivedShare() && !capabilities.files_sharing.resharing) {
      return false
    }
    return item.canShare({ ability })
  }

  return { canShare }
}
